import 'server-only';

import {
  getWorkshop2B2bOrder,
  listWorkshop2B2bOrdersForArticle,
  listWorkshop2B2bOrdersForCollection,
  patchWorkshop2B2bOrderStatus,
} from '@/lib/server/workshop2-b2b-orders-repository';
import {
  appendWorkshop2ContextualSystemMessage,
} from '@/lib/server/workshop2-contextual-messages-repository';
import {
  canAdvanceFactoryMesReleaseStage,
  factoryMesReleaseStageLabelRu,
  getNextFactoryMesReleaseStage,
  type FactoryMesReleaseStage,
} from '@/lib/production/workshop2-factory-mes-release-stage';
import {
  getWorkshop2PurchaseOrderById,
  listWorkshop2PurchaseOrdersByPayloadSource,
  updateWorkshop2PurchaseOrderErpSync,
  updateWorkshop2PurchaseOrderMesReleaseStage,
  upsertWorkshop2PurchaseOrder,
} from '@/lib/server/workshop2-purchase-order-repository';
import { postWorkshop2PurchaseOrderToErpOnCreate } from '@/lib/server/workshop2-purchase-order-erp-create';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
  type Workshop2B2bOrderRecord,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
export type { Workshop2B2bOrderRecord };
import { WORKSHOP2_ARTICLE_CONTEXT_TYPE } from '@/lib/production/workshop2-domain-event-types';
import { listWorkshop2SampleOrders } from '@/lib/server/workshop2-sample-order-repository';
import { getPlatformCoreDemoByOrderId } from '@/lib/platform-core-hub-matrix';
import { areWorkshop2MaterialRequisitionsConfirmedForArticles, listWorkshop2MaterialRequisitions } from '@/lib/server/workshop2-material-requisition-repository';
import { autoCreateMaterialRequestsOnFactoryPoAck } from '@/lib/server/workshop2-factory-po-ack-material-request';
import type { Workshop2PurchaseOrderStatus } from '@/lib/server/workshop2-purchase-order-repository';
import { isWorkshop2InternalWmsEnabled } from '@/lib/production/workshop2-internal-wms';
import { persistWorkshop2InternalWmsToDossier } from '@/lib/production/workshop2-internal-wms';
import {
  getWorkshop2ServerDossierAtVersion,
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
  appendWorkshop2ServerDossierEvent,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import { summarizeWorkshop2PersistDiff } from '@/lib/production/workshop2-dossier-activity-log';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import { reserveWorkshop2WmsForSampleOrder } from '@/lib/server/workshop2-internal-wms-server';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';
import { getOrCreateGlobalRuntime } from '@/lib/server/global-runtime-singleton';
import { buildWorkshop2BulkHandoffIdempotencyKey } from '@/lib/production/workshop2-bulk-handoff-idempotency';

export type Workshop2B2bInventoryReserveResult = {
  reserved: boolean;
  reservedQty?: number;
  deficitLineCount?: number;
  reason?: string;
  reservedAt?: string;
};

/** Макс. авто-повторов ERP после live_failed (exponential backoff). */
export const WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX = 3;
const ERP_AUTO_RETRY_BASE_MS = 15_000;

function erpAutoRetryDelayMs(attempt: number): number {
  return ERP_AUTO_RETRY_BASE_MS * 2 ** Math.max(0, attempt);
}

const PO_STATUS_LABEL_RU: Record<Workshop2PurchaseOrderStatus, string> = {
  draft: 'Черновик PO',
  pending_erp: 'В очереди цеха',
  synced: 'Синхронизирован с ERP',
  error: 'Ошибка ERP',
};

export const WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE = 'b2b_production_handoff';

/** Цех из sample-order артикула → demo preset → fact-1. */
export async function resolveWorkshop2FactoryIdForB2bHandoff(input: {
  orderId: string;
  collectionId: string;
  articleId: string;
  explicitFactoryId?: string;
}): Promise<string> {
  const explicit = input.explicitFactoryId?.trim();
  if (explicit) return explicit;

  const sampleOrders = await listWorkshop2SampleOrders({
    collectionId: input.collectionId,
    articleId: input.articleId,
  });
  const fromSample = sampleOrders.find((o) => o.contractorId?.trim())?.contractorId?.trim();
  if (fromSample) return fromSample;

  return getPlatformCoreDemoByOrderId(input.orderId).factoryId || 'fact-1';
}

import { workshop2B2bProductionHandoffPoId } from '@/lib/production/workshop2-b2b-handoff-po-id';

export { workshop2B2bProductionHandoffPoId };

export type Workshop2B2bProductionHandoffResult =
  | {
      ok: true;
      order: Workshop2B2bOrderRecord;
      productionOrderId: string;
      factoryId: string;
      alreadyConfirmed: boolean;
      inventoryReserve: Workshop2B2bInventoryReserveResult;
      messageRu: string;
    }
  | { ok: false; code: string; messageRu: string };

/** Резерв WMS под оптовый заказ после подтверждения бренда (волна D). */
export async function tryReserveB2bInventoryOnHandoff(input: {
  orderId: string;
  collectionId: string;
  articleId: string;
}): Promise<Workshop2B2bInventoryReserveResult> {
  if (!isWorkshop2InternalWmsEnabled()) {
    return { reserved: false, reason: 'internal_wms_disabled' };
  }

  const record = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  if (!record) {
    return { reserved: false, reason: 'dossier_not_found' };
  }

  const reserveKey = `b2b:${input.orderId.trim()}`;
  const result = await reserveWorkshop2WmsForSampleOrder({
    collectionId: input.collectionId,
    articleId: input.articleId,
    dossier: record.dossier,
    actor: 'b2b-handoff',
    sampleOrderId: reserveKey,
  });

  const reservedQty = result.mirror.reservedQty ?? 0;
  const reserved =
    result.ok &&
    (result.reservedLines > 0 ||
      result.reason === 'idempotent_reserve_skip' ||
      reservedQty > 0);

  if (reserved && result.mirror) {
    const nextDossier = persistWorkshop2InternalWmsToDossier(record.dossier, {
      mirror: result.mirror,
    });
    await putWorkshop2ServerDossierRecord({
      collectionId: input.collectionId,
      articleId: input.articleId,
      dossier: nextDossier,
      baseVersion: record.version,
      txMeta: {
        eventType: 'b2b.inventory_reserve',
        eventPayload: { orderId: input.orderId, reservedQty, reserveKey },
      },
    });
  }

  return {
    reserved,
    reservedQty: reserved ? reservedQty : undefined,
    deficitLineCount: result.deficitLineCount,
    reason: result.reason,
    reservedAt: reserved ? new Date().toISOString() : undefined,
  };
}

export type Workshop2B2bInventoryReservePatchResult =
  | {
      ok: true;
      orderId: string;
      inventoryReserve: Workshop2B2bInventoryReserveResult;
      idempotent: boolean;
      order: Workshop2B2bOrderRecord;
      messageRu: string;
    }
  | { ok: false; code: string; messageRu: string };

/** PATCH inventory/reserve — WMS резерв под B2B заказ + зеркало в PO payload (S3). */
export async function patchWorkshop2B2bInventoryReserve(input: {
  orderId: string;
  organizationId?: string;
  source?: 'brand_confirm' | 'supplier_materials' | 'manual_patch';
}): Promise<Workshop2B2bInventoryReservePatchResult> {
  const orderId = input.orderId.trim();
  const org = input.organizationId?.trim() || 'org-brand-001';
  const order = await getWorkshop2B2bOrder(orderId);
  if (!order) {
    return { ok: false, code: 'not_found', messageRu: 'B2B заказ не найден.' };
  }

  const collectionId = order.collectionId?.trim() || 'SS27';
  const articleId =
    order.lines[0]?.articleId?.trim() || order.articleId?.trim() || 'demo-ss27-01';
  const productionOrderId = workshop2B2bProductionHandoffPoId(orderId);
  const po = await getWorkshop2PurchaseOrderById(productionOrderId, org);

  const prevInventory = po?.payload?.inventoryReserve as
    | Workshop2B2bInventoryReserveResult
    | undefined;
  if (prevInventory?.reserved === true) {
    bumpPlatformCoreChainStatus([orderId]);
    return {
      ok: true,
      orderId,
      inventoryReserve: prevInventory,
      idempotent: true,
      order,
      messageRu: 'Резерв на складе уже оформлен (идемпотентно).',
    };
  }

  const inventoryReserve = await tryReserveB2bInventoryOnHandoff({
    orderId,
    collectionId,
    articleId,
  });

  let nextOrder = order;
  if (inventoryReserve.reserved && order.status === 'confirmed') {
    const allocated = await patchWorkshop2B2bOrderStatus({ orderId, status: 'allocated' });
    if (allocated.ok) nextOrder = allocated.order;
  }

  if (po) {
    await updateWorkshop2PurchaseOrderErpSync({
      id: productionOrderId,
      collectionId,
      articleId,
      status: po.status,
      payloadPatch: {
        inventoryReserve,
        inventoryReserveSource: input.source ?? 'manual_patch',
        inventoryReserveAt: new Date().toISOString(),
      },
    });
  }

  bumpPlatformCoreChainStatus([orderId]);
  const { bumpPlatformCoreB2bRegistry } =
    await import('@/lib/server/platform-core-b2b-registry-hub');
  bumpPlatformCoreB2bRegistry('b2b.inventory_reserve');

  if (inventoryReserve.reserved) {
    const { recordPlatformCoreChainNotificationEvents } =
      await import('@/lib/server/platform-core-notification-events-repository');
    void recordPlatformCoreChainNotificationEvents({
      orderId,
      collectionId,
      kind: 'inventory_reserved',
      titleRu: `Резерв на складе · ${orderId}`,
      bodyRu: `Резерв: ${inventoryReserve.reservedQty ?? '—'} ед.`,
    }).catch(() => {});
  }

  const messageRu = inventoryReserve.reserved
    ? `Резерв на складе: ${inventoryReserve.reservedQty ?? '—'} ед.`
    : inventoryReserve.reason === 'internal_wms_disabled'
      ? 'WMS отключён — резерв не создан.'
      : 'Резерв не оформлен (дефицит или досье не найдено).';

  return {
    ok: true,
    orderId,
    inventoryReserve,
    idempotent: false,
    order: nextOrder,
    messageRu,
  };
}

export type Workshop2B2bInventoryReserveGetResult =
  | {
      ok: true;
      orderId: string;
      collectionId: string;
      articleId: string;
      inventoryReserve: Workshop2B2bInventoryReserveResult;
      reservedQty: number;
      internalWmsEnabled: boolean;
      wmsBalancesHref: string;
    }
  | { ok: false; code: string; messageRu: string };

/** GET inventory/reserve — зеркало PO payload + WMS qty (S3 wave UX). */
export async function getWorkshop2B2bInventoryReserve(input: {
  orderId: string;
  organizationId?: string;
}): Promise<Workshop2B2bInventoryReserveGetResult> {
  const orderId = input.orderId.trim();
  const org = input.organizationId?.trim() || 'org-brand-001';
  const order = await getWorkshop2B2bOrder(orderId);
  if (!order) {
    return { ok: false, code: 'not_found', messageRu: 'B2B заказ не найден.' };
  }

  const collectionId = order.collectionId?.trim() || 'SS27';
  const articleId =
    order.lines[0]?.articleId?.trim() || order.articleId?.trim() || 'demo-ss27-01';
  const productionOrderId = workshop2B2bProductionHandoffPoId(orderId);
  const po = await getWorkshop2PurchaseOrderById(productionOrderId, org);
  const poInventory = po?.payload?.inventoryReserve as
    | Workshop2B2bInventoryReserveResult
    | undefined;

  const dossierRecord = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  const wmsMirror = dossierRecord?.dossier.internalWmsMirror;
  const dossierReservedQty = wmsMirror
    ? workshop2PgMirrorNum(wmsMirror, 'reservedQty')
    : 0;
  const dossierInventoryReserved =
    dossierReservedQty > 0 &&
    (wmsMirror ? workshop2PgMirrorStr(wmsMirror, 'wmsSyncStatus') : '') === 'internal_pg';

  const reserved =
    order.status === 'allocated' ||
    poInventory?.reserved === true ||
    dossierInventoryReserved;
  const reservedQty =
    poInventory?.reservedQty ??
    (dossierReservedQty > 0 ? dossierReservedQty : reserved && po?.qty ? po.qty : 0);

  const inventoryReserve: Workshop2B2bInventoryReserveResult = poInventory
    ? { ...poInventory }
    : {
        reserved,
        reservedQty: reserved ? reservedQty : undefined,
        reason: reserved ? undefined : 'pending_handoff',
      };

  if (!inventoryReserve.reserved && reserved) {
    inventoryReserve.reserved = true;
    inventoryReserve.reservedQty = reservedQty;
  }

  return {
    ok: true,
    orderId,
    collectionId,
    articleId,
    inventoryReserve,
    reservedQty: reservedQty > 0 ? reservedQty : 0,
    internalWmsEnabled: isWorkshop2InternalWmsEnabled(),
    wmsBalancesHref: `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/wms/balances`,
  };
}

export type Workshop2B2bOrderBrandConfirmResult =
  | {
      ok: true;
      order: Workshop2B2bOrderRecord;
      alreadyConfirmed: boolean;
      inventoryReserve?: Workshop2B2bInventoryReserveResult;
      messageRu: string;
    }
  | { ok: false; code: string; messageRu: string };

/** Бренд подтверждает заказ (submitted → confirmed) без передачи в цех. */
export async function confirmWorkshop2B2bOrderByBrand(input: {
  orderId: string;
  organizationId?: string;
}): Promise<Workshop2B2bOrderBrandConfirmResult> {
  const orderId = input.orderId.trim();
  const org = input.organizationId?.trim() || 'org-brand-001';
  const existing = await getWorkshop2B2bOrder(orderId);
  if (!existing) {
    return { ok: false, code: 'not_found', messageRu: 'B2B заказ не найден.' };
  }

  if (existing.status === 'confirmed' || existing.status === 'allocated' || existing.status === 'shipped') {
    const collectionId = existing.collectionId?.trim() || 'SS27';
    const articleId =
      existing.lines[0]?.articleId?.trim() || existing.articleId?.trim() || 'demo-ss27-01';
    const inventoryReserve = await tryReserveB2bInventoryOnHandoff({
      orderId,
      collectionId,
      articleId,
    });
    return {
      ok: true,
      order: existing,
      alreadyConfirmed: true,
      inventoryReserve,
      messageRu: 'Заказ уже подтверждён.',
    };
  }

  if (existing.status !== 'submitted') {
    return {
      ok: false,
      code: 'invalid_status',
      messageRu: `Нельзя подтвердить заказ из статуса «${existing.status}».`,
    };
  }

  const patched = await patchWorkshop2B2bOrderStatus({ orderId, status: 'confirmed' });
  if (!patched.ok) {
    return { ok: false, code: patched.code, messageRu: patched.messageRu };
  }

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: workshop2B2bOrderContextId(orderId),
    message: `Бренд подтвердил оптовый заказ ${orderId}.`,
  });

  bumpPlatformCoreChainStatus([orderId]);

  const collectionId = patched.order.collectionId?.trim() || 'SS27';
  const articleId =
    patched.order.lines[0]?.articleId?.trim() ||
    patched.order.articleId?.trim() ||
    'demo-ss27-01';
  const inventoryReserve = await tryReserveB2bInventoryOnHandoff({
    orderId,
    collectionId,
    articleId,
  });

  return {
    ok: true,
    order: patched.order,
    alreadyConfirmed: false,
    inventoryReserve,
    messageRu: 'Заказ подтверждён. Можно передать в производство.',
  };
}

