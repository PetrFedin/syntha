import 'server-only';

import { randomUUID } from 'node:crypto';
import {
  type FactoryMesReleaseStage,
  resolveFactoryMesReleaseStage,
} from '@/lib/production/workshop2-factory-mes-release-stage';
import type { ProductionOrderCutTicketStub } from '@/lib/production/brand-op-production-order-cut-ticket';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const PO_SELECT_COLUMNS = `id, collection_id, article_id, line_ref, supplier_id, qty, status,
  erp_external_id, synced_at, payload, created_at, updated_at, mes_release_stage, wip_status, cut_ticket`;

/** Статус PO: draft → pending_erp → synced | error */
export type Workshop2PurchaseOrderStatus = 'draft' | 'pending_erp' | 'synced' | 'error';

export type Workshop2PurchaseOrderSource =
  | 'bom_requisition'
  | 'material_request'
  | 'sample_plan'
  | 'manual';

export type Workshop2PurchaseOrderRecord = {
  id: string;
  collectionId: string;
  articleId: string;
  lineRef?: string;
  supplierId?: string;
  qty: number;
  status: Workshop2PurchaseOrderStatus;
  mesReleaseStage: FactoryMesReleaseStage;
  /** Wave WO · floor tablet WIP (PG wip_status, mirrors mes_release_stage). */
  wipStatus: FactoryMesReleaseStage;
  erpExternalId?: string;
  syncedAt?: string;
  lastError?: string;
  payload: Record<string, unknown>;
  cutTicket: ProductionOrderCutTicketStub;
  createdAt: string;
  updatedAt: string;
};

const memoryPos: Workshop2PurchaseOrderRecord[] = [];

