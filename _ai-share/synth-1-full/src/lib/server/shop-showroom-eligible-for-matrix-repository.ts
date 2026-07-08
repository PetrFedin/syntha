import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopShowroomEligibleForMatrixJournalRow = {
  id: string;
  buyerId: string;
  collectionId: string;
  publishedCount: number;
  eligibleCount: number;
  filterActive: boolean;
  createdAt: string;
};

const memoryJournal: ShopShowroomEligibleForMatrixJournalRow[] = [];
const STORE_FILE = path.join(process.cwd(), 'data', 'shop-showroom-eligible-for-matrix.json');
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
    ) as ShopShowroomEligibleForMatrixJournalRow[];
    if (Array.isArray(parsed)) memoryJournal.push(...parsed);
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryJournal.slice(-200), null, 2));
  } catch {
    /* best effort */
  }
}

export function shopShowroomEligibleForMatrixStorageMode(): 'pg' | 'file' | 'memory' {
  if (pgAvailable) return 'pg';
  if (canUseDiskPersistence() && fs.existsSync(STORE_FILE)) return 'file';
  return 'memory';
}

export async function appendShopShowroomEligibleForMatrixJournal(input: {
  buyerId: string;
  collectionId: string;
  publishedCount: number;
  eligibleCount: number;
  filterActive: boolean;
}): Promise<ShopShowroomEligibleForMatrixJournalRow> {
  const row: ShopShowroomEligibleForMatrixJournalRow = {
    id: `efm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    buyerId: input.buyerId,
    collectionId: input.collectionId,
    publishedCount: input.publishedCount,
    eligibleCount: input.eligibleCount,
    filterActive: input.filterActive,
    createdAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `INSERT INTO shop_showroom_eligible_for_matrix_journal
          (id, buyer_id, collection_id, published_count, eligible_count, filter_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          row.id,
          row.buyerId,
          row.collectionId,
          row.publishedCount,
          row.eligibleCount,
          row.filterActive,
        ]
      );
      pgAvailable = true;
      return row;
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  memoryJournal.push(row);
  persistFile();
  return row;
}

export async function listShopShowroomEligibleForMatrixJournal(input: {
  buyerId: string;
  collectionId: string;
  limit?: number;
}): Promise<ShopShowroomEligibleForMatrixJournalRow[]> {
  const limit = input.limit ?? 12;

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        id: string;
        buyer_id: string;
        collection_id: string;
        published_count: number;
        eligible_count: number;
        filter_active: boolean;
        created_at: Date;
      }>(
        `SELECT id, buyer_id, collection_id, published_count, eligible_count, filter_active, created_at
         FROM shop_showroom_eligible_for_matrix_journal
         WHERE buyer_id = $1 AND collection_id = $2
         ORDER BY created_at DESC
         LIMIT $3`,
        [input.buyerId, input.collectionId, limit]
      );
      pgAvailable = true;
      return res.rows.map((r) => ({
        id: r.id,
        buyerId: r.buyer_id,
        collectionId: r.collection_id,
        publishedCount: r.published_count,
        eligibleCount: r.eligible_count,
        filterActive: r.filter_active,
        createdAt: r.created_at.toISOString(),
      }));
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  return memoryJournal
    .filter((r) => r.buyerId === input.buyerId && r.collectionId === input.collectionId)
    .slice(-limit)
    .reverse();
}
