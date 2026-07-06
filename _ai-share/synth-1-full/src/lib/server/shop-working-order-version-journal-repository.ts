import 'server-only';

import { randomUUID } from 'node:crypto';

import fs from 'node:fs';
import path from 'node:path';

import type { WorkingOrderVersionDiffResult } from '@/lib/server/shop-working-order-version-diff';
import type { ShopWorkingOrderMergeToMatrixResult } from '@/lib/server/shop-working-order-merge-to-matrix';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopWorkingOrderVersionJournalEventType = 'version_diff' | 'merge_to_matrix';

export type ShopWorkingOrderVersionJournalRow = {
  id: string;
  wholesaleOrderId: string;
  eventType: ShopWorkingOrderVersionJournalEventType;
  fromVersionId?: string;
  toVersionId?: string;
  diffJson: Record<string, unknown>;
  mergedLines: number;
  eligibleLines: number;
  partialMerge: boolean;
  buyerId?: string;
  collectionId?: string;
  messageRu: string;
  createdAt: string;
};

const memoryJournal: ShopWorkingOrderVersionJournalRow[] = [];
const JOURNAL_FILE = path.join(process.cwd(), 'data', 'shop-working-order-version-journal.json');
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
    if (!fs.existsSync(JOURNAL_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(JOURNAL_FILE, 'utf8')) as ShopWorkingOrderVersionJournalRow[];
    if (Array.isArray(parsed)) memoryJournal.splice(0, memoryJournal.length, ...parsed);
  } catch {
    /* ignore */
  }
}

function persistJournalFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(JOURNAL_FILE), { recursive: true });
    fs.writeFileSync(JOURNAL_FILE, JSON.stringify(memoryJournal.slice(-120), null, 2));
  } catch {
    /* best effort */
  }
}

export function shopWorkingOrderVersionJournalStorageMode(): 'postgres' | 'file' | 'memory' {
  if (pgAvailable || isWorkshop2PostgresEnabled()) return 'postgres';
  if (canUseDiskPersistence() && fs.existsSync(JOURNAL_FILE)) return 'file';
  return 'memory';
}

export function clearShopWorkingOrderVersionJournalMemoryForTests(): void {
  memoryJournal.splice(0, memoryJournal.length);
  fileHydrated = true;
  pgAvailable = false;
}

export async function appendShopWorkingOrderVersionDiffJournal(input: {
  diff: WorkingOrderVersionDiffResult;
}): Promise<ShopWorkingOrderVersionJournalRow> {
  return appendShopWorkingOrderVersionJournal({
    wholesaleOrderId: input.diff.wholesaleOrderId,
    eventType: 'version_diff',
    fromVersionId: input.diff.fromVersionId,
    toVersionId: input.diff.toVersionId,
    diffJson: {
      addedLines: input.diff.addedLines,
      removedLines: input.diff.removedLines,
      changedLines: input.diff.changedLines,
      summaryRu: input.diff.summaryRu,
    },
    messageRu: input.diff.summaryRu,
  });
}

export async function appendShopWorkingOrderMergeJournal(input: {
  result: ShopWorkingOrderMergeToMatrixResult;
  buyerId?: string;
}): Promise<ShopWorkingOrderVersionJournalRow> {
  return appendShopWorkingOrderVersionJournal({
    wholesaleOrderId: input.result.wholesaleOrderId,
    eventType: 'merge_to_matrix',
    toVersionId: input.result.versionId,
    diffJson: { matrixHref: input.result.matrixHref },
    mergedLines: input.result.mergedLines,
    eligibleLines: input.result.eligibleLines,
    partialMerge: input.result.partialMerge,
    buyerId: input.buyerId,
    collectionId: input.result.collectionId,
    messageRu: input.result.messageRu,
  });
}

