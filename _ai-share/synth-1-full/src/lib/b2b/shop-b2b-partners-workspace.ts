import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { brandOrderCommsTabHref } from '@/lib/b2b/brand-collection-order-hrefs';
import { platformB2bMarketroomFeatureHref } from '@/lib/b2b/platform-b2b-marketroom';
import {
  shopMatrixWorkspaceTabHref,
  shopLandedMarginTabHref,
  shopOrderCommsTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { shopShowroomBuyFeatureHref } from '@/lib/b2b/shop-showroom-buy';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_PARTNERS_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';

export type ShopB2bPartnersSession = {
  collectionId: string;
  rosterHref: string;
  discoverHref: string;
  repHref: string;
  discoverPageHref: string;
  platformPartnersHref: string;
  platformMarketroomHref: string;
  shopShowroomHref: string;
  shopMatrixHref: string;
  salesRepPortalHref: string;
  shopAgentRepCommissionHref: string;
  collaborativeHref: string;
  brandCrmSegmentsHref: string;
  orderCommsHref: string;
  landedMarginHref: string;
  brandOrderChatHref: string;
  brandOrderHandoffHref: string;
  platformHubHref: string;
};

export function buildShopB2bPartnersSession(input?: {
  collectionId?: string;
  orderId?: string;
}): ShopB2bPartnersSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionQ = `collection=${encodeURIComponent(collectionId)}`;
  const partnersBase = `${ROUTES.shop.b2bPartners}?${collectionQ}`;
  const discoverBase = `${ROUTES.shop.b2bPartnersDiscover}?${collectionQ}`;

  return {
    collectionId,
    rosterHref: `${partnersBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=roster`,
    discoverHref: `${discoverBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=discover`,
    repHref: `${partnersBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=rep`,
    discoverPageHref: discoverBase,
    platformPartnersHref: `${PLATFORM_CORE_B2B_PARTNERS_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=directory`,
    platformMarketroomHref: platformB2bMarketroomFeatureHref('showcase', collectionId),
    shopShowroomHref: shopShowroomBuyFeatureHref(collectionId, 'showroom'),
    shopMatrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    salesRepPortalHref: `${LEGACY_ROUTES.shop.b2bSalesRepPortal}?${PILLAR_CAPABILITY_FEATURE_PARAM}=portal&${collectionQ}`,
    shopAgentRepCommissionHref: `${LEGACY_ROUTES.shop.b2bSalesRepPortal}?${PILLAR_CAPABILITY_FEATURE_PARAM}=commission&${collectionQ}`,
    collaborativeHref: `${LEGACY_ROUTES.shop.b2bCollaborativeOrder}?${PILLAR_CAPABILITY_FEATURE_PARAM}=session&order=${encodeURIComponent(orderId)}`,
    brandCrmSegmentsHref: `${LEGACY_ROUTES.brand.customerGroups}?${PILLAR_CAPABILITY_FEATURE_PARAM}=segments`,
    orderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    landedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    brandOrderChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    brandOrderHandoffHref: brandOrderCommsTabHref('handoff', orderId, collectionId),
    platformHubHref: `${PLATFORM_CORE_B2B_BASE}?${collectionQ}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`,
  };
}

export function shopB2bPartnersFeatureHref(
  featureId: 'roster' | 'discover' | 'rep',
  collectionId?: string,
  onDiscoverRoute?: boolean
): string {
  const session = buildShopB2bPartnersSession({ collectionId });
  if (featureId === 'discover') {
    return onDiscoverRoute ? session.discoverHref : session.discoverPageHref;
  }
  if (featureId === 'rep') return session.repHref;
  return session.rosterHref;
}
