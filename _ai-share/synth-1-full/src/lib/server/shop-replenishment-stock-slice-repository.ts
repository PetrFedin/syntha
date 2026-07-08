import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { ReplenishmentStockSlice } from '@/lib/platform/shop-replenishment-stock-slices';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopReplenishmentStockSliceConfig = ReplenishmentStockSlice & {
  buyerId: string;
  updatedAt: string;
};

const memory = new Map<string, ShopReplenishmentStockSliceConfig>();
const STORE_FILE = path.join(process.cwd(), 'data', 'shop-replenishment-stock-slices.json');
let fileHydrated = false;
let pgAvailable = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(
      fs.readFileSync(STORE_FILE, 'utf8')
    ) as ShopReplenishmentStockSliceConfig[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        if (row.buyerId) memory.set(row.buyerId.trim(), row);
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
    fs.writeFileSync(STORE_FILE, JSON.stringify([...memory.values()], null, 2));
  } catch {
    /* best effort */
  }
}

export async function getShopReplenishmentStockSliceServer(
  buyerId: string
): Promise<ShopReplenishmentStockSliceConfig | null> {
  const bid = buyerId.trim() || 'shop1';
  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        org_id: string;
        season_id: string;
        collection_id: string;
        label_ru: string;
        updated_at: Date;
      }>(
        `SELECT org_id, season_id, collection_id, label_ru, updated_at
         FROM shop_replenishment_stock_slices WHERE buyer_id = $1`,
        [bid]
      );
      pgAvailable = true;
      const row = res.rows[0];
      if (!row) return null;
      return {
        buyerId: bid,
        orgId: row.org_id,
        seasonId: row.season_id,
        collectionId: row.collection_id,
        labelRu: row.label_ru,
        updatedAt: row.updated_at.toISOString(),
      };
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  return memory.get(bid) ?? null;
}

export async function putShopReplenishmentStockSliceServer(
  config: Omit<ShopReplenishmentStockSliceConfig, 'updatedAt'> & { updatedAt?: string }
): Promise<ShopReplenishmentStockSliceConfig> {
  const buyerId = config.buyerId.trim() || 'shop1';
  const next: ShopReplenishmentStockSliceConfig = {
    buyerId,
    orgId: config.orgId.trim() || 'shop1',
    seasonId: config.seasonId.trim() || 'all',
    collectionId: config.collectionId.trim() || 'all',
    labelRu: config.labelRu.trim() || `${config.orgId} · ${config.seasonId}`,
    updatedAt: config.updatedAt ?? new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `INSERT INTO shop_replenishment_stock_slices
           (buyer_id, org_id, season_id, collection_id, label_ru, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6::timestamptz)
         ON CONFLICT (buyer_id) DO UPDATE SET
           org_id = EXCLUDED.org_id,
           season_id = EXCLUDED.season_id,
           collection_id = EXCLUDED.collection_id,
           label_ru = EXCLUDED.label_ru,
           updated_at = EXCLUDED.updated_at`,
        [buyerId, next.orgId, next.seasonId, next.collectionId, next.labelRu, next.updatedAt]
      );
      pgAvailable = true;
    } catch {
      pgAvailable = false;
    }
  }

  memory.set(buyerId, next);
  persistFile();
  return next;
}

export function shopReplenishmentStockSliceStorageMode(): 'pg' | 'file' | 'memory' {
  if (pgAvailable && isWorkshop2PostgresEnabled()) return 'pg';
  if (canUseDiskPersistence() && fs.existsSync(STORE_FILE)) return 'file';
  return 'memory';
}
