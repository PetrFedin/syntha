import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { buildPlatformB2bMarketroomSession } from '@/lib/b2b/platform-b2b-marketroom';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { buildShopB2bPartnersSession } from '@/lib/b2b/shop-b2b-partners-workspace';
import { shopB2bOrdersCollectionRegistryHref } from '@/lib/routes';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_PARTNERS_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

export type PlatformB2bPartnersSession = {
  collectionId: string;
  directoryHref: string;
  shopRosterHref: string;
  marketroomHref: string;
  shopDiscoverHref: string;
  brandCrmHref: string;
  brandCrmBuyerAssignHref: string;
  shopRegistryGreenfieldHref: string;
  platformMarketroomDiscoverHref: string;
  buyPathHref: string;
  shopRepHref: string;
  collaborativeHref: string;
  platformHubHref: string;
  shopShowroomHref: string;
  shopMatrixHref: string;
  orderCommsHref: string;
  landedMarginHref: string;
  brandOrderChatHref: string;
};

export function buildPlatformB2bPartnersSession(input?: {
  collectionId?: string;
}): PlatformB2bPartnersSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const shop = buildShopB2bPartnersSession({ collectionId });
  const marketroom = buildPlatformB2bMarketroomSession({ collectionId });
  const base = `${PLATFORM_CORE_B2B_PARTNERS_HREF}?collection=${encodeURIComponent(collectionId)}`;

  return {
    collectionId,
    directoryHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=directory`,
    shopRosterHref: shop.rosterHref,
    marketroomHref: marketroom.showcaseHref,
    shopDiscoverHref: shop.discoverPageHref,
    brandCrmHref: shop.brandCrmSegmentsHref,
    brandCrmBuyerAssignHref: brandCrmSegmentationFeatureHref('pricelist', collectionId),
    shopRegistryGreenfieldHref: `${shopB2bOrdersCollectionRegistryHref()}?buyer=shop2&collection=${encodeURIComponent(collectionId)}`,
    platformMarketroomDiscoverHref: marketroom.discoverHref,
    buyPathHref: marketroom.buyPathHref,
    shopRepHref: shop.repHref,
    collaborativeHref: marketroom.collaborativeHref,
    platformHubHref: `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`,
    shopShowroomHref: shop.shopShowroomHref,
    shopMatrixHref: shop.shopMatrixHref,
    orderCommsHref: shop.orderCommsHref,
    landedMarginHref: shop.landedMarginHref,
    brandOrderChatHref: shop.brandOrderChatHref,
  };
}

export function platformB2bPartnersFeatureHref(
  featureId: 'directory' | 'shop-roster' | 'marketroom',
  collectionId?: string
): string {
  const session = buildPlatformB2bPartnersSession({ collectionId });
  if (featureId === 'directory') return session.directoryHref;
  if (featureId === 'shop-roster') return session.shopRosterHref;
  return session.marketroomHref;
}
