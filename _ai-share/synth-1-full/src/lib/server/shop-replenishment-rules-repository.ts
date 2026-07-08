import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { ShopReplenishmentRulesConfig } from '@/lib/shop/shop-replenishment-rules-store.types';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const memory = new Map<string, ShopReplenishmentRulesConfig>();
const STORE_FILE = path.join(process.cwd(), 'data', 'shop-replenishment-rules.json');
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
    ) as ShopReplenishmentRulesConfig[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        if (row.buyerId) memory.set(row.buyerId.trim(), row);
      }
    }
  } catch {
    /* ignore corrupt file */
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

export async function getShopReplenishmentRulesServer(
  buyerId: string
): Promise<ShopReplenishmentRulesConfig | null> {
  const bid = buyerId.trim() || 'shop1';
  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        active_preset_id: string;
        updated_at: Date;
      }>(`SELECT active_preset_id, updated_at FROM shop_replenishment_rules WHERE buyer_id = $1`, [
        bid,
      ]);
      pgAvailable = true;
      const row = res.rows[0];
      if (!row) return null;
      return {
        buyerId: bid,
        activePresetId: row.active_preset_id,
        updatedAt: row.updated_at.toISOString(),
      };
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  return memory.get(bid) ?? null;
}

export async function putShopReplenishmentRulesServer(
  config: ShopReplenishmentRulesConfig
): Promise<ShopReplenishmentRulesConfig> {
  const buyerId = config.buyerId.trim() || 'shop1';
  const next: ShopReplenishmentRulesConfig = {
    ...config,
    buyerId,
    updatedAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `INSERT INTO shop_replenishment_rules (buyer_id, active_preset_id, updated_at)
         VALUES ($1, $2, $3::timestamptz)
         ON CONFLICT (buyer_id) DO UPDATE SET
           active_preset_id = EXCLUDED.active_preset_id,
           updated_at = EXCLUDED.updated_at`,
        [buyerId, next.activePresetId, next.updatedAt]
      );
      pgAvailable = true;
      memory.set(buyerId, next);
      persistFile();
      return next;
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  memory.set(buyerId, next);
  persistFile();
  return next;
}

/** Storage mode hint for API responses. */
export function shopReplenishmentRulesStorageMode(): 'pg' | 'file' | 'memory' {
  if (pgAvailable && isWorkshop2PostgresEnabled()) return 'pg';
  if (canUseDiskPersistence() && fs.existsSync(STORE_FILE)) return 'file';
  return 'memory';
}
