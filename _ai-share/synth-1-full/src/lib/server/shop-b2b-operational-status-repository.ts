import 'server-only';

import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { ShopB2bOperationalStatusEntry } from '@/lib/order/shop-b2b-operational-status';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

type JournalRow = ShopB2bOperationalStatusEntry & { id: string; idempotencyKey?: string };

const memoryByOrder = new Map<string, JournalRow[]>();
const idempotencyIndex = new Map<string, JournalRow>();
const JOURNAL_FILE = path.join(process.cwd(), 'data', 'shop-b2b-operational-status-journal.json');

let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(JOURNAL_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(JOURNAL_FILE, 'utf8')) as JournalRow[];
    if (!Array.isArray(parsed)) return;
    for (const row of parsed) {
      const orderId = row.orderId?.trim();
      if (!orderId) continue;
      const existing = memoryByOrder.get(orderId) ?? [];
      memoryByOrder.set(orderId, [row, ...existing]);
      if (row.idempotencyKey?.trim()) idempotencyIndex.set(row.idempotencyKey.trim(), row);
    }
  } catch {
    /* best-effort */
  }
}

function persistJournalFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(JOURNAL_FILE), { recursive: true });
    const flat = [...memoryByOrder.values()].flat().slice(-120);
    fs.writeFileSync(JOURNAL_FILE, JSON.stringify(flat, null, 2));
  } catch {
    /* best-effort */
  }
}

export function shopB2bOperationalStatusStorageMode(): 'postgres' | 'file' | 'memory' {
  if (isWorkshop2PostgresEnabled()) return 'postgres';
  if (canUseDiskPersistence() && fs.existsSync(JOURNAL_FILE)) return 'file';
  return 'memory';
}

export type MergeShopOperationalStatusResult =
  | {
      ok: true;
      entry: ShopB2bOperationalStatusEntry;
      idempotentReplay: boolean;
    }
  | { ok: false; code: 'IDEMPOTENCY_CONFLICT' | 'BAD_REQUEST'; message: string };

export async function mergeShopB2bOperationalStatusJournal(params: {
  orderId: string;
  status: string;
  source?: string;
  amendmentId?: string;
  idempotencyKey: string;
  payload?: Record<string, unknown>;
}): Promise<MergeShopOperationalStatusResult> {
  hydrateFileIfNeeded();

  const orderId = params.orderId.trim();
  const status = params.status.trim();
  const idempotencyKey = params.idempotencyKey.trim();

  if (!orderId) {
    return { ok: false, code: 'BAD_REQUEST', message: 'orderId required' };
  }
  if (!status) {
    return { ok: false, code: 'BAD_REQUEST', message: 'status required' };
  }
  if (!idempotencyKey) {
    return { ok: false, code: 'BAD_REQUEST', message: 'idempotencyKey required' };
  }

  const prev = idempotencyIndex.get(idempotencyKey);
  if (prev) {
    if (prev.orderId !== orderId) {
      return {
        ok: false,
        code: 'IDEMPOTENCY_CONFLICT',
        message: 'Idempotency-Key already used for a different order',
      };
    }
    return {
      ok: true,
      entry: {
        orderId: prev.orderId,
        status: prev.status,
        source: prev.source,
        amendmentId: prev.amendmentId,
        updatedAt: prev.updatedAt,
      },
      idempotentReplay: true,
    };
  }

  const now = new Date().toISOString();
  const row: JournalRow = {
    id: `shop-op-${randomUUID().slice(0, 12)}`,
    orderId,
    status,
    source: params.source?.trim() || 'brand_amend_mirror',
    amendmentId: params.amendmentId?.trim() || undefined,
    idempotencyKey,
    updatedAt: now,
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO shop_b2b_operational_status_journal
         (id, order_id, status, source, amendment_id, idempotency_key, payload, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::timestamptz)`,
      [
        row.id,
        row.orderId,
        row.status,
        row.source,
        row.amendmentId ?? null,
        idempotencyKey,
        JSON.stringify(params.payload ?? {}),
        now,
      ]
    );
  }

  const existing = memoryByOrder.get(orderId) ?? [];
  memoryByOrder.set(orderId, [row, ...existing]);
  idempotencyIndex.set(idempotencyKey, row);
  persistJournalFile();

  return {
    ok: true,
    entry: {
      orderId: row.orderId,
      status: row.status,
      source: row.source,
      amendmentId: row.amendmentId,
      updatedAt: row.updatedAt,
    },
    idempotentReplay: false,
  };
}

export async function getLatestShopB2bOperationalStatus(
  orderId: string
): Promise<ShopB2bOperationalStatusEntry | null> {
  hydrateFileIfNeeded();
  const id = orderId.trim();
  if (!id) return null;

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      order_id: string;
      status: string;
      source: string;
      amendment_id: string | null;
      created_at: Date;
    }>(
      `SELECT order_id, status, source, amendment_id, created_at
         FROM shop_b2b_operational_status_journal
        WHERE order_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [id]
    );
    const pg = res.rows[0];
    if (pg) {
      return {
        orderId: pg.order_id,
        status: pg.status,
        source: pg.source,
        amendmentId: pg.amendment_id ?? undefined,
        updatedAt: new Date(pg.created_at).toISOString(),
      };
    }
  }

  const rows = memoryByOrder.get(id) ?? [];
  const latest = rows[0];
  if (!latest) return null;
  return {
    orderId: latest.orderId,
    status: latest.status,
    source: latest.source,
    amendmentId: latest.amendmentId,
    updatedAt: latest.updatedAt,
  };
}

export function clearShopB2bOperationalStatusMemoryForTests(): void {
  memoryByOrder.clear();
  idempotencyIndex.clear();
  fileHydrated = true;
}
