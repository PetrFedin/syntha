import {
  shopCollaborativeTabHref,
  shopLandedMarginTabHref,
  shopMatrixWorkspaceTabHref,
  shopOrderCommsTabHref,
  shopReplenishmentTabHref,
  shopShowroomTabHref,
  shopWorkingOrderTabHref,
} from '@/lib/b2b/shop-collection-order-hrefs';
import {
  brandLandedMarginTabHref,
  brandOrderCommsTabHref,
} from '@/lib/b2b/brand-collection-order-hrefs';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_MARKETROOM_HREF,
} from '@/lib/platform-core-mode-surfaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  brandB2bOrdersCollectionRegistryHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
  ROUTES,
} from '@/lib/routes';

export type ShopOrderCommsSession = {
  orderId: string;
  collectionId: string;
  trackingHref: string;
  chatHref: string;
  calendarHref: string;
  collaborativeHref: string;
  collaborativeApprovalsHref: string;
  matrixHref: string;
  prepackHref: string;
  workingOrderHref: string;
  workingOrderBulkHref: string;
  replenishmentHref: string;
  replenishmentAtpHref: string;
  landedMarginHref: string;
  showroomHref: string;
  brandOrderChatHref: string;
  brandOrderHandoffHref: string;
  brandRegistryHref: string;
  brandLandedMarginHref: string;
  inventoryOverviewHref: string;
  platformMarketroomHref: string;
  platformHubHref: string;
};

export function buildShopOrderCommsSession(input?: {
  orderId?: string;
  collectionId?: string;
}): ShopOrderCommsSession {
  const orderId = input?.orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;

  return {
    orderId,
    collectionId,
    trackingHref: shopOrderCommsTabHref('tracking', orderId, collectionId),
    chatHref: shopOrderCommsTabHref('chat', orderId, collectionId),
    calendarHref: shopOrderCommsTabHref('calendar', orderId, collectionId),
    collaborativeHref: shopCollaborativeTabHref('comms', orderId, collectionId),
    collaborativeApprovalsHref: shopCollaborativeTabHref('approvals', orderId, collectionId),
    matrixHref: shopMatrixWorkspaceTabHref('matrix', collectionId, orderId),
    prepackHref: shopMatrixWorkspaceTabHref('prepack', collectionId, orderId),
    workingOrderHref: shopWorkingOrderTabHref('versions', orderId, collectionId),
    workingOrderBulkHref: shopWorkingOrderTabHref('bulk', orderId, collectionId),
    replenishmentHref: shopReplenishmentTabHref('alerts', collectionId, orderId),
    replenishmentAtpHref: shopReplenishmentTabHref('stock-atp', collectionId, orderId),
    landedMarginHref: shopLandedMarginTabHref('rollup', collectionId, orderId),
    showroomHref: shopShowroomTabHref('showroom', collectionId, orderId),
    brandOrderChatHref: brandOrderCommsTabHref('chat', orderId, collectionId),
    brandOrderHandoffHref: brandOrderCommsTabHref('handoff', orderId, collectionId),
    brandRegistryHref: brandB2bOrdersCollectionRegistryHref(orderId),
    brandLandedMarginHref: brandLandedMarginTabHref('simulator', collectionId, orderId),
    inventoryOverviewHref: `${ROUTES.shop.inventory}?${PILLAR_CAPABILITY_FEATURE_PARAM}=overview&collection=${encodeURIComponent(collectionId)}`,
    platformMarketroomHref: `${PLATFORM_CORE_B2B_MARKETROOM_HREF}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=showcase`,
    platformHubHref: `${PLATFORM_CORE_B2B_BASE}?collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=hub`,
  };
}

export function shopOrderCommsMessagesDeepHref(orderId: string): string {
  return shopMessagesB2bOrderContextHref(orderId);
}

export function shopOrderCommsCalendarDeepHref(orderId: string): string {
  return shopCalendarB2bOrderContextHref(orderId);
}

export function shopOrderCommsFeatureHref(
  orderId: string,
  featureId: 'tracking' | 'chat' | 'calendar',
  collectionId?: string
): string {
  return shopOrderCommsTabHref(featureId, orderId, collectionId);
}
