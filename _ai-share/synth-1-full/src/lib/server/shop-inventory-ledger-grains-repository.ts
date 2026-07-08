import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { InventoryGrain, StockState } from '@/lib/logic/inventory-ledger-core';
import { products } from '@/lib/products';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const memory: InventoryGrain[] = [];
const STORE_FILE = path.join(process.cwd(), 'data', 'shop-inventory-ledger-grains.json');
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
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as InventoryGrain[];
    if (Array.isArray(parsed)) {
      memory.splice(0, memory.length, ...parsed);
    }
  } catch {
    /* ignore */
  }
}

function persistFile(grains: InventoryGrain[]): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(grains, null, 2));
  } catch {
    /* best effort */
  }
}

function rowToGrain(row: {
  grain_id: string;
  shop_id: string;
  sku: string;
  product_id: string;
  product_name: string | null;
  location_id: string;
  state: string;
  quantity: number;
  season_tag: string | null;
  collection_id: string | null;
  channel_id: string | null;
  updated_at: Date;
}): InventoryGrain {
  return {
    grainId: row.grain_id,
    productId: row.product_id,
    sku: row.sku,
    locationId: row.location_id,
    state: row.state as StockState,
    quantity: row.quantity,
    ownerId: row.shop_id,
    tenantId: row.shop_id,
    channelId:
      row.channel_id === 'b2b' || row.channel_id === 'b2c' || row.channel_id === 'retail'
        ? row.channel_id
        : undefined,
    metadata: {
      updatedAt: row.updated_at.toISOString(),
      version: 1,
    },
  };
}

function grainToInsertParams(
  grain: InventoryGrain,
  shopId: string,
  seasonTag: string,
  collectionId: string,
  productName: string
) {
  return [
    grain.grainId,
    shopId,
    grain.sku,
    grain.productId,
    productName,
    grain.locationId,
    grain.state,
    grain.quantity,
    seasonTag,
    collectionId,
    grain.channelId ?? null,
    grain.metadata.updatedAt,
  ];
}

function buildSeedGrains(shopId: string): InventoryGrain[] {
  const now = new Date().toISOString();
  const grains: InventoryGrain[] = [];
  for (const [i, p] of products.slice(5, 17).entries()) {
    const storeStock = (i * 3 + 2) % 18;
    const reserved = Math.min(Math.max(storeStock - 1, 0), (i % 4) + 1);
    const onHandQty = Math.max(storeStock - reserved, 0);
    const seasonTag = (p.season as string | undefined) ?? (i % 2 === 0 ? 'SS27' : 'FW27');
    const collectionId = seasonTag === 'FW27' ? 'FW27' : 'SS27';
    const base = {
      productId: p.sku,
      sku: p.sku,
      locationId: 'shop-main',
      ownerId: shopId,
      tenantId: shopId,
      channelId: 'b2b' as const,
      metadata: {
        updatedAt: now,
        version: 1,
      },
    };
    if (onHandQty > 0) {
      grains.push({
        grainId: `${shopId}-${p.sku}-on-hand`,
        ...base,
        state: 'on_hand',
        quantity: onHandQty,
      });
    }
    if (reserved > 0) {
      grains.push({
        grainId: `${shopId}-${p.sku}-reserved`,
        ...base,
        state: 'reserved',
        quantity: reserved,
      });
    }
    if (i % 4 === 0) {
      grains.push({
        grainId: `${shopId}-${p.sku}-transit`,
        ...base,
        state: 'in_transit',
        quantity: 2,
      });
    }
    if (i % 7 === 0) {
      grains.push({
        grainId: `${shopId}-${p.sku}-unconfirmed`,
        ...base,
        state: 'ex_factory',
        quantity: 1,
      });
    }
  }
  return grains;
}

