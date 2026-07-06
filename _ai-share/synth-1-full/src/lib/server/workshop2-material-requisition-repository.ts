import 'server-only';

import { randomUUID } from 'node:crypto';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type Workshop2MaterialRequisitionRecord = {
  id: string;
  collectionId: string;
  articleId: string;
  bomLineRef?: string;
  materialLabel?: string;
  quantity?: number;
  unit?: string;
  status: string;
  partialShipQty?: number;
  backorderFlag?: boolean;
  createdAt: string;
  createdBy?: string;
};

function mapWorkshop2MaterialRequisitionRow(row: {
  id: unknown;
  collection_id: unknown;
  article_id: unknown;
  bom_line_ref: unknown;
  material_label: unknown;
  quantity: unknown;
  unit: unknown;
  status: unknown;
  partial_ship_qty?: unknown;
  backorder_flag?: unknown;
  created_at: unknown;
  created_by: unknown;
}): Workshop2MaterialRequisitionRecord {
  return {
    id: String(row.id),
    collectionId: String(row.collection_id),
    articleId: String(row.article_id),
    bomLineRef: row.bom_line_ref != null ? String(row.bom_line_ref) : undefined,
    materialLabel: row.material_label != null ? String(row.material_label) : undefined,
    quantity: row.quantity != null ? Number(row.quantity) : undefined,
    unit: row.unit != null ? String(row.unit) : undefined,
    status: String(row.status),
    partialShipQty:
      row.partial_ship_qty != null && Number.isFinite(Number(row.partial_ship_qty))
        ? Number(row.partial_ship_qty)
        : undefined,
    backorderFlag: row.backorder_flag === true,
    createdAt: new Date(row.created_at as string | Date).toISOString(),
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
  };
}

const MATERIAL_REQ_SELECT = `id, collection_id, article_id, bom_line_ref, material_label, quantity, unit, status,
  partial_ship_qty, backorder_flag, created_at, created_by`;

const memoryReqs: Workshop2MaterialRequisitionRecord[] = [];

export async function createWorkshop2MaterialRequisition(input: {
  collectionId: string;
  articleId: string;
  organizationId?: string;
  bomLineRef?: string;
  materialLabel?: string;
  quantity?: number;
  unit?: string;
  createdBy?: string;
  payload?: Record<string, unknown>;
}): Promise<Workshop2MaterialRequisitionRecord> {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const record: Workshop2MaterialRequisitionRecord = {
    id,
    collectionId: input.collectionId,
    articleId: input.articleId,
    bomLineRef: input.bomLineRef,
    materialLabel: input.materialLabel,
    quantity: input.quantity,
    unit: input.unit,
    status: 'draft',
    createdAt,
    createdBy: input.createdBy,
  };

  if (!isWorkshop2PostgresEnabled()) {
    memoryReqs.push(record);
    return record;
  }

  await ensureWorkshop2PgSchema();
  const orgId = input.organizationId?.trim() || 'org-brand-001';
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_material_requisitions
      (id, collection_id, article_id, organization_id, bom_line_ref, material_label, quantity, unit, status, payload, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', $9::jsonb, $10)`,
    [
      id,
      input.collectionId,
      input.articleId,
      orgId,
      input.bomLineRef ?? null,
      input.materialLabel ?? null,
      input.quantity ?? null,
      input.unit ?? null,
      JSON.stringify(input.payload ?? {}),
      input.createdBy ?? null,
    ]
  );
  return record;
}

