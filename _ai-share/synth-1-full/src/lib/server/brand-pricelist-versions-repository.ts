import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildBrandPricelistVersionSeedRows,
  summarizeBrandPricelistVersionRows,
  type BrandPricelistVersionRow,
  type BrandPricelistVersionsStorageMode,
} from '@/lib/b2b/brand-pricelist-versions-feed';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const DEFAULT_COLLECTION = 'SS27';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-pricelist-versions.json');
const memoryByKey = new Map<string, BrandPricelistVersionRow>();
let fileHydrated = false;

function versionKey(collectionId: string, id: string): string {
  return `${collectionId}:${id}`;
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
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as BrandPricelistVersionRow[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) memoryByKey.set(versionKey(row.collectionId, row.id), row);
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

function mapPgRow(row: {
  id: string;
  collection_id: string;
  name: string;
  channel: string;
  valid_from: string;
  valid_to: string;
  list_type: string;
  multiplier: string | number | null;
  customer_group_ids: string[] | string;
  overrides_json: Record<string, number> | string;
  created_at: Date;
}): BrandPricelistVersionRow {
  const customerGroupIds =
    typeof row.customer_group_ids === 'string'
      ? (JSON.parse(row.customer_group_ids) as BrandPricelistVersionRow['customerGroupIds'])
      : row.customer_group_ids;
  const overrides =
    typeof row.overrides_json === 'string'
      ? (JSON.parse(row.overrides_json) as BrandPricelistVersionRow['overrides'])
      : row.overrides_json;
  return {
    id: row.id,
    name: row.name,
    channel: row.channel as BrandPricelistVersionRow['channel'],
    validFrom: row.valid_from,
    validTo: row.valid_to,
    type: row.list_type === 'override' ? 'override' : 'multiplier',
    multiplier: row.multiplier == null ? undefined : Number(row.multiplier),
    customerGroupIds,
    overrides,
    createdAt: row.created_at.toISOString(),
    collectionId: row.collection_id,
    source: 'pg',
  };
}

async function listPersistedPg(
  org: string,
  collectionId: string
): Promise<BrandPricelistVersionRow[]> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT id, collection_id, name, channel, valid_from, valid_to, list_type,
            multiplier, customer_group_ids, overrides_json, created_at
     FROM brand_pricelist_versions
     WHERE organization_id = $1 AND collection_id = $2
     ORDER BY valid_from DESC, name ASC`,
    [org, collectionId]
  );
  return res.rows.map((row) => mapPgRow(row as Parameters<typeof mapPgRow>[0]));
}

async function upsertPersistedPg(
  org: string,
  collectionId: string,
  row: BrandPricelistVersionRow
): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO brand_pricelist_versions
       (id, organization_id, collection_id, name, channel, valid_from, valid_to, list_type,
        multiplier, customer_group_ids, overrides_json, list_json, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12::jsonb, $13::timestamptz, NOW())
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       channel = EXCLUDED.channel,
       valid_from = EXCLUDED.valid_from,
       valid_to = EXCLUDED.valid_to,
       list_type = EXCLUDED.list_type,
       multiplier = EXCLUDED.multiplier,
       customer_group_ids = EXCLUDED.customer_group_ids,
       overrides_json = EXCLUDED.overrides_json,
       list_json = EXCLUDED.list_json,
       updated_at = NOW()`,
    [
      row.id,
      org,
      collectionId,
      row.name,
      row.channel,
      row.validFrom,
      row.validTo,
      row.type,
      row.multiplier ?? null,
      JSON.stringify(row.customerGroupIds ?? []),
      JSON.stringify(row.overrides ?? {}),
      JSON.stringify({ source: 'pg' }),
      row.createdAt,
    ]
  );
}

function listPersistedMemory(collectionId: string): BrandPricelistVersionRow[] {
  hydrateFileIfNeeded();
  return [...memoryByKey.entries()]
    .filter(([key]) => key.startsWith(`${collectionId}:`))
    .map(([, row]) => row)
    .sort((a, b) => a.validFrom.localeCompare(b.validFrom));
}

