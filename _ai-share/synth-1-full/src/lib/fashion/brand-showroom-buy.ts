import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  brandLandedMarginTabHref,
  brandOrderCommsTabHref,
} from '@/lib/b2b/brand-collection-order-hrefs';
import {
  shopCollaborativeTabHref,
  shopOrderCommsTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import { shopMatrixWorkspaceTabHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { shopShowroomBuyFeatureHref } from '@/lib/b2b/shop-showroom-buy';
import {
  PLATFORM_CORE_B2B_MARKETROOM_HREF,
  PLATFORM_CORE_B2B_PARTNERS_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';

export type BrandShowroomBuySession = {
  collectionId: string;
  previewHref: string;
  publishHref: string;
  shopBuyHref: string;
  launchReadinessHref: string;
  syndicationHref: string;
  releaseGateHref: string;
  shopShowroomHref: string;
  shopBuyPathHref: string;
  platformMarketroomHref: string;
  platformPartnersHref: string;
  shopOrderCommsHref: string;
  shopCollaborativeHref: string;
  brandOrderCommsChatHref: string;
  brandLandedMarginHref: string;
  shopMatrixHref: string;
};

export function buildBrandShowroomBuySession(input?: {
  collectionId?: string;
}): BrandShowroomBuySession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const orderId = PLATFORM_CORE_DEMO.demoOrderId;
  const base = `${ROUTES.brand.showroom}?collection=${encodeURIComponent(collectionId)}`;

  return {
    collectionId,
    previewHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=preview`,
    publishHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=publish`,
    shopBuyHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=shop-buy`,
    launchReadinessHref: ROUTES.brand.launchReadiness,
    syndicationHref: `${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=syndication`,
    releaseGateHref: ROUTES.brand.launchReadiness,
    shopShowroomHref: shopShowroomBuyFeatureHref(collectionId, 'showroom'),
    shopBuyPathHref: shopShowroomBuyFeatureHref(collectionId, 'buy'),
    platformMarketroomHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase`,
    platformPartnersHref: `${PLATFORM_CORE_B2B_PARTNERS_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=directory`,
    shopOrderCommsHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    shopCollaborativeHref: shopCollaborativeTabHref('session', orderId, collectionId),
    brandOrderCommsChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    brandLandedMarginHref: brandLandedMarginTabHref('simulator', collectionId, orderId),
    shopMatrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
  };
}
