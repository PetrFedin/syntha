import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildBrandPackRulesFeedRows,
  mergeBrandPackRulesFeedRows,
  summarizeBrandPackRulesFeed,
  type BrandPackRulesFeedRow,
  type BrandPackRulesFeedStorageMode,
} from '@/lib/fashion/brand-pack-rules-feed';
import { products } from '@/lib/products';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const DEFAULT_COLLECTION = 'SS27';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-pack-rules.json');
const memoryByKey = new Map<string, BrandPackRulesFeedRow>();
let fileHydrated = false;

function rulesKey(collectionId: string, sku: string): string {
  return `${collectionId}:${sku}`;
}

function rulesId(collectionId: string, sku: string): string {
  return `pack-rules-${collectionId}-${sku}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
}

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as BrandPackRulesFeedRow[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) memoryByKey.set(rulesKey(DEFAULT_COLLECTION, row.sku), row);
    }
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify([...memoryByKey.values()], null, 2));
  } catch {
    /* ignore */
  }
}

function catalogRowsForCollection(collectionId: string, limit = 80): BrandPackRulesFeedRow[] {
  const seasonHint = collectionId.replace(/^\D+/, '').toUpperCase();
  const filtered = products.filter((p) => {
    const season = p.season?.toUpperCase() ?? '';
    if (!seasonHint) return true;
    return season.includes(seasonHint) || season.includes(collectionId.toUpperCase());
  });
  const slice = (filtered.length ? filtered : products).slice(0, limit);
  return buildBrandPackRulesFeedRows(slice, slice.length);
}

function mapPgRow(row: {
  sku: string;
  slug: string;
  moq: number | null;
  case_pack: number | null;
  lead_weeks: number | null;
  incoterm: string;
  ship_from: string;
  source: string;
}): BrandPackRulesFeedRow {
  return {
    sku: row.sku,
    slug: row.slug,
    moq: row.moq,
    casePack: row.case_pack,
    leadWeeks: row.lead_weeks,
    incoterm: row.incoterm,
    shipFrom: row.ship_from,
    source: row.source === 'pg' ? 'pg' : 'catalog',
    persisted: true,
  };
}

async function listPersistedPg(
  org: string,
  collectionId: string
): Promise<BrandPackRulesFeedRow[]> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT sku, slug, moq, case_pack, lead_weeks, incoterm, ship_from, source
     FROM brand_pack_rules
     WHERE organization_id = $1 AND collection_id = $2
     ORDER BY sku ASC`,
    [org, collectionId]
  );
  return res.rows.map((row) => mapPgRow(row as Parameters<typeof mapPgRow>[0]));
}

