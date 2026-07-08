import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { brandOrderCommsFeatureHref } from '@/lib/b2b/brand-order-comms';
import { appendSupplierOpPoContextToHref } from '@/lib/b2b/supplier-op-po-context-hrefs';
import { brandOrderCommsTabHref } from '@/lib/b2b/brand-collection-order-hrefs';
import { buildShopInventoryOpsSession } from '@/lib/b2b/shop-inventory-ops';
import {
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
  shopReplenishmentTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { manufacturerOrderCommsFeatureHref } from '@/lib/b2b/manufacturer-order-comms';
import { buildSupplierMrpSupplySession } from '@/lib/fashion/supplier-mrp-supply';
import { supplierCommsEntitiesHref } from '@/lib/fashion/supplier-comms-entity-threads';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  ROUTES,
  factorySupplierCalendarB2bOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';

export type SupplierOrderCommsSession = {
  orderId: string;
  collectionId: string;
  articleId: string;
  orderTabHref: string;
  messagesHref: string;
  calendarHref: string;
  supplyTabHref: string;
  brandBomHref: string;
  shopTrackingHref: string;
  shopOrderCommsHref: string;
  brandOrderChatHref: string;
  brandOrderHandoffHref: string;
  shopLandedMarginHref: string;
  shopMatrixHref: string;
  replenishmentAtpHref: string;
  inventoryOverviewHref: string;
  manufacturerOrderHref: string;
  entitiesHref: string;
};

export function buildSupplierOrderCommsSession(input?: {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  productionOrderId?: string;
}): SupplierOrderCommsSession {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01';
  const productionOrderId =
    input?.productionOrderId?.trim() || PLATFORM_CORE_DEMO.productionOrderId;
  const poCtx = { orderId, productionOrderId };
  const base = appendSupplierOpPoContextToHref(
    `${EXTENDED_ROUTES.factory.supplierMessages}?order=${encodeURIComponent(orderId)}&collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`,
    poCtx
  );
  const supply = buildSupplierMrpSupplySession({ collectionId, articleId, orderId });
  const inventory = buildShopInventoryOpsSession({ collectionId, orderId });

  return {
    orderId,
    collectionId,
    articleId,
    orderTabHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=order`,
    messagesHref: appendSupplierOpPoContextToHref(
      factorySupplierMessagesB2bOrderContextHref(orderId),
      poCtx
    ),
    calendarHref: appendSupplierOpPoContextToHref(
      factorySupplierCalendarB2bOrderContextHref(orderId),
      poCtx
    ),
    supplyTabHref: appendSupplierOpPoContextToHref(supply.supplyTabHref, poCtx),
    brandBomHref: appendSupplierOpPoContextToHref(supply.brandBomHref, poCtx),
    shopTrackingHref: appendSupplierOpPoContextToHref(
      `${shopB2bTrackingOrderHref(orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=tracking`,
      poCtx
    ),
    shopOrderCommsHref: appendSupplierOpPoContextToHref(
      shopOrderCommsTabHref('tracking', orderId, collectionId),
      poCtx
    ),
    brandOrderChatHref: appendSupplierOpPoContextToHref(
      brandOrderCommsFeatureHref(orderId, 'chat', collectionId),
      poCtx
    ),
    brandOrderHandoffHref: appendSupplierOpPoContextToHref(
      brandOrderCommsTabHref('handoff', orderId, collectionId),
      poCtx
    ),
    shopLandedMarginHref: appendSupplierOpPoContextToHref(
      shopLandedMarginTabHref('rollup', collectionId, orderId),
      poCtx
    ),
    shopMatrixHref: appendSupplierOpPoContextToHref(
      shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
      poCtx
    ),
    replenishmentAtpHref: appendSupplierOpPoContextToHref(
      shopReplenishmentTabHref('stock-atp', collectionId, orderId),
      poCtx
    ),
    inventoryOverviewHref: appendSupplierOpPoContextToHref(inventory.overviewHref, poCtx),
    manufacturerOrderHref: appendSupplierOpPoContextToHref(
      manufacturerOrderCommsFeatureHref(orderId, collectionId),
      poCtx
    ),
    entitiesHref: appendSupplierOpPoContextToHref(
      supplierCommsEntitiesHref(collectionId, articleId),
      poCtx
    ),
  };
}

export function supplierOrderCommsFeatureHref(
  orderId: string,
  collectionId?: string,
  articleId?: string,
  productionOrderId?: string
): string {
  return buildSupplierOrderCommsSession({ orderId, collectionId, articleId, productionOrderId })
    .orderTabHref;
}