async function appendShopWorkingOrderVersionJournal(input: {
  wholesaleOrderId: string;
  eventType: ShopWorkingOrderVersionJournalEventType;
  fromVersionId?: string;
  toVersionId?: string;
  diffJson?: Record<string, unknown>;
  mergedLines?: number;
  eligibleLines?: number;
  partialMerge?: boolean;
  buyerId?: string;
  collectionId?: string;
  messageRu: string;
}): Promise<ShopWorkingOrderVersionJournalRow> {
  hydrateFileIfNeeded();
  const row: ShopWorkingOrderVersionJournalRow = {
    id: `woj-${randomUUID().slice(0, 12)}`,
    wholesaleOrderId: input.wholesaleOrderId.trim(),
    eventType: input.eventType,
    fromVersionId: input.fromVersionId?.trim() || undefined,
    toVersionId: input.toVersionId?.trim() || undefined,
    diffJson: input.diffJson ?? {},
    mergedLines: input.mergedLines ?? 0,
    eligibleLines: input.eligibleLines ?? 0,
    partialMerge: input.partialMerge ?? false,
    buyerId: input.buyerId?.trim() || undefined,
    collectionId: input.collectionId?.trim() || undefined,
    messageRu: input.messageRu,
    createdAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `INSERT INTO shop_working_order_version_journal
           (id, wholesale_order_id, event_type, from_version_id, to_version_id,
            diff_json, merged_lines, eligible_lines, partial_merge, buyer_id, collection_id, message_ru, created_at)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,$13::timestamptz)`,
        [
          row.id,
          row.wholesaleOrderId,
          row.eventType,
          row.fromVersionId ?? null,
          row.toVersionId ?? null,
          JSON.stringify(row.diffJson),
          row.mergedLines,
          row.eligibleLines,
          row.partialMerge,
          row.buyerId ?? null,
          row.collectionId ?? null,
          row.messageRu,
          row.createdAt,
        ]
      );
      pgAvailable = true;
      return row;
    } catch {
      /* fall through to memory */
    }
  }

  memoryJournal.push(row);
  persistJournalFile();
  return row;
}

export async function listShopWorkingOrderVersionJournal(input: {
  wholesaleOrderId: string;
  limit?: number;
}): Promise<ShopWorkingOrderVersionJournalRow[]> {
  hydrateFileIfNeeded();
  const orderId = input.wholesaleOrderId.trim();
  const cap = Math.min(Math.max(input.limit ?? 12, 1), 100);

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        id: string;
        wholesale_order_id: string;
        event_type: string;
        from_version_id: string | null;
        to_version_id: string | null;
        diff_json: Record<string, unknown>;
        merged_lines: number;
        eligible_lines: number;
        partial_merge: boolean;
        buyer_id: string | null;
        collection_id: string | null;
        message_ru: string;
        created_at: Date;
      }>(
        `SELECT id, wholesale_order_id, event_type, from_version_id, to_version_id,
                diff_json, merged_lines, eligible_lines, partial_merge, buyer_id, collection_id, message_ru, created_at
         FROM shop_working_order_version_journal
         WHERE wholesale_order_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [orderId, cap]
      );
      pgAvailable = true;
      return res.rows.map((r) => ({
        id: r.id,
        wholesaleOrderId: r.wholesale_order_id,
        eventType: r.event_type as ShopWorkingOrderVersionJournalEventType,
        fromVersionId: r.from_version_id ?? undefined,
        toVersionId: r.to_version_id ?? undefined,
        diffJson: r.diff_json ?? {},
        mergedLines: r.merged_lines,
        eligibleLines: r.eligible_lines,
        partialMerge: r.partial_merge,
        buyerId: r.buyer_id ?? undefined,
        collectionId: r.collection_id ?? undefined,
        messageRu: r.message_ru,
        createdAt: r.created_at.toISOString(),
      }));
    } catch {
      /* fall through */
    }
  }

  return memoryJournal
    .filter((r) => r.wholesaleOrderId === orderId)
    .slice(-cap)
    .reverse();
}
