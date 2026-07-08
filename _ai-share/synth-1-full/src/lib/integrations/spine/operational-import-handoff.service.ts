/**
 * Wave A4/A6/A7: confirm → handoff → PO + contextual threads для imported wholesale (INT-*).
 */
import 'server-only';

import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';
import type { Workshop2B2bOrderStatus } from '@/lib/production/workshop2-b2b-order-lifecycle';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { WORKSHOP2_ARTICLE_CONTEXT_TYPE } from '@/lib/production/workshop2-domain-event-types';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import {
  getWorkshop2B2bChainStatus,
  resolveWorkshop2FactoryIdForB2bHandoff,
  workshop2B2bProductionHandoffPoId,
  WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
  type Workshop2B2bChainStatus,
  type Workshop2B2bOrderRecord,
  type Workshop2B2bProductionHandoffResult,
} from '@/lib/server/workshop2-b2b-production-handoff';
import {
  getWorkshop2PurchaseOrderById,
  upsertWorkshop2PurchaseOrder,
  type Workshop2PurchaseOrderStatus,
} from '@/lib/server/workshop2-purchase-order-repository';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';
import { getOperationalStatusRecord } from '@/lib/order/b2b-operational-status-persistence.file';
import { mergeOperationalStatusPersisted } from '@/lib/order/b2b-operational-status-persistence.file';
import {
  ensureSpineImportedOrdersStoreReady,
  getImportedOrderRecord,
  patchImportedOrderStatus,
} from './imported-orders-persistence';
import { getIntegrationMetaForOrder } from './integration-meta-persistence.file';
import { getAllocationQueue } from './allocation-queue-persistence.file';
import { getCentricRfqByOrderId } from './centric-rfq-persistence.file';
import { getVendorPoByOrderId } from './vendor-po-persistence.file';
import {
  ensureSpineOperationalStoreReady,
  SPINE_ALLOCATION_SCOPES,
  SPINE_PROCUREMENT_SCOPES,
} from './spine-operational-store';
import { enqueueAllocationForOrder, syncAims360Allocation } from './aims360-allocation.service';
import { importVendorPoForHandoff } from './apparel-magic-vendor-po.service';
import {
  createInitialWorkingOrderVersion,
  exportWholesaleOrderAfterConfirm,
} from './wholesale-export.service';
import { syncAims360Wip } from './order-tracking.service';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import {
  resolveArticleIdFromProductId,
  resolveSpineCollectionIdFromLines,
} from './spine-production-forecast-lines';
import { areWorkshop2MaterialRequisitionsConfirmedForArticles } from '@/lib/server/workshop2-material-requisition-repository';

import { isIntegrationImportedWholesaleOrderId } from './integration-ui-utils';

function metaPlatformFromOrder(
  orderId: string
): 'nuorder' | 'joor' | 'syntha' | 'zedonk' | undefined {
  const p = getIntegrationMetaForOrder(orderId)?.sourcePlatform;
  if (p === 'nuorder' || p === 'joor' || p === 'zedonk') return p;
  return 'syntha';
}

const PO_STATUS_LABEL_RU: Record<Workshop2PurchaseOrderStatus, string> = {
  draft: 'Черновик PO',
  pending_erp: 'В очереди цеха',
  synced: 'Синхронизирован с ERP',
  error: 'Ошибка ERP',
};

function resolveArticleFromLine(line: B2BOrderLineItem | undefined): string {
  const fromProduct = resolveArticleIdFromProductId(String(line?.productId ?? ''));
  if (fromProduct) return fromProduct;
  return PLATFORM_CORE_DEMO.demoArticleId;
}

function resolveArticleIdsFromImport(lineItems: B2BOrderLineItem[]): string[] {
  const ids = new Set<string>();
  for (const line of lineItems) {
    const articleId = resolveArticleFromLine(line);
    if (articleId) ids.add(articleId);
  }
  return ids.size > 0 ? [...ids] : [PLATFORM_CORE_DEMO.demoArticleId];
}