function mapRow(row: {
  id: string;
  collection_id: string;
  article_id: string;
  line_ref: string | null;
  supplier_id: string | null;
  qty: string | number;
  status: string;
  mes_release_stage?: string | null;
  wip_status?: string | null;
  erp_external_id: string | null;
  synced_at: Date | null;
  payload: Record<string, unknown> | null;
  cut_ticket?: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}): Workshop2PurchaseOrderRecord {
  const payload = row.payload ?? {};
  const cutTicket = (row.cut_ticket ?? {}) as ProductionOrderCutTicketStub;
  const mesReleaseStage = resolveFactoryMesReleaseStage(
    row.mes_release_stage != null
      ? String(row.mes_release_stage)
      : String(payload.mesReleaseStage ?? 'queued')
  );
  const wipStatus = resolveFactoryMesReleaseStage(
    row.wip_status != null
      ? String(row.wip_status)
      : row.mes_release_stage != null
        ? String(row.mes_release_stage)
        : String(payload.wipStatus ?? payload.mesReleaseStage ?? 'queued')
  );
  return {
    id: String(row.id),
    collectionId: String(row.collection_id),
    articleId: String(row.article_id),
    lineRef: row.line_ref != null ? String(row.line_ref) : undefined,
    supplierId: row.supplier_id != null ? String(row.supplier_id) : undefined,
    qty: Number(row.qty),
    status: row.status as Workshop2PurchaseOrderStatus,
    mesReleaseStage,
    wipStatus,
    erpExternalId: row.erp_external_id != null ? String(row.erp_external_id) : undefined,
    syncedAt: row.synced_at?.toISOString(),
    payload,
    cutTicket,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

/** Все PO поставщика (для QC scorecard) — memory или PG. */
export async function listWorkshop2PurchaseOrdersBySupplier(
  supplierId: string,
  organizationId?: string
): Promise<Workshop2PurchaseOrderRecord[]> {
  const sid = supplierId.trim();
  if (!sid) return [];

  if (!isWorkshop2PostgresEnabled()) {
    return memoryPos.filter((p) => (p.supplierId ?? '').trim() === sid);
  }

  await ensureWorkshop2PgSchema();
  const orgId = organizationId?.trim() || 'org-brand-001';
  const res = await getWorkshop2PgPool().query(
    `SELECT ${PO_SELECT_COLUMNS}
     FROM workshop2_purchase_orders
     WHERE organization_id = $1 AND supplier_id = $2
     ORDER BY created_at DESC`,
    [orgId, sid]
  );
  return res.rows.map(mapRow);
}

export async function listWorkshop2PurchaseOrders(input: {
  collectionId: string;
  articleId: string;
  organizationId?: string;
}): Promise<Workshop2PurchaseOrderRecord[]> {
  if (!isWorkshop2PostgresEnabled()) {
    return memoryPos.filter(
      (p) => p.collectionId === input.collectionId && p.articleId === input.articleId
    );
  }
  await ensureWorkshop2PgSchema();
  const orgId = input.organizationId?.trim() || 'org-brand-001';
  const res = await getWorkshop2PgPool().query(
    `SELECT ${PO_SELECT_COLUMNS}
     FROM workshop2_purchase_orders
     WHERE collection_id = $1 AND article_id = $2 AND organization_id = $3
     ORDER BY created_at DESC`,
    [input.collectionId, input.articleId, orgId]
  );
  return res.rows.map(mapRow);
}

export async function listWorkshop2PurchaseOrdersByCollection(input: {
  collectionId: string;
  organizationId?: string;
  limit?: number;
}): Promise<Workshop2PurchaseOrderRecord[]> {
  const collectionId = input.collectionId.trim();
  if (!collectionId) return [];
  const limit = Math.min(Math.max(input.limit ?? 100, 1), 200);

  if (!isWorkshop2PostgresEnabled()) {
    return memoryPos.filter((p) => p.collectionId === collectionId).slice(0, limit);
  }

  await ensureWorkshop2PgSchema();
  const orgId = input.organizationId?.trim() || 'org-brand-001';
  const res = await getWorkshop2PgPool().query(
    `SELECT ${PO_SELECT_COLUMNS}
     FROM workshop2_purchase_orders
     WHERE collection_id = $1 AND organization_id = $2
     ORDER BY updated_at DESC
     LIMIT $3`,
    [collectionId, orgId, limit]
  );
  return res.rows.map(mapRow);
}

export async function upsertWorkshop2PurchaseOrder(input: {
  id: string;
  collectionId: string;
  articleId: string;
  organizationId?: string;
  lineRef?: string;
  supplierId?: string;
  qty: number;
  status?: Workshop2PurchaseOrderStatus;
  payload?: Record<string, unknown>;
}): Promise<Workshop2PurchaseOrderRecord> {
  const now = new Date().toISOString();
  const record: Workshop2PurchaseOrderRecord = {
    id: input.id,
    collectionId: input.collectionId,
    articleId: input.articleId,
    lineRef: input.lineRef,
    supplierId: input.supplierId,
    qty: input.qty,
    status: input.status ?? 'draft',
    mesReleaseStage: resolveFactoryMesReleaseStage(
      String(input.payload?.mesReleaseStage ?? 'queued')
    ),
    wipStatus: resolveFactoryMesReleaseStage(
      String(input.payload?.wipStatus ?? input.payload?.mesReleaseStage ?? 'queued')
    ),
    payload: input.payload ?? {},
    cutTicket: {},
    createdAt: now,
    updatedAt: now,
  };

  if (!isWorkshop2PostgresEnabled()) {
    const idx = memoryPos.findIndex((p) => p.id === input.id);
    if (idx >= 0) memoryPos[idx] = { ...memoryPos[idx]!, ...record, updatedAt: now };
    else memoryPos.push(record);
    return record;
  }

  await ensureWorkshop2PgSchema();
  const orgId = input.organizationId?.trim() || 'org-brand-001';
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_purchase_orders
      (id, collection_id, article_id, organization_id, line_ref, supplier_id, qty, status, payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
     ON CONFLICT (id) DO UPDATE SET
       collection_id = EXCLUDED.collection_id,
       article_id = EXCLUDED.article_id,
       line_ref = EXCLUDED.line_ref,
       supplier_id = EXCLUDED.supplier_id,
       qty = EXCLUDED.qty,
       status = EXCLUDED.status,
       payload = EXCLUDED.payload,
       updated_at = NOW()`,
    [
      input.id,
      input.collectionId,
      input.articleId,
      orgId,
      input.lineRef ?? null,
      input.supplierId ?? null,
      input.qty,
      record.status,
      JSON.stringify(record.payload),
    ]
  );
  return record;
}

export async function getWorkshop2PurchaseOrderById(
  id: string,
  organizationId?: string
): Promise<Workshop2PurchaseOrderRecord | null> {
  const poId = id.trim();
  if (!poId) return null;

  if (!isWorkshop2PostgresEnabled()) {
    return memoryPos.find((p) => p.id === poId) ?? null;
  }

  await ensureWorkshop2PgSchema();
  const orgId = organizationId?.trim() || 'org-brand-001';
  const res = await getWorkshop2PgPool().query(
    `SELECT ${PO_SELECT_COLUMNS}
     FROM workshop2_purchase_orders
     WHERE id = $1 AND organization_id = $2`,
    [poId, orgId]
  );
  const row = res.rows[0];
  return row ? mapRow(row) : null;
}

export async function listWorkshop2PurchaseOrdersByPayloadSource(input: {
  source: string;
  factoryId?: string;
  organizationId?: string;
}): Promise<Workshop2PurchaseOrderRecord[]> {
  if (!isWorkshop2PostgresEnabled()) {
    return memoryPos.filter((p) => {
      const src = String(p.payload?.source ?? '');
      if (src !== input.source) return false;
      if (input.factoryId && String(p.payload?.factoryId ?? '') !== input.factoryId) return false;
      return true;
    });
  }
  await ensureWorkshop2PgSchema();
  const orgId = input.organizationId?.trim() || 'org-brand-001';
  const res = input.factoryId
    ? await getWorkshop2PgPool().query(
        `SELECT ${PO_SELECT_COLUMNS}
         FROM workshop2_purchase_orders
         WHERE organization_id = $1
           AND payload->>'source' = $2
           AND payload->>'factoryId' = $3
         ORDER BY updated_at DESC`,
        [orgId, input.source, input.factoryId]
      )
    : await getWorkshop2PgPool().query(
        `SELECT ${PO_SELECT_COLUMNS}
         FROM workshop2_purchase_orders
         WHERE organization_id = $1 AND payload->>'source' = $2
         ORDER BY updated_at DESC`,
        [orgId, input.source]
      );
  return res.rows.map(mapRow);
}

export async function createWorkshop2PurchaseOrder(input: {
  collectionId: string;
  articleId: string;
  organizationId?: string;
  lineRef?: string;
  supplierId?: string;
  qty: number;
  status?: Workshop2PurchaseOrderStatus;
  payload?: Record<string, unknown>;
}): Promise<Workshop2PurchaseOrderRecord> {
  const id = randomUUID();
  const now = new Date().toISOString();
  const record: Workshop2PurchaseOrderRecord = {
    id,
    collectionId: input.collectionId,
    articleId: input.articleId,
    lineRef: input.lineRef,
    supplierId: input.supplierId,
    qty: input.qty,
    status: input.status ?? 'draft',
    mesReleaseStage: resolveFactoryMesReleaseStage(
      String(input.payload?.mesReleaseStage ?? 'queued')
    ),
    wipStatus: resolveFactoryMesReleaseStage(
      String(input.payload?.wipStatus ?? input.payload?.mesReleaseStage ?? 'queued')
    ),
    payload: input.payload ?? {},
    cutTicket: {},
    createdAt: now,
    updatedAt: now,
  };

  if (!isWorkshop2PostgresEnabled()) {
    memoryPos.push(record);
    return record;
  }

  await ensureWorkshop2PgSchema();
  const orgId = input.organizationId?.trim() || 'org-brand-001';
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_purchase_orders
      (id, collection_id, article_id, organization_id, line_ref, supplier_id, qty, status, payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
    [
      id,
      input.collectionId,
      input.articleId,
      orgId,
      input.lineRef ?? null,
      input.supplierId ?? null,
      input.qty,
      record.status,
      JSON.stringify(record.payload),
    ]
  );
  return record;
}

export async function updateWorkshop2PurchaseOrderErpSync(input: {
  id: string;
  collectionId: string;
  articleId: string;
  status: Workshop2PurchaseOrderStatus;
  erpExternalId?: string;
  syncedAt?: string;
  lastError?: string;
  payloadPatch?: Record<string, unknown>;
}): Promise<Workshop2PurchaseOrderRecord | null> {
  const syncedAt = input.syncedAt ?? new Date().toISOString();

  if (!isWorkshop2PostgresEnabled()) {
    const idx = memoryPos.findIndex((p) => p.id === input.id);
    if (idx < 0) return null;
    const prev = memoryPos[idx]!;
    const nextPayload: Record<string, unknown> = {
      ...prev.payload,
      ...(input.payloadPatch ?? {}),
      ...(input.lastError ? { lastError: input.lastError } : {}),
    };
    const next: Workshop2PurchaseOrderRecord = {
      ...prev,
      status: input.status,
      mesReleaseStage: resolveFactoryMesReleaseStage(
        String(nextPayload.mesReleaseStage ?? prev.mesReleaseStage)
      ),
      wipStatus: resolveFactoryMesReleaseStage(
        String(nextPayload.wipStatus ?? nextPayload.mesReleaseStage ?? prev.wipStatus)
      ),
      erpExternalId: input.erpExternalId ?? prev.erpExternalId,
      syncedAt: input.status === 'synced' ? syncedAt : prev.syncedAt,
      payload: nextPayload,
      updatedAt: new Date().toISOString(),
    };
    memoryPos[idx] = next;
    return next;
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `UPDATE workshop2_purchase_orders
     SET status = $4,
         erp_external_id = COALESCE($5, erp_external_id),
         synced_at = CASE WHEN $4 = 'synced' THEN COALESCE($6::timestamptz, NOW()) ELSE synced_at END,
         payload = payload || $7::jsonb,
         updated_at = NOW()
     WHERE id = $1 AND collection_id = $2 AND article_id = $3
     RETURNING ${PO_SELECT_COLUMNS}`,
    [
      input.id,
      input.collectionId,
      input.articleId,
      input.status,
      input.erpExternalId ?? null,
      input.status === 'synced' ? syncedAt : null,
      JSON.stringify({
        ...(input.payloadPatch ?? {}),
        ...(input.lastError ? { lastError: input.lastError } : {}),
      }),
    ]
  );
  const row = res.rows[0];
  return row ? mapRow(row) : null;
}

export async function updateWorkshop2PurchaseOrderMesReleaseStage(input: {
  id: string;
  collectionId: string;
  articleId: string;
  stage: FactoryMesReleaseStage;
  actor?: string;
}): Promise<Workshop2PurchaseOrderRecord | null> {
  const stage = resolveFactoryMesReleaseStage(input.stage);
  const at = new Date().toISOString();
  const payloadPatch = {
    mesReleaseStage: stage,
    wipStatus: stage,
    mesReleaseStageAt: at,
    mesReleaseStageBy: input.actor?.trim() || 'factory_mes',
    wipStatusAt: at,
    wipStatusBy: input.actor?.trim() || 'factory-floor-tablet',
  };

  if (!isWorkshop2PostgresEnabled()) {
    const idx = memoryPos.findIndex((p) => p.id === input.id);
    if (idx < 0) return null;
    const prev = memoryPos[idx]!;
    const next: Workshop2PurchaseOrderRecord = {
      ...prev,
      mesReleaseStage: stage,
      wipStatus: stage,
      payload: { ...prev.payload, ...payloadPatch },
      updatedAt: at,
    };
    memoryPos[idx] = next;
    return next;
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `UPDATE workshop2_purchase_orders
     SET mes_release_stage = $4,
         wip_status = $4,
         payload = payload || $5::jsonb,
         updated_at = NOW()
     WHERE id = $1 AND collection_id = $2 AND article_id = $3
     RETURNING ${PO_SELECT_COLUMNS}`,
    [input.id, input.collectionId, input.articleId, stage, JSON.stringify(payloadPatch)]
  );
  const row = res.rows[0];
  return row ? mapRow(row) : null;
}

/** Создаёт PO из заявок на материал (BOM requisition / material request). */
export async function createWorkshop2PurchaseOrdersFromRequisitions(input: {
  collectionId: string;
  articleId: string;
  organizationId?: string;
  lines: Array<{
    lineRef?: string;
    materialLabel?: string;
    quantity?: number;
    unit?: string;
    requisitionId?: string;
    supplierId?: string;
  }>;
}): Promise<Workshop2PurchaseOrderRecord[]> {
  const created: Workshop2PurchaseOrderRecord[] = [];
  for (const line of input.lines) {
    const qty = line.quantity ?? 1;
    if (qty <= 0) continue;
    const po = await createWorkshop2PurchaseOrder({
      collectionId: input.collectionId,
      articleId: input.articleId,
      organizationId: input.organizationId,
      lineRef: line.lineRef,
      supplierId: line.supplierId,
      qty,
      status: 'draft',
      payload: {
        source: 'material_request' as Workshop2PurchaseOrderSource,
        materialLabel: line.materialLabel,
        unit: line.unit,
        requisitionId: line.requisitionId,
      },
    });
    created.push(po);
  }
  return created;
}

export async function updateWorkshop2ProductionOrderCutTicket(input: {
  id: string;
  collectionId: string;
  articleId: string;
  cutTicket: ProductionOrderCutTicketStub;
  actor?: string;
}): Promise<Workshop2PurchaseOrderRecord | null> {
  const at = new Date().toISOString();
  const cutTicket: ProductionOrderCutTicketStub = {
    ...input.cutTicket,
    updatedAt: input.cutTicket.updatedAt ?? at,
    updatedBy: input.cutTicket.updatedBy ?? (input.actor?.trim() || 'brand-cut-ticket'),
  };

  if (!isWorkshop2PostgresEnabled()) {
    const idx = memoryPos.findIndex((p) => p.id === input.id);
    if (idx < 0) return null;
    const prev = memoryPos[idx]!;
    if (prev.collectionId !== input.collectionId || prev.articleId !== input.articleId) {
      return null;
    }
    const next: Workshop2PurchaseOrderRecord = {
      ...prev,
      cutTicket,
      updatedAt: at,
    };
    memoryPos[idx] = next;
    return next;
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `UPDATE workshop2_purchase_orders
     SET cut_ticket = $4::jsonb,
         updated_at = NOW()
     WHERE id = $1 AND collection_id = $2 AND article_id = $3
     RETURNING ${PO_SELECT_COLUMNS}`,
    [input.id, input.collectionId, input.articleId, JSON.stringify(cutTicket)]
  );
  const row = res.rows[0];
  return row ? mapRow(row) : null;
}

export async function linkPurchaseOrdersToSampleOrder(input: {
  sampleOrderId: string;
  collectionId: string;
  articleId: string;
  purchaseOrderIds: string[];
}): Promise<void> {
  if (!isWorkshop2PostgresEnabled()) return;
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `UPDATE workshop2_sample_orders
     SET purchase_order_ids = $4::jsonb, updated_at = NOW()
     WHERE id = $1 AND collection_id = $2 AND article_id = $3`,
    [
      input.sampleOrderId,
      input.collectionId,
      input.articleId,
      JSON.stringify(input.purchaseOrderIds),
    ]
  );
}

export function clearWorkshop2PurchaseOrdersMemoryForTests(): void {
  memoryPos.length = 0;
}
