import { brandLandedMarginFeatureHref } from '@/lib/b2b/brand-landed-margin';
import { brandOrderCommsTabHref } from '@/lib/b2b/brand-collection-order-hrefs';
import { platformB2bMarketroomFeatureHref } from '@/lib/b2b/platform-b2b-marketroom';
import { platformB2bPartnersFeatureHref } from '@/lib/b2b/platform-b2b-partners';
import { shopOrderCommsTabHref, shopShowroomTabHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { shopLandedMarginFeatureHref } from '@/lib/b2b/shop-landed-margin';
import { brandAgentRepLedgerHref } from '@/lib/fashion/brand-agent-rep-oversight';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_B2B_BASE } from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES, shopB2bCheckoutCollectionHref, shopB2bMatrixOrderContextHref } from '@/lib/routes';

export type BrandPricelistSession = {
  collectionId: string;
  orderId: string;
  versionsHref: string;
  tiersHref: string;
  shopSyncHref: string;
  shopMatrixHref: string;
  shopMarginPricelistHref: string;
  brandLandedMarginHref: string;
  brandCrmSegmentsHref: string;
  platformMarketroomHref: string;
  platformPartnersHref: string;
  platformHubHref: string;
  shopShowroomHref: string;
  shopCheckoutHref: string;
  shopOrderCommsHref: string;
  brandOrderCommsChatHref: string;
  agentRepHref: string;
};

export function brandPricelistFeatureHref(
  featureId: 'versions' | 'tiers' | 'shop-sync',
  collectionId?: string,
  groupId?: string
): string {
  const session = buildBrandPricelistSession({ collectionId, groupId });
  if (featureId === 'versions') return session.versionsHref;
  if (featureId === 'tiers') return session.tiersHref;
  return session.shopSyncHref;
}

export function buildBrandPricelistSession(input?: {
  collectionId?: string;
  orderId?: string;
  groupId?: string;
}): BrandPricelistSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const base = `${ROUTES.brand.priceLists}?collection=${encodeURIComponent(collectionId)}`;
  const groupQ = input?.groupId?.trim() ? `&group=${encodeURIComponent(input.groupId.trim())}` : '';

  return {
    collectionId,
    orderId,
    versionsHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=versions${groupQ}`,
    tiersHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=tiers`,
    shopSyncHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=shop-sync`,
    shopMatrixHref: orderId
      ? shopB2bMatrixOrderContextHref(orderId)
      : `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`,
    shopMarginPricelistHref: shopLandedMarginFeatureHref('pricelist', collectionId, orderId),
    brandLandedMarginHref: brandLandedMarginFeatureHref('pricelist', collectionId, orderId),
    brandCrmSegmentsHref: `${ROUTES.brand.customerGroups}?${PILLAR_CAPABILITY_FEATURE_PARAM}=segments&collection=${encodeURIComponent(collectionId)}`,
    platformMarketroomHref: platformB2bMarketroomFeatureHref('showcase', collectionId),
    platformPartnersHref: platformB2bPartnersFeatureHref('directory', collectionId),
    platformHubHref: `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`,
    shopShowroomHref: shopShowroomTabHref('showroom', collectionId, orderId),
    shopCheckoutHref: shopB2bCheckoutCollectionHref(collectionId),
    shopOrderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    brandOrderCommsChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    agentRepHref: brandAgentRepLedgerHref(),
  };
}
