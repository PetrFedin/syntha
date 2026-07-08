import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { brandLandedMarginTabHref } from '@/lib/b2b/brand-collection-order-hrefs';
import {
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_B2B_MARKETROOM_HREF } from '@/lib/platform-core-mode-surfaces';
import { shopInventoryFeatureHref } from '@/lib/b2b/shop-inventory-ops';
import { ROUTES } from '@/lib/routes';

export type BrandInventoryOpsSession = {
  collectionId: string;
  orderId: string;
  overviewHref: string;
  balanceHref: string;
  countHref: string;
  networkHref: string;
  inventoryBalanceHref: string;
  multiLocationHref: string;
  shadowInventoryHref: string;
  warehouseHref: string;
  productsMatrixHref: string;
  shopInventoryOverviewHref: string;
  shopInventoryReconcileHref: string;
  replenishmentAlertsHref: string;
  replenishmentAtpHref: string;
  cycleCountHref: string;
  legacyMatrixHref: string;
  shopLandedMarginHref: string;
  shopOrderCommsHref: string;
  shopMatrixHref: string;
  brandLandedMarginHref: string;
  platformMarketroomHref: string;
};

export function buildBrandInventoryOpsSession(input?: {
  collectionId?: string;
  orderId?: string;
}): BrandInventoryOpsSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const base = ROUTES.brand.inventory;
  const collectionQ = `collection=${encodeURIComponent(collectionId)}`;

  return {
    collectionId,
    orderId,
    overviewHref: `${base}?${PILLAR_CAPABILITY_FEATURE_PARAM}=overview&${collectionQ}`,
    balanceHref: `${base}?${PILLAR_CAPABILITY_FEATURE_PARAM}=balance&${collectionQ}`,
    countHref: `${base}?${PILLAR_CAPABILITY_FEATURE_PARAM}=count&${collectionQ}`,
    networkHref: `${base}?${PILLAR_CAPABILITY_FEATURE_PARAM}=network&${collectionQ}`,
    inventoryBalanceHref: ROUTES.brand.inventoryBalance,
    multiLocationHref: ROUTES.brand.inventoryMultiLocation,
    shadowInventoryHref: ROUTES.brand.logisticsShadowInventory,
    warehouseHref: ROUTES.brand.warehouse,
    productsMatrixHref: '/brand/products/matrix',
    shopInventoryOverviewHref: shopInventoryFeatureHref('overview', collectionId),
    shopInventoryReconcileHref: shopInventoryFeatureHref('reconcile', collectionId),
    replenishmentAlertsHref: `${LEGACY_ROUTES.shop.b2bReplenishment}?${PILLAR_CAPABILITY_FEATURE_PARAM}=alerts&${collectionQ}`,
    replenishmentAtpHref: `${LEGACY_ROUTES.shop.b2bReplenishment}?${PILLAR_CAPABILITY_FEATURE_PARAM}=stock-atp&${collectionQ}`,
    cycleCountHref: ROUTES.shop.cycleCounting,
    legacyMatrixHref: `${base}?legacy=1`,
    shopLandedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    shopOrderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    shopMatrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    brandLandedMarginHref: brandLandedMarginTabHref('simulator', collectionId, orderId),
    platformMarketroomHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase&${collectionQ}`,
  };
}

export function brandInventoryFeatureHref(
  featureId: 'overview' | 'balance' | 'count' | 'network',
  collectionId?: string
): string {
  const session = buildBrandInventoryOpsSession({ collectionId });
  if (featureId === 'overview') return session.overviewHref;
  if (featureId === 'balance') return session.balanceHref;
  if (featureId === 'count') return session.countHref;
  return session.networkHref;
}
