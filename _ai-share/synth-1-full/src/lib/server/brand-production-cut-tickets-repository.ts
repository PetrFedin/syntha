import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { BrandProductionCutTicketStatus } from '@/lib/brand-production/cut-tickets';
import {
  brandProductionCutTicketPgToRow,
  brandProductionCutTicketRowToPgPayload,
  mapBrandCutTicketStatusToW2,
  type BrandProductionCutTicketPgPayload,
  type BrandProductionCutTicketPgRow,
} from '@/lib/production/brand-production-cut-ticket-spine';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-production-cut-tickets.json');
const memoryById = new Map<string, BrandProductionCutTicketPgRow>();
let fileHydrated = false;

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
    ) as BrandProductionCutTicketPgRow[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) memoryById.set(row.id, row);
    }
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify([...memoryById.values()], null, 2));
  } catch {
    /* ignore */
  }
}

function newTicketId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `ct-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultSs27SeedRows(): BrandProductionCutTicketPgRow[] {
  const collectionId = PLATFORM_CORE_DEMO.collectionId;
  const articleId = PLATFORM_CORE_DEMO.demoArticleId;
  const orderId = PLATFORM_CORE_DEMO.demoOrderId;
  return [
    brandProductionCutTicketPgToRow({
      id: 'ct-ss27-pg-001',
      collectionId,
      articleId,
      ticketNo: 'CT-SS27-001',
      qty: 480,
      w2Status: 'draft',
      payload: {
        poId: 'po-ss27-101',
        poCode: 'PO-SS27-101',
        sku: articleId,
        articleName: 'SS27 Demo Jacket',
        factoryName: 'Factory «North»',
        sizeSummary: 'XS:40 · S:80 · M:120 · L:120 · XL:80 · XXL:40',
        targetCutDate: '2026-04-15',
        brandStatus: 'ready',
        b2bOrderId: orderId,
        lifecycleLabel: 'Manufacturing',
        source: 'pg_seed',
      },
    }),
    brandProductionCutTicketPgToRow({
      id: 'ct-ss27-pg-002',
      collectionId,
      articleId: 'demo-ss27-02',
      ticketNo: 'CT-SS27-002',
      qty: 220,
      w2Status: 'issued',
      payload: {
        poId: 'po-ss27-102',
        poCode: 'PO-SS27-102',
        sku: 'demo-ss27-02',
        articleName: 'SS27 Demo Trouser',
        factoryName: 'CMT Istanbul',
        sizeSummary: 'S:40 · M:80 · L:60 · XL:40',
        targetCutDate: '2026-04-20',
        brandStatus: 'in_wip',
        b2bOrderId: orderId,
        lifecycleLabel: 'Manufacturing',
        source: 'pg_seed',
      },
    }),
  ];
}

function mapPgRecord(row: {
  id: string;
  collection_id: string;
  article_id: string;
  ticket_no: string;
  qty: number;
  status: string;
  payload: BrandProductionCutTicketPgPayload;
}): BrandProductionCutTicketPgRow {
  return brandProductionCutTicketPgToRow({
    id: row.id,
    collectionId: row.collection_id,
    articleId: row.article_id,
    ticketNo: row.ticket_no,
    qty: row.qty,
    w2Status: row.status,
    payload: row.payload ?? {},
  });
}

export function clearBrandProductionCutTicketMemoryForTests(): void {
  memoryById.clear();
  fileHydrated = false;
}

export async function listBrandProductionCutTickets(input: {
  collectionId: string;
  orderId?: string;
  organizationId?: string;
  limit?: number;
}): Promise<{ rows: BrandProductionCutTicketPgRow[]; storageMode: 'pg' | 'file' | 'empty' }> {
  const collectionId = input.collectionId.trim();
  const orderId = input.orderId?.trim();
  const org = input.organizationId ?? DEFAULT_ORG;
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);

  const filterByOrder = (
    rows: BrandProductionCutTicketPgRow[],
    payloads: Map<string, BrandProductionCutTicketPgPayload>
  ) => {
    if (!orderId) return rows;
    return rows.filter((r) => {
      const oid = payloads.get(r.id)?.b2bOrderId;
      return !oid || oid === orderId;
    });
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query(
      `SELECT id, collection_id, article_id, ticket_no, qty, status, payload
       FROM workshop2_cut_tickets
       WHERE organization_id = $1 AND collection_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [org, collectionId, limit]
    );
    const payloadById = new Map<string, BrandProductionCutTicketPgPayload>();
    for (const row of res.rows) {
      payloadById.set(row.id as string, (row.payload ?? {}) as BrandProductionCutTicketPgPayload);
    }
    let rows = filterByOrder(
      res.rows.map((row) => mapPgRecord(row as Parameters<typeof mapPgRecord>[0])),
      payloadById
    );
    if (rows.length === 0 && collectionId.toUpperCase() === 'SS27') {
      for (const seed of defaultSs27SeedRows()) {
        await upsertBrandProductionCutTicket({
          id: seed.id,
          collectionId,
          articleId: seed.articleId,
          ticketNo: seed.ticketNo,
          qty: seed.totalQty,
          brandStatus: seed.status,
          payload: {
            ...brandProductionCutTicketRowToPgPayload(seed, PLATFORM_CORE_DEMO.demoOrderId),
            source: 'pg_seed',
          },
          organizationId: org,
        });
      }
      return listBrandProductionCutTickets({ ...input, limit });
    }
    return { rows, storageMode: rows.length ? 'pg' : 'empty' };
  }

  hydrateFileIfNeeded();
  let rows = [...memoryById.values()].filter((r) => {
    const stored = memoryById.get(r.id);
    return stored && collectionId;
  });
  const payloadById = new Map<string, BrandProductionCutTicketPgPayload>();
  for (const row of rows) {
    payloadById.set(row.id, brandProductionCutTicketRowToPgPayload(row));
  }
  rows = filterByOrder(rows, payloadById);

  if (rows.length === 0 && collectionId.toUpperCase() === 'SS27') {
    for (const seed of defaultSs27SeedRows()) {
      memoryById.set(seed.id, seed);
    }
    persistFile();
    rows = filterByOrder(
      defaultSs27SeedRows(),
      new Map(
        defaultSs27SeedRows().map((r) => [
          r.id,
          brandProductionCutTicketRowToPgPayload(r, PLATFORM_CORE_DEMO.demoOrderId),
        ])
      )
    );
  }

  return { rows: rows.slice(0, limit), storageMode: rows.length ? 'file' : 'empty' };
}