function resolveQty(lines: B2BOrderLineItem[]): number {
  return lines.reduce((sum, l) => sum + (l.quantity ?? 0), 0) || 1;
}

export function normalizeImportedSpineStatus(
  orderId: string,
  fallbackStatus: string
): Workshop2B2bOrderStatus {
  const overlay = getOperationalStatusRecord(orderId);
  const raw = (overlay?.status ?? fallbackStatus).trim().toLowerCase();
  if (raw === 'confirmed' || raw === 'approved' || raw === 'подтверждён') return 'confirmed';
  if (raw.startsWith('подтвержд')) return 'confirmed';
  if (raw === 'allocated') return 'allocated';
  if (raw === 'shipped' || raw === 'отгружен') return 'shipped';
  if (raw === 'cancelled' || raw === 'canceled' || raw === 'отменён') return 'cancelled';
  if (raw === 'draft' || raw === 'черновик') return 'draft';
  return 'submitted';
}

/** PATCH v1 status / UI label → тот же confirm spine, что POST confirm-order. */
export function statusIndicatesBrandConfirm(status: string): boolean {
  const raw = status.trim().toLowerCase();
  if (!raw) return false;
  if (raw === 'confirmed' || raw === 'approved') return true;
  if (raw === 'подтверждён') return true;
  if (raw.startsWith('подтвержд')) return true;
  return false;
}

export type OperationalImportStatusPatchResult =
  | {
      ok: true;
      wholesaleOrderId: string;
      status: string;
      updatedAt: string;
      idempotentReplay: boolean;
      spineConfirmed: boolean;
    }
  | { ok: false; code: string; message: string; httpStatus?: number };

/**
 * INT-* PATCH operational status: confirm-путь через confirmOperationalImportOrderByBrand,
 * иначе overlay + patch imported (legacy v1 free-text labels).
 */
export async function applyOperationalImportStatusPatch(input: {
  wholesaleOrderId: string;
  status: string;
  idempotencyKey: string;
}): Promise<OperationalImportStatusPatchResult> {
  const orderId = input.wholesaleOrderId.trim();
  const status = input.status.trim();
  if (!status) {
    return {
      ok: false,
      code: 'BAD_REQUEST',
      message: 'status must be a non-empty string',
      httpStatus: 400,
    };
  }

  if (statusIndicatesBrandConfirm(status)) {
    const confirm = await confirmOperationalImportOrderByBrand({ orderId });
    if (!confirm.ok) {
      const httpStatus =
        confirm.code === 'not_found' ? 404 : confirm.code === 'invalid_status' ? 409 : 409;
      return { ok: false, code: confirm.code, message: confirm.messageRu, httpStatus };
    }
    const merge = mergeOperationalStatusPersisted({
      wholesaleOrderId: orderId,
      idempotencyKey: input.idempotencyKey,
      status: status === 'confirmed' ? 'confirmed' : status,
    });
    if (!merge.ok) {
      return {
        ok: false,
        code: merge.code,
        message: merge.message,
        httpStatus: merge.code === 'BAD_REQUEST' ? 400 : 409,
      };
    }
    return {
      ok: true,
      wholesaleOrderId: orderId,
      status: merge.status,
      updatedAt: merge.updatedAt,
      idempotentReplay: merge.idempotentReplay,
      spineConfirmed: true,
    };
  }

  const merge = mergeOperationalStatusPersisted({
    wholesaleOrderId: orderId,
    idempotencyKey: input.idempotencyKey,
    status,
  });
  if (!merge.ok) {
    return {
      ok: false,
      code: merge.code,
      message: merge.message,
      httpStatus: merge.code === 'BAD_REQUEST' ? 400 : 409,
    };
  }
  patchImportedOrderStatus(orderId, normalizeImportedSpineStatus(orderId, merge.status));
  bumpPlatformCoreChainStatus([orderId]);
  return {
    ok: true,
    wholesaleOrderId: orderId,
    status: merge.status,
    updatedAt: merge.updatedAt,
    idempotentReplay: merge.idempotentReplay,
    spineConfirmed: false,
  };
}

