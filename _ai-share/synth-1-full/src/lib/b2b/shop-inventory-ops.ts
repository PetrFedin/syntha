import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import {
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';

export type ShopInventoryOpsSession = {
  collectionId: string;
  orderId: string;
  overviewHref: string;
  reconcileHref: string;
  cycleCountHref: string;
  replenishmentAlertsHref: string;
  replenishmentAtpHref: string;
  replenishmentRulesHref: string;
  landedMarginHref: string;
  orderCommsHref: string;
  matrixHref: string;
  brandInventoryOverviewHref: string;
};

export function buildShopInventoryOpsSession(input?: {
  collectionId?: string;
  orderId?: string;
}): ShopInventoryOpsSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const base = ROUTES.shop.inventory;
  const collectionQ = `collection=${encodeURIComponent(collectionId)}`;

  return {
    collectionId,
    orderId,
    overviewHref: `${base}?${PILLAR_CAPABILITY_FEATURE_PARAM}=overview&${collectionQ}`,
    reconcileHref: `${base}?${PILLAR_CAPABILITY_FEATURE_PARAM}=reconcile&${collectionQ}`,
    cycleCountHref: ROUTES.shop.cycleCounting,
    replenishmentAlertsHref: `${LEGACY_ROUTES.shop.b2bReplenishment}?${PILLAR_CAPABILITY_FEATURE_PARAM}=alerts&${collectionQ}`,
    replenishmentAtpHref: `${LEGACY_ROUTES.shop.b2bReplenishment}?${PILLAR_CAPABILITY_FEATURE_PARAM}=stock-atp&${collectionQ}`,
    replenishmentRulesHref: `${LEGACY_ROUTES.shop.b2bReplenishment}?${PILLAR_CAPABILITY_FEATURE_PARAM}=rules&${collectionQ}`,
    landedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    orderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    matrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    brandInventoryOverviewHref: `${ROUTES.brand.inventory}?${PILLAR_CAPABILITY_FEATURE_PARAM}=overview&${collectionQ}`,
  };
}

export function shopInventoryFeatureHref(
  featureId: 'overview' | 'reconcile',
  collectionId?: string
): string {
  const session = buildShopInventoryOpsSession({ collectionId });
  return featureId === 'overview' ? session.overviewHref : session.reconcileHref;
}