export async function upsertWorkshop2MaterialRequisition(input: {
  id: string;
  collectionId: string;
  articleId: string;
  organizationId?: string;
  bomLineRef?: string;
  materialLabel?: string;
  quantity?: number;
  unit?: string;
  status?: string;
  createdBy?: string;
  payload?: Record<string, unknown>;
}): Promise<Workshop2MaterialRequisitionRecord> {
  const id = input.id.trim();
  const createdAt = new Date().toISOString();
  const record: Workshop2MaterialRequisitionRecord = {
    id,
    collectionId: input.collectionId,
    articleId: input.articleId,
    bomLineRef: input.bomLineRef,
    materialLabel: input.materialLabel,
    quantity: input.quantity,
    unit: input.unit,
    status: input.status ?? 'draft',
    createdAt,
    createdBy: input.createdBy,
  };

  if (!isWorkshop2PostgresEnabled()) {
    const idx = memoryReqs.findIndex((r) => r.id === id);
    if (idx >= 0) memoryReqs[idx] = { ...memoryReqs[idx]!, ...record };
    else memoryReqs.push(record);
    return record;
  }

  await ensureWorkshop2PgSchema();
  const orgId = input.organizationId?.trim() || 'org-brand-001';
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_material_requisitions
      (id, collection_id, article_id, organization_id, bom_line_ref, material_label, quantity, unit, status, payload, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)
     ON CONFLICT (id) DO UPDATE SET
       bom_line_ref = EXCLUDED.bom_line_ref,
       material_label = EXCLUDED.material_label,
       quantity = EXCLUDED.quantity,
       unit = EXCLUDED.unit,
       status = EXCLUDED.status,
       payload = EXCLUDED.payload`,
    [
      id,
      input.collectionId,
      input.articleId,
      orgId,
      input.bomLineRef ?? null,
      input.materialLabel ?? null,
      input.quantity ?? null,
      input.unit ?? null,
      record.status,
      JSON.stringify(input.payload ?? {}),
      input.createdBy ?? null,
    ]
  );
  return record;
}

export async function listWorkshop2MaterialRequisitions(input: {
  collectionId: string;
  articleId: string;
  organizationId?: string;
}): Promise<Workshop2MaterialRequisitionRecord[]> {
  if (!isWorkshop2PostgresEnabled()) {
    return memoryReqs.filter(
      (r) => r.collectionId === input.collectionId && r.articleId === input.articleId
    );
  }
  await ensureWorkshop2PgSchema();
  const orgId = input.organizationId?.trim() || 'org-brand-001';
  const res = await getWorkshop2PgPool().query(
    `SELECT ${MATERIAL_REQ_SELECT}
     FROM workshop2_material_requisitions
     WHERE collection_id = $1 AND article_id = $2 AND organization_id = $3
     ORDER BY created_at DESC`,
    [input.collectionId, input.articleId, orgId]
  );
  return res.rows.map((row) => mapWorkshop2MaterialRequisitionRow(row));
}

export async function listWorkshop2MaterialRequisitionsByCollection(input: {
  collectionId: string;
  organizationId?: string;
  limit?: number;
}): Promise<Workshop2MaterialRequisitionRecord[]> {
  const collectionId = input.collectionId.trim();
  if (!collectionId) return [];
  const limit = Math.min(Math.max(input.limit ?? 100, 1), 200);

  if (!isWorkshop2PostgresEnabled()) {
    return memoryReqs.filter((r) => r.collectionId === collectionId).slice(0, limit);
  }

  await ensureWorkshop2PgSchema();
  const orgId = input.organizationId?.trim() || 'org-brand-001';
  const res = await getWorkshop2PgPool().query(
    `SELECT ${MATERIAL_REQ_SELECT}
     FROM workshop2_material_requisitions
     WHERE collection_id = $1 AND organization_id = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [collectionId, orgId, limit]
  );
  return res.rows.map((row) => mapWorkshop2MaterialRequisitionRow(row));
}