export type Workshop2DossierHandoffB2bSyncItem = {
  orderId: string;
  ok: boolean;
  code?: string;
  messageRu: string;
  productionOrderId?: string;
  orderStatus?: Workshop2B2bOrderRecord['status'];
};

export type Workshop2DossierHandoffB2bSyncResult = {
  attempted: boolean;
  resolvedOrderId?: string;
  results: Workshop2DossierHandoffB2bSyncItem[];
};

/** Выбирает один B2B-заказ для синка после dossier handoff (не bulk). */
export function pickWorkshop2B2bOrderIdForDossierHandoffSync(
  orders: Workshop2B2bOrderRecord[],
  collectionId: string
): string | null {
  const eligible = orders.filter(
    (o) => o.status !== 'cancelled' && o.status !== 'shipped' && o.status !== 'draft'
  );
  if (eligible.length === 0) return null;

  const inCollection = eligible.filter(
    (o) => (o.collectionId?.trim() || '') === collectionId.trim()
  );
  const pool = inCollection.length > 0 ? inCollection : eligible;
  const priority: Workshop2B2bOrderRecord['status'][] = ['confirmed', 'allocated', 'submitted'];
  for (const status of priority) {
    const match = pool.find((o) => o.status === status);
    if (match) return match.id;
  }
  return pool[0]?.id ?? null;
}

