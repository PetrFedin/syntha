import 'server-only';

import { getOrCreateGlobalRuntime } from '@/lib/server/global-runtime-singleton';
import {
  applyWorkshop2MaterialRequisitionStatusToDossier,
  createWorkshop2MaterialRequisition,
  getWorkshop2MaterialRequisitionById,
  listWorkshop2MaterialRequisitions,
  patchWorkshop2MaterialRequisitionSupplierStatus,
  type Workshop2MaterialRequisitionRecord,
  type Workshop2MaterialRequisitionSupplierStatus,
} from '@/lib/server/workshop2-material-requisition-repository';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';
import { bumpPlatformCoreB2bRegistry } from '@/lib/server/platform-core-b2b-registry-hub';
import { patchWorkshop2B2bInventoryReserve } from '@/lib/server/workshop2-b2b-production-handoff';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import {
  WORKSHOP2_ARTICLE_CONTEXT_TYPE,
  workshop2ArticleContextId,
} from '@/lib/production/workshop2-domain-event-types';
import type { Workshop2ProductionMaterialLine } from '@/lib/production/workshop2-dossier-phase1.types';
import { getWorkshop2PurchaseOrderById } from '@/lib/server/workshop2-purchase-order-repository';
import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  uniqueArticleScopesFromB2bOrder,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { buildWorkshop2SupplierBulkConfirmIdempotencyKey } from '@/lib/production/workshop2-supplier-bulk-confirm-idempotency';

const SUPPLIER_BULK_CONFIRM_IDEM_KEY = Symbol.for(
  'syntha.workshop2.supplier.bulk-confirm.idempotency'
);

type SupplierBulkConfirmIdempotencyRecord = {
  response: BulkSupplierMaterialConfirmResult;
  createdAt: string;
};

function supplierBulkConfirmIdempotencyStore(): Map<string, SupplierBulkConfirmIdempotencyRecord> {
  return getOrCreateGlobalRuntime(SUPPLIER_BULK_CONFIRM_IDEM_KEY, () => new Map());
}

export function peekWorkshop2SupplierBulkConfirmIdempotency(
  key: string
): BulkSupplierMaterialConfirmResult | undefined {
  return supplierBulkConfirmIdempotencyStore().get(key.trim())?.response;
}

export function rememberWorkshop2SupplierBulkConfirmIdempotency(
  key: string,
  response: BulkSupplierMaterialConfirmResult
): void {
  supplierBulkConfirmIdempotencyStore().set(key.trim(), {
    response,
    createdAt: new Date().toISOString(),
  });
}

export function resetWorkshop2SupplierBulkConfirmIdempotencyForTests(): void {
  supplierBulkConfirmIdempotencyStore().clear();
}

export { buildWorkshop2SupplierBulkConfirmIdempotencyKey };

export type SupplierMaterialRequestConfirmResult = {
  requisition: Workshop2MaterialRequisitionRecord;
  idempotent: boolean;
};

function isTerminalRequisitionStatus(status: string): boolean {
  return (
    status === 'supplier_confirmed' || status === 'confirmed' || status === 'supplier_rejected'
  );
}

