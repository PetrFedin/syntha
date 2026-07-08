import {
  brandLandedMarginTabHref,
  brandOrderCommsTabHref,
} from '@/lib/b2b/brand-collection-order-hrefs';
import {
  shopCollaborativeTabHref,
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
  shopReplenishmentTabHref,
  shopShowroomTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { brandAgentRepLedgerHref } from '@/lib/fashion/brand-agent-rep-oversight';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_MARKETROOM_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES, shopB2bCheckoutCollectionHref } from '@/lib/routes';

export type BrandLandedMarginSession = {
  collectionId: string;
  orderId: string;
  simulatorHref: string;
  pricelistHref: string;
  shopRollupHref: string;
  shopMarginHubHref: string;
  shopMarginRollupHref: string;
  shopMarginPricelistHref: string;
  shopMatrixHref: string;
  shopCheckoutHref: string;
  shopPrepackHref: string;
  shopCollaborativeHref: string;
  shopOrderCommsHref: string;
  shopReplenishmentAtpHref: string;
  brandOrderCommsChatHref: string;
  brandOrderCommsHandoffHref: string;
  agentRepHref: string;
  priceListsVersionsHref: string;
  shopShowroomHref: string;
  brandCrmSegmentsHref: string;
  platformMarketroomHref: string;
  platformHubHref: string;
};

export function brandLandedMarginFeatureHref(
  featureId: 'simulator' | 'pricelist' | 'shop-rollup',
  collectionId?: string,
  orderId?: string
): string {
  return brandLandedMarginTabHref(
    featureId,
    collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId,
    orderId
  );
}

export function buildBrandLandedMarginSession(input?: {
  collectionId?: string;
  orderId?: string;
}): BrandLandedMarginSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;

  return {
    collectionId,
    orderId,
    simulatorHref: brandLandedMarginTabHref('simulator', collectionId, orderId),
    pricelistHref: brandLandedMarginTabHref('pricelist', collectionId, orderId),
    shopRollupHref: brandLandedMarginTabHref('shop-rollup', collectionId, orderId),
    shopMarginHubHref: shopLandedMarginTabHref('hub', collectionId, orderId),
    shopMarginRollupHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    shopMarginPricelistHref: shopLandedMarginTabHref('pricelist', collectionId, orderId),
    shopMatrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    shopCheckoutHref: shopB2bCheckoutCollectionHref(collectionId),
    shopPrepackHref: shopMatrixWorkspaceTabHref('prepack', collectionId, orderId),
    shopCollaborativeHref: shopCollaborativeTabHref('approvals', orderId, collectionId),
    shopOrderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    shopReplenishmentAtpHref: shopReplenishmentTabHref('stock-atp', collectionId, orderId),
    brandOrderCommsChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    brandOrderCommsHandoffHref: brandOrderCommsTabHref('handoff', orderId, collectionId),
    agentRepHref: brandAgentRepLedgerHref(),
    priceListsVersionsHref: `${ROUTES.brand.priceLists}?${PILLAR_CAPABILITY_FEATURE_PARAM}=versions&collection=${encodeURIComponent(collectionId)}`,
    shopShowroomHref: shopShowroomTabHref('showroom', collectionId, orderId),
    brandCrmSegmentsHref: `${ROUTES.brand.customerGroups}?${PILLAR_CAPABILITY_FEATURE_PARAM}=segments&collection=${encodeURIComponent(collectionId)}`,
    platformMarketroomHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase`,
    platformHubHref: `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`,
  };
}