function persistImportedStatus(orderId: string, status: Workshop2B2bOrderStatus): void {
  patchImportedOrderStatus(orderId, status);
  mergeOperationalStatusPersisted({
    wholesaleOrderId: orderId,
    idempotencyKey: `import-spine-status-${orderId}-${status}-${Date.now()}`,
    status,
  });
}

async function resolveSpineInventoryReserved(
  b2bOrderId: string,
  brandConfirmed: boolean
): Promise<boolean> {
  if (!brandConfirmed) return false;
  await ensureSpineOperationalStoreReady(SPINE_ALLOCATION_SCOPES);
  const allocation = getAllocationQueue(b2bOrderId);
  if (!allocation) return false;
  return allocation.status === 'allocated' || allocation.status === 'partial';
}

async function resolveSpineMaterialsSupplied(
  b2bOrderId: string,
  handedOff: boolean,
  collectionId: string,
  articleIds: string[],
  organizationId?: string
): Promise<boolean> {
  if (!handedOff) return false;
  await ensureSpineOperationalStoreReady(SPINE_PROCUREMENT_SCOPES);
  const vendorPo = getVendorPoByOrderId(b2bOrderId);
  if (vendorPo?.status === 'acknowledged' || vendorPo?.status === 'shipped') return true;
  const rfq = getCentricRfqByOrderId(b2bOrderId);
  if (rfq?.status === 'awarded') return true;
  const materialsCheck = await areWorkshop2MaterialRequisitionsConfirmedForArticles({
    collectionId,
    articleIds,
    organizationId,
  });
  return materialsCheck.allConfirmed;
}

export async function getOperationalImportChainStatus(
  orderId: string,
  organizationId?: string
): Promise<Workshop2B2bChainStatus | null> {
  await ensureSpineImportedOrdersStoreReady();
  const id = orderId.trim();
  if (!isIntegrationImportedWholesaleOrderId(id)) return null;

  const imported = getImportedOrderRecord(id);
  if (!imported) return null;

  const spineStatus = normalizeImportedSpineStatus(id, imported.order.status);
  const collectionId = resolveSpineCollectionIdFromLines(
    imported.lineItems,
    PLATFORM_CORE_DEMO.collectionId
  );
  const articleIds = resolveArticleIdsFromImport(imported.lineItems);
  const articleId = articleIds[0] ?? PLATFORM_CORE_DEMO.demoArticleId;
  const productionOrderId = workshop2B2bProductionHandoffPoId(id);
  const po = await getWorkshop2PurchaseOrderById(productionOrderId, organizationId);
  const handedOff = po?.payload?.source === WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE;
  const brandConfirmed =
    spineStatus === 'confirmed' || spineStatus === 'allocated' || spineStatus === 'shipped';
  const materialsSupplied = await resolveSpineMaterialsSupplied(
    id,
    handedOff,
    collectionId,
    articleIds,
    organizationId
  );
  const inventoryReserved = await resolveSpineInventoryReserved(id, brandConfirmed);

  return {
    orderId: id,
    status: spineStatus,
    collectionId,
    articleId,
    productionOrderId: handedOff ? productionOrderId : undefined,
    factoryId:
      handedOff && po?.payload?.factoryId != null
        ? String(po.payload.factoryId)
        : handedOff
          ? po?.supplierId
          : undefined,
    poStatus: handedOff && po ? po.status : undefined,
    poStatusLabelRu: handedOff && po ? PO_STATUS_LABEL_RU[po.status] : undefined,
    handedOff,
    inventoryReserved,
    materialsSupplied,
    dossierHref: `/factory/production/dossier/${encodeURIComponent(articleId)}`,
    steps: [
      {
        id: 'shop_sent',
        labelRu: 'Заказ отправлен из внешнего канала',
        done: spineStatus !== 'draft',
      },
      {
        id: 'brand_confirmed',
        labelRu: 'Бренд подтвердил оптовый заказ',
        done: brandConfirmed,
      },
      {
        id: 'inventory_reserved',
        labelRu: 'Резерв на складе (allocation)',
        done: inventoryReserved,
      },
      {
        id: 'production_po',
        labelRu: 'Серия передана на производство',
        done: handedOff,
      },
      {
        id: 'materials_supplied',
        labelRu: 'Материалы поставщика',
        done: materialsSupplied,
      },
    ],
  };
}

