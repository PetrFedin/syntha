import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { buildShopInventoryOpsSession } from '@/lib/b2b/shop-inventory-ops';
import { brandOrderCommsTabHref } from '@/lib/b2b/brand-collection-order-hrefs';
import {
  shopCollaborativeTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
  shopReplenishmentTabHref,
  shopShowroomTabHref,
  shopWorkingOrderTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { shopLandedMarginFeatureHref } from '@/lib/b2b/shop-landed-margin';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_B2B_MARKETROOM_HREF } from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES, shopB2bCheckoutCollectionHref } from '@/lib/routes';

export type ShopReplenishmentSession = {
  collectionId: string;
  orderId: string;
  alertsHref: string;
  stockAtpHref: string;
  rulesHref: string;
  matrixHref: string;
  checkoutHref: string;
  prepackHref: string;
  workingOrderHref: string;
  inventoryOverviewHref: string;
  landedMarginHref: string;
  orderCommsHref: string;
  collaborativeApprovalsHref: string;
  brandOrderChatHref: string;
  shopShowroomHref: string;
  platformMarketroomHref: string;
  /** Cross-pillar: supplier collection_order forecast (peer insight). */
  supplierForecastHref: string;
};

export function shopReplenishmentFeatureHref(
  featureId: 'alerts' | 'stock-atp' | 'rules',
  collectionId?: string,
  orderId?: string
): string {
  return shopReplenishmentTabHref(
    featureId,
    collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId,
    orderId
  );
}

export function buildShopReplenishmentSession(input?: {
  collectionId?: string;
  orderId?: string;
}): ShopReplenishmentSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const inventory = buildShopInventoryOpsSession({ collectionId });

  return {
    collectionId,
    orderId,
    alertsHref: shopReplenishmentTabHref('alerts', collectionId, orderId),
    stockAtpHref: shopReplenishmentTabHref('stock-atp', collectionId, orderId),
    rulesHref: shopReplenishmentTabHref('rules', collectionId, orderId),
    matrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    checkoutHref: shopB2bCheckoutCollectionHref(collectionId),
    prepackHref: shopMatrixWorkspaceTabHref('prepack', collectionId, orderId),
    workingOrderHref: shopWorkingOrderTabHref('bulk', orderId, collectionId),
    inventoryOverviewHref: inventory.overviewHref,
    landedMarginHref: shopLandedMarginFeatureHref('rollup', collectionId, orderId),
    orderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    collaborativeApprovalsHref: shopCollaborativeTabHref('approvals', orderId, collectionId),
    brandOrderChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    shopShowroomHref: shopShowroomTabHref('showroom', collectionId, orderId),
    platformMarketroomHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase`,
    supplierForecastHref: `${EXTENDED_ROUTES.factory.supplierMessages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=forecast&collection=${encodeURIComponent(collectionId)}&order=${encodeURIComponent(orderId)}`,
  };
}