/** Одна заявка: PATCH + зеркало досье + чат (идемпотентно). */
export async function confirmWorkshop2SupplierMaterialRequest(input: {
  requisitionId: string;
  status: Workshop2MaterialRequisitionSupplierStatus;
  note?: string;
  updatedBy?: string;
  b2bOrderId?: string;
  shippedQty?: number;
  backorder?: boolean;
  /** Bulk-confirm aggregates brand push — per-line confirms skip duplicate notification_events. */
  skipBrandPush?: boolean;
}): Promise<SupplierMaterialRequestConfirmResult | null> {
  const existing = await getWorkshop2MaterialRequisitionById(input.requisitionId);
  if (!existing) return null;

  const targetStatus = input.status === 'confirmed' ? 'supplier_confirmed' : 'supplier_rejected';
  const idempotent = existing.status === targetStatus;

  const requisition = idempotent
    ? existing
    : await patchWorkshop2MaterialRequisitionSupplierStatus({
        id: input.requisitionId,
        status: input.status,
        note: input.note,
        updatedBy: input.updatedBy,
        shippedQty: input.shippedQty,
        backorder: input.backorder,
      });
  if (!requisition) return null;

  const b2bOrderId = input.b2bOrderId?.trim();

  if (!idempotent) {
    if (b2bOrderId) {
      bumpPlatformCoreChainStatus([b2bOrderId]);
      bumpPlatformCoreB2bRegistry('supplier.materials_confirmed');
    }

    const record = await getWorkshop2ServerDossierRecord(
      requisition.collectionId,
      requisition.articleId
    );
    if (record) {
      const nextDossier = applyWorkshop2MaterialRequisitionStatusToDossier({
        dossier: record.dossier,
        requisition,
      });
      await putWorkshop2ServerDossierRecord({
        collectionId: requisition.collectionId,
        articleId: requisition.articleId,
        dossier: nextDossier,
        baseVersion: record.version,
        updatedBy: input.updatedBy || 'supplier-material-request',
        txMeta: { eventType: 'supply_material_request_updated' },
      });
    }

    const statusRu = input.status === 'confirmed' ? 'подтверждена' : 'отклонена';
    const partialRu =
      input.status === 'confirmed' && input.shippedQty != null
        ? input.backorder || (existing.quantity != null && input.shippedQty < existing.quantity)
          ? ` · отгрузка ${input.shippedQty}${existing.quantity ? `/${existing.quantity}` : ''}${input.backorder ? ', backorder' : ''}`
          : ''
        : '';
    const chatLine = `Поставщик: заявка ${requisition.materialLabel ?? requisition.id} — ${statusRu}${partialRu}.${input.note ? ` ${input.note}` : ''}`;

    void enqueueWorkshop2DomainEvent({
      type: 'supply.material_request.updated',
      collectionId: requisition.collectionId,
      articleId: requisition.articleId,
      payload: {
        requisitionId: requisition.id,
        status: requisition.status,
        supplierDecision: input.status,
        note: input.note ?? null,
        materialLabel: requisition.materialLabel ?? null,
        b2bOrderId: b2bOrderId ?? null,
      },
      dispatchNow: true,
    }).catch(() => {});

    if (input.status === 'confirmed') {
      bumpPlatformCoreB2bRegistry('materials_supplied');
    }

    void appendWorkshop2ContextualSystemMessage({
      contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
      contextId: workshop2ArticleContextId(requisition.collectionId, requisition.articleId),
      message: chatLine,
    }).catch(() => {});

    if (b2bOrderId) {
      const orderLine =
        input.status === 'confirmed'
          ? `Поставщик подтвердил материалы по артикулу ${requisition.articleId}: ${requisition.materialLabel ?? 'заявка'}.`
          : `Поставщик отклонил материалы по артикулу ${requisition.articleId}: ${requisition.materialLabel ?? 'заявка'}.${input.note ? ` ${input.note}` : ''}`;
      void appendWorkshop2ContextualSystemMessage({
        contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
        contextId: workshop2B2bOrderContextId(b2bOrderId),
        message: orderLine,
      }).catch(() => {});

      if (input.status === 'confirmed') {
        await patchWorkshop2B2bInventoryReserve({
          orderId: b2bOrderId,
          source: 'supplier_materials',
        });
      }
    }
  }

  if (input.status === 'confirmed' && b2bOrderId && !input.skipBrandPush) {
    await pushSupplierMaterialsBrandNotify({
      b2bOrderId,
      collectionId: requisition.collectionId,
      partialShipQty: input.shippedQty,
      backorder: input.backorder,
      lineLabel: requisition.materialLabel ?? requisition.id,
      idempotent,
    });
  }

  return { requisition, idempotent };
}

export type BulkSupplierMaterialConfirmResult = {
  ok: boolean;
  confirmed: number;
  idempotent: number;
  created: number;
  requisitionIds: string[];
  messageRu: string;
  partialShipQty?: number | null;
  backorderFlag?: boolean;
  notifyOnly?: boolean;
};

