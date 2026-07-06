import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { PriceTierId } from '@/lib/b2b/price-tiers';
import {
  summarizeBrandPricelistTierSync,
  type BrandPricelistTierSyncRow,
  type BrandPricelistTierSyncStorageMode,
} from '@/lib/b2b/brand-pricelist-tier-sync';
import type { PriceList } from '@/lib/b2b/price-lists';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-pricelist-tier-sync.json');
const memoryByKey = new Map<string, BrandPricelistTierSyncRow>();
let fileHydrated = false;

const SERVER_PRICE_LIST_SEED: PriceList[] = [
  {
    id: 'pl-retail-b-q1',
    name: 'Retail B −4% Q1',
    channel: 'retail_b',
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
    type: 'multiplier',
    multiplier: 0.96,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pl-outlet-promo',
    name: 'Outlet акция −5%',
    channel: 'outlet',
    validFrom: '2025-02-01',
    validTo: '2025-02-28',
    type: 'multiplier',
    multiplier: 0.95,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pl-retail-a-base',
    name: 'Retail A base',
    channel: 'retail_a',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    type: 'multiplier',
    multiplier: 1,
    createdAt: new Date().toISOString(),
  },
];

function rowKey(collectionId: string, tierId: string): string {
  return `${collectionId}:${tierId}`;
}

function syncId(collectionId: string, tierId: string): string {
  return `tier-sync-${collectionId}-${tierId}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
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
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as BrandPricelistTierSyncRow[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) memoryByKey.set(rowKey(row.collectionId, row.tierId), row);
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

function defaultTierRows(collectionId: string): BrandPricelistTierSyncRow[] {
  const today = new Date().toISOString().slice(0, 10);
  const activeLists = SERVER_PRICE_LIST_SEED.filter(
    (pl) => pl.validFrom <= today && pl.validTo >= today
  );
  const tiers: PriceTierId[] = ['retail_a', 'retail_b', 'outlet'];
  return tiers.map((tierId) => {
    const pl =
      activeLists.find((list) => list.channel === tierId) ??
      SERVER_PRICE_LIST_SEED.find((list) => list.channel === tierId);
    return {
      tierId,
      priceListId: pl?.id ?? `pl-${tierId}`,
      priceListName: pl?.name ?? tierId,
      multiplier: pl?.multiplier ?? 1,
      shopSynced: tierId === 'retail_b',
      syncedAt: tierId === 'retail_b' ? new Date().toISOString() : undefined,
      collectionId,
    };
  });
}

function mapPgRow(row: {
  tier_id: string;
  price_list_id: string;
  price_list_name: string;
  multiplier: string | number;
  shop_synced: boolean;
  sync_json: { syncedAt?: string } | string;
  synced_at: Date | null;
  collection_id: string;
}): BrandPricelistTierSyncRow {
  const syncJsonRaw = row.sync_json;
  const syncJson =
    typeof syncJsonRaw === 'string'
      ? (JSON.parse(syncJsonRaw) as { syncedAt?: string })
      : (syncJsonRaw ?? {});
  return {
    tierId: row.tier_id as PriceTierId,
    priceListId: row.price_list_id,
    priceListName: row.price_list_name,
    multiplier: Number(row.multiplier),
    shopSynced: row.shop_synced,
    syncedAt: row.synced_at?.toISOString() ?? syncJson.syncedAt,
    collectionId: row.collection_id,
  };
}

async function listPg(org: string, collectionId: string): Promise<BrandPricelistTierSyncRow[]> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT tier_id, price_list_id, price_list_name, multiplier, shop_synced,
            sync_json, synced_at, collection_id
     FROM brand_pricelist_tier_sync
     WHERE organization_id = $1 AND collection_id = $2
     ORDER BY tier_id ASC`,
    [org, collectionId]
  );
  return res.rows.map((row) => mapPgRow(row as Parameters<typeof mapPgRow>[0]));
}