/**
 * P0 spine: после server handoff/commit обновляет B2B order + PO (не только dossier UI).
 */
export async function syncWorkshop2B2bOrderAfterDossierHandoffCommit(input: {
  collectionId: string;
  articleId: string;
  orderId?: string;
  factoryId?: string;
  organizationId?: string;
}): Promise<Workshop2DossierHandoffB2bSyncResult> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const explicitOrderId = input.orderId?.trim();

  let resolvedOrderId = explicitOrderId || null;
  if (!resolvedOrderId) {
    const orders = await listWorkshop2B2bOrdersForArticle({ collectionId, articleId });
    resolvedOrderId = pickWorkshop2B2bOrderIdForDossierHandoffSync(orders, collectionId);
  }

  if (!resolvedOrderId) {
    return { attempted: false, results: [] };
  }

  const results: Workshop2DossierHandoffB2bSyncItem[] = [];
  const orderId = resolvedOrderId;
  const existing = await getWorkshop2B2bOrder(orderId);
  if (!existing) {
    results.push({
      orderId,
      ok: false,
      code: 'not_found',
      messageRu: 'B2B заказ не найден.',
    });
    return { attempted: true, resolvedOrderId: orderId, results };
  }

  if (existing.status === 'submitted') {
    const confirmed = await confirmWorkshop2B2bOrderByBrand({
      orderId,
      organizationId: input.organizationId,
    });
    if (!confirmed.ok) {
      results.push({
        orderId,
        ok: false,
        code: confirmed.code,
        messageRu: confirmed.messageRu,
      });
      return { attempted: true, resolvedOrderId: orderId, results };
    }
  }

  const handoff = await confirmWorkshop2B2bProductionHandoff({
    orderId,
    factoryId: input.factoryId,
    organizationId: input.organizationId,
  });

  if (handoff.ok) {
    results.push({
      orderId,
      ok: true,
      messageRu: handoff.messageRu,
      productionOrderId: handoff.productionOrderId,
      orderStatus: handoff.order.status,
    });
  } else {
    results.push({
      orderId,
      ok: false,
      code: handoff.code,
      messageRu: handoff.messageRu,
    });
  }

  return { attempted: true, resolvedOrderId: orderId, results };
}

export type Workshop2B2bDossierEditLock = {
  locked: boolean;
  orderId?: string;
  productionOrderId?: string;
  messageRu?: string;
};

/** ТЗ заблокировано после handoff B2B по этому артикулу. */
export async function getWorkshop2B2bDossierEditLock(input: {
  collectionId: string;
  articleId: string;
}): Promise<Workshop2B2bDossierEditLock> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  if (!collectionId || !articleId) return { locked: false };

  const orders = await listWorkshop2B2bOrdersForCollection(collectionId);
  for (const order of orders) {
    const lineArticle =
      order.lines[0]?.articleId?.trim() || order.articleId?.trim() || '';
    if (lineArticle !== articleId) continue;
    const productionOrderId = workshop2B2bProductionHandoffPoId(order.id);
    const po = await getWorkshop2PurchaseOrderById(productionOrderId);
    if (po?.payload?.source === WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE) {
      return {
        locked: true,
        orderId: order.id,
        productionOrderId,
        messageRu: `ТЗ зафиксировано при передаче заказа ${order.id} в производство.`,
      };
    }
  }
  return { locked: false };
}

