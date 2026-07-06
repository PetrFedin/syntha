import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { Workshop2QcInspectionRecord } from '@/lib/production/workshop2-qc-gate-shipment';
import { workshop2QcGateBlocksOrderShipment } from '@/lib/production/workshop2-qc-gate-shipment';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const memoryRows: Workshop2QcInspectionRecord[] = [];
const STORE_FILE = path.join(process.cwd(), 'data', 'workshop2-qc-inspections.json');
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
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as Workshop2QcInspectionRecord[];
    if (Array.isArray(parsed)) memoryRows.push(...parsed);
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryRows, null, 2));
  } catch {
    /* ignore */
  }
}

function newInspectionId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `w2qc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapPgRow(row: {
  id: string;
  order_id: string;
  po_id: string | null;
  collection_id: string | null;
  article_id: string | null;
  result: string;
  blocks_shipment: boolean;
  inspector_label: string | null;
  inspected_at: Date;
}): Workshop2QcInspectionRecord {
  const result = row.result as Workshop2QcInspectionRecord['result'];
  return {
    id: row.id,
    orderId: row.order_id,
    poId: row.po_id ?? undefined,
    collectionId: row.collection_id ?? undefined,
    articleId: row.article_id ?? undefined,
    result,
    blocksShipment: row.blocks_shipment,
    inspectorLabel: row.inspector_label ?? undefined,
    inspectedAt: row.inspected_at.toISOString(),
  };
}

export function clearWorkshop2QcInspectionMemoryForTests(): void {
  memoryRows.length = 0;
  fileHydrated = false;
}

export async function listWorkshop2QcInspectionsForOrder(
  orderId: string,
  organizationId = 'org-brand-001'
): Promise<Workshop2QcInspectionRecord[]> {
  const oid = orderId.trim();
  if (!oid) return [];

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query(
      `SELECT id, order_id, po_id, collection_id, article_id, result, blocks_shipment,
              inspector_label, inspected_at
       FROM workshop2_qc_inspections
       WHERE organization_id = $1 AND order_id = $2
       ORDER BY inspected_at DESC`,
      [organizationId, oid]
    );
    return res.rows.map((row) => mapPgRow(row as Parameters<typeof mapPgRow>[0]));
  }

  hydrateFileIfNeeded();
  return memoryRows.filter((r) => r.orderId === oid);
}

export async function listWorkshop2QcInspectionsForCollection(input: {
  collectionId: string;
  organizationId?: string;
  limit?: number;
}): Promise<Workshop2QcInspectionRecord[]> {
  const collectionId = input.collectionId.trim();
  const org = input.organizationId ?? 'org-brand-001';
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query(
      `SELECT id, order_id, po_id, collection_id, article_id, result, blocks_shipment,
              inspector_label, inspected_at
       FROM workshop2_qc_inspections
       WHERE organization_id = $1 AND collection_id = $2
       ORDER BY inspected_at DESC
       LIMIT $3`,
      [org, collectionId, limit]
    );
    return res.rows.map((row) => mapPgRow(row as Parameters<typeof mapPgRow>[0]));
  }

  hydrateFileIfNeeded();
  return memoryRows.filter((r) => r.collectionId === collectionId).slice(0, limit);
}

export async function upsertWorkshop2QcInspection(input: {
  orderId: string;
  poId?: string;
  collectionId?: string;
  articleId?: string;
  result: Workshop2QcInspectionRecord['result'];
  blocksShipment?: boolean;
  inspectorLabel?: string;
  organizationId?: string;
}): Promise<Workshop2QcInspectionRecord> {
  const org = input.organizationId ?? 'org-brand-001';
  const orderId = input.orderId.trim();
  const result = input.result;
  const blocksShipment =
    input.blocksShipment ?? (result === 'fail' || result === 'rework');
  const inspectedAt = new Date().toISOString();
  const row: Workshop2QcInspectionRecord = {
    id: newInspectionId(),
    orderId,
    poId: input.poId?.trim() || undefined,
    collectionId: input.collectionId?.trim() || undefined,
    articleId: input.articleId?.trim() || undefined,
    result,
    blocksShipment,
    inspectorLabel: input.inspectorLabel?.trim() || 'brand_qc_api',
    inspectedAt,
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO workshop2_qc_inspections
         (id, organization_id, order_id, po_id, collection_id, article_id, result,
          blocks_shipment, inspector_label, inspected_at, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::timestamptz, $11::jsonb)`,
      [
        row.id,
        org,
        row.orderId,
        row.poId ?? null,
        row.collectionId ?? null,
        row.articleId ?? null,
        row.result,
        row.blocksShipment,
        row.inspectorLabel ?? null,
        row.inspectedAt,
        JSON.stringify({ source: 'brand_qc_api' }),
      ]
    );
    return row;
  }

  hydrateFileIfNeeded();
  memoryRows.unshift(row);
  persistFile();
  return row;
}

function workshop2QcGateBlockedInspections(
  inspections: Awaited<ReturnType<typeof listWorkshop2QcInspectionsForOrder>>
) {
  return inspections.filter((i) => i.blocksShipment && i.result !== 'pass');
}

export async function assertWorkshop2QcGateAllowsOrderShipment(orderId: string): Promise<
  | { ok: true }
  | { ok: false; code: 'qc_gate_blocked'; messageRu: string; blockedCount: number }
> {
  const inspections = await listWorkshop2QcInspectionsForOrder(orderId);
  const blocking = workshop2QcGateBlockedInspections(inspections);
  if (workshop2QcGateBlocksOrderShipment(inspections)) {
    return {
      ok: false,
      code: 'qc_gate_blocked',
      messageRu: `QC gate: отгрузка заблокирована (${blocking.length} инспекций fail/rework).`,
      blockedCount: blocking.length,
    };
  }
  return { ok: true };
}

/** QC gate перед передачей B2B в цех — та же семантика, что отгрузка. */
export async function assertWorkshop2QcGateAllowsProductionHandoff(orderId: string): Promise<
  | { ok: true }
  | { ok: false; code: 'qc_gate_blocked'; messageRu: string; blockedCount: number }
> {
  const inspections = await listWorkshop2QcInspectionsForOrder(orderId);
  const blocking = workshop2QcGateBlockedInspections(inspections);
  if (workshop2QcGateBlocksOrderShipment(inspections)) {
    return {
      ok: false,
      code: 'qc_gate_blocked',
      messageRu: `QC gate: передача в цех заблокирована — завершите контроль качества (${blocking.length} инспекций fail/rework).`,
      blockedCount: blocking.length,
    };
  }
  return { ok: true };
}