async function upsertPg(org: string, row: BrandPricelistTierSyncRow): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO brand_pricelist_tier_sync
       (id, organization_id, collection_id, tier_id, price_list_id, price_list_name,
        multiplier, shop_synced, sync_json, synced_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, NOW())
     ON CONFLICT (id) DO UPDATE SET
       price_list_id = EXCLUDED.price_list_id,
       price_list_name = EXCLUDED.price_list_name,
       multiplier = EXCLUDED.multiplier,
       shop_synced = EXCLUDED.shop_synced,
       sync_json = EXCLUDED.sync_json,
       synced_at = EXCLUDED.synced_at,
       updated_at = NOW()`,
    [
      syncId(row.collectionId, row.tierId),
      org,
      row.collectionId,
      row.tierId,
      row.priceListId,
      row.priceListName,
      row.multiplier,
      row.shopSynced,
      JSON.stringify({ syncedAt: row.syncedAt }),
      row.syncedAt ? new Date(row.syncedAt) : null,
    ]
  );
}

async function seedPg(org: string, collectionId: string): Promise<BrandPricelistTierSyncRow[]> {
  const seeds = defaultTierRows(collectionId);
  for (const row of seeds) await upsertPg(org, row);
  return listPg(org, collectionId);
}

function listMemory(collectionId: string): BrandPricelistTierSyncRow[] {
  hydrateFileIfNeeded();
  return [...memoryByKey.values()]
    .filter((row) => row.collectionId === collectionId)
    .sort((a, b) => a.tierId.localeCompare(b.tierId));
}

function seedMemory(collectionId: string): BrandPricelistTierSyncRow[] {
  hydrateFileIfNeeded();
  if (listMemory(collectionId).length) return listMemory(collectionId);
  const seeds = defaultTierRows(collectionId);
  for (const row of seeds) memoryByKey.set(rowKey(collectionId, row.tierId), row);
  persistFile();
  return seeds;
}

export function clearBrandPricelistTierSyncMemoryForTests(): void {
  memoryByKey.clear();
  fileHydrated = false;
}

export async function listBrandPricelistTierSyncServer(input?: {
  collectionId?: string;
  organizationId?: string;
  seedIfEmpty?: boolean;
}): Promise<{
  collectionId: string;
  rows: BrandPricelistTierSyncRow[];
  summary: ReturnType<typeof summarizeBrandPricelistTierSync>;
  storageMode: BrandPricelistTierSyncStorageMode;
}> {
  const org = input?.organizationId ?? DEFAULT_ORG;
  const collectionId = input?.collectionId?.trim() || 'SS27';

  if (isWorkshop2PostgresEnabled()) {
    let rows = await listPg(org, collectionId);
    if (!rows.length && input?.seedIfEmpty !== false) {
      rows = await seedPg(org, collectionId);
    }
    return {
      collectionId,
      rows,
      summary: summarizeBrandPricelistTierSync(rows),
      storageMode: 'pg',
    };
  }

  let rows = listMemory(collectionId);
  if (!rows.length && input?.seedIfEmpty !== false) {
    rows = seedMemory(collectionId);
  }
  return {
    collectionId,
    rows,
    summary: summarizeBrandPricelistTierSync(rows),
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
  };
}

export async function refreshBrandPricelistTierSyncFromVersionServer(input: {
  collectionId: string;
  tierId: PriceTierId;
  priceListId: string;
  priceListName: string;
  multiplier: number;
  organizationId?: string;
}): Promise<BrandPricelistTierSyncRow> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const listed = await listBrandPricelistTierSyncServer({
    collectionId,
    organizationId: org,
    seedIfEmpty: true,
  });
  const existing = listed.rows.find((row) => row.tierId === input.tierId);
  const next: BrandPricelistTierSyncRow = {
    tierId: input.tierId,
    priceListId: input.priceListId,
    priceListName: input.priceListName,
    multiplier: input.multiplier,
    shopSynced: existing?.shopSynced ?? false,
    syncedAt: existing?.syncedAt,
    collectionId,
  };

  if (listed.storageMode === 'pg') {
    await upsertPg(org, next);
  } else {
    memoryByKey.set(rowKey(collectionId, next.tierId), next);
    persistFile();
  }

  return next;
}

export async function pushBrandPricelistTierSyncToShopServer(input: {
  collectionId: string;
  tierId: PriceTierId;
  organizationId?: string;
}): Promise<{
  row: BrandPricelistTierSyncRow;
  rows: BrandPricelistTierSyncRow[];
  storageMode: BrandPricelistTierSyncStorageMode;
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const collectionId = input.collectionId.trim();
  const listed = await listBrandPricelistTierSyncServer({
    collectionId,
    organizationId: org,
    seedIfEmpty: true,
  });
  const existing = listed.rows.find((row) => row.tierId === input.tierId);
  if (!existing) throw new Error('TIER_NOT_FOUND');

  const next: BrandPricelistTierSyncRow = {
    ...existing,
    shopSynced: true,
    syncedAt: new Date().toISOString(),
  };

  if (listed.storageMode === 'pg') {
    await upsertPg(org, next);
  } else {
    memoryByKey.set(rowKey(collectionId, next.tierId), next);
    persistFile();
  }

  const rows = await listBrandPricelistTierSyncServer({
    collectionId,
    organizationId: org,
    seedIfEmpty: false,
  });

  return {
    row: next,
    rows: rows.rows,
    storageMode: listed.storageMode,
  };
}