async function persistGrainsPg(shopId: string, grains: InventoryGrain[]): Promise<boolean> {
  await ensureWorkshop2PgSchema();
  const pool = getWorkshop2PgPool();
  await pool.query(`DELETE FROM shop_inventory_ledger_grains WHERE shop_id = $1`, [shopId]);
  for (const grain of grains) {
    const idx = products.slice(5, 17).findIndex((p) => p.sku === grain.sku);
    const p = products.slice(5, 17)[idx >= 0 ? idx : 0];
    const seasonTag = (p?.season as string | undefined) ?? 'SS27';
    const collectionId = seasonTag === 'FW27' ? 'FW27' : 'SS27';
    await pool.query(
      `INSERT INTO shop_inventory_ledger_grains
         (grain_id, shop_id, sku, product_id, product_name, location_id, state, quantity,
          season_tag, collection_id, channel_id, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::timestamptz)`,
      grainToInsertParams(grain, shopId, seasonTag, collectionId, p?.name ?? grain.sku)
    );
  }
  pgAvailable = true;
  return true;
}

export async function ensureShopInventoryLedgerGrainsSeeded(
  shopId: string
): Promise<InventoryGrain[]> {
  const sid = shopId.trim() || 'shop1';
  const existing = await listShopInventoryLedgerGrainsRaw(sid);
  if (existing.length > 0) return existing;

  const seeded = buildSeedGrains(sid);
  if (isWorkshop2PostgresEnabled()) {
    try {
      await persistGrainsPg(sid, seeded);
      memory.splice(0, memory.length, ...seeded);
      persistFile(seeded);
      return seeded;
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  memory.splice(0, memory.length, ...seeded);
  persistFile(seeded);
  return seeded;
}

async function listShopInventoryLedgerGrainsRaw(shopId: string): Promise<InventoryGrain[]> {
  const sid = shopId.trim() || 'shop1';
  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        grain_id: string;
        shop_id: string;
        sku: string;
        product_id: string;
        product_name: string | null;
        location_id: string;
        state: string;
        quantity: number;
        season_tag: string | null;
        collection_id: string | null;
        channel_id: string | null;
        updated_at: Date;
      }>(
        `SELECT grain_id, shop_id, sku, product_id, product_name, location_id, state, quantity,
                season_tag, collection_id, channel_id, updated_at
         FROM shop_inventory_ledger_grains
         WHERE shop_id = $1
         ORDER BY sku, state`,
        [sid]
      );
      pgAvailable = true;
      return res.rows.map(rowToGrain);
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  return memory.filter((g) => g.ownerId === sid || g.tenantId === sid);
}

export async function listShopInventoryLedgerGrains(input: {
  shopId: string;
  collectionId?: string;
}): Promise<InventoryGrain[]> {
  const sid = input.shopId.trim() || 'shop1';
  let grains = await listShopInventoryLedgerGrainsRaw(sid);
  if (grains.length === 0) {
    grains = await ensureShopInventoryLedgerGrainsSeeded(sid);
  }

  const collectionId = input.collectionId?.trim();
  if (!collectionId || collectionId === 'all') return grains;

  const allowedSkus = new Set(
    products
      .filter((p) => {
        const season = (p.season as string | undefined) ?? 'SS27';
        return season === collectionId || collectionId === season.replace(/\d.*/, collectionId);
      })
      .map((p) => p.sku)
  );
  if (collectionId === 'SS27' || collectionId === 'FW27') {
    return grains.filter((g) => {
      const p = products.find((x) => x.sku === g.sku);
      const season =
        (p?.season as string | undefined) ?? (collectionId === 'FW27' ? 'FW27' : 'SS27');
      return season === collectionId || allowedSkus.has(g.sku);
    });
  }
  return grains.filter((g) => allowedSkus.has(g.sku));
}

export function shopInventoryLedgerGrainsStorageMode(): 'pg' | 'file' | 'memory' {
  if (pgAvailable && isWorkshop2PostgresEnabled()) return 'pg';
  if (canUseDiskPersistence() && fs.existsSync(STORE_FILE)) return 'file';
  return 'memory';
}

/** Test-only reset. */
export async function __clearShopInventoryLedgerGrainsForTests(): Promise<void> {
  memory.splice(0, memory.length);
  fileHydrated = true;
  pgAvailable = false;
  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(`DELETE FROM shop_inventory_ledger_grains`);
    } catch {
      /* ignore */
    }
  }
}
