import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildBrandWssiCapacityFeedRows,
  buildBrandWssiMixFeedRows,
  summarizeBrandWssiMixFeed,
  type BrandWssiCapacityFeedRow,
  type BrandWssiFeedStorageMode,
  type BrandWssiMixFeedRow,
} from '@/lib/fashion/brand-wssi-otb-feed';
import { products } from '@/lib/products';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const DEFAULT_COLLECTION = 'SS27';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-wssi-otb-ledger.json');
const memoryMix = new Map<string, BrandWssiMixFeedRow[]>();
const memoryCapacity = new Map<string, BrandWssiCapacityFeedRow[]>();
let fileHydrated = false;

function scopeKey(collectionId: string): string {
  return collectionId;
}

function rowId(collectionId: string, kind: string, key: string): string {
  return `wssi-${collectionId}-${kind}-${key}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
}

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

type PersistedSnapshot = {
  collectionId: string;
  mix: BrandWssiMixFeedRow[];
  capacity: BrandWssiCapacityFeedRow[];
};

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as PersistedSnapshot[];
    if (!Array.isArray(parsed)) return;
    for (const snap of parsed) {
      memoryMix.set(scopeKey(snap.collectionId), snap.mix);
      memoryCapacity.set(scopeKey(snap.collectionId), snap.capacity);
    }
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    const keys = new Set([...memoryMix.keys(), ...memoryCapacity.keys()]);
    const snapshots = [...keys].map((collectionId) => ({
      collectionId,
      mix: memoryMix.get(collectionId) ?? [],
      capacity: memoryCapacity.get(collectionId) ?? [],
    }));
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(snapshots, null, 2));
  } catch {
    /* ignore */
  }
}

function catalogMixForCollection(collectionId: string): BrandWssiMixFeedRow[] {
  const seasonHint = collectionId.replace(/^\D+/, '').toUpperCase();
  const filtered = products.filter((p) => {
    const season = p.season?.toUpperCase() ?? '';
    if (!seasonHint) return true;
    return season.includes(seasonHint) || season.includes(collectionId.toUpperCase());
  });
  return buildBrandWssiMixFeedRows(filtered.length ? filtered : products);
}

async function listPg(
  org: string,
  collectionId: string
): Promise<{
  mix: BrandWssiMixFeedRow[];
  capacity: BrandWssiCapacityFeedRow[];
}> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{
    row_kind: string;
    row_key: string;
    payload: BrandWssiMixFeedRow | BrandWssiCapacityFeedRow;
  }>(
    `SELECT row_kind, row_key, payload
     FROM brand_wssi_otb_ledger
     WHERE organization_id = $1 AND collection_id = $2`,
    [org, collectionId]
  );
  const mix: BrandWssiMixFeedRow[] = [];
  const capacity: BrandWssiCapacityFeedRow[] = [];
  for (const row of res.rows) {
    if (row.row_kind === 'mix') {
      mix.push({ ...(row.payload as BrandWssiMixFeedRow), source: 'pg' });
    } else if (row.row_kind === 'capacity') {
      capacity.push({ ...(row.payload as BrandWssiCapacityFeedRow), source: 'pg' });
    }
  }
  mix.sort((a, b) => b.skuCount - a.skuCount);
  return { mix, capacity };
}

async function upsertPg(
  org: string,
  collectionId: string,
  kind: 'mix' | 'capacity',
  key: string,
  payload: BrandWssiMixFeedRow | BrandWssiCapacityFeedRow
): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO brand_wssi_otb_ledger
       (id, organization_id, collection_id, row_kind, row_key, payload, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [rowId(collectionId, kind, key), org, collectionId, kind, key, JSON.stringify(payload)]
  );
}

async function seedPersisted(
  org: string,
  collectionId: string,
  mix: BrandWssiMixFeedRow[],
  capacity: BrandWssiCapacityFeedRow[],
  storageMode: BrandWssiFeedStorageMode
): Promise<{ mix: BrandWssiMixFeedRow[]; capacity: BrandWssiCapacityFeedRow[] }> {
  const mixSeeded = mix.map((row) => ({ ...row, source: 'pg' as const }));
  const capSeeded = capacity.map((row) => ({ ...row, source: 'pg' as const }));

  if (storageMode === 'pg') {
    for (const row of mixSeeded) {
      await upsertPg(org, collectionId, 'mix', row.category, row);
    }
    for (const row of capSeeded) {
      await upsertPg(org, collectionId, 'capacity', row.id, row);
    }
    return listPg(org, collectionId);
  }

  memoryMix.set(scopeKey(collectionId), mixSeeded);
  memoryCapacity.set(scopeKey(collectionId), capSeeded);
  persistFile();
  return { mix: mixSeeded, capacity: capSeeded };
}

export function clearBrandWssiOtbMemoryForTests(): void {
  memoryMix.clear();
  memoryCapacity.clear();
  fileHydrated = false;
}

export async function listBrandWssiOtbServer(input?: {
  collectionId?: string;
  organizationId?: string;
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  mix: BrandWssiMixFeedRow[];
  capacity: BrandWssiCapacityFeedRow[];
  mixSummary: ReturnType<typeof summarizeBrandWssiMixFeed>;
  storageMode: BrandWssiFeedStorageMode;
}> {
  const org = input?.organizationId ?? DEFAULT_ORG;
  const collectionId = input?.collectionId?.trim() || DEFAULT_COLLECTION;
  const catalogMix = catalogMixForCollection(collectionId);
  const catalogCapacity = buildBrandWssiCapacityFeedRows(collectionId);

  if (isWorkshop2PostgresEnabled()) {
    let persisted = await listPg(org, collectionId);
    if (!persisted.mix.length && input?.seedIfEmpty !== false) {
      persisted = await seedPersisted(org, collectionId, catalogMix, catalogCapacity, 'pg');
    }
    return {
      collectionId,
      mix: persisted.mix.length ? persisted.mix : catalogMix,
      capacity: persisted.capacity.length ? persisted.capacity : catalogCapacity,
      mixSummary: summarizeBrandWssiMixFeed(persisted.mix.length ? persisted.mix : catalogMix),
      storageMode: 'pg',
    };
  }

  hydrateFileIfNeeded();
  let mix = memoryMix.get(scopeKey(collectionId)) ?? [];
  let capacity = memoryCapacity.get(scopeKey(collectionId)) ?? [];
  if (!mix.length && input?.seedIfEmpty !== false) {
    const seeded = await seedPersisted(org, collectionId, catalogMix, catalogCapacity, 'file');
    mix = seeded.mix;
    capacity = seeded.capacity;
  }
  return {
    collectionId,
    mix: mix.length ? mix : catalogMix,
    capacity: capacity.length ? capacity : catalogCapacity,
    mixSummary: summarizeBrandWssiMixFeed(mix.length ? mix : catalogMix),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
  };
}

export async function patchBrandWssiMixTargetServer(input: {
  collectionId: string;
  category: string;
  targetPct: number;
  organizationId?: string;
}): Promise<{ row: BrandWssiMixFeedRow | null; storageMode: BrandWssiFeedStorageMode }> {
  const listed = await listBrandWssiOtbServer({
    collectionId: input.collectionId,
    organizationId: input.organizationId,
    seedIfEmpty: true,
  });
  const existing = listed.mix.find((row) => row.category === input.category.trim());
  if (!existing) return { row: null, storageMode: listed.storageMode };

  const next: BrandWssiMixFeedRow = {
    ...existing,
    targetPct: input.targetPct,
    gap: existing.currentPct - input.targetPct,
    source: 'pg',
  };

  if (listed.storageMode === 'pg') {
    await upsertPg(
      input.organizationId ?? DEFAULT_ORG,
      input.collectionId.trim(),
      'mix',
      next.category,
      next
    );
    return { row: next, storageMode: 'pg' };
  }

  const mix = listed.mix.map((row) => (row.category === next.category ? next : row));
  memoryMix.set(scopeKey(input.collectionId.trim()), mix);
  persistFile();
  return {
    row: next,
    storageMode: listed.storageMode === 'demo' ? 'memory' : listed.storageMode,
  };
}

export async function refreshBrandWssiOtbServer(input: {
  collectionId: string;
  organizationId?: string;
}): Promise<{
  mixSummary: ReturnType<typeof summarizeBrandWssiMixFeed>;
  storageMode: BrandWssiFeedStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const catalogMix = catalogMixForCollection(collectionId);
  const catalogCapacity = buildBrandWssiCapacityFeedRows(collectionId);
  const seeded = await seedPersisted(
    org,
    collectionId,
    catalogMix,
    catalogCapacity,
    isWorkshop2PostgresEnabled() ? 'pg' : 'file'
  );
  return {
    mixSummary: summarizeBrandWssiMixFeed(seeded.mix),
    storageMode: isWorkshop2PostgresEnabled() ? 'pg' : canUseDiskPersistence() ? 'file' : 'memory',
  };
}