export type OperationalImportConfirmResult =
  | {
      ok: true;
      orderId: string;
      status: Workshop2B2bOrderStatus;
      alreadyConfirmed: boolean;
      messageRu: string;
    }
  | { ok: false; code: string; messageRu: string };

/** A4: brand confirms imported OO (mirrors confirm-order). */
export async function confirmOperationalImportOrderByBrand(input: {
  orderId: string;
  organizationId?: string;
}): Promise<OperationalImportConfirmResult> {
  await ensureSpineImportedOrdersStoreReady();
  const orderId = input.orderId.trim();
  const org = input.organizationId?.trim() || 'org-brand-001';
  const imported = getImportedOrderRecord(orderId);
  if (!imported) {
    return { ok: false, code: 'not_found', messageRu: 'Внешний оптовый заказ не найден.' };
  }

  const current = normalizeImportedSpineStatus(orderId, imported.order.status);
  if (current === 'cancelled') {
    return { ok: false, code: 'invalid_status', messageRu: 'Заказ отменён.' };
  }
  if (current === 'confirmed' || current === 'allocated' || current === 'shipped') {
    return {
      ok: true,
      orderId,
      status: current,
      alreadyConfirmed: true,
      messageRu: 'Заказ уже подтверждён.',
    };
  }

  persistImportedStatus(orderId, 'confirmed');

  const collectionId = resolveSpineCollectionIdFromLines(
    imported.lineItems,
    PLATFORM_CORE_DEMO.collectionId
  );

  enqueueAllocationForOrder({
    wholesaleOrderId: orderId,
    collectionId,
    lines: imported.lineItems,
  });

  await syncAims360Allocation({ wholesaleOrderId: orderId, organizationId: org });

  createInitialWorkingOrderVersion(orderId, imported.lineItems, metaPlatformFromOrder(orderId));
  await exportWholesaleOrderAfterConfirm(orderId, org);

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: workshop2B2bOrderContextId(orderId),
    message: `Бренд подтвердил внешний оптовый заказ ${orderId}. Allocation и экспорт выполнены.`,
  });

  bumpPlatformCoreChainStatus([orderId]);

  return {
    ok: true,
    orderId,
    status: 'confirmed',
    alreadyConfirmed: false,
    messageRu: 'Внешний оптовый заказ подтверждён. Можно передать в производство.',
  };
}

/** A6: handoff imported OO → PO-B2B-{orderId} visible in factory queue. */
function buildImportedOrderStub(
  imported: NonNullable<ReturnType<typeof getImportedOrderRecord>>,
  orderId: string,
  status: Workshop2B2bOrderStatus
): Workshop2B2bOrderRecord {
  const collectionId = resolveSpineCollectionIdFromLines(
    imported.lineItems,
    PLATFORM_CORE_DEMO.collectionId
  );
  const articleId = resolveArticleFromLine(imported.lineItems[0]);
  return {
    id: orderId,
    collectionId,
    articleId,
    buyerId: 'imported',
    status,
    tier: 'standard',
    totalRub: 0,
    lines: imported.lineItems.map((l) => ({
      collectionId,
      articleId: resolveArticleFromLine(l),
      colorCode: 'core',
      size: l.size ?? 'M',
      qty: l.quantity ?? 1,
      wholesalePriceRub: l.price ?? 0,
    })),
    createdAt: imported.importedAt,
    updatedAt: new Date().toISOString(),
  };
}