async function evaluateWorkshop2HandoffMaterialsGate(input: {
  collectionId: string;
  articleIds: string[];
  organizationId?: string;
}): Promise<{ ok: true } | { ok: false; messageRu: string }> {
  const unique = [...new Set(input.articleIds.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return { ok: true };

  for (const articleId of unique) {
    const reqs = await listWorkshop2MaterialRequisitions({
      collectionId: input.collectionId,
      articleId,
      organizationId: input.organizationId,
    });
    if (reqs.length === 0) continue;
    if (!reqs.some((r) => r.status === 'supplier_confirmed')) {
      return {
        ok: false,
        messageRu:
          'Есть незакрытые заявки на материалы — дождитесь подтверждения поставщика перед передачей в цех.',
      };
    }
  }
  return { ok: true };
}

export async function confirmWorkshop2B2bProductionHandoff(input: {
  orderId: string;
  factoryId?: string;
  organizationId?: string;
}): Promise<Workshop2B2bProductionHandoffResult> {
  const orderId = input.orderId.trim();
  const org = input.organizationId?.trim() || 'org-brand-001';

  const existing = await getWorkshop2B2bOrder(orderId);
  if (!existing) {
    return { ok: false, code: 'not_found', messageRu: 'B2B заказ не найден.' };
  }

  const collectionId = existing.collectionId?.trim() || 'SS27';
  const primaryLine = existing.lines[0];
  const articleId = primaryLine?.articleId?.trim() || existing.articleId?.trim() || 'demo-ss27-01';
  const factoryId = await resolveWorkshop2FactoryIdForB2bHandoff({
    orderId,
    collectionId,
    articleId,
    explicitFactoryId: input.factoryId,
  });
  const qty = primaryLine?.qty ?? 1;
  const productionOrderId = workshop2B2bProductionHandoffPoId(orderId);

  let order = existing;
  const alreadyConfirmed =
    existing.status === 'confirmed' || existing.status === 'allocated';

  if (existing.status === 'submitted') {
    return {
      ok: false,
      code: 'needs_confirm',
      messageRu: 'Сначала подтвердите заказ, затем передайте в производство.',
    };
  }
  if (!alreadyConfirmed && existing.status !== 'cancelled' && existing.status !== 'shipped') {
    return {
      ok: false,
      code: 'invalid_status',
      messageRu: `Нельзя передать в производство из статуса «${existing.status}».`,
    };
  }

  const articleIdsForMaterials = [
    ...new Set(
      existing.lines
        .map((l) => (l.articleId?.trim() || articleId).trim())
        .filter(Boolean)
    ),
  ];
  const materialsGate = await evaluateWorkshop2HandoffMaterialsGate({
    collectionId,
    articleIds: articleIdsForMaterials,
    organizationId: org,
  });
  if (!materialsGate.ok) {
    return { ok: false, code: 'materials_pending', messageRu: materialsGate.messageRu };
  }

  const { assertWorkshop2QcGateAllowsProductionHandoff } =
    await import('@/lib/server/workshop2-qc-gate-repository');
  const qcGate = await assertWorkshop2QcGateAllowsProductionHandoff(orderId);
  if (!qcGate.ok) {
    return { ok: false, code: qcGate.code, messageRu: qcGate.messageRu };
  }

  const inventoryReserve = await tryReserveB2bInventoryOnHandoff({
    orderId,
    collectionId,
    articleId,
  });

  if (inventoryReserve.reserved && order.status === 'confirmed') {
    const allocated = await patchWorkshop2B2bOrderStatus({ orderId, status: 'allocated' });
    if (allocated.ok) {
      order = allocated.order;
    }
  } else if (inventoryReserve.reserved) {
    const { bumpPlatformCoreB2bRegistry } =
      await import('@/lib/server/platform-core-b2b-registry-hub');
    bumpPlatformCoreB2bRegistry('b2b.inventory_reserve');
  }

  const dossierRefs = existing.lines.map((l) => ({
    collectionId: l.collectionId || collectionId,
    articleId: l.articleId,
  }));

  const priorPo = await getWorkshop2PurchaseOrderById(productionOrderId, org);
  const priorHandoffVersion =
    priorPo?.payload?.dossierVersionAtHandoff != null
      ? Number(priorPo.payload.dossierVersionAtHandoff)
      : undefined;
  const dossierAtHandoff = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  const dossierVersionAtHandoff =
    priorHandoffVersion != null && Number.isFinite(priorHandoffVersion)
      ? priorHandoffVersion
      : dossierAtHandoff?.version ?? 1;

  await upsertWorkshop2PurchaseOrder({
    id: productionOrderId,
    collectionId,
    articleId,
    organizationId: org,
    lineRef: `b2b:${orderId}`,
    supplierId: factoryId,
    qty,
    status: 'pending_erp',
    payload: {
      source: WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
      b2bOrderId: orderId,
      buyerId: order.buyerId,
      factoryId,
      totalRub: order.totalRub,
      lines: existing.lines,
      dossierRefs,
      handoffAt: new Date().toISOString(),
      dossierVersionAtHandoff,
      inventoryReserve,
    },
  });

  const b2bCtx = workshop2B2bOrderContextId(orderId);
  const articleCtx = `${collectionId}:${articleId}`;

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: b2bCtx,
    message: `Заказ передан на производство ${factoryId} · ${productionOrderId} · ${qty} шт. · досье: ${articleId}.`,
  });

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    contextId: articleCtx,
    message: `Серия по B2B ${orderId} запущена на ${factoryId} (${productionOrderId}) с контекстом ТЗ ${articleId}.`,
  });

  void enqueueWorkshop2DomainEvent({
    type: 'b2b.order.status_changed',
    collectionId,
    articleId,
    payload: {
      orderId,
      status: order.status,
      previousStatus: existing.status,
      source: 'b2b_production_handoff',
      productionOrderId,
      factoryId,
      dossierRefs,
      dossierVersionAtHandoff,
    },
  }).catch(() => {
    /* best-effort */
  });

  void appendWorkshop2ServerDossierEvent({
    collectionId,
    articleId,
    eventType: 'b2b_tz_handoff_linked',
    createdBy: 'b2b-production-handoff',
    eventPayload: {
      orderId,
      productionOrderId,
      factoryId,
      dossierVersionAtHandoff,
      source: WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
    },
  }).catch(() => {
    /* best-effort journal */
  });

  const reserveNote = inventoryReserve.reserved
    ? ` Резерв на складе: ${inventoryReserve.reservedQty ?? qty} ед.`
    : inventoryReserve.reason === 'internal_wms_disabled'
      ? ' Резерв склада недоступен (WMS выключен).'
      : '';

  bumpPlatformCoreChainStatus([orderId]);
  const { bumpPlatformCoreB2bRegistry } =
    await import('@/lib/server/platform-core-b2b-registry-hub');
  bumpPlatformCoreB2bRegistry('b2b.production_handoff');

  if (!priorPo) {
    const { notifyManufacturerHandoffQueuePoInbox } =
      await import('@/lib/server/platform-core-handoff-inbox-notification');
    void notifyManufacturerHandoffQueuePoInbox({
      b2bOrderId: orderId,
      productionOrderId,
      collectionId,
      factoryId,
      articleId,
    }).catch(() => {});
  }

  return {
    ok: true,
    order,
    productionOrderId,
    factoryId,
    alreadyConfirmed,
    inventoryReserve,
    messageRu: alreadyConfirmed
      ? `PO ${productionOrderId} обновлён для ${factoryId}.${reserveNote}`
      : `Передано в производство · ${productionOrderId}.${reserveNote}`,
  };
}

export type Workshop2B2bProductionHandoffBulkResult = {
  ok: boolean;
  handedOff: string[];
  skipped: string[];
  errors: Array<{ orderId: string; messageRu: string }>;
  messageRu: string;
  idempotent?: boolean;
};

const BULK_HANDOFF_IDEM_KEY = Symbol.for('syntha.workshop2.b2b.bulk-handoff.idempotency');

type BulkHandoffIdempotencyRecord = {
  response: Workshop2B2bProductionHandoffBulkResult;
  createdAt: string;
};

function bulkHandoffIdempotencyStore(): Map<string, BulkHandoffIdempotencyRecord> {
  return getOrCreateGlobalRuntime(BULK_HANDOFF_IDEM_KEY, () => new Map());
}

export { buildWorkshop2BulkHandoffIdempotencyKey } from '@/lib/production/workshop2-bulk-handoff-idempotency';

export function peekWorkshop2BulkHandoffIdempotency(
  key: string
): Workshop2B2bProductionHandoffBulkResult | undefined {
  return bulkHandoffIdempotencyStore().get(key.trim())?.response;
}

export function rememberWorkshop2BulkHandoffIdempotency(
  key: string,
  response: Workshop2B2bProductionHandoffBulkResult
): void {
  bulkHandoffIdempotencyStore().set(key.trim(), {
    response,
    createdAt: new Date().toISOString(),
  });
}

export function resetWorkshop2BulkHandoffIdempotencyForTests(): void {
  bulkHandoffIdempotencyStore().clear();
}

/** Бренд: пакетная передача подтверждённых B2B заказов в производство. */
export async function bulkConfirmWorkshop2B2bProductionHandoff(input: {
  orderIds: string[];
  factoryId?: string;
  organizationId?: string;
  idempotencyKey?: string;
}): Promise<Workshop2B2bProductionHandoffBulkResult> {
  const idemKey = input.idempotencyKey?.trim();
  if (idemKey) {
    const cached = peekWorkshop2BulkHandoffIdempotency(idemKey);
    if (cached) {
      return { ...cached, idempotent: true };
    }
  }

  const handedOff: string[] = [];
  const skipped: string[] = [];
  const errors: Array<{ orderId: string; messageRu: string }> = [];
  const unique = [...new Set(input.orderIds.map((id) => id.trim()).filter(Boolean))];

  for (const orderId of unique) {
    const existing = await getWorkshop2B2bOrder(orderId);
    if (existing?.status === 'submitted') {
      skipped.push(orderId);
      errors.push({
        orderId,
        messageRu: 'Сначала подтвердите заказ, затем передайте в производство.',
      });
      continue;
    }
    const result = await confirmWorkshop2B2bProductionHandoff({
      orderId,
      factoryId: input.factoryId,
      organizationId: input.organizationId,
    });
    if (result.ok) {
      handedOff.push(orderId);
    } else if (result.code === 'invalid_status' || result.code === 'needs_confirm') {
      skipped.push(orderId);
      errors.push({ orderId, messageRu: result.messageRu });
    } else {
      errors.push({ orderId, messageRu: result.messageRu });
    }
  }

  if (handedOff.length > 0) {
    bumpPlatformCoreChainStatus(handedOff);
    await runWorkshop2FactoryHandoffErpAutoRetries({
      factoryId: input.factoryId?.trim() || 'fact-1',
      burst: true,
    });
  }

  const ok = handedOff.length > 0;
  const messageRu = ok
    ? `Передано в производство: ${handedOff.length} из ${unique.length} заказ(ов).`
    : errors[0]?.messageRu ?? 'Не удалось передать заказы в производство.';

  const result: Workshop2B2bProductionHandoffBulkResult = {
    ok,
    handedOff,
    skipped,
    errors,
    messageRu,
  };
  if (idemKey && ok) {
    rememberWorkshop2BulkHandoffIdempotency(idemKey, result);
  }
  return result;
}