export async function upsertBrandProductionCutTicket(input: {
  id?: string;
  collectionId: string;
  articleId: string;
  ticketNo?: string;
  qty: number;
  brandStatus: BrandProductionCutTicketStatus;
  payload: BrandProductionCutTicketPgPayload;
  organizationId?: string;
}): Promise<BrandProductionCutTicketPgRow> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const id = input.id?.trim() || newTicketId();
  const ticketNo = input.ticketNo?.trim() || `CT-${input.collectionId}-${id.slice(-6)}`;
  const w2Status = mapBrandCutTicketStatusToW2(input.brandStatus);
  const payload: BrandProductionCutTicketPgPayload = {
    ...input.payload,
    brandStatus: input.brandStatus,
    source: input.payload.source ?? 'brand_ops_api',
  };
  const row = brandProductionCutTicketPgToRow({
    id,
    collectionId: input.collectionId.trim(),
    articleId: input.articleId.trim(),
    ticketNo,
    qty: Math.max(0, Math.round(input.qty)),
    w2Status,
    payload,
  });

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO workshop2_cut_tickets
         (id, collection_id, article_id, organization_id, ticket_no, qty, status, payload, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET
         qty = EXCLUDED.qty,
         status = EXCLUDED.status,
         payload = EXCLUDED.payload,
         updated_at = NOW()`,
      [
        id,
        row.articleId ? input.collectionId.trim() : input.collectionId.trim(),
        input.articleId.trim(),
        org,
        ticketNo,
        row.totalQty,
        w2Status,
        JSON.stringify(payload),
      ]
    );
    return row;
  }

  hydrateFileIfNeeded();
  memoryById.set(id, row);
  persistFile();
  return row;
}

export async function advanceBrandProductionCutTicketStatus(input: {
  ticketId: string;
  nextStatus: BrandProductionCutTicketStatus;
  organizationId?: string;
}): Promise<BrandProductionCutTicketPgRow | null> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const ticketId = input.ticketId.trim();
  if (!ticketId) return null;

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const existing = await getWorkshop2PgPool().query(
      `SELECT id, collection_id, article_id, ticket_no, qty, status, payload
       FROM workshop2_cut_tickets
       WHERE organization_id = $1 AND id = $2`,
      [org, ticketId]
    );
    if (!existing.rows[0]) return null;
    const current = mapPgRecord(existing.rows[0] as Parameters<typeof mapPgRecord>[0]);
    const payload = {
      ...(existing.rows[0].payload as BrandProductionCutTicketPgPayload),
      brandStatus: input.nextStatus,
    };
    return upsertBrandProductionCutTicket({
      id: ticketId,
      collectionId: String(existing.rows[0].collection_id),
      articleId: current.articleId,
      ticketNo: current.ticketNo,
      qty: current.totalQty,
      brandStatus: input.nextStatus,
      payload,
      organizationId: org,
    });
  }

  hydrateFileIfNeeded();
  const current = memoryById.get(ticketId);
  if (!current) return null;
  const payload = brandProductionCutTicketRowToPgPayload({
    ...current,
    status: input.nextStatus,
  });
  return upsertBrandProductionCutTicket({
    id: ticketId,
    collectionId: PLATFORM_CORE_DEMO.collectionId,
    articleId: current.articleId,
    ticketNo: current.ticketNo,
    qty: current.totalQty,
    brandStatus: input.nextStatus,
    payload,
    organizationId: org,
  });
}