export async function confirmOperationalImportProductionHandoff(input: {
  orderId: string;
  factoryId?: string;
  organizationId?: string;
}): Promise<Workshop2B2bProductionHandoffResult> {
  await ensureSpineImportedOrdersStoreReady();
  const orderId = input.orderId.trim();
  const org = input.organizationId?.trim() || 'org-brand-001';
  const imported = getImportedOrderRecord(orderId);
  if (!imported) {
    return { ok: false, code: 'not_found', messageRu: 'Внешний оптовый заказ не найден.' };
  }

  const spineStatus = normalizeImportedSpineStatus(orderId, imported.order.status);
  if (spineStatus === 'submitted' || spineStatus === 'draft') {
    return {
      ok: false,
      code: 'needs_confirm',
      messageRu: 'Сначала подтвердите imported заказ, затем передайте в производство.',
    };
  }
  if (spineStatus === 'cancelled') {
    return { ok: false, code: 'invalid_status', messageRu: 'Заказ отменён.' };
  }

  const collectionId = resolveSpineCollectionIdFromLines(
    imported.lineItems,
    PLATFORM_CORE_DEMO.collectionId
  );
  const articleId = resolveArticleFromLine(imported.lineItems[0]);
  const qty = resolveQty(imported.lineItems);
  const productionOrderId = workshop2B2bProductionHandoffPoId(orderId);
  const factoryId = await resolveWorkshop2FactoryIdForB2bHandoff({
    orderId,
    collectionId,
    articleId,
    explicitFactoryId: input.factoryId,
  });

  const priorPo = await getWorkshop2PurchaseOrderById(productionOrderId, org);
  if (priorPo?.payload?.source === WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE) {
    return {
      ok: true,
      order: buildImportedOrderStub(imported, orderId, spineStatus),
      productionOrderId,
      factoryId,
      alreadyConfirmed: true,
      inventoryReserve: { reserved: false, reason: 'imported_spine' },
      messageRu: 'Заказ уже передан в производство.',
    };
  }

  const dossierAtHandoff = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  const dossierVersionAtHandoff = dossierAtHandoff?.version ?? 1;

  await upsertWorkshop2PurchaseOrder({
    id: productionOrderId,
    collectionId,
    articleId,
    organizationId: org,
    lineRef: `b2b-import:${orderId}`,
    supplierId: factoryId,
    qty,
    status: 'pending_erp',
    payload: {
      source: WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
      b2bOrderId: orderId,
      buyerId: 'imported',
      factoryId,
      totalRub: 0,
      lines: imported.lineItems.map((l) => ({
        collectionId,
        articleId: resolveArticleFromLine(l),
        sku: l.productId,
        qty: l.quantity ?? 1,
      })),
      dossierRefs: [{ collectionId, articleId }],
      handoffAt: new Date().toISOString(),
      dossierVersionAtHandoff,
      integrationSpine: true,
    },
  });

  const b2bCtx = workshop2B2bOrderContextId(orderId);
  const articleCtx = `${collectionId}:${articleId}`;

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: b2bCtx,
    message: `Внешний оптовый заказ ${orderId} передан на ${factoryId} · ${productionOrderId} · ${qty} шт.`,
  });

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    contextId: articleCtx,
    message: `Серия по imported B2B ${orderId} (${productionOrderId}) с контекстом ${articleId}.`,
  });

  await importVendorPoForHandoff(orderId, productionOrderId);

  syncAims360Wip({
    productionOrderId,
    b2bOrderId: orderId,
    poStage: 'cutting',
    qtyTotal: qty,
  });

  bumpPlatformCoreChainStatus([orderId]);

  return {
    ok: true,
    order: buildImportedOrderStub(imported, orderId, spineStatus),
    productionOrderId,
    factoryId,
    alreadyConfirmed: false,
    inventoryReserve: { reserved: false, reason: 'imported_spine' },
    messageRu: `Imported заказ передан в производство · ${productionOrderId}.`,
  };
}

/** W2 chain first; INT-* operational fallback (same as chain-status API route). */
export async function resolveB2bChainStatusUnified(
  orderId: string,
  organizationId?: string
): Promise<Workshop2B2bChainStatus | null> {
  const id = orderId.trim();
  if (!id) return null;
  const w2 = await getWorkshop2B2bChainStatus(id, organizationId);
  if (w2) return w2;
  if (isIntegrationImportedWholesaleOrderId(id)) {
    return getOperationalImportChainStatus(id, organizationId);
  }
  return null;
}