export type Workshop2FactoryHandoffBulkAckItem = {
  productionOrderId: string;
  collectionId: string;
  articleId: string;
};

export type Workshop2FactoryHandoffBulkAckMaterialRequestAuto = {
  productionOrderId: string;
  created: number;
  skipped: number;
  requisitionIds: string[];
};

export type Workshop2FactoryHandoffBulkAckResult = {
  ok: boolean;
  acknowledged: string[];
  skipped: string[];
  errors: Array<{ productionOrderId: string; messageRu: string }>;
  erp?: {
    journalOnly: number;
    liveSynced: number;
    liveFailed: number;
  };
  materialRequestAuto?: Workshop2FactoryHandoffBulkAckMaterialRequestAuto[];
};

/** Цех принимает серии: factory ack + опциональный POST в ERP при WORKSHOP2_FACTORY_ERP_BASE_URL. */
export async function bulkAcknowledgeWorkshop2FactoryProductionHandoff(input: {
  factoryId?: string;
  organizationId?: string;
  items: Workshop2FactoryHandoffBulkAckItem[];
  actor?: string;
}): Promise<Workshop2FactoryHandoffBulkAckResult> {
  const factoryId = input.factoryId?.trim() || 'fact-1';
  const acknowledged: string[] = [];
  const skipped: string[] = [];
  const errors: Array<{ productionOrderId: string; messageRu: string }> = [];
  const materialRequestAuto: Workshop2FactoryHandoffBulkAckMaterialRequestAuto[] = [];
  const erp = { journalOnly: 0, liveSynced: 0, liveFailed: 0 };

  for (const raw of input.items) {
    const productionOrderId = raw.productionOrderId?.trim();
    const collectionId = raw.collectionId?.trim();
    const articleId = raw.articleId?.trim();
    if (!productionOrderId || !collectionId || !articleId) {
      errors.push({
        productionOrderId: productionOrderId || '—',
        messageRu: 'Не указаны productionOrderId, collectionId или articleId.',
      });
      continue;
    }

    const po = await getWorkshop2PurchaseOrderById(productionOrderId, input.organizationId);
    if (!po) {
      errors.push({ productionOrderId, messageRu: 'Производственный заказ не найден.' });
      continue;
    }
    if (po.payload?.source !== WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE) {
      errors.push({ productionOrderId, messageRu: 'Серия не из очереди B2B handoff.' });
      continue;
    }
    if (po.supplierId !== factoryId) {
      errors.push({ productionOrderId, messageRu: `Серия назначена другому цеху (${po.supplierId}).` });
      continue;
    }
    if (po.collectionId !== collectionId || po.articleId !== articleId) {
      errors.push({ productionOrderId, messageRu: 'collectionId/articleId не совпадают с PO.' });
      continue;
    }

    if (po.status === 'synced') {
      skipped.push(productionOrderId);
      continue;
    }
    if (po.status !== 'pending_erp') {
      errors.push({
        productionOrderId,
        messageRu: `Нельзя принять серию из статуса «${PO_STATUS_LABEL_RU[po.status]}».`,
      });
      continue;
    }

    const acknowledgedAt = new Date().toISOString();
    const actor = input.actor?.trim() || 'factory_bulk_ack';
    const factoryAckPatch = {
      factoryAcknowledgedAt: acknowledgedAt,
      factoryAcknowledgedBy: actor,
      factoryAckSource: WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
    };

    const erpAttempt = await postWorkshop2PurchaseOrderToErpOnCreate({
      collectionId,
      articleId,
      purchaseOrder: {
        ...po,
        payload: { ...po.payload, ...factoryAckPatch, erpTrigger: 'factory_bulk_ack' },
      },
    });

    let updated = erpAttempt.purchaseOrder;

    if (erpAttempt.ok && erpAttempt.erpExternalId) {
      updated =
        (await updateWorkshop2PurchaseOrderErpSync({
          id: productionOrderId,
          collectionId,
          articleId,
          status: 'synced',
          payloadPatch: factoryAckPatch,
        })) ?? updated;
      erp.liveSynced += 1;
    } else if (!erpAttempt.attempted) {
      updated =
        (await updateWorkshop2PurchaseOrderErpSync({
          id: productionOrderId,
          collectionId,
          articleId,
          status: 'synced',
          erpExternalId: `FACTORY-ACK-${productionOrderId}`,
          syncedAt: acknowledgedAt,
          payloadPatch: {
            ...factoryAckPatch,
            erpSyncStatus: 'not_configured',
            erpSyncHintRu: 'Задайте WORKSHOP2_FACTORY_ERP_BASE_URL для POST /purchase-orders',
          },
        })) ?? updated;
      if (!updated) {
        errors.push({ productionOrderId, messageRu: 'Не удалось обновить статус PO.' });
        continue;
      }
      erp.journalOnly += 1;
    } else {
      updated =
        (await updateWorkshop2PurchaseOrderErpSync({
          id: productionOrderId,
          collectionId,
          articleId,
          status: 'error',
          lastError: erpAttempt.error,
          payloadPatch: {
            ...factoryAckPatch,
            erpSyncStatus: 'error',
            erpSyncError: erpAttempt.error,
            erpAutoRetryCount: 0,
            erpNextRetryAt: new Date(Date.now() + erpAutoRetryDelayMs(0)).toISOString(),
          },
        })) ?? updated;
      erp.liveFailed += 1;
      errors.push({
        productionOrderId,
        messageRu: `Цех принял серию, ERP sync не выполнен: ${erpAttempt.error ?? 'ошибка'}.`,
      });
      continue;
    }

    await updateWorkshop2PurchaseOrderMesReleaseStage({
      id: productionOrderId,
      collectionId,
      articleId,
      stage: 'cut',
      actor: input.actor,
    });

    acknowledged.push(productionOrderId);
    const b2bOrderId = String(po.payload?.b2bOrderId ?? '').trim();

    try {
      const autoMat = await autoCreateMaterialRequestsOnFactoryPoAck({
        productionOrderId,
        collectionId,
        articleId,
        organizationId: input.organizationId,
        actor,
        b2bOrderId: b2bOrderId || undefined,
      });
      if (autoMat.created > 0 || autoMat.skipped > 0 || autoMat.requisitionIds.length > 0) {
        materialRequestAuto.push({
          productionOrderId,
          created: autoMat.created,
          skipped: autoMat.skipped,
          requisitionIds: autoMat.requisitionIds,
        });
      }
    } catch {
      /* PO ack succeeds even if material-request auto-create fails */
    }

    if (b2bOrderId) {
      void appendWorkshop2ContextualSystemMessage({
        contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
        contextId: workshop2B2bOrderContextId(b2bOrderId),
        message: `Цех ${factoryId} принял серию ${productionOrderId} в производство.`,
      }).catch(() => {});
      void enqueueWorkshop2DomainEvent({
        type: 'b2b.factory_handoff_acknowledged',
        collectionId,
        articleId,
        payload: {
          b2bOrderId,
          productionOrderId,
          factoryId,
          actor: input.actor?.trim() || 'factory_bulk_ack',
        },
      }).catch(() => {});
    }
  }

  if (acknowledged.length > 0) {
    const orderIdsFromItems = await Promise.all(
      acknowledged.map(async (poId) => {
        const po = await getWorkshop2PurchaseOrderById(poId);
        return String(po?.payload?.b2bOrderId ?? '').trim();
      })
    );
    bumpPlatformCoreChainStatus(orderIdsFromItems.filter(Boolean));
    const { bumpPlatformCoreHandoffQueue } =
      await import('@/lib/server/platform-core-handoff-queue-hub');
    bumpPlatformCoreHandoffQueue(factoryId);
    await runWorkshop2FactoryHandoffErpAutoRetries({ factoryId, burst: true });
  }

  return {
    ok: errors.length === 0,
    acknowledged,
    skipped,
    errors,
    erp:
      erp.journalOnly + erp.liveSynced + erp.liveFailed > 0
        ? erp
        : undefined,
    materialRequestAuto: materialRequestAuto.length > 0 ? materialRequestAuto : undefined,
  };
}

