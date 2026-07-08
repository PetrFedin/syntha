import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { Workshop2B2bCommissionLine } from '@/lib/production/workshop2-b2b-commission';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const memoryLines: Workshop2B2bCommissionLine[] = [];
const STORE_FILE = path.join(process.cwd(), 'data', 'workshop2-b2b-commissions.json');
let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test' && !isWorkshop2PgOnlyMode();
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Workshop2B2bCommissionLine[];
    if (Array.isArray(parsed)) memoryLines.push(...parsed);
  } catch {
    /* best-effort */
  }
}

function flushFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryLines, null, 2), 'utf8');
  } catch {
    /* best-effort */
  }
}

function newCommissionId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `w2comm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapPgRow(r: {
  id: string;
  rep_id: string;
  order_id: string;
  order_total_rub: string | number;
  commission_pct: string | number;
  commission_rub: string | number;
  customer_name: string | null;
  attributed_at: Date;
  payout_status?: string | null;
}): Workshop2B2bCommissionLine {
  const payoutRaw = String(r.payout_status ?? 'accrued').trim();
  const payoutStatus =
    payoutRaw === 'payout_pending' || payoutRaw === 'paid' ? payoutRaw : 'accrued';
  return {
    id: r.id,
    orderId: r.order_id,
    repId: r.rep_id,
    orderTotalRub: Number(r.order_total_rub) || 0,
    commissionPct: Number(r.commission_pct) || 0,
    commissionRub: Number(r.commission_rub) || 0,
    customerName: r.customer_name ?? undefined,
    attributedAt: r.attributed_at.toISOString(),
    payoutStatus,
  };
}

export async function upsertWorkshop2B2bCommissionLineOnOrderSubmit(input: {
  line: Workshop2B2bCommissionLine;
  organizationId?: string;
}): Promise<{ persisted: boolean; mode: 'postgres' | 'file' | 'memory' | 'pg_only_blocked' }> {
  const line = input.line;
  const org = input.organizationId ?? 'org-brand-001';

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const id = newCommissionId();
    await getWorkshop2PgPool().query(
      `INSERT INTO workshop2_b2b_commissions
         (id, organization_id, rep_id, order_id, order_total_rub, commission_pct, commission_rub,
          customer_name, attributed_at, payout_status, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz, $10, $11::jsonb)
       ON CONFLICT (organization_id, order_id) DO UPDATE SET
         rep_id = EXCLUDED.rep_id,
         order_total_rub = EXCLUDED.order_total_rub,
         commission_pct = EXCLUDED.commission_pct,
         commission_rub = EXCLUDED.commission_rub,
         customer_name = EXCLUDED.customer_name,
         attributed_at = EXCLUDED.attributed_at,
         payout_status = CASE
           WHEN workshop2_b2b_commissions.payout_status = 'paid' THEN workshop2_b2b_commissions.payout_status
           ELSE EXCLUDED.payout_status
         END`,
      [
        id,
        org,
        line.repId,
        line.orderId,
        line.orderTotalRub,
        line.commissionPct,
        line.commissionRub,
        line.customerName ?? null,
        line.attributedAt,
        line.payoutStatus ?? 'accrued',
        JSON.stringify({ source: 'order_submit' }),
      ]
    );
    return { persisted: true, mode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) {
    return { persisted: false, mode: 'pg_only_blocked' };
  }

  hydrateFileIfNeeded();
  const idx = memoryLines.findIndex((l) => l.orderId === line.orderId);
  if (idx >= 0) {
    memoryLines[idx] = {
      ...line,
      payoutStatus: line.payoutStatus ?? memoryLines[idx]?.payoutStatus ?? 'accrued',
    };
  } else {
    memoryLines.push({ ...line, payoutStatus: line.payoutStatus ?? 'accrued' });
  }
  flushFile();
  return { persisted: true, mode: canUseDiskPersistence() ? 'file' : 'memory' };
}

export async function persistWorkshop2B2bCommissionLine(input: {
  line: Workshop2B2bCommissionLine;
  organizationId?: string;
}): Promise<{ persisted: boolean; mode: 'postgres' | 'file' | 'memory' | 'pg_only_blocked' }> {
  const line = input.line;
  const org = input.organizationId ?? 'org-brand-001';
  const id = newCommissionId();

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO workshop2_b2b_commissions
         (id, organization_id, rep_id, order_id, order_total_rub, commission_pct, commission_rub,
          customer_name, attributed_at, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz, $10::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [
        id,
        org,
        line.repId,
        line.orderId,
        line.orderTotalRub,
        line.commissionPct,
        line.commissionRub,
        line.customerName ?? null,
        line.attributedAt,
        JSON.stringify({ source: 'calculated' }),
      ]
    );
    return { persisted: true, mode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) {
    return { persisted: false, mode: 'pg_only_blocked' };
  }

  hydrateFileIfNeeded();
  memoryLines.push(line);
  flushFile();
  return { persisted: true, mode: canUseDiskPersistence() ? 'file' : 'memory' };
}

export async function listWorkshop2B2bCommissionLinesForRep(input: {
  repId: string;
  organizationId?: string;
}): Promise<Workshop2B2bCommissionLine[]> {
  const repId = input.repId.trim();
  const org = input.organizationId ?? 'org-brand-001';

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      id: string;
      rep_id: string;
      order_id: string;
      order_total_rub: string | number;
      commission_pct: string | number;
      commission_rub: string | number;
      customer_name: string | null;
      attributed_at: Date;
      payout_status: string;
    }>(
      `SELECT id, rep_id, order_id, order_total_rub, commission_pct, commission_rub,
              customer_name, attributed_at, payout_status
       FROM workshop2_b2b_commissions
       WHERE organization_id = $1 AND rep_id = $2
       ORDER BY attributed_at DESC`,
      [org, repId]
    );
    return res.rows.map(mapPgRow);
  }

  if (isWorkshop2PgOnlyMode()) {
    return [];
  }

  hydrateFileIfNeeded();
  return memoryLines.filter((l) => l.repId === repId);
}

export async function listWorkshop2B2bCommissionLinesForOrganization(input?: {
  organizationId?: string;
  repId?: string;
  limit?: number;
  seedIfEmpty?: boolean;
}): Promise<Workshop2B2bCommissionLine[]> {
  const org = input?.organizationId ?? 'org-brand-001';
  const repFilter = input?.repId?.trim();
  const limit = Math.min(Math.max(input?.limit ?? 100, 1), 500);
  const seedIfEmpty = input?.seedIfEmpty !== false;

  const queryPgLines = async (): Promise<Workshop2B2bCommissionLine[]> => {
    await ensureWorkshop2PgSchema();
    const params: unknown[] = [org];
    let sql = `SELECT id, rep_id, order_id, order_total_rub, commission_pct, commission_rub,
                      customer_name, attributed_at, payout_status
               FROM workshop2_b2b_commissions
               WHERE organization_id = $1`;
    if (repFilter) {
      params.push(repFilter);
      sql += ` AND rep_id = $${params.length}`;
    }
    params.push(limit);
    sql += ` ORDER BY attributed_at DESC LIMIT $${params.length}`;
    const res = await getWorkshop2PgPool().query<{
      id: string;
      rep_id: string;
      order_id: string;
      order_total_rub: string | number;
      commission_pct: string | number;
      commission_rub: string | number;
      customer_name: string | null;
      attributed_at: Date;
      payout_status: string;
    }>(sql, params);
    return res.rows.map(mapPgRow);
  };

  if (isWorkshop2PostgresEnabled()) {
    let lines = await queryPgLines();
    if (!lines.length && seedIfEmpty) {
      await seedWorkshop2B2bCommissionLines(org);
      lines = await queryPgLines();
    }
    return lines;
  }

  if (isWorkshop2PgOnlyMode()) {
    return [];
  }

  hydrateFileIfNeeded();
  let lines = memoryLines.filter((l) => (repFilter ? l.repId === repFilter : true)).slice(0, limit);
  if (!lines.length && seedIfEmpty) {
    await seedWorkshop2B2bCommissionLines(org);
    lines = memoryLines.filter((l) => (repFilter ? l.repId === repFilter : true)).slice(0, limit);
  }
  return lines;
}

const SEED_COMMISSION_LINES: Workshop2B2bCommissionLine[] = [
  {
    orderId: 'B2B-0010',
    repId: 'rep-anna',
    orderTotalRub: 1_200_000,
    commissionPct: 3,
    commissionRub: 36_000,
    customerName: 'Multibrand RU',
    attributedAt: '2026-03-15T10:00:00.000Z',
    payoutStatus: 'accrued',
  },
  {
    orderId: 'B2B-0012',
    repId: 'rep-ivan',
    orderTotalRub: 750_000,
    commissionPct: 3,
    commissionRub: 22_500,
    customerName: 'Boutique SPB',
    attributedAt: '2026-03-18T12:00:00.000Z',
    payoutStatus: 'payout_pending',
  },
  {
    orderId: 'B2B-0008',
    repId: 'rep-anna',
    orderTotalRub: 2_100_000,
    commissionPct: 3,
    commissionRub: 63_000,
    customerName: 'Department Store',
    attributedAt: '2026-02-10T09:00:00.000Z',
    payoutStatus: 'paid',
  },
];

async function seedWorkshop2B2bCommissionLines(org: string): Promise<void> {
  if (isWorkshop2PostgresEnabled()) {
    for (const line of SEED_COMMISSION_LINES) {
      await upsertWorkshop2B2bCommissionLineOnOrderSubmit({ line, organizationId: org });
    }
    return;
  }
  if (isWorkshop2PgOnlyMode()) return;
  hydrateFileIfNeeded();
  for (const line of SEED_COMMISSION_LINES) {
    const idx = memoryLines.findIndex((l) => l.orderId === line.orderId);
    if (idx >= 0) {
      memoryLines[idx] = { ...line, payoutStatus: line.payoutStatus ?? 'accrued' };
    } else {
      memoryLines.push({ ...line, payoutStatus: line.payoutStatus ?? 'accrued' });
    }
  }
  flushFile();
}

export async function markWorkshop2B2bCommissionsPayoutPending(input: {
  repId: string;
  orderIds?: string[];
  organizationId?: string;
}): Promise<{
  updatedCount: number;
  mode: 'postgres' | 'file' | 'memory' | 'pg_only_blocked';
}> {
  const repId = input.repId.trim();
  const org = input.organizationId ?? 'org-brand-001';
  const orderFilter = input.orderIds?.length ? input.orderIds : undefined;

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    if (orderFilter?.length) {
      const res = await getWorkshop2PgPool().query(
        `UPDATE workshop2_b2b_commissions
         SET payout_status = $4
         WHERE organization_id = $1 AND rep_id = $2 AND payout_status <> $4 AND order_id = ANY($3::text[])`,
        [org, repId, orderFilter, 'payout_pending']
      );
      return { updatedCount: res.rowCount ?? 0, mode: 'postgres' };
    }
    const res = await getWorkshop2PgPool().query(
      `UPDATE workshop2_b2b_commissions
       SET payout_status = $3
       WHERE organization_id = $1 AND rep_id = $2 AND payout_status <> $3`,
      [org, repId, 'payout_pending']
    );
    return { updatedCount: res.rowCount ?? 0, mode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) {
    return { updatedCount: 0, mode: 'pg_only_blocked' };
  }

  hydrateFileIfNeeded();
  let updated = 0;
  for (const line of memoryLines) {
    if (line.repId !== repId) continue;
    if (orderFilter && !orderFilter.includes(line.orderId)) continue;
    if (line.payoutStatus === 'paid') continue;
    line.payoutStatus = 'payout_pending';
    updated += 1;
  }
  flushFile();
  return { updatedCount: updated, mode: canUseDiskPersistence() ? 'file' : 'memory' };
}

export type ShopRepCommissionLedgerWriteAction = 'payout_request';

export async function writeShopRepCommissionLedgerPayout(input: {
  repId: string;
  orderIds?: string[];
  organizationId?: string;
  action?: ShopRepCommissionLedgerWriteAction;
}): Promise<{
  ok: boolean;
  updatedCount: number;
  storageMode: 'postgres' | 'file' | 'memory' | 'unavailable';
  messageRu: string;
}> {
  const action = input.action ?? 'payout_request';
  if (action !== 'payout_request') {
    return {
      ok: false,
      updatedCount: 0,
      storageMode: 'unavailable',
      messageRu: 'Неподдерживаемое действие ledger.',
    };
  }

  const result = await markWorkshop2B2bCommissionsPayoutPending({
    repId: input.repId,
    orderIds: input.orderIds,
    organizationId: input.organizationId,
  });

  if (result.mode === 'pg_only_blocked') {
    return {
      ok: false,
      updatedCount: 0,
      storageMode: 'unavailable',
      messageRu: 'WORKSHOP2_PG_ONLY: запись payout в ledger требует PostgreSQL.',
    };
  }

  const storageMode = result.mode;
  return {
    ok: true,
    updatedCount: result.updatedCount,
    storageMode,
    messageRu:
      result.updatedCount > 0
        ? `${result.updatedCount} строк ledger → payout_pending (${storageMode === 'postgres' ? 'PG' : storageMode}).`
        : 'Нет строк для payout — проверьте repId и orderIds.',
  };
}

export function shopRepCommissionLedgerStorageMode(
  lineCount: number
): 'postgres' | 'file' | 'memory' | 'empty' | 'unavailable' {
  if (isWorkshop2PgOnlyMode() && !isWorkshop2PostgresEnabled()) return 'unavailable';
  if (lineCount === 0) return 'empty';
  if (isWorkshop2PostgresEnabled()) return 'postgres';
  return process.env.NODE_ENV === 'test' ? 'memory' : 'file';
}

export function clearWorkshop2B2bCommissionMemoryForTests(): void {
  memoryLines.length = 0;
  fileHydrated = false;
}
