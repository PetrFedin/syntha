import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type {
  ShopInventoryLedgerAdjustRecord,
  ShopInventoryLedgerAdjustResult,
} from '@/lib/shop/shop-inventory-ledger-adjust.types';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const memory: ShopInventoryLedgerAdjustRecord[] = [];
const STORE_FILE = path.join(process.cwd(), 'data', 'shop-inventory-ledger-adjustments.json');
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
    ) as ShopInventoryLedgerAdjustRecord[];
    if (Array.isArray(parsed)) {
      memory.splice(0, memory.length, ...parsed);
    }
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(memory, null, 2));
  } catch {
    /* best effort */
  }
}

function newId(): string {
  return `adj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listShopInventoryLedgerAdjustments(
  shopId: string
): Promise<ShopInventoryLedgerAdjustRecord[]> {
  const sid = shopId.trim() || 'shop1';
  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        id: string;
        shop_id: string;
        sku: string;
        delta: number;
        reason: string;
        adjusted_at: Date;
      }>(
        `SELECT id, shop_id, sku, delta, reason, adjusted_at
         FROM shop_inventory_ledger_adjustments
         WHERE shop_id = $1
         ORDER BY adjusted_at DESC`,
        [sid]
      );
      pgAvailable = true;
      return res.rows.map((r) => ({
        id: r.id,
        shopId: r.shop_id,
        sku: r.sku,
        delta: r.delta,
        reason: 'cycle_count_reconcile' as const,
        adjustedAt: r.adjusted_at.toISOString(),
      }));
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  return memory.filter((r) => r.shopId === sid);
}

export async function appendShopInventoryLedgerAdjust(input: {
  shopId: string;
  sku: string;
  ledgerAtp: number;
  physicalOnHand: number;
}): Promise<ShopInventoryLedgerAdjustResult> {
  const sid = input.shopId.trim() || 'shop1';
  const sku = input.sku.trim();
  const delta = input.physicalOnHand - input.ledgerAtp;
  const record: ShopInventoryLedgerAdjustRecord = {
    id: newId(),
    shopId: sid,
    sku,
    delta,
    reason: 'cycle_count_reconcile',
    adjustedAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `INSERT INTO shop_inventory_ledger_adjustments (id, shop_id, sku, delta, reason, adjusted_at)
         VALUES ($1, $2, $3, $4, $5, $6::timestamptz)`,
        [record.id, sid, sku, delta, record.reason, record.adjustedAt]
      );
      pgAvailable = true;
      memory.push(record);
      persistFile();
    } catch {
      pgAvailable = false;
      hydrateFileIfNeeded();
      memory.push(record);
      persistFile();
    }
  } else {
    hydrateFileIfNeeded();
    memory.push(record);
    persistFile();
  }

  const newLedgerAtp = input.ledgerAtp + delta;
  return {
    record,
    newLedgerAtp,
    diffAfter: input.physicalOnHand - newLedgerAtp,
  };
}

export function shopInventoryLedgerAdjustStorageMode(): 'pg' | 'file' | 'memory' {
  if (pgAvailable && isWorkshop2PostgresEnabled()) return 'pg';
  if (canUseDiskPersistence() && fs.existsSync(STORE_FILE)) return 'file';
  return 'memory';
}
