import {
  brandLandedMarginTabHref,
  brandOrderCommsTabHref,
} from '@/lib/b2b/brand-collection-order-hrefs';
import {
  shopCollaborativeTabHref,
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  brandShowroomHrefForDemo,
  getPlatformCoreDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_MARKETROOM_HREF,
  PLATFORM_CORE_B2B_PARTNERS_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { ROUTES } from '@/lib/routes';

export type BrandCrmSegmentationSession = {
  collectionId: string;
  segmentsHref: string;
  pricelistHref: string;
  showroomHref: string;
  priceListsHref: string;
  brandShowroomPreviewHref: string;
  shopShowroomHref: string;
  companyAccountsHref: string;
  agentRepHref: string;
  retailersHref: string;
  shopMarginPricelistHref: string;
  brandLandedMarginHref: string;
  platformMarketroomHref: string;
  platformPartnersHref: string;
  platformHubHref: string;
  shopMatrixHref: string;
  orderCommsHref: string;
  brandOrderChatHref: string;
  collaborativeHref: string;
};

export function buildBrandCrmSegmentationSession(input?: {
  collectionId?: string;
  groupId?: string;
}): BrandCrmSegmentationSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = PLATFORM_CORE_DEMO.demoOrderId;
  const groupId = input?.groupId?.trim();
  const base = ROUTES.brand.customerGroups;
  const demo = getPlatformCoreDemo(collectionId);
  const showroom = brandShowroomHrefForDemo(demo);
  const groupQ = groupId ? `&group=${encodeURIComponent(groupId)}` : '';

  return {
    collectionId,
    segmentsHref: `${base}?${PILLAR_CAPABILITY_FEATURE_PARAM}=segments`,
    pricelistHref: `${base}?${PILLAR_CAPABILITY_FEATURE_PARAM}=pricelist${groupQ}`,
    showroomHref: `${base}?${PILLAR_CAPABILITY_FEATURE_PARAM}=showroom&collection=${encodeURIComponent(collectionId)}`,
    priceListsHref: `${ROUTES.brand.priceLists}?${PILLAR_CAPABILITY_FEATURE_PARAM}=versions${groupQ}`,
    brandShowroomPreviewHref: `${showroom}&${PILLAR_CAPABILITY_FEATURE_PARAM}=preview`,
    shopShowroomHref: `${ROUTES.shop.b2bShowroom}?${PILLAR_CAPABILITY_FEATURE_PARAM}=showroom&collection=${encodeURIComponent(collectionId)}`,
    companyAccountsHref: ROUTES.brand.companyAccounts,
    agentRepHref: `${ROUTES.brand.distributor.commissions}?${PILLAR_CAPABILITY_FEATURE_PARAM}=ledger`,
    retailersHref: ROUTES.brand.retailers,
    shopMarginPricelistHref: shopLandedMarginTabHref('pricelist', collectionId),
    brandLandedMarginHref: brandLandedMarginTabHref('simulator', collectionId),
    platformMarketroomHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase&collection=${encodeURIComponent(collectionId)}`,
    platformPartnersHref: `${PLATFORM_CORE_B2B_PARTNERS_HREF}?${PILLAR_CAPABILITY_FEATURE_PARAM}=directory&collection=${encodeURIComponent(collectionId)}`,
    platformHubHref: `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`,
    shopMatrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    orderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    brandOrderChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    collaborativeHref: shopCollaborativeTabHref('session', orderId, collectionId),
  };
}

export function brandCrmSegmentationFeatureHref(
  featureId: 'segments' | 'pricelist' | 'showroom',
  collectionId?: string
): string {
  const session = buildBrandCrmSegmentationSession({ collectionId });
  if (featureId === 'segments') return session.segmentsHref;
  if (featureId === 'pricelist') return session.pricelistHref;
  return session.showroomHref;
}
