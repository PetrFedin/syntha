import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  REPLENISHMENT_STOCK_SLICE_PRESETS,
  type ReplenishmentStockSlice,
} from '@/lib/platform/shop-replenishment-stock-slices';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import {
  getShopReplenishmentStockSliceServer,
  putShopReplenishmentStockSliceServer,
} from '@/lib/server/shop-replenishment-stock-slice-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopReplenishmentFilterSliceRecord = ReplenishmentStockSlice & {
  sliceId: string;
  isActive: boolean;
  updatedAt: string;
};

export type ShopReplenishmentFilterSlicesSnapshot = {
  buyerId: string;
  presets: readonly ReplenishmentStockSlice[];
  savedSlices: ShopReplenishmentFilterSliceRecord[];
  activeSlice: ReplenishmentStockSlice;
  activeSliceId: string;
};

const memory = new Map<string, ShopReplenishmentFilterSliceRecord[]>();
const STORE_FILE = path.join(process.cwd(), 'data', 'shop-replenishment-filter-slices.json');
let fileHydrated = false;
let pgAvailable = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function sliceKey(slice: ReplenishmentStockSlice): string {
  return `${slice.orgId}::${slice.seasonId}::${slice.collectionId}`;
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as Record<
      string,
      ShopReplenishmentFilterSliceRecord[]
    >;
    if (parsed && typeof parsed === 'object') {
      for (const [buyerId, rows] of Object.entries(parsed)) {
        if (Array.isArray(rows)) memory.set(buyerId, rows);
      }
    }
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    const payload = Object.fromEntries(memory.entries());
    fs.writeFileSync(STORE_FILE, JSON.stringify(payload, null, 2));
  } catch {
    /* best effort */
  }
}

function presetRecords(buyerId: string): ShopReplenishmentFilterSliceRecord[] {
  return REPLENISHMENT_STOCK_SLICE_PRESETS.map((preset, index) => ({
    sliceId: sliceKey(preset),
    orgId: preset.orgId,
    seasonId: preset.seasonId,
    collectionId: preset.collectionId,
    labelRu: preset.labelRu,
    isActive: index === 0,
    updatedAt: new Date(0).toISOString(),
  }));
}

function resolveActiveFromRows(
  rows: ShopReplenishmentFilterSliceRecord[]
): ShopReplenishmentFilterSliceRecord {
  return rows.find((r) => r.isActive) ?? rows[0] ?? presetRecords('shop1')[0]!;
}

async function loadRowsFromPg(buyerId: string): Promise<ShopReplenishmentFilterSliceRecord[] | null> {
  if (!isWorkshop2PostgresEnabled()) return null;
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      slice_id: string;
      org_id: string;
      season_id: string;
      collection_id: string;
      label_ru: string;
      is_active: boolean;
      updated_at: Date;
    }>(
      `SELECT slice_id, org_id, season_id, collection_id, label_ru, is_active, updated_at
       FROM shop_replenishment_filter_slices
       WHERE buyer_id = $1
       ORDER BY is_active DESC, updated_at DESC`,
      [buyerId]
    );
    pgAvailable = true;
    if (res.rows.length === 0) return null;
    return res.rows.map((row) => ({
      sliceId: row.slice_id,
      orgId: row.org_id,
      seasonId: row.season_id,
      collectionId: row.collection_id,
      labelRu: row.label_ru,
      isActive: row.is_active,
      updatedAt: row.updated_at.toISOString(),
    }));
  } catch {
    pgAvailable = false;
    return null;
  }
}

async function seedRowsIfEmpty(buyerId: string): Promise<ShopReplenishmentFilterSliceRecord[]> {
  const legacy = await getShopReplenishmentStockSliceServer(buyerId);
  const presets = presetRecords(buyerId);
  if (!legacy) return presets;
  const activeKey = sliceKey(legacy);
  return presets.map((row) => ({
    ...row,
    isActive: sliceKey(row) === activeKey,
    updatedAt: legacy.updatedAt,
  }));
}

