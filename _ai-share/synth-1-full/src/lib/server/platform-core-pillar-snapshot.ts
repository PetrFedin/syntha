import 'server-only';

import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  getPlatformCoreDemo,
  isPlatformCoreEmptyChainCollection,
} from '@/lib/platform-core-hub-matrix';
import { getPlatformCoreB2bCalendarEvents } from '@/lib/server/platform-core-calendar-events';
import { listWorkshop2ContextualMessageThreads } from '@/lib/server/workshop2-contextual-messages-repository';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
  workshop2B2bOrderStatusLabelRu,
  type Workshop2B2bOrderStatus,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import {
  getWorkshop2DevelopmentStatus,
  filterWorkshop2DevelopmentStepsForManufacturer,
} from '@/lib/server/workshop2-development-status';
import { getWorkshop2SampleCollectionStatus } from '@/lib/server/workshop2-sample-collection-status';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { listWorkshop2FactorySampleQueue } from '@/lib/production/workshop2-factory-sample-queue';
import { extractWorkshop2DossierMaterialPreviews } from '@/lib/production/workshop2-dossier-material-preview';
import { resolveB2bChainStatusUnified } from '@/lib/integrations/spine/operational-import-handoff.service';
import { filterChainStepsForShopBuyer } from '@/lib/platform-core-shop-production-visibility';
import { resolveShopProductionVisibilityPolicyForOrder } from '@/lib/server/workshop2-shop-production-visibility-repository';
import { resolveSpineActiveWholesaleOrderIdServer } from '@/lib/integrations/spine/spine-active-order.server';
import { getImportedOrderRecord } from '@/lib/integrations/spine/imported-orders-persistence';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { resolveWholesaleExport } from '@/lib/integrations/spine/wholesale-export.service';
import { getOrderTracking } from '@/lib/integrations/spine/order-tracking-persistence.file';
import {
  getProductionWipByB2bOrderId,
  PRODUCTION_WIP_STAGE_LABEL_RU,
} from '@/lib/integrations/spine/production-wip-persistence.file';
import { getDeliveryWindow } from '@/lib/integrations/spine/delivery-window-persistence.file';
import {
  ensureSpineOperationalStoreReady,
  SPINE_HUB_MINIMAL_SCOPES,
  SPINE_PROCUREMENT_SCOPES,
  SPINE_TRACKING_READ_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';
import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import { isPlatformCoreSpinePgPrimary } from '@/lib/server/platform-core-spine-pg.server';

import type {
  CollectionOrderPillarSnapshot,
  CommsPillarSnapshot,
  DevelopmentPillarSnapshot,
  ManufacturerCollectionOrderInsightSnapshot,
  OrderProductionPillarSnapshot,
  PlatformCorePillarSnapshotPayload,
  SupplierCollectionOrderForecastSnapshot,
  SupplierProcurementBomLine,
  SupplierProcurementPillarSnapshot,
  SupplierProcurementSpineSnapshot,
} from '@/lib/platform-core-pillar-snapshot.types';
import { batchWorkshop2DossierMaterialNames } from '@/lib/server/workshop2-dossier-materials-batch';
import { batchWorkshop2SupplierConfirmedByArticle } from '@/lib/server/workshop2-material-requisition-repository';
import { mapOperationalItemsToForecastLines } from '@/lib/integrations/spine/spine-production-forecast-lines';
import { listWorkshop2FactoryProductionHandoffQueue } from '@/lib/server/workshop2-b2b-production-handoff';
import {
  getSpineProcurementContext,
  type SpineProcurementContext,
} from '@/lib/integrations/spine/procurement-context.service';
import { isWorkshop2PgConnectionError } from '@/lib/server/workshop2-pg-pool';

type OrderProductionVariant = 'brand' | 'shop' | 'manufacturer';

async function resolveSpineOrderTracking(orderId: string) {
  await ensureSpineOperationalStoreReady(SPINE_TRACKING_READ_SCOPES);
  if (isPlatformCoreSpinePgPrimary()) {
    const { getOrderTrackingShipmentFromPg } =
      await import('@/lib/integrations/spine/spine-operational-persistence.pg');
    const fromPg = await getOrderTrackingShipmentFromPg(orderId);
    if (fromPg) return fromPg;
  }
  return getOrderTracking(orderId);
}

async function resolveSpineProductionWipByB2bOrderId(orderId: string) {
  await ensureSpineOperationalStoreReady(SPINE_TRACKING_READ_SCOPES);
  if (isPlatformCoreSpinePgPrimary()) {
    const { getProductionWipByB2bOrderIdFromPg } =
      await import('@/lib/integrations/spine/spine-operational-persistence.pg');
    const fromPg = await getProductionWipByB2bOrderIdFromPg(orderId);
    if (fromPg) return fromPg;
  }
  return getProductionWipByB2bOrderId(orderId);
}

async function resolveSpineDeliveryWindow(orderId: string) {
  await ensureSpineOperationalStoreReady(SPINE_TRACKING_READ_SCOPES);
  if (isPlatformCoreSpinePgPrimary()) {
    const { getDeliveryWindowFromPg } =
      await import('@/lib/integrations/spine/spine-operational-persistence.pg');
    const fromPg = await getDeliveryWindowFromPg(orderId);
    if (fromPg) return fromPg;
  }
  return getDeliveryWindow(orderId);
}

async function resolveHandoffQueueOrderId(
  factoryId: string,
  wholesaleOrderIdInput?: string,
  collectionId?: string
): Promise<{
  orderId: string;
  queueHit: boolean;
  productionOrderId: string | null;
  handoffAt: string | null;
}> {
  await ensureSpineOperationalStoreReady(SPINE_HUB_MINIMAL_SCOPES);
  const [queue, spineOrderId] = await Promise.all([
    listWorkshop2FactoryProductionHandoffQueue({ factoryId }),
    resolveSpineActiveWholesaleOrderIdServer({
      fallbackOrderId: '',
      factoryId,
      collectionId,
      resolveFrom: ['w2_registry', 'handoff'],
    }),
  ]);
  const items = queue.items;
  const preferred = wholesaleOrderIdInput?.trim();
  const resolved =
    (preferred ? items.find((i) => i.b2bOrderId === preferred) : undefined) ??
    (spineOrderId ? items.find((i) => i.b2bOrderId === spineOrderId) : undefined) ??
    items.find((i) => isIntegrationImportedWholesaleOrderId(i.b2bOrderId)) ??
    items[0];
  const orderId = preferred || resolved?.b2bOrderId || spineOrderId || '';
  const queueHit = Boolean(orderId && items.some((i) => i.b2bOrderId === orderId));
  const matched = orderId ? (items.find((i) => i.b2bOrderId === orderId) ?? resolved) : resolved;
  return {
    orderId,
    queueHit,
    productionOrderId: matched?.productionOrderId?.trim() || null,
    handoffAt: matched?.handoffAt?.trim() || null,
  };
}

async function resolveWholesaleOrderStatusLabel(orderId: string): Promise<string | null> {
  const id = orderId.trim();
  if (!id) return null;
  const order = await getWorkshop2B2bOrder(id);
  if (order?.status) return workshop2B2bOrderStatusLabelRu(order.status);
  if (isIntegrationImportedWholesaleOrderId(id)) {
    const imported = getImportedOrderRecord(id);
    if (imported?.order.status) {
      return workshop2B2bOrderStatusLabelRu(imported.order.status as Workshop2B2bOrderStatus);
    }
  }
  return null;
}

async function resolveWholesaleOrderArticleLines(
  orderId: string
): Promise<Array<{ articleId: string; qty: number }>> {
  const id = orderId.trim();
  if (!id) return [];
  const order = await getWorkshop2B2bOrder(id);
  if (order?.lines?.length) {
    const byArticle = new Map<string, number>();
    for (const line of order.lines) {
      if (!line.articleId || (line.qty ?? 0) <= 0) continue;
      byArticle.set(line.articleId, (byArticle.get(line.articleId) ?? 0) + (line.qty ?? 0));
    }
    return [...byArticle.entries()].map(([articleId, qty]) => ({ articleId, qty }));
  }
  if (isIntegrationImportedWholesaleOrderId(id)) {
    const imported = getImportedOrderRecord(id);
    if (imported?.lineItems.length) {
      return mapOperationalItemsToForecastLines(imported.lineItems);
    }
  }
  return [];
}

async function buildManufacturerCollectionOrderInsight(
  collectionId: string,
  factoryId: string,
  wholesaleOrderIdInput?: string
): Promise<ManufacturerCollectionOrderInsightSnapshot> {
  const { orderId, queueHit } = await resolveHandoffQueueOrderId(
    factoryId,
    wholesaleOrderIdInput,
    collectionId
  );
  if (!orderId) {
    return {
      orderId: '',
      orderStatusLabel: null,
      productionOrderId: null,
      queueHit: false,
      chainSteps: [],
    };
  }
  const [orderStatusLabel, chain] = await Promise.all([
    resolveWholesaleOrderStatusLabel(orderId),
    resolveB2bChainStatusUnified(orderId),
  ]);
  return {
    orderId,
    orderStatusLabel,
    productionOrderId: chain?.productionOrderId ?? null,
    queueHit,
    chainSteps: chain?.steps ?? [],
  };
}

async function buildSupplierCollectionOrderForecast(
  collectionId: string,
  factoryId: string,
  wholesaleOrderIdInput?: string
): Promise<SupplierCollectionOrderForecastSnapshot> {
  const { orderId, productionOrderId, handoffAt } = await resolveHandoffQueueOrderId(
    factoryId,
    wholesaleOrderIdInput,
    collectionId
  );
  if (!orderId) {
    return {
      orderId: '',
      orderStatusLabel: null,
      totalUnits: 0,
      rows: [],
      productionOrderId: null,
      expectedHandoffAt: null,
    };
  }
  const [orderStatusLabel, lines] = await Promise.all([
    resolveWholesaleOrderStatusLabel(orderId),
    resolveWholesaleOrderArticleLines(orderId),
  ]);
  if (!lines.length) {
    return {
      orderId,
      orderStatusLabel,
      totalUnits: 0,
      rows: [],
      productionOrderId,
      expectedHandoffAt: handoffAt,
    };
  }
  const articleIds = lines.map((l) => l.articleId);
  const materialBatch = await batchWorkshop2DossierMaterialNames({
    collectionId,
    articleIds,
    limitPerArticle: 20,
  });
  const materialByArticle = new Map(materialBatch.map((b) => [b.articleId, b.materials]));
  const confirmedMap = await batchWorkshop2SupplierConfirmedByArticle({
    collectionId,
    articleIds,
  });
  const rows = lines.map((line) => ({
    articleId: line.articleId,
    orderQty: line.qty,
    materials: (materialByArticle.get(line.articleId) ?? []).map((m) => ({
      name: m.name,
      unitLabelRu: m.unitLabelRu,
      consumptionLabel: m.consumptionLabel,
    })),
    supplierConfirmed: confirmedMap[line.articleId] === true,
  }));
  const totalUnits = lines.reduce((s, l) => s + l.qty, 0);
  return {
    orderId,
    orderStatusLabel,
    totalUnits,
    rows,
    productionOrderId,
    expectedHandoffAt: handoffAt,
  };
}

async function buildDevelopmentSnapshot(
  collectionId: string,
  factoryId: string,
  articleId: string,
  roleId?: CoreChainRoleId
): Promise<DevelopmentPillarSnapshot> {
  const [statusRaw, dossier, queue] = await Promise.all([
    getWorkshop2DevelopmentStatus(collectionId, factoryId),
    getWorkshop2ServerDossierRecord(collectionId, articleId),
    listWorkshop2FactorySampleQueue({ factoryId }),
  ]);
  const status =
    roleId === 'manufacturer'
      ? { ...statusRaw, steps: filterWorkshop2DevelopmentStepsForManufacturer(statusRaw.steps) }
      : statusRaw;

  const materialLines = dossier?.dossier?.productionModel?.materialLines;
  const bomLineCount = Array.isArray(materialLines) ? materialLines.length : null;
  const bomMaterialPreviews = extractWorkshop2DossierMaterialPreviews(dossier?.dossier ?? null, 20);

  const items = queue.items.filter((i) => i.collectionId === collectionId);
  const hitIndex = items.findIndex(
    (i) => i.articleId === articleId && i.collectionId === collectionId
  );
  const hit = hitIndex >= 0 ? items[hitIndex] : undefined;

  return {
    status,
    bomLineCount,
    bomMaterialPreviews,
    sampleStatus: hit?.status ?? null,
    sampleQueuePosition: hitIndex >= 0 ? hitIndex + 1 : null,
    sampleQueueTotal: items.length > 0 ? items.length : null,
  };
}

async function buildCollectionOrderSnapshot(
  collectionId: string,
  factoryId: string,
  wholesaleOrderIdInput?: string
): Promise<CollectionOrderPillarSnapshot> {
  await ensureSpineOperationalStoreReady(SPINE_HUB_MINIMAL_SCOPES);

  const demo = getPlatformCoreDemo(collectionId);
  const w2Fallback = demo.demoOrderId.startsWith('__') ? '' : demo.demoOrderId;
  const orderId =
    wholesaleOrderIdInput?.trim() ||
    (await resolveSpineActiveWholesaleOrderIdServer({
      fallbackOrderId: w2Fallback,
      factoryId,
      collectionId,
      resolveFrom: ['w2_registry', 'allocation', 'operational'],
    })) ||
    w2Fallback;

  const chain = orderId ? await resolveB2bChainStatusUnified(orderId) : null;
  const buyerPolicy = orderId
    ? await resolveShopProductionVisibilityPolicyForOrder({ orderId, collectionId })
    : await resolveShopProductionVisibilityPolicyForOrder({ collectionId });
  const chainSteps = filterChainStepsForShopBuyer(chain?.steps, buyerPolicy);

  let orderQty: number | null = null;
  let orderTotalRub: number | null = null;
  let exportReady = false;
  let trackingNumber: string | null = null;

  if (orderId) {
    if (isIntegrationImportedWholesaleOrderId(orderId)) {
      await ensureSpineOperationalStoreReady(SPINE_TRACKING_READ_SCOPES);
      const imported = getImportedOrderRecord(orderId);
      if (imported) {
        orderQty = imported.lineItems.reduce((s, l) => s + (l.quantity ?? 0), 0);
        const fromLines = imported.lineItems.reduce(
          (s, l) => s + (l.quantity ?? 0) * (l.price ?? 0),
          0
        );
        const amountRaw = imported.order.amount?.replace(/[^\d]/g, '');
        orderTotalRub = amountRaw ? Number(amountRaw) : fromLines > 0 ? fromLines : null;
      }
      exportReady = Boolean((await resolveWholesaleExport(orderId))?.externalExportId);
      trackingNumber = (await resolveSpineOrderTracking(orderId))?.trackingNumber ?? null;
    } else {
      const order = await getWorkshop2B2bOrder(orderId);
      if (order) {
        orderQty = (order.lines ?? []).reduce((s, l) => s + (l.qty ?? 0), 0);
        orderTotalRub = order.totalRub ?? null;
      }
    }
  }

  return {
    orderId,
    chainSteps,
    orderQty,
    orderTotalRub,
    exportReady,
    trackingNumber,
  };
}

async function buildOrderProductionSnapshot(
  collectionId: string,
  factoryId: string,
  articleId: string,
  variant: OrderProductionVariant,
  wholesaleOrderIdInput?: string
): Promise<OrderProductionPillarSnapshot> {
  await ensureSpineOperationalStoreReady(SPINE_HUB_MINIMAL_SCOPES);

  const demo = getPlatformCoreDemo(collectionId);
  const w2Fallback = demo.demoOrderId.startsWith('__') ? '' : demo.demoOrderId;
  const resolveFrom =
    variant === 'shop'
      ? (['w2_registry', 'allocation', 'operational'] as const)
      : (['w2_registry', 'handoff', 'allocation'] as const);

  const orderId =
    wholesaleOrderIdInput?.trim() ||
    (await resolveSpineActiveWholesaleOrderIdServer({
      fallbackOrderId: w2Fallback,
      factoryId: variant === 'shop' ? '' : factoryId,
      collectionId,
      resolveFrom,
    })) ||
    w2Fallback;

  const chain = orderId ? await resolveB2bChainStatusUnified(orderId) : null;
  const buyerPolicy =
    variant === 'shop' && orderId
      ? await resolveShopProductionVisibilityPolicyForOrder({ orderId, collectionId })
      : await resolveShopProductionVisibilityPolicyForOrder({ collectionId });
  const rawSteps = chain?.steps ?? [];
  const chainSteps =
    variant === 'shop' ? filterChainStepsForShopBuyer(rawSteps, buyerPolicy) : rawSteps;
  const productionOrderId = chain?.productionOrderId ?? null;

  let handoffItems: OrderProductionPillarSnapshot['handoffItems'] = [];
  if (variant === 'manufacturer') {
    const queue = await listWorkshop2FactoryProductionHandoffQueue({ factoryId });
    handoffItems = queue.items.map((item) => ({
      b2bOrderId: item.b2bOrderId,
      productionOrderId: item.productionOrderId,
      articleId: item.articleId,
      collectionId: item.collectionId,
      status: item.status,
      wipStatus: item.wipStatus ?? item.mesReleaseStage,
    }));
  }

  let bomLineCount: number | null = null;
  let bomPreviewLines: OrderProductionPillarSnapshot['bomPreviewLines'] = [];
  let trackingPreview: OrderProductionPillarSnapshot['trackingPreview'] = null;

  if (variant === 'brand') {
    const dossier = await getWorkshop2ServerDossierRecord(collectionId, articleId);
    const lines = (dossier?.dossier?.productionModel?.materialLines ?? []) as Array<{
      materialName?: string;
    }>;
    bomLineCount = lines.length;
    bomPreviewLines = lines.filter((line) => line.materialName?.trim()).slice(0, 3);
  }

  if (variant === 'shop' && orderId && isIntegrationImportedWholesaleOrderId(orderId)) {
    const [shipment, wip, delivery] = await Promise.all([
      resolveSpineOrderTracking(orderId),
      resolveSpineProductionWipByB2bOrderId(orderId),
      resolveSpineDeliveryWindow(orderId),
    ]);
    trackingPreview = {
      trackingNumber: shipment?.trackingNumber,
      carrier: shipment?.carrier,
      status: shipment?.status,
      wipLabelRu: wip ? PRODUCTION_WIP_STAGE_LABEL_RU[wip.poStage] : undefined,
      deliveryLabel: delivery?.label,
    };
  }

  return {
    orderId,
    chainSteps,
    productionOrderId,
    handoffItems,
    bomLineCount,
    bomPreviewLines,
    trackingPreview,
  };
}

function resolveOrderProductionVariant(input: {
  pillarVariant?: OrderProductionVariant;
  roleId?: CoreChainRoleId;
}): OrderProductionVariant {
  if (input.pillarVariant) return input.pillarVariant;
  if (input.roleId === 'shop') return 'shop';
  if (input.roleId === 'manufacturer') return 'manufacturer';
  return 'brand';
}

function toProcurementSpineSnapshot(
  ctx: SpineProcurementContext | null
): SupplierProcurementSpineSnapshot | null {
  if (!ctx) return null;
  return {
    b2bOrderId: ctx.b2bOrderId,
    isSpineImported: ctx.isSpineImported,
    poId: ctx.poId,
    chainHandedOff: ctx.chainHandedOff,
    chainMaterialsSupplied: ctx.chainMaterialsSupplied,
    deliveryLabel: ctx.deliveryLabel,
    centricRfq: ctx.centricRfq
      ? {
          rfqId: ctx.centricRfq.rfqId,
          status: ctx.centricRfq.status,
          lines: ctx.centricRfq.lines.slice(0, 8).map((line) => ({
            materialName: line.materialName,
            qty: line.qty,
            unit: line.unit,
          })),
        }
      : undefined,
    vendorPo: ctx.vendorPo
      ? {
          vendorPoId: ctx.vendorPo.vendorPoId,
          status: ctx.vendorPo.status,
          lines: ctx.vendorPo.lines.slice(0, 8).map((line) => ({
            materialName: line.materialName,
            qty: line.qty,
            unit: line.unit,
            ackQty: line.ackQty,
            ackDate: line.ackDate,
          })),
        }
      : undefined,
  };
}

async function buildSupplierProcurementSnapshot(
  collectionId: string,
  factoryId: string,
  articleId: string,
  wholesaleOrderIdInput?: string
): Promise<SupplierProcurementPillarSnapshot> {
  await ensureSpineOperationalStoreReady(SPINE_PROCUREMENT_SCOPES);

  const demo = getPlatformCoreDemo(collectionId);
  const w2Fallback = demo.demoOrderId.startsWith('__') ? '' : demo.demoOrderId;

  const spineOrderId = await resolveSpineActiveWholesaleOrderIdServer({
    fallbackOrderId: w2Fallback,
    factoryId,
    collectionId,
    resolveFrom: ['w2_registry', 'handoff', 'allocation'],
  });

  const [queue, dossier] = await Promise.all([
    listWorkshop2FactoryProductionHandoffQueue({ factoryId }),
    getWorkshop2ServerDossierRecord(collectionId, articleId),
  ]);

  const items = queue.items;
  const spineHit =
    (spineOrderId ? items.find((i) => i.b2bOrderId === spineOrderId) : undefined) ??
    items.find((i) => isIntegrationImportedWholesaleOrderId(i.b2bOrderId)) ??
    items[0];

  const orderId =
    wholesaleOrderIdInput?.trim() || spineHit?.b2bOrderId || spineOrderId || w2Fallback;

  const hit = items.find((i) => i.b2bOrderId === orderId);
  let poQty = hit?.qty ?? 0;
  if (!hit && orderId && isIntegrationImportedWholesaleOrderId(orderId)) {
    const imported = getImportedOrderRecord(orderId);
    poQty = imported?.lineItems.reduce((s, l) => s + (l.quantity ?? 0), 0) ?? 0;
  }

  const poReady =
    Boolean(hit) ||
    (Boolean(orderId) && isIntegrationImportedWholesaleOrderId(orderId) && poQty > 0);

  const bomLines = (dossier?.dossier?.productionModel?.materialLines ??
    []) as SupplierProcurementBomLine[];

  let chainSteps: SupplierProcurementPillarSnapshot['chainSteps'] = [];
  let productionOrderId: string | null = hit?.productionOrderId ?? null;
  if (orderId) {
    const chain = await resolveB2bChainStatusUnified(orderId);
    productionOrderId = chain?.productionOrderId ?? productionOrderId;
    chainSteps = (chain?.steps ?? []).filter((s) =>
      ['inventory_reserved', 'production_po', 'materials_supplied'].includes(s.id)
    );
  }

  const procurementSpine = orderId
    ? toProcurementSpineSnapshot(await getSpineProcurementContext(orderId))
    : null;

  return {
    orderId: orderId || '',
    productionOrderId,
    poReady,
    poQty,
    bomLines,
    chainSteps,
    handoffQueueCount: items.length,
    procurementSpine,
  };
}

async function countCommsThreadMessages(orderId: string): Promise<number> {
  const id = orderId.trim();
  if (!id) return 0;
  try {
    const threads = await listWorkshop2ContextualMessageThreads({
      contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
      contextId: workshop2B2bOrderContextId(id),
      limit: 1,
    });
    return threads[0]?.messageCount ?? 0;
  } catch {
    return 0;
  }
}

function commsResolveFrom(roleId?: CoreChainRoleId) {
  if (roleId === 'shop') return ['w2_registry', 'allocation', 'operational'] as const;
  if (roleId === 'brand') return ['w2_registry', 'handoff', 'allocation', 'operational'] as const;
  return ['w2_registry', 'handoff', 'allocation'] as const;
}

async function buildCommsSnapshot(
  collectionId: string,
  factoryId: string,
  roleId: CoreChainRoleId | undefined,
  wholesaleOrderIdInput?: string
): Promise<CommsPillarSnapshot> {
  if (isPlatformCoreEmptyChainCollection(collectionId)) {
    return {
      orderId: '',
      commsThreadCount: 0,
      calendarEventCount: 0,
      deliveryWindowCount: 0,
    };
  }

  const demo = getPlatformCoreDemo(collectionId);
  const w2Fallback = demo.demoOrderId.startsWith('__') ? '' : demo.demoOrderId;

  const orderId =
    wholesaleOrderIdInput?.trim() ||
    (await resolveSpineActiveWholesaleOrderIdServer({
      fallbackOrderId: w2Fallback,
      factoryId: roleId === 'shop' ? '' : factoryId,
      collectionId,
      resolveFrom: commsResolveFrom(roleId),
    })) ||
    w2Fallback;

  const goldenOrderContext = orderId.startsWith('B2B-DEMO-');
  if (!goldenOrderContext) {
    await ensureSpineOperationalStoreReady(SPINE_HUB_MINIMAL_SCOPES);
  }

  const [calendar, commsThreadCount] = await Promise.all([
    getPlatformCoreB2bCalendarEvents({ collectionId, orderId }),
    countCommsThreadMessages(orderId),
  ]);

  const deliveryWindowCount = calendar.events.filter((e) => e.kind === 'delivery_window').length;

  return {
    orderId,
    commsThreadCount,
    calendarEventCount: calendar.count,
    deliveryWindowCount,
  };
}

export async function getPlatformCorePillarSnapshot(input: {
  collectionId: string;
  pillarId: CoreHubPillarId;
  roleId?: CoreChainRoleId;
  factoryId?: string;
  wholesaleOrderId?: string;
  articleId?: string;
  pillarVariant?: OrderProductionVariant;
}): Promise<PlatformCorePillarSnapshotPayload> {
  const cid = input.collectionId.trim();
  const demo = getPlatformCoreDemo(cid);
  const factoryId = input.factoryId?.trim() || demo.factoryId;
  const articleId = input.articleId?.trim() || demo.demoArticleId;

  if (input.pillarId === 'development') {
    return {
      pillarId: 'development',
      development: await buildDevelopmentSnapshot(cid, factoryId, articleId, input.roleId),
    };
  }

  if (input.pillarId === 'sample_collection') {
    return {
      pillarId: 'sample_collection',
      sampleCollection: { status: await getWorkshop2SampleCollectionStatus(cid) },
    };
  }

  if (input.pillarId === 'collection_order') {
    if (input.roleId === 'manufacturer') {
      return {
        pillarId: 'collection_order',
        manufacturerCollectionOrder: await buildManufacturerCollectionOrderInsight(
          cid,
          factoryId,
          input.wholesaleOrderId
        ),
      };
    }
    if (input.roleId === 'supplier') {
      return {
        pillarId: 'collection_order',
        supplierCollectionOrderForecast: await buildSupplierCollectionOrderForecast(
          cid,
          factoryId,
          input.wholesaleOrderId
        ),
      };
    }
    return {
      pillarId: 'collection_order',
      collectionOrder: await buildCollectionOrderSnapshot(cid, factoryId, input.wholesaleOrderId),
    };
  }

  if (input.pillarId === 'order_production') {
    if (input.roleId === 'supplier') {
      return {
        pillarId: 'order_production',
        supplierProcurement: await buildSupplierProcurementSnapshot(
          cid,
          factoryId,
          articleId,
          input.wholesaleOrderId
        ),
      };
    }
    const variant = resolveOrderProductionVariant(input);
    return {
      pillarId: 'order_production',
      orderProduction: await buildOrderProductionSnapshot(
        cid,
        factoryId,
        articleId,
        variant,
        input.wholesaleOrderId
      ),
    };
  }

  if (input.pillarId === 'comms') {
    return {
      pillarId: 'comms',
      comms: await buildCommsSnapshot(cid, factoryId, input.roleId, input.wholesaleOrderId),
    };
  }

  return { pillarId: input.pillarId, unsupported: true };
}

/** PG connection error → offline demo snapshot (без 503 в UI). */
export async function getPlatformCorePillarSnapshotResilient(input: {
  collectionId: string;
  pillarId: CoreHubPillarId;
  roleId?: CoreChainRoleId;
  factoryId?: string;
  wholesaleOrderId?: string;
  articleId?: string;
  pillarVariant?: OrderProductionVariant;
}): Promise<PlatformCorePillarSnapshotPayload> {
  try {
    return await getPlatformCorePillarSnapshot(input);
  } catch (err) {
    if (!isWorkshop2PgConnectionError(err)) throw err;
    const { buildPlatformCorePillarSnapshotOffline } =
      await import('@/lib/server/platform-core-pillar-snapshot-offline');
    return buildPlatformCorePillarSnapshotOffline(input);
  }
}
