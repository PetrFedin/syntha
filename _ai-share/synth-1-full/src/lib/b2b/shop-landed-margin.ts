import {
  brandLandedMarginTabHref,
  brandOrderCommsTabHref,
} from '@/lib/b2b/brand-collection-order-hrefs';
import {
  buildLandedMarginCatalogSeedRows,
  summarizeLandedMarginFeed,
  type LandedMarginFeedRow,
} from '@/lib/b2b/landed-margin-feed';
import { brandPricelistFeatureHref } from '@/lib/b2b/brand-pricelist-workspace';
import {
  shopCollaborativeTabHref,
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
  shopReplenishmentTabHref,
  shopShowroomTabHref,
  shopWorkingOrderTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_B2B_MARKETROOM_HREF } from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';

export type ShopLandedMarginRow = LandedMarginFeedRow;

export type ShopLandedMarginSession = {
  collectionId: string;
  orderId: string;
  hubHref: string;
  rollupHref: string;
  pricelistHref: string;
  collaborativeHref: string;
  collaborativeApprovalsHref: string;
  replenishmentRulesHref: string;
  replenishmentAtpHref: string;
  brandPricelistHref: string;
  brandShopSyncHref: string;
  brandMarginSimulatorHref: string;
  brandMarginPricelistHref: string;
  matrixHref: string;
  prepackHref: string;
  workingOrderHref: string;
  showroomHref: string;
  orderCommsHref: string;
  brandOrderChatHref: string;
  inventoryOverviewHref: string;
  platformMarketroomHref: string;
  /** @deprecated use replenishmentRulesHref */
  replenishmentHref: string;
};

export function shopLandedMarginFeatureHref(
  featureId: 'hub' | 'rollup' | 'pricelist',
  collectionId?: string,
  orderId?: string
): string {
  return shopLandedMarginTabHref(
    featureId,
    collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId,
    orderId
  );
}

export function buildShopLandedMarginSession(input?: {
  collectionId?: string;
  orderId?: string;
}): ShopLandedMarginSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;

  return {
    collectionId,
    orderId,
    hubHref: shopLandedMarginTabHref('hub', collectionId, orderId),
    rollupHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    pricelistHref: shopLandedMarginTabHref('pricelist', collectionId, orderId),
    collaborativeHref: shopCollaborativeTabHref('session', orderId, collectionId),
    collaborativeApprovalsHref: shopCollaborativeTabHref('approvals', orderId, collectionId),
    replenishmentRulesHref: shopReplenishmentTabHref('rules', collectionId, orderId),
    replenishmentAtpHref: shopReplenishmentTabHref('stock-atp', collectionId, orderId),
    brandPricelistHref: brandPricelistFeatureHref('tiers', collectionId),
    brandShopSyncHref: brandPricelistFeatureHref('shop-sync', collectionId),
    brandMarginSimulatorHref: brandLandedMarginTabHref('simulator', collectionId, orderId),
    brandMarginPricelistHref: brandLandedMarginTabHref('pricelist', collectionId, orderId),
    matrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    prepackHref: shopMatrixWorkspaceTabHref('prepack', collectionId, orderId),
    workingOrderHref: shopWorkingOrderTabHref('versions', orderId, collectionId),
    showroomHref: shopShowroomTabHref('showroom', collectionId, orderId),
    orderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    brandOrderChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    inventoryOverviewHref: `${ROUTES.shop.inventory}?${PILLAR_CAPABILITY_FEATURE_PARAM}=overview&collection=${encodeURIComponent(collectionId)}`,
    platformMarketroomHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase`,
    replenishmentHref: shopReplenishmentTabHref('rules', collectionId, orderId),
  };
}

export function buildShopLandedMarginRows(input?: {
  collectionId?: string;
  orderId?: string;
}): ShopLandedMarginRow[] {
  return buildLandedMarginCatalogSeedRows(input);
}

export function summarizeShopLandedMargin(rows: readonly ShopLandedMarginRow[]): {
  total: number;
  onTarget: number;
  avgMarginPct: number;
} {
  const summary = summarizeLandedMarginFeed(rows);
  return {
    total: summary.total,
    onTarget: summary.onTarget,
    avgMarginPct: summary.avgMarginPct,
  };
}

/** @deprecated use buildShopLandedMarginSession().collaborativeApprovalsHref */
export function shopLandedMarginCollaborativeHref(orderId: string, collectionId?: string): string {
  return shopCollaborativeTabHref('approvals', orderId, collectionId);
}

/** @deprecated use buildShopLandedMarginSession().replenishmentRulesHref */
export function shopLandedMarginReplenishmentHref(collectionId: string, orderId?: string): string {
  return shopReplenishmentTabHref('rules', collectionId, orderId);
}
