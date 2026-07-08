import 'server-only';

import { randomUUID } from 'node:crypto';

import fs from 'node:fs';
import path from 'node:path';

import type { ShopCollaborativeApprovalStepId } from '@/lib/shop/shop-collaborative-approval-feed';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type ShopCollaborativeSessionJournalEventType = 'brand_margin_approve' | 'shop_step_advance';

export type ShopCollaborativeSessionJournalRow = {
  id: string;
  buyerId: string;
  orderId: string;
  eventType: ShopCollaborativeSessionJournalEventType;
  stepId?: ShopCollaborativeApprovalStepId;
  brandActor?: string;
  messageRu: string;
  createdAt: string;
};

const memoryJournal: ShopCollaborativeSessionJournalRow[] = [];
const JOURNAL_FILE = path.join(process.cwd(), 'data', 'shop-collaborative-session-journal.json');
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
    const parsed = JSON.parse(
      fs.readFileSync(JOURNAL_FILE, 'utf8')
    ) as ShopCollaborativeSessionJournalRow[];
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

export function shopCollaborativeSessionJournalStorageMode(): 'postgres' | 'file' | 'memory' {
  if (pgAvailable || isWorkshop2PostgresEnabled()) return 'postgres';
  if (canUseDiskPersistence() && fs.existsSync(JOURNAL_FILE)) return 'file';
  return 'memory';
}

export function clearShopCollaborativeSessionJournalMemoryForTests(): void {
  memoryJournal.splice(0, memoryJournal.length);
  fileHydrated = true;
  pgAvailable = false;
}

async function appendShopCollaborativeSessionJournal(input: {
  buyerId: string;
  orderId: string;
  eventType: ShopCollaborativeSessionJournalEventType;
  stepId?: ShopCollaborativeApprovalStepId;
  brandActor?: string;
  messageRu: string;
}): Promise<ShopCollaborativeSessionJournalRow> {
  hydrateFileIfNeeded();
  const row: ShopCollaborativeSessionJournalRow = {
    id: `csl-${randomUUID().slice(0, 12)}`,
    buyerId: input.buyerId.trim() || 'shop1',
    orderId: input.orderId.trim(),
    eventType: input.eventType,
    stepId: input.stepId,
    brandActor: input.brandActor?.trim() || undefined,
    messageRu: input.messageRu,
    createdAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `INSERT INTO shop_collaborative_session_journal
           (id, buyer_id, order_id, event_type, step_id, brand_actor, message_ru, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::timestamptz)`,
        [
          row.id,
          row.buyerId,
          row.orderId,
          row.eventType,
          row.stepId ?? null,
          row.brandActor ?? null,
          row.messageRu,
          row.createdAt,
        ]
      );
      pgAvailable = true;
      memoryJournal.push(row);
      persistJournalFile();
      return row;
    } catch {
      pgAvailable = false;
    }
  }

  memoryJournal.push(row);
  persistJournalFile();
  return row;
}

export async function appendBrandCollaborativeMarginJournal(input: {
  buyerId: string;
  orderId: string;
  brandActorLabel?: string;
}): Promise<ShopCollaborativeSessionJournalRow> {
  const brandActor = input.brandActorLabel?.trim() || 'brand';
  return appendShopCollaborativeSessionJournal({
    buyerId: input.buyerId,
    orderId: input.orderId,
    eventType: 'brand_margin_approve',
    stepId: 'margin',
    brandActor,
    messageRu: `Бренд согласовал маржу (${brandActor}) · магазин может отправить заказ.`,
  });
}

export async function appendShopCollaborativeStepJournal(input: {
  buyerId: string;
  orderId: string;
  stepId: ShopCollaborativeApprovalStepId;
}): Promise<ShopCollaborativeSessionJournalRow> {
  const labels: Record<ShopCollaborativeApprovalStepId, string> = {
    matrix: 'Магазин зафиксировал матрицу.',
    margin: 'Магазин отметил маржу (ожидает бренд).',
    submit: 'Магазин отправил заказ бренду.',
  };
  return appendShopCollaborativeSessionJournal({
    buyerId: input.buyerId,
    orderId: input.orderId,
    eventType: 'shop_step_advance',
    stepId: input.stepId,
    messageRu: labels[input.stepId],
  });
}

export async function listShopCollaborativeSessionJournal(input: {
  buyerId: string;
  orderId: string;
  limit?: number;
}): Promise<ShopCollaborativeSessionJournalRow[]> {
  hydrateFileIfNeeded();
  const buyerId = input.buyerId.trim() || 'shop1';
  const orderId = input.orderId.trim();
  const limit = Math.min(Math.max(input.limit ?? 8, 1), 40);

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        id: string;
        buyer_id: string;
        order_id: string;
        event_type: string;
        step_id: string | null;
        brand_actor: string | null;
        message_ru: string;
        created_at: Date;
      }>(
        `SELECT id, buyer_id, order_id, event_type, step_id, brand_actor, message_ru, created_at
         FROM shop_collaborative_session_journal
         WHERE buyer_id = $1 AND order_id = $2
         ORDER BY created_at DESC
         LIMIT $3`,
        [buyerId, orderId, limit]
      );
      pgAvailable = true;
      return res.rows.map((row) => ({
        id: row.id,
        buyerId: row.buyer_id,
        orderId: row.order_id,
        eventType: row.event_type as ShopCollaborativeSessionJournalEventType,
        stepId: (row.step_id as ShopCollaborativeApprovalStepId | null) ?? undefined,
        brandActor: row.brand_actor ?? undefined,
        messageRu: row.message_ru,
        createdAt: row.created_at.toISOString(),
      }));
    } catch {
      pgAvailable = false;
    }
  }

  return memoryJournal
    .filter((row) => row.buyerId === buyerId && row.orderId === orderId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