export type Workshop2FactoryHandoffErpRetryResult = {
  ok: boolean;
  productionOrderId: string;
  erpExternalId?: string;
  mode: 'live_post' | 'journal_only';
  messageRu: string;
};

/** Повтор ERP sync для принятой серии (error или FACTORY-ACK journal). */
export async function retryWorkshop2FactoryHandoffErpSync(input: {
  productionOrderId: string;
  collectionId: string;
  articleId: string;
  factoryId?: string;
  actor?: string;
}): Promise<Workshop2FactoryHandoffErpRetryResult> {
  const productionOrderId = input.productionOrderId.trim();
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const factoryId = input.factoryId?.trim() || 'fact-1';

  const po = await getWorkshop2PurchaseOrderById(productionOrderId);
  if (!po) {
    return {
      ok: false,
      productionOrderId,
      mode: 'journal_only',
      messageRu: 'Производственный заказ не найден.',
    };
  }
  if (po.payload?.source !== WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE) {
    return {
      ok: false,
      productionOrderId,
      mode: 'journal_only',
      messageRu: 'Серия не из очереди B2B handoff.',
    };
  }
  if (po.supplierId !== factoryId) {
    return {
      ok: false,
      productionOrderId,
      mode: 'journal_only',
      messageRu: `Серия назначена другому цеху (${po.supplierId}).`,
    };
  }

  const canRetry =
    po.status === 'error' ||
    po.status === 'pending_erp' ||
    (po.status === 'synced' && String(po.erpExternalId ?? '').startsWith('FACTORY-ACK-'));
  if (!canRetry) {
    return {
      ok: false,
      productionOrderId,
      mode: 'journal_only',
      messageRu: `Повтор ERP недоступен из статуса «${PO_STATUS_LABEL_RU[po.status]}».`,
    };
  }

  const erpAttempt = await postWorkshop2PurchaseOrderToErpOnCreate({
    collectionId,
    articleId,
    purchaseOrder: {
      ...po,
      payload: {
        ...po.payload,
        erpRetryAt: new Date().toISOString(),
        erpRetryBy: input.actor?.trim() || 'factory_erp_retry',
      },
    },
  });

  const b2bOrderId = String(po.payload?.b2bOrderId ?? '').trim();
  if (b2bOrderId) bumpPlatformCoreChainStatus([b2bOrderId]);

  if (erpAttempt.ok && erpAttempt.erpExternalId) {
    return {
      ok: true,
      productionOrderId,
      erpExternalId: erpAttempt.erpExternalId,
      mode: 'live_post',
      messageRu: `ERP синхронизирован: ${erpAttempt.erpExternalId}.`,
    };
  }

  if (!erpAttempt.attempted) {
    const acknowledgedAt = new Date().toISOString();
    await updateWorkshop2PurchaseOrderErpSync({
      id: productionOrderId,
      collectionId,
      articleId,
      status: 'synced',
      erpExternalId: `FACTORY-ACK-${productionOrderId}`,
      syncedAt: acknowledgedAt,
      payloadPatch: {
        erpRetryAt: acknowledgedAt,
        erpRetryBy: input.actor?.trim() || 'factory_erp_retry',
        erpSyncStatus: 'not_configured',
        erpSyncHintRu: 'Задайте WORKSHOP2_FACTORY_ERP_BASE_URL для POST /purchase-orders',
      },
    });
    return {
      ok: true,
      productionOrderId,
      erpExternalId: `FACTORY-ACK-${productionOrderId}`,
      mode: 'journal_only',
      messageRu: 'ERP не настроен — journal-only FACTORY-ACK.',
    };
  }

  if (!erpAttempt.ok && po.status === 'pending_erp' && isPlatformCoreMode()) {
    const acknowledgedAt = new Date().toISOString();
    await updateWorkshop2PurchaseOrderErpSync({
      id: productionOrderId,
      collectionId,
      articleId,
      status: 'synced',
      erpExternalId: `FACTORY-ACK-${productionOrderId}`,
      syncedAt: acknowledgedAt,
      payloadPatch: {
        erpRetryAt: acknowledgedAt,
        erpRetryBy: input.actor?.trim() || 'factory_erp_retry',
        erpSyncStatus: 'core_journal_fallback',
        erpSyncError: erpAttempt.error,
      },
    });
    return {
      ok: true,
      productionOrderId,
      erpExternalId: `FACTORY-ACK-${productionOrderId}`,
      mode: 'journal_only',
      messageRu: 'Core: ERP недоступен — journal-only FACTORY-ACK.',
    };
  }

  return {
    ok: false,
    productionOrderId,
    mode: 'live_post',
    messageRu: `ERP sync не выполнен: ${erpAttempt.error ?? 'ошибка'}.`,
  };
}

export type Workshop2FactoryHandoffBulkErpRetryItem = {
  productionOrderId: string;
  collectionId: string;
  articleId: string;
};

export type Workshop2FactoryHandoffBulkErpRetryResult = {
  ok: boolean;
  retried: string[];
  succeeded: string[];
  failed: Array<{ productionOrderId: string; messageRu: string }>;
  messageRu: string;
};

/** Повтор ERP sync для всех attention rows (или явного списка). */
export async function bulkRetryWorkshop2FactoryHandoffErpSync(input: {
  factoryId?: string;
  items?: Workshop2FactoryHandoffBulkErpRetryItem[];
  actor?: string;
}): Promise<Workshop2FactoryHandoffBulkErpRetryResult> {
  const factoryId = input.factoryId?.trim() || 'fact-1';
  let items = input.items ?? [];

  if (items.length === 0) {
    const queue = await listWorkshop2FactoryProductionHandoffQueue({ factoryId });
    items = queue.items
      .filter((row) => canRetryFactoryHandoffErpFromPo(row.status, row.erpExternalId))
      .map((row) => ({
        productionOrderId: row.productionOrderId,
        collectionId: row.collectionId,
        articleId: row.articleId,
      }));
  }

  const retried: string[] = [];
  const succeeded: string[] = [];
  const failed: Array<{ productionOrderId: string; messageRu: string }> = [];

  for (const raw of items) {
    const productionOrderId = raw.productionOrderId?.trim();
    const collectionId = raw.collectionId?.trim();
    const articleId = raw.articleId?.trim();
    if (!productionOrderId || !collectionId || !articleId) {
      failed.push({
        productionOrderId: productionOrderId || '—',
        messageRu: 'Не указаны productionOrderId, collectionId или articleId.',
      });
      continue;
    }

    retried.push(productionOrderId);
    const result = await retryWorkshop2FactoryHandoffErpSync({
      productionOrderId,
      collectionId,
      articleId,
      factoryId,
      actor: input.actor,
    });
    if (result.ok) {
      succeeded.push(productionOrderId);
    } else {
      failed.push({ productionOrderId, messageRu: result.messageRu });
    }
  }

  const ok = failed.length === 0 && succeeded.length > 0;
  const messageRu =
    retried.length === 0
      ? 'Нет серий для повторного ERP sync.'
      : succeeded.length === retried.length
        ? `ERP sync выполнен для ${succeeded.length} ${succeeded.length === 1 ? 'серии' : 'серий'}.`
        : succeeded.length > 0
          ? `ERP sync: ${succeeded.length} из ${retried.length} серий.`
          : failed[0]?.messageRu ?? 'ERP sync не выполнен.';

  return { ok, retried, succeeded, failed, messageRu };
}

function canRetryFactoryHandoffErpFromPo(status: string, erpExternalId?: string | null): boolean {
  if (status === 'error' || status === 'pending_erp') return true;
  const ext = erpExternalId?.trim() ?? '';
  return status === 'synced' && ext.startsWith('FACTORY-ACK-');
}