async function pushSupplierMaterialsBrandNotify(input: {
  b2bOrderId: string;
  collectionId: string;
  partialShipQty?: number;
  backorder?: boolean;
  lineLabel?: string;
  idempotent?: boolean;
}): Promise<void> {
  bumpPlatformCoreChainStatus([input.b2bOrderId]);
  bumpPlatformCoreB2bRegistry('materials_supplied');
  const { recordPlatformCoreChainNotificationEvents } =
    await import('@/lib/server/platform-core-notification-events-repository');
  const partialRu =
    input.partialShipQty != null
      ? ` · отгрузка ${input.partialShipQty}${input.backorder ? ' · backorder' : ''}`
      : '';
  const lineRu = input.lineLabel
    ? `Строка BOM: ${input.lineLabel}`
    : 'Push поставщика · materials_supplied';
  void recordPlatformCoreChainNotificationEvents({
    orderId: input.b2bOrderId,
    collectionId: input.collectionId,
    kind: 'materials_supplied',
    titleRu: `Материалы подтверждены · ${input.b2bOrderId}`,
    bodyRu: input.idempotent
      ? `${lineRu} · PATCH синхронизирован (идемпотентно)${partialRu}.`
      : `${lineRu}${partialRu}.`,
  }).catch(() => {});
}

function withBulkConfirmJournalFields(
  result: BulkSupplierMaterialConfirmResult,
  shippedQty?: number,
  backorder?: boolean
): BulkSupplierMaterialConfirmResult {
  return {
    ...result,
    partialShipQty: shippedQty ?? null,
    backorderFlag: backorder === true,
  };
}