async function upsertPersistedPg(
  org: string,
  collectionId: string,
  row: BrandPackRulesFeedRow
): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO brand_pack_rules
       (id, organization_id, collection_id, sku, slug, moq, case_pack, lead_weeks,
        incoterm, ship_from, source, rules_json, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       slug = EXCLUDED.slug,
       moq = EXCLUDED.moq,
       case_pack = EXCLUDED.case_pack,
       lead_weeks = EXCLUDED.lead_weeks,
       incoterm = EXCLUDED.incoterm,
       ship_from = EXCLUDED.ship_from,
       source = EXCLUDED.source,
       rules_json = EXCLUDED.rules_json,
       updated_at = NOW()`,
    [
      rulesId(collectionId, row.sku),
      org,
      collectionId,
      row.sku,
      row.slug,
      row.moq,
      row.casePack,
      row.leadWeeks,
      row.incoterm,
      row.shipFrom,
      'pg',
      JSON.stringify({ persisted: true }),
    ]
  );
}

function listPersistedMemory(collectionId: string): BrandPackRulesFeedRow[] {
  hydrateFileIfNeeded();
  return [...memoryByKey.entries()]
    .filter(([key]) => key.startsWith(`${collectionId}:`))
    .map(([, row]) => row)
    .sort((a, b) => a.sku.localeCompare(b.sku));
}

function upsertPersistedMemory(collectionId: string, row: BrandPackRulesFeedRow): void {
  hydrateFileIfNeeded();
  memoryByKey.set(rulesKey(collectionId, row.sku), row);
  persistFile();
}

async function seedPersistedFromCatalog(
  org: string,
  collectionId: string,
  catalogRows: BrandPackRulesFeedRow[],
  storageMode: BrandPackRulesFeedStorageMode
): Promise<BrandPackRulesFeedRow[]> {
  const seeded = catalogRows.map((row) => ({ ...row, source: 'pg' as const, persisted: true }));
  if (storageMode === 'pg') {
    for (const row of seeded) await upsertPersistedPg(org, collectionId, row);
    return listPersistedPg(org, collectionId);
  }
  for (const row of seeded) upsertPersistedMemory(collectionId, row);
  return listPersistedMemory(collectionId);
}

export function clearBrandPackRulesMemoryForTests(): void {
  memoryByKey.clear();
  fileHydrated = false;
}

/** @internal tests */
export function seedBrandPackRulesMemoryForTests(
  collectionId: string,
  row: BrandPackRulesFeedRow
): void {
  hydrateFileIfNeeded();
  memoryByKey.set(rulesKey(collectionId, row.sku), row);
}

export async function listBrandPackRulesServer(input?: {
  collectionId?: string;
  organizationId?: string;
  limit?: number;
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  rows: BrandPackRulesFeedRow[];
  summary: ReturnType<typeof summarizeBrandPackRulesFeed>;
  storageMode: BrandPackRulesFeedStorageMode;
}> {
  const org = input?.organizationId ?? DEFAULT_ORG;
  const collectionId = input?.collectionId?.trim() || DEFAULT_COLLECTION;
  const catalogRows = catalogRowsForCollection(collectionId, input?.limit ?? 80);

  if (isWorkshop2PostgresEnabled()) {
    let persisted = await listPersistedPg(org, collectionId);
    if (!persisted.length && input?.seedIfEmpty !== false) {
      persisted = await seedPersistedFromCatalog(org, collectionId, catalogRows, 'pg');
    }
    const merged = mergeBrandPackRulesFeedRows(
      catalogRows,
      new Map(persisted.map((row) => [row.sku, row]))
    );
    return {
      collectionId,
      rows: merged,
      summary: summarizeBrandPackRulesFeed(merged),
      storageMode: 'pg',
    };
  }

  hydrateFileIfNeeded();
  let persisted = listPersistedMemory(collectionId);
  if (!persisted.length && input?.seedIfEmpty !== false) {
    persisted = await seedPersistedFromCatalog(org, collectionId, catalogRows, 'file');
  }
  const merged = mergeBrandPackRulesFeedRows(
    catalogRows,
    new Map(persisted.map((row) => [row.sku, row]))
  );
  return {
    collectionId,
    rows: merged,
    summary: summarizeBrandPackRulesFeed(merged),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
  };
}

export async function patchBrandPackRulesServer(input: {
  collectionId: string;
  sku: string;
  moq?: number | null;
  casePack?: number | null;
  organizationId?: string;
}): Promise<{ row: BrandPackRulesFeedRow | null; storageMode: BrandPackRulesFeedStorageMode }> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const sku = input.sku.trim();
  const listed = await listBrandPackRulesServer({
    collectionId,
    organizationId: org,
    seedIfEmpty: true,
  });
  const existing = listed.rows.find((row) => row.sku === sku);
  if (!existing) return { row: null, storageMode: listed.storageMode };

  const next: BrandPackRulesFeedRow = {
    ...existing,
    moq: input.moq !== undefined ? input.moq : existing.moq,
    casePack: input.casePack !== undefined ? input.casePack : existing.casePack,
    source: 'pg',
    persisted: true,
  };

  if (listed.storageMode === 'pg') {
    await upsertPersistedPg(org, collectionId, next);
    return { row: next, storageMode: 'pg' };
  }

  upsertPersistedMemory(collectionId, next);
  return {
    row: next,
    storageMode: listed.storageMode === 'demo' ? 'memory' : listed.storageMode,
  };
}

export async function refreshBrandPackRulesServer(input: {
  collectionId: string;
  organizationId?: string;
  limit?: number;
}): Promise<{
  rows: BrandPackRulesFeedRow[];
  summary: ReturnType<typeof summarizeBrandPackRulesFeed>;
  storageMode: BrandPackRulesFeedStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const catalogRows = catalogRowsForCollection(collectionId, input.limit ?? 80);

  if (isWorkshop2PostgresEnabled()) {
    for (const row of catalogRows) {
      await upsertPersistedPg(org, collectionId, { ...row, source: 'pg', persisted: true });
    }
  } else {
    for (const row of catalogRows) {
      upsertPersistedMemory(collectionId, { ...row, source: 'pg', persisted: true });
    }
  }

  const listed = await listBrandPackRulesServer({
    collectionId,
    organizationId: org,
    seedIfEmpty: false,
  });
  return {
    rows: listed.rows,
    summary: listed.summary,
    storageMode: listed.storageMode === 'demo' ? 'memory' : listed.storageMode,
  };
}