/** Lazy auto-retry ERP для PO в error; burst — до 3× сразу после handoff/ack failure. */
export async function runWorkshop2FactoryHandoffErpAutoRetries(input: {
  factoryId?: string;
  /** Игнорировать erpNextRetryAt и повторять до MAX подряд (после ошибки handoff/ack). */
  burst?: boolean;
}): Promise<{ attempted: number; succeeded: number }> {
  const factoryId = input.factoryId?.trim() || 'fact-1';
  const pos = await listWorkshop2PurchaseOrdersByPayloadSource({
    source: WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
    factoryId,
  });
  const now = Date.now();
  let attempted = 0;
  let succeeded = 0;

  for (const po of pos) {
    if (po.status !== 'error') continue;
    let count = Number(po.payload?.erpAutoRetryCount ?? 0);
    if (count >= WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX) continue;

    if (!input.burst) {
      const nextRaw = po.payload?.erpNextRetryAt;
      if (nextRaw && Date.parse(String(nextRaw)) > now) continue;
    }

    const maxAttemptsThisRun = input.burst
      ? WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX - count
      : 1;

    for (let i = 0; i < maxAttemptsThisRun && count < WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX; i += 1) {
      attempted += 1;
      const result = await retryWorkshop2FactoryHandoffErpSync({
        productionOrderId: po.id,
        collectionId: po.collectionId,
        articleId: po.articleId,
        factoryId,
        actor: 'factory_erp_auto_retry',
      });

      if (result.ok) {
        succeeded += 1;
        const nextStatus =
          result.mode === 'live_post' && result.erpExternalId ? 'synced' : po.status;
        await updateWorkshop2PurchaseOrderErpSync({
          id: po.id,
          collectionId: po.collectionId,
          articleId: po.articleId,
          status: nextStatus,
          erpExternalId: result.erpExternalId ?? po.erpExternalId,
          payloadPatch: {
            erpAutoRetryCount: undefined,
            erpNextRetryAt: undefined,
            erpAutoRetryLastError: undefined,
            erpSyncStatus: result.mode === 'live_post' ? 'synced' : 'not_configured',
          },
        });
        break;
      }

      count += 1;
      await updateWorkshop2PurchaseOrderErpSync({
        id: po.id,
        collectionId: po.collectionId,
        articleId: po.articleId,
        status: 'error',
        lastError: result.messageRu,
        payloadPatch: {
          erpAutoRetryCount: count,
          erpNextRetryAt:
            count >= WORKSHOP2_FACTORY_ERP_AUTO_RETRY_MAX
              ? undefined
              : new Date(now + erpAutoRetryDelayMs(count)).toISOString(),
          erpAutoRetryLastError: result.messageRu,
        },
      });
    }
  }

  return { attempted, succeeded };
}

export async function advanceWorkshop2FactoryMesReleaseStage(input: {
  factoryId?: string;
  productionOrderId: string;
  collectionId: string;
  articleId: string;
  organizationId?: string;
  actor?: string;
}): Promise<{
  ok: boolean;
  stage?: FactoryMesReleaseStage;
  previousStage?: FactoryMesReleaseStage;
  messageRu?: string;
}> {
  const factoryId = input.factoryId?.trim() || 'fact-1';
  const productionOrderId = input.productionOrderId?.trim();
  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  if (!productionOrderId || !collectionId || !articleId) {
    return { ok: false, messageRu: 'Укажите productionOrderId, collectionId и articleId.' };
  }

  const po = await getWorkshop2PurchaseOrderById(productionOrderId, input.organizationId);
  if (!po) {
    return { ok: false, messageRu: 'Производственный заказ не найден.' };
  }
  if (po.payload?.source !== WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE) {
    return { ok: false, messageRu: 'Серия не из очереди B2B handoff.' };
  }
  if (po.supplierId !== factoryId) {
    return { ok: false, messageRu: `Серия назначена другому цеху (${po.supplierId}).` };
  }
  if (po.collectionId !== collectionId || po.articleId !== articleId) {
    return { ok: false, messageRu: 'collectionId/articleId не совпадают с PO.' };
  }

  const previousStage = po.mesReleaseStage;
  if (!canAdvanceFactoryMesReleaseStage(po.status, previousStage)) {
    return {
      ok: false,
      messageRu:
        po.status !== 'synced'
          ? 'Сначала примите серию цехом (статус «Принято цехом»).'
          : `Этап «${factoryMesReleaseStageLabelRu(previousStage)}» уже завершён.`,
    };
  }

  const nextStage = getNextFactoryMesReleaseStage(previousStage);
  if (!nextStage) {
    return { ok: false, messageRu: 'Дальнейшее продвижение MES недоступно.' };
  }

  const updated = await updateWorkshop2PurchaseOrderMesReleaseStage({
    id: productionOrderId,
    collectionId,
    articleId,
    stage: nextStage,
    actor: input.actor,
  });
  if (!updated) {
    return { ok: false, messageRu: 'Не удалось обновить MES-этап в PG.' };
  }

  const b2bOrderId = String(po.payload?.b2bOrderId ?? '').trim();
  if (b2bOrderId) {
    void appendWorkshop2ContextualSystemMessage({
      contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
      contextId: workshop2B2bOrderContextId(b2bOrderId),
      message: `MES ${factoryId}: ${productionOrderId} → ${factoryMesReleaseStageLabelRu(nextStage)}.`,
    }).catch(() => {});
    bumpPlatformCoreChainStatus([b2bOrderId]);
  }

  return {
    ok: true,
    stage: nextStage,
    previousStage,
    messageRu: `Этап выпуска: ${factoryMesReleaseStageLabelRu(nextStage)}.`,
  };
}

export async function listWorkshop2FactoryProductionHandoffQueue(input: {
  factoryId?: string;
  organizationId?: string;
}) {
  const factoryId = input.factoryId?.trim() || 'fact-1';
  await runWorkshop2FactoryHandoffErpAutoRetries({ factoryId });
  const items = await listWorkshop2PurchaseOrdersByPayloadSource({
    source: WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
    factoryId,
    organizationId: input.organizationId,
  });
  return {
    factoryId,
    items: items.map((po) => ({
      productionOrderId: po.id,
      b2bOrderId: String(po.payload?.b2bOrderId ?? ''),
      collectionId: po.collectionId,
      articleId: po.articleId,
      qty: po.qty,
      status: po.status,
      mesReleaseStage: po.mesReleaseStage,
      wipStatus: po.wipStatus,
      erpExternalId: po.erpExternalId,
      erpNextRetryAt:
        po.payload?.erpNextRetryAt != null ? String(po.payload.erpNextRetryAt) : undefined,
      erpAutoRetryCount:
        po.payload?.erpAutoRetryCount != null
          ? Number(po.payload.erpAutoRetryCount)
          : undefined,
      erpLastError:
        po.payload?.erpAutoRetryLastError != null
          ? String(po.payload.erpAutoRetryLastError)
          : po.payload?.erpSyncError != null
            ? String(po.payload.erpSyncError)
            : po.lastError,
      buyerId: po.payload?.buyerId != null ? String(po.payload.buyerId) : undefined,
      dossierRefs: po.payload?.dossierRefs,
      dossierHref: `/factory/production/dossier/${encodeURIComponent(po.articleId)}`,
      handoffAt: po.payload?.handoffAt != null ? String(po.payload.handoffAt) : po.updatedAt,
    })),
  };
}

export type Workshop2B2bChainStep = {
  id:
    | 'shop_sent'
    | 'brand_confirmed'
    | 'inventory_reserved'
    | 'production_po'
    | 'materials_supplied'
    | 'delivery_received';
  labelRu: string;
  done: boolean;
};

export type Workshop2B2bHandoffDossierDiff = {
  dossierVersionAtHandoff?: number;
  currentDossierVersion?: number;
  dossierChangedSinceHandoff: boolean;
  dossierDiffSummaryRu?: string;
  dossierDiffLines?: string[];
};