/** Bulk confirm всех строк BOM под PO — одним API-вызовом. */
export async function bulkConfirmWorkshop2SupplierMaterialSupply(input: {
  collectionId: string;
  articleId: string;
  b2bOrderId: string;
  productionOrderId?: string;
  updatedBy?: string;
  organizationId?: string;
  shippedQty?: number;
  backorder?: boolean;
  idempotencyKey?: string;
  notifyOnly?: boolean;
}): Promise<BulkSupplierMaterialConfirmResult> {
  const idemKey = input.idempotencyKey?.trim();
  if (idemKey) {
    const cached = peekWorkshop2SupplierBulkConfirmIdempotency(idemKey);
    if (cached) {
      return { ...cached, idempotent: Math.max(cached.idempotent, 1) };
    }
  }

  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const b2bOrderId = input.b2bOrderId.trim();
  const updatedBy = input.updatedBy?.trim() || 'supplier-procurement';

  if (input.notifyOnly) {
    const existing = await listWorkshop2MaterialRequisitions({
      collectionId,
      articleId,
      organizationId: input.organizationId,
    });
    const anyConfirmed = existing.some((r) => isTerminalRequisitionStatus(r.status));
    if (!anyConfirmed) {
      return withBulkConfirmJournalFields(
        {
          ok: false,
          confirmed: 0,
          idempotent: 0,
          created: 0,
          requisitionIds: [],
          messageRu: 'Сначала подтвердите поставку — push доступен после confirm.',
          notifyOnly: true,
        },
        input.shippedQty,
        input.backorder
      );
    }
    await pushSupplierMaterialsBrandNotify({
      b2bOrderId,
      collectionId,
      partialShipQty: input.shippedQty,
      backorder: input.backorder,
    });
    const notifyResult = withBulkConfirmJournalFields(
      {
        ok: true,
        confirmed: 0,
        idempotent: 1,
        created: 0,
        requisitionIds: existing.map((r) => r.id),
        messageRu: 'Push бренду отправлен · materials_supplied.',
        notifyOnly: true,
      },
      input.shippedQty,
      input.backorder
    );
    if (idemKey) rememberWorkshop2SupplierBulkConfirmIdempotency(idemKey, notifyResult);
    return notifyResult;
  }

  let poQty = 0;
  const poId = input.productionOrderId?.trim();
  if (poId) {
    const po = await getWorkshop2PurchaseOrderById(poId, input.organizationId);
    if (po?.qty) poQty = po.qty;
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  const bomLines: Workshop2ProductionMaterialLine[] =
    record?.dossier?.productionModel?.materialLines?.filter((l) => l.materialName?.trim()) ?? [];

  if (bomLines.length === 0) {
    return {
      ok: false,
      confirmed: 0,
      idempotent: 0,
      created: 0,
      requisitionIds: [],
      messageRu: 'В досье нет строк BOM для подтверждения.',
    };
  }

  const existing = await listWorkshop2MaterialRequisitions({
    collectionId,
    articleId,
    organizationId: input.organizationId,
  });

  const requisitionIds: string[] = [];
  let created = 0;
  let confirmed = 0;
  let idempotent = 0;

  for (const line of bomLines) {
    const materialLabel = line.materialName!.trim();
    const matched = existing.find(
      (r) => r.materialLabel?.trim().toLowerCase() === materialLabel.toLowerCase()
    );

    let reqId = matched?.id;
    if (!reqId) {
      const perUnit = line.yieldPerUnit ?? line.consumption ?? 0;
      const createdReq = await createWorkshop2MaterialRequisition({
        collectionId,
        articleId,
        organizationId: input.organizationId,
        materialLabel,
        quantity: poQty > 0 ? perUnit * poQty : perUnit,
        unit: line.unit,
        createdBy: updatedBy,
      });
      reqId = createdReq.id;
      created += 1;
      existing.push(createdReq);
    }

    if (matched && isTerminalRequisitionStatus(matched.status)) {
      idempotent += 1;
      requisitionIds.push(reqId);
      continue;
    }

    const result = await confirmWorkshop2SupplierMaterialRequest({
      requisitionId: reqId,
      status: 'confirmed',
      updatedBy,
      b2bOrderId,
      shippedQty: input.shippedQty,
      backorder: input.backorder,
      skipBrandPush: true,
    });
    if (!result) continue;
    requisitionIds.push(reqId);
    if (result.idempotent) idempotent += 1;
    else confirmed += 1;
  }

  const pending = existing.filter((r) => !isTerminalRequisitionStatus(r.status));
  for (const row of pending) {
    if (requisitionIds.includes(row.id)) continue;
    const result = await confirmWorkshop2SupplierMaterialRequest({
      requisitionId: row.id,
      status: 'confirmed',
      updatedBy,
      b2bOrderId,
      shippedQty: input.shippedQty,
      backorder: input.backorder,
      skipBrandPush: true,
    });
    if (!result) continue;
    requisitionIds.push(row.id);
    if (result.idempotent) idempotent += 1;
    else confirmed += 1;
  }

  const allIdempotent = confirmed === 0 && idempotent > 0;
  const materialsConfirmed = confirmed > 0 || idempotent > 0;

  if (materialsConfirmed) {
    await patchWorkshop2B2bInventoryReserve({
      orderId: b2bOrderId,
      organizationId: input.organizationId,
      source: 'supplier_materials',
    });
    const { recordPlatformCoreChainNotificationEvents } =
      await import('@/lib/server/platform-core-notification-events-repository');
    void recordPlatformCoreChainNotificationEvents({
      orderId: b2bOrderId,
      collectionId,
      kind: 'materials_supplied',
      titleRu: `Материалы подтверждены · ${b2bOrderId}`,
      bodyRu: allIdempotent
        ? 'Все строки BOM уже подтверждены.'
        : input.backorder || input.shippedQty != null
          ? `Подтверждено строк: ${confirmed}${input.shippedQty != null ? ` · отгрузка ${input.shippedQty}` : ''}${input.backorder ? ' · backorder' : ''}.`
          : `Подтверждено строк: ${confirmed}.`,
    }).catch(() => {});
  }

  const result = withBulkConfirmJournalFields(
    {
      ok: true,
      confirmed,
      idempotent,
      created,
      requisitionIds: [...new Set(requisitionIds)],
      messageRu: allIdempotent
        ? 'Все строки BOM уже подтверждены (идемпотентно).'
        : input.backorder || input.shippedQty != null
          ? `Частичная отгрузка: ${confirmed} строк${input.shippedQty != null ? ` · qty ${input.shippedQty}` : ''}${input.backorder ? ' · backorder' : ''}.`
          : `Подтверждено строк: ${confirmed}${created ? ` · создано заявок: ${created}` : ''}.`,
    },
    input.shippedQty,
    input.backorder
  );
  if (idemKey) rememberWorkshop2SupplierBulkConfirmIdempotency(idemKey, result);
  return result;
}

export type BulkSupplierMaterialOrderConfirmResult = BulkSupplierMaterialConfirmResult & {
  articlesProcessed: number;
  articleResults: Array<{
    collectionId: string;
    articleId: string;
    confirmed: number;
    idempotent: number;
    ok: boolean;
    messageRu: string;
  }>;
};

/** Bulk confirm BOM по всем уникальным артикулам B2B-заказа. */
export async function bulkConfirmWorkshop2SupplierMaterialSupplyForOrder(input: {
  b2bOrderId: string;
  productionOrderId?: string;
  updatedBy?: string;
  organizationId?: string;
  shippedQty?: number;
  backorder?: boolean;
  idempotencyKey?: string;
  notifyOnly?: boolean;
}): Promise<BulkSupplierMaterialOrderConfirmResult> {
  const idemKey = input.idempotencyKey?.trim();
  if (idemKey) {
    const cached = peekWorkshop2SupplierBulkConfirmIdempotency(idemKey);
    if (cached) {
      return {
        ...cached,
        idempotent: Math.max(cached.idempotent, 1),
        articlesProcessed: cached.requisitionIds.length > 0 ? 1 : 0,
        articleResults: [],
      };
    }
  }

  const b2bOrderId = input.b2bOrderId.trim();
  const order = await getWorkshop2B2bOrder(b2bOrderId);
  if (!order) {
    return {
      ok: false,
      confirmed: 0,
      idempotent: 0,
      created: 0,
      requisitionIds: [],
      messageRu: 'B2B заказ не найден.',
      articlesProcessed: 0,
      articleResults: [],
    };
  }

  const scopes = uniqueArticleScopesFromB2bOrder(order);
  if (scopes.length === 0) {
    return {
      ok: false,
      confirmed: 0,
      idempotent: 0,
      created: 0,
      requisitionIds: [],
      messageRu: 'В заказе нет артикулов для закупки.',
      articlesProcessed: 0,
      articleResults: [],
    };
  }

  let totalConfirmed = 0;
  let totalIdempotent = 0;
  let totalCreated = 0;
  const allRequisitionIds: string[] = [];
  const articleResults: BulkSupplierMaterialOrderConfirmResult['articleResults'] = [];

  for (const scope of scopes) {
    const result = await bulkConfirmWorkshop2SupplierMaterialSupply({
      collectionId: scope.collectionId,
      articleId: scope.articleId,
      b2bOrderId,
      productionOrderId: input.productionOrderId,
      updatedBy: input.updatedBy,
      organizationId: input.organizationId,
      shippedQty: input.shippedQty,
      backorder: input.backorder,
      notifyOnly: input.notifyOnly,
    });
    articleResults.push({
      collectionId: scope.collectionId,
      articleId: scope.articleId,
      confirmed: result.confirmed,
      idempotent: result.idempotent,
      ok: result.ok,
      messageRu: result.messageRu,
    });
    if (!result.ok) continue;
    totalConfirmed += result.confirmed;
    totalIdempotent += result.idempotent;
    totalCreated += result.created;
    allRequisitionIds.push(...result.requisitionIds);
  }

  const anyOk = articleResults.some((r) => r.ok);
  const allFailed = articleResults.every((r) => !r.ok);
  const allIdempotent = totalConfirmed === 0 && totalIdempotent > 0;

  const orderResult = withBulkConfirmJournalFields(
    {
      ok: anyOk && !allFailed,
      confirmed: totalConfirmed,
      idempotent: totalIdempotent,
      created: totalCreated,
      requisitionIds: [...new Set(allRequisitionIds)],
      articlesProcessed: scopes.length,
      articleResults,
      messageRu: allFailed
        ? (articleResults[0]?.messageRu ?? 'Не удалось подтвердить поставку.')
        : scopes.length === 1
          ? (articleResults[0]?.messageRu ?? 'Поставка подтверждена.')
          : allIdempotent
            ? `Все артикулы заказа (${scopes.length}) уже подтверждены.`
            : `Подтверждено артикулов: ${articleResults.filter((r) => r.ok && r.confirmed > 0).length || scopes.length} из ${scopes.length}.`,
      notifyOnly: input.notifyOnly,
    },
    input.shippedQty,
    input.backorder
  );
  if (idemKey) rememberWorkshop2SupplierBulkConfirmIdempotency(idemKey, orderResult);
  return orderResult;
}