export async function getShopReplenishmentFilterSlicesServer(
  buyerId: string
): Promise<ShopReplenishmentFilterSlicesSnapshot> {
  const bid = buyerId.trim() || 'shop1';
  let rows = (await loadRowsFromPg(bid)) ?? null;
  if (!rows || rows.length === 0) {
    hydrateFileIfNeeded();
    rows = memory.get(bid) ?? null;
  }
  if (!rows || rows.length === 0) {
    rows = await seedRowsIfEmpty(bid);
  }

  const active = resolveActiveFromRows(rows);
  return {
    buyerId: bid,
    presets: REPLENISHMENT_STOCK_SLICE_PRESETS,
    savedSlices: rows,
    activeSlice: {
      orgId: active.orgId,
      seasonId: active.seasonId,
      collectionId: active.collectionId,
      labelRu: active.labelRu,
    },
    activeSliceId: active.sliceId,
  };
}

export async function postShopReplenishmentFilterSliceServer(input: {
  buyerId: string;
  slice: ReplenishmentStockSlice;
  sliceId?: string;
}): Promise<ShopReplenishmentFilterSlicesSnapshot> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const slice = {
    orgId: input.slice.orgId.trim() || 'shop1',
    seasonId: input.slice.seasonId.trim() || 'all',
    collectionId: input.slice.collectionId.trim() || 'all',
    labelRu: input.slice.labelRu.trim() || `${input.slice.orgId} · ${input.slice.seasonId}`,
  };
  const sliceId = input.sliceId?.trim() || sliceKey(slice);
  const updatedAt = new Date().toISOString();

  const snapshot = await getShopReplenishmentFilterSlicesServer(buyerId);
  const nextRows = snapshot.savedSlices.map((row) => ({
    ...row,
    isActive: row.sliceId === sliceId,
    updatedAt: row.sliceId === sliceId ? updatedAt : row.updatedAt,
  }));
  const existing = nextRows.find((r) => r.sliceId === sliceId);
  if (existing) {
    Object.assign(existing, { ...slice, isActive: true, updatedAt });
  } else {
    nextRows.push({
      sliceId,
      ...slice,
      isActive: true,
      updatedAt,
    });
  }
  for (const row of nextRows) {
    row.isActive = row.sliceId === sliceId;
  }

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `UPDATE shop_replenishment_filter_slices SET is_active = false WHERE buyer_id = $1`,
        [buyerId]
      );
      await getWorkshop2PgPool().query(
        `INSERT INTO shop_replenishment_filter_slices
           (buyer_id, slice_id, org_id, season_id, collection_id, label_ru, is_active, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,true,$7::timestamptz)
         ON CONFLICT (buyer_id, slice_id) DO UPDATE SET
           org_id = EXCLUDED.org_id,
           season_id = EXCLUDED.season_id,
           collection_id = EXCLUDED.collection_id,
           label_ru = EXCLUDED.label_ru,
           is_active = true,
           updated_at = EXCLUDED.updated_at`,
        [
          buyerId,
          sliceId,
          slice.orgId,
          slice.seasonId,
          slice.collectionId,
          slice.labelRu,
          updatedAt,
        ]
      );
      pgAvailable = true;
    } catch {
      pgAvailable = false;
    }
  }

  memory.set(buyerId, nextRows);
  persistFile();

  await putShopReplenishmentStockSliceServer({
    buyerId,
    ...slice,
  });

  return getShopReplenishmentFilterSlicesServer(buyerId);
}

export function shopReplenishmentFilterSlicesStorageMode(): 'pg' | 'file' | 'memory' {
  if (pgAvailable && isWorkshop2PostgresEnabled()) return 'pg';
  if (canUseDiskPersistence() && fs.existsSync(STORE_FILE)) return 'file';
  return 'memory';
}