export type Workshop2B2bChainStatus = {
  orderId: string;
  status: Workshop2B2bOrderRecord['status'];
  buyerId?: string;
  collectionId: string;
  articleId: string;
  productionOrderId?: string;
  factoryId?: string;
  poStatus?: Workshop2PurchaseOrderStatus;
  poStatusLabelRu?: string;
  /** ISO — следующий авто-повтор ERP после live_failed (backoff). */
  erpNextRetryAt?: string;
  /** Число выполненных авто-повторов ERP (0…3). */
  erpAutoRetryCount?: number;
  handedOff: boolean;
  inventoryReserved: boolean;
  inventoryReservedQty?: number;
  inventoryReserveReason?: string;
  materialsSupplied: boolean;
  materialsSuppliedArticleIds?: string[];
  buyerDeliveryAcknowledgedAt?: string;
  dossierHref: string;
  dossierDiff?: Workshop2B2bHandoffDossierDiff;
  steps: Workshop2B2bChainStep[];
};

async function resolveWorkshop2B2bHandoffDossierDiff(input: {
  collectionId: string;
  articleId: string;
  dossierVersionAtHandoff?: number;
}): Promise<Workshop2B2bHandoffDossierDiff | undefined> {
  const handoffVersion = input.dossierVersionAtHandoff;
  if (handoffVersion == null || !Number.isFinite(handoffVersion)) return undefined;

  const currentRecord = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  const currentVersion = currentRecord?.version;
  if (currentVersion == null) return undefined;

  const changed = currentVersion !== handoffVersion;
  if (!changed) {
    return {
      dossierVersionAtHandoff: handoffVersion,
      currentDossierVersion: currentVersion,
      dossierChangedSinceHandoff: false,
      dossierDiffSummaryRu: `ТЗ v${handoffVersion} без изменений с момента передачи.`,
    };
  }

  const handoffDossier = await getWorkshop2ServerDossierAtVersion(
    input.collectionId,
    input.articleId,
    handoffVersion
  );
  const diffLines =
    handoffDossier && currentRecord
      ? summarizeWorkshop2PersistDiff(handoffDossier, currentRecord.dossier).slice(0, 6)
      : [];
  const summaryRu =
    diffLines.length > 0
      ? `ТЗ v${handoffVersion} → v${currentVersion}: ${diffLines.length} изменений.`
      : `ТЗ v${handoffVersion} → v${currentVersion} (детали diff недоступны).`;

  return {
    dossierVersionAtHandoff: handoffVersion,
    currentDossierVersion: currentVersion,
    dossierChangedSinceHandoff: true,
    dossierDiffSummaryRu: summaryRu,
    dossierDiffLines: diffLines.length > 0 ? diffLines : undefined,
  };
}

export async function getWorkshop2B2bChainStatus(
  orderId: string,
  organizationId?: string
): Promise<Workshop2B2bChainStatus | null> {
  const id = orderId.trim();
  const order = await getWorkshop2B2bOrder(id);
  if (!order) return null;

  const collectionId = order.collectionId?.trim() || 'SS27';
  const articleId =
    order.lines[0]?.articleId?.trim() || order.articleId?.trim() || 'demo-ss27-01';
  const productionOrderId = workshop2B2bProductionHandoffPoId(id);
  const po = await getWorkshop2PurchaseOrderById(productionOrderId, organizationId);
  const handedOff = po?.payload?.source === WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE;
  const factoryId =
    handedOff && po?.payload?.factoryId != null
      ? String(po.payload.factoryId)
      : handedOff && po?.supplierId
        ? po.supplierId
        : undefined;
  const poStatus = handedOff && po ? po.status : undefined;
  const poStatusLabelRu = poStatus ? PO_STATUS_LABEL_RU[poStatus] : undefined;
  const brandConfirmed =
    order.status === 'confirmed' ||
    order.status === 'allocated' ||
    order.status === 'shipped';

  const poInventory = po?.payload?.inventoryReserve as
    | Workshop2B2bInventoryReserveResult
    | undefined;

  const dossierRecord = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  const wmsMirror = dossierRecord?.dossier.internalWmsMirror;
  const dossierInventoryReserved =
    (wmsMirror ? workshop2PgMirrorNum(wmsMirror, 'reservedQty') : 0) > 0 &&
    (wmsMirror ? workshop2PgMirrorStr(wmsMirror, 'wmsSyncStatus') : '') === 'internal_pg';

  const inventoryReserved =
    order.status === 'allocated' ||
    poInventory?.reserved === true ||
    dossierInventoryReserved;
  const inventoryReservedQty =
    poInventory?.reservedQty ??
    (inventoryReserved && po?.qty ? po.qty : undefined);

  const orderArticleIds = [
    ...new Set(
      (order.lines ?? [])
        .map((line) => line.articleId?.trim())
        .filter((aid): aid is string => Boolean(aid))
    ),
  ];
  const articleIdsForMaterials =
    orderArticleIds.length > 0 ? orderArticleIds : [articleId];
  const materialsCheck = await areWorkshop2MaterialRequisitionsConfirmedForArticles({
    collectionId,
    articleIds: articleIdsForMaterials,
    organizationId,
  });
  const materialsSupplied = handedOff && materialsCheck.allConfirmed;

  const dossierVersionAtHandoff =
    handedOff && po?.payload?.dossierVersionAtHandoff != null
      ? Number(po.payload.dossierVersionAtHandoff)
      : undefined;
  const dossierDiff =
    handedOff && dossierVersionAtHandoff != null && Number.isFinite(dossierVersionAtHandoff)
      ? await resolveWorkshop2B2bHandoffDossierDiff({
          collectionId,
          articleId,
          dossierVersionAtHandoff,
        })
      : undefined;

  return {
    orderId: id,
    status: order.status,
    buyerId: order.buyerId,
    collectionId,
    articleId,
    productionOrderId: handedOff ? productionOrderId : undefined,
    factoryId,
    poStatus,
    poStatusLabelRu,
    erpNextRetryAt:
      handedOff && po?.payload?.erpNextRetryAt != null
        ? String(po.payload.erpNextRetryAt)
        : undefined,
    erpAutoRetryCount:
      handedOff && po?.payload?.erpAutoRetryCount != null
        ? Number(po.payload.erpAutoRetryCount)
        : undefined,
    handedOff,
    inventoryReserved,
    inventoryReservedQty,
    inventoryReserveReason: poInventory?.reason,
    materialsSupplied,
    materialsSuppliedArticleIds: materialsCheck.confirmedArticleIds,
    buyerDeliveryAcknowledgedAt: order.buyerDeliveryAcknowledgedAt,
    dossierHref: `/factory/production/dossier/${encodeURIComponent(articleId)}`,
    dossierDiff,
    steps: [
      {
        id: 'shop_sent',
        labelRu: 'Магазин отправил заказ бренду',
        done: order.status !== 'draft',
      },
      {
        id: 'brand_confirmed',
        labelRu: 'Бренд подтвердил заказ',
        done: brandConfirmed,
      },
      {
        id: 'inventory_reserved',
        labelRu: 'Резерв на складе по заказу',
        done: inventoryReserved,
      },
      {
        id: 'production_po',
        labelRu: 'Серия передана на производство (с досье разработки)',
        done: handedOff,
      },
      {
        id: 'materials_supplied',
        labelRu: 'Поставщик подтвердил поставку материалов',
        done: materialsSupplied,
      },
      ...(order.status === 'shipped'
        ? [
            {
              id: 'delivery_received' as const,
              labelRu: 'Магазин подтвердил получение',
              done: Boolean(order.buyerDeliveryAcknowledgedAt),
            },
          ]
        : []),
    ],
  };
}

/** Детерминированные id для идемпотентного seed (не randomUUID). */
export function workshop2B2bHandoffSeedMessageIds(orderId: string): string[] {
  const slug = orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  return [
    `cccchandoff-${slug}-01`,
    `cccchandoff-${slug}-02`,
  ];
}
