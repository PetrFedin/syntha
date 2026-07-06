import { buildPlatformB2bMarketroomSession } from '@/lib/b2b/platform-b2b-marketroom';
import { buildPlatformB2bPartnersSession } from '@/lib/b2b/platform-b2b-partners';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_MARKETROOM_HREF,
  PLATFORM_CORE_B2B_PARTNERS_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

export type PlatformB2bHubSession = {
  collectionId: string;
  hubHref: string;
  marketroomBridgeHref: string;
  partnersBridgeHref: string;
  marketroomShowcaseHref: string;
  partnersDirectoryHref: string;
  shopShowroomHref: string;
  brandPreviewHref: string;
  buyPathHref: string;
  collaborativeHref: string;
  shopMatrixHref: string;
  shopOrderCommsHref: string;
  shopLandedMarginHref: string;
  workingOrderHref: string;
  replenishmentAtpHref: string;
  brandPublishHref: string;
  brandCrmBuyerAssignHref: string;
  shopRegistryGreenfieldHref: string;
};

export function platformB2bHubFeatureHref(
  featureId: 'hub' | 'marketroom' | 'partners',
  collectionId?: string
): string {
  return buildPlatformB2bHubSession({ collectionId })[
    featureId === 'hub'
      ? 'hubHref'
      : featureId === 'marketroom'
        ? 'marketroomBridgeHref'
        : 'partnersBridgeHref'
  ];
}

export function buildPlatformB2bHubSession(input?: {
  collectionId?: string;
  orderId?: string;
}): PlatformB2bHubSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const marketroom = buildPlatformB2bMarketroomSession({ collectionId, orderId: input?.orderId });
  const partners = buildPlatformB2bPartnersSession({ collectionId });
  const base = `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}`;

  return {
    collectionId,
    hubHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`,
    marketroomBridgeHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=marketroom`,
    partnersBridgeHref: `${base}&${PILLAR_CAPABILITY_FEATURE_PARAM}=partners`,
    marketroomShowcaseHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase`,
    partnersDirectoryHref: `${PLATFORM_CORE_B2B_PARTNERS_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=directory`,
    shopShowroomHref: marketroom.shopShowroomHref,
    brandPreviewHref: marketroom.brandPreviewHref,
    buyPathHref: marketroom.buyPathHref,
    collaborativeHref: marketroom.collaborativeHref,
    shopMatrixHref: marketroom.shopMatrixHref,
    shopOrderCommsHref: marketroom.shopOrderCommsHref,
    shopLandedMarginHref: marketroom.shopLandedMarginHref,
    workingOrderHref: marketroom.workingOrderHref,
    replenishmentAtpHref: marketroom.replenishmentAtpHref,
    brandPublishHref: marketroom.brandPublishHref,
    brandCrmBuyerAssignHref: partners.brandCrmBuyerAssignHref,
    shopRegistryGreenfieldHref: partners.shopRegistryGreenfieldHref,
  };
}