function upsertPersistedMemory(collectionId: string, row: BrandPricelistVersionRow): void {
  hydrateFileIfNeeded();
  memoryByKey.set(versionKey(collectionId, row.id), row);
  persistFile();
}

async function seedPersisted(
  org: string,
  collectionId: string,
  rows: BrandPricelistVersionRow[],
  storageMode: BrandPricelistVersionsStorageMode
): Promise<BrandPricelistVersionRow[]> {
  const seeded = rows.map((row) => ({ ...row, source: 'pg' as const }));
  if (storageMode === 'pg') {
    for (const row of seeded) await upsertPersistedPg(org, collectionId, row);
    return listPersistedPg(org, collectionId);
  }
  for (const row of seeded) upsertPersistedMemory(collectionId, row);
  return listPersistedMemory(collectionId);
}

export function clearBrandPricelistVersionsMemoryForTests(): void {
  memoryByKey.clear();
  fileHydrated = false;
}

/** @internal tests */
export function seedBrandPricelistVersionMemoryForTests(
  collectionId: string,
  row: BrandPricelistVersionRow
): void {
  hydrateFileIfNeeded();
  memoryByKey.set(versionKey(collectionId, row.id), row);
}

export async function listBrandPricelistVersionsServer(input?: {
  collectionId?: string;
  organizationId?: string;
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  rows: BrandPricelistVersionRow[];
  summary: ReturnType<typeof summarizeBrandPricelistVersionRows>;
  storageMode: BrandPricelistVersionsStorageMode;
}> {
  const org = input?.organizationId ?? DEFAULT_ORG;
  const collectionId = input?.collectionId?.trim() || DEFAULT_COLLECTION;
  const seedRows = buildBrandPricelistVersionSeedRows(collectionId);

  if (isWorkshop2PostgresEnabled()) {
    let persisted = await listPersistedPg(org, collectionId);
    if (!persisted.length && input?.seedIfEmpty !== false) {
      persisted = await seedPersisted(org, collectionId, seedRows, 'pg');
    }
    return {
      collectionId,
      rows: persisted,
      summary: summarizeBrandPricelistVersionRows(persisted),
      storageMode: 'pg',
    };
  }

  hydrateFileIfNeeded();
  let persisted = listPersistedMemory(collectionId);
  if (!persisted.length && input?.seedIfEmpty !== false) {
    persisted = await seedPersisted(org, collectionId, seedRows, 'file');
  }
  return {
    collectionId,
    rows: persisted,
    summary: summarizeBrandPricelistVersionRows(persisted),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
  };
}

export async function patchBrandPricelistVersionServer(input: {
  collectionId: string;
  id: string;
  multiplier?: number;
  validTo?: string;
  organizationId?: string;
}): Promise<{
  row: BrandPricelistVersionRow | null;
  storageMode: BrandPricelistVersionsStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const listed = await listBrandPricelistVersionsServer({
    collectionId,
    organizationId: org,
    seedIfEmpty: true,
  });
  const existing = listed.rows.find((row) => row.id === input.id.trim());
  if (!existing) return { row: null, storageMode: listed.storageMode };

  const next: BrandPricelistVersionRow = {
    ...existing,
    multiplier: input.multiplier ?? existing.multiplier,
    validTo: input.validTo ?? existing.validTo,
    source: 'pg',
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

export async function refreshBrandPricelistVersionsServer(input: {
  collectionId: string;
  organizationId?: string;
}): Promise<{
  rows: BrandPricelistVersionRow[];
  summary: ReturnType<typeof summarizeBrandPricelistVersionRows>;
  storageMode: BrandPricelistVersionsStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const seedRows = buildBrandPricelistVersionSeedRows(collectionId);

  if (isWorkshop2PostgresEnabled()) {
    for (const row of seedRows) {
      await upsertPersistedPg(org, collectionId, { ...row, source: 'pg' });
    }
  } else {
    for (const row of seedRows) {
      upsertPersistedMemory(collectionId, { ...row, source: 'pg' });
    }
  }

  const listed = await listBrandPricelistVersionsServer({
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