export async function getWorkshop2MaterialRequisitionById(
  id: string
): Promise<Workshop2MaterialRequisitionRecord | null> {
  const trimmed = id.trim();
  if (!trimmed) return null;

  if (!isWorkshop2PostgresEnabled()) {
    return memoryReqs.find((r) => r.id === trimmed) ?? null;
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT ${MATERIAL_REQ_SELECT}
     FROM workshop2_material_requisitions
     WHERE id = $1
     LIMIT 1`,
    [trimmed]
  );
  const row = res.rows[0];
  if (!row) return null;
  return mapWorkshop2MaterialRequisitionRow(row);
}

export type Workshop2MaterialRequisitionSupplierStatus = 'confirmed' | 'rejected';

export async function patchWorkshop2MaterialRequisitionSupplierStatus(input: {
  id: string;
  status: Workshop2MaterialRequisitionSupplierStatus;
  note?: string;
  updatedBy?: string;
  shippedQty?: number;
  backorder?: boolean;
}): Promise<Workshop2MaterialRequisitionRecord | null> {
  const existing = await getWorkshop2MaterialRequisitionById(input.id);
  if (!existing) return null;

  const nextStatus = input.status === 'confirmed' ? 'supplier_confirmed' : 'supplier_rejected';
  const requestedQty = existing.quantity ?? 0;
  const shippedQty =
    input.shippedQty != null && Number.isFinite(input.shippedQty)
      ? Math.max(0, Math.round(input.shippedQty))
      : requestedQty;
  const backorder =
    input.backorder === true || (requestedQty > 0 && shippedQty > 0 && shippedQty < requestedQty);

  const partialShipQty = input.status === 'confirmed' ? shippedQty : undefined;
  const backorderFlag = input.status === 'confirmed' ? backorder : false;

  if (!isWorkshop2PostgresEnabled()) {
    const idx = memoryReqs.findIndex((r) => r.id === existing.id);
    const next = {
      ...existing,
      status: nextStatus,
      partialShipQty,
      backorderFlag,
    };
    if (idx >= 0) {
      memoryReqs[idx] = next;
      return memoryReqs[idx]!;
    }
    return next;
  }

  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `UPDATE workshop2_material_requisitions
     SET status = $2,
         partial_ship_qty = $3,
         backorder_flag = $4,
         payload = COALESCE(payload, '{}'::jsonb) || $5::jsonb
     WHERE id = $1`,
    [
      existing.id,
      nextStatus,
      input.status === 'confirmed' ? partialShipQty ?? null : null,
      backorderFlag,
      JSON.stringify({
        supplierNote: input.note?.trim() || null,
        supplierRespondedAt: new Date().toISOString(),
        supplierRespondedBy: input.updatedBy ?? null,
        requestedQty: requestedQty > 0 ? requestedQty : null,
        shippedQty: input.status === 'confirmed' ? shippedQty : null,
        backorder: backorderFlag,
        partialShipQty: input.status === 'confirmed' ? partialShipQty ?? null : null,
        backorderFlag,
      }),
    ]
  );
  return {
    ...existing,
    status: nextStatus,
    partialShipQty,
    backorderFlag,
  };
}

export function applyWorkshop2MaterialRequisitionStatusToDossier(input: {
  dossier: import('@/lib/production/workshop2-dossier-phase1.types').Workshop2DossierPhase1;
  requisition: Workshop2MaterialRequisitionRecord;
}): import('@/lib/production/workshop2-dossier-phase1.types').Workshop2DossierPhase1 {
  const at = new Date().toISOString();
  const refs = { ...(input.dossier.bomRequisitionByLineRef ?? {}) };
  const lineRef =
    input.requisition.bomLineRef ??
    Object.entries(refs).find(([, v]) => v.id === input.requisition.id)?.[0];
  if (lineRef) {
    refs[lineRef] = {
      id: input.requisition.id,
      status: input.requisition.status,
      at,
      materialLabel: input.requisition.materialLabel ?? refs[lineRef]?.materialLabel,
    };
  }
  return {
    ...input.dossier,
    bomRequisitionByLineRef: refs,
  };
}

/** Есть ли подтверждённая заявка на материал по каждому артикулу заказа. */
export async function areWorkshop2MaterialRequisitionsConfirmedForArticles(input: {
  collectionId: string;
  articleIds: string[];
  organizationId?: string;
}): Promise<{ allConfirmed: boolean; confirmedArticleIds: string[] }> {
  const unique = [...new Set(input.articleIds.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return { allConfirmed: false, confirmedArticleIds: [] };
  }
  const confirmedArticleIds: string[] = [];
  for (const articleId of unique) {
    const reqs = await listWorkshop2MaterialRequisitions({
      collectionId: input.collectionId,
      articleId,
      organizationId: input.organizationId,
    });
    if (reqs.some((r) => r.status === 'supplier_confirmed')) {
      confirmedArticleIds.push(articleId);
    }
  }
  return {
    allConfirmed: confirmedArticleIds.length === unique.length,
    confirmedArticleIds,
  };
}

/** Карта articleId → supplier_confirmed для supplier forecast snapshot. */
export async function batchWorkshop2SupplierConfirmedByArticle(input: {
  collectionId: string;
  articleIds: string[];
  organizationId?: string;
}): Promise<Record<string, boolean>> {
  const { confirmedArticleIds } = await areWorkshop2MaterialRequisitionsConfirmedForArticles(input);
  const confirmed = new Set(confirmedArticleIds);
  return Object.fromEntries(input.articleIds.map((id) => [id, confirmed.has(id)]));
}

export function clearWorkshop2MaterialRequisitionsMemoryForTests(): void {
  memoryReqs.length = 0;
}
