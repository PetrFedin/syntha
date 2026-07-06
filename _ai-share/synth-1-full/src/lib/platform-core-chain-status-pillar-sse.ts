import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';
import {
  platformCoreCmCalendarTrackingHref as platformCoreCmCalendarTrackingHrefImpl,
  platformCoreCmCalendarTrackingHrefForRole,
} from '@/lib/platform/platform-core-comms-pctask-deeplinks';

export type PlatformCoreChainStatusPillarKind = 'collection_order' | 'order_production';

const ROLE_PREFIX: Record<CoreChainRoleId, string> = {
  brand: 'brand',
  shop: 'shop',
  manufacturer: 'mfr',
  supplier: 'sup',
};

const PILLAR_SEGMENT: Record<PlatformCoreChainStatusPillarKind, string> = {
  collection_order: 'co',
  order_production: 'op',
};

/** testid prefix для SSE/poll badge на pillar insight cards (Wave TW). */
export function platformCorePillarChainStatusRolePrefix(roleId: CoreChainRoleId): string {
  return ROLE_PREFIX[roleId];
}

export function platformCorePillarChainStatusSseTestId(
  roleId: CoreChainRoleId,
  pillar: PlatformCoreChainStatusPillarKind
): string {
  return `${ROLE_PREFIX[roleId]}-${PILLAR_SEGMENT[pillar]}-cabinet-sse-live-badge`;
}

export function platformCorePillarChainStatusPollTestId(
  roleId: CoreChainRoleId,
  pillar: PlatformCoreChainStatusPillarKind
): string {
  return `${ROLE_PREFIX[roleId]}-${PILLAR_SEGMENT[pillar]}-cabinet-poll-badge`;
}

/** Calendar row / notification → role tracking / handoff / PO card (Wave WC). */
export function platformCoreCmCalendarTrackingHref(
  orderId: string,
  role?: CoreChainRoleId,
  opts?: { factoryId?: string; collectionId?: string }
): string {
  return platformCoreCmCalendarTrackingHrefImpl(orderId, role, opts);
}

export { platformCoreCmCalendarTrackingHrefForRole };

export function platformCoreCmCalendarTrackingDeepLinkTestId(
  rolePrefix: string,
  eventOrTaskId: string
): string {
  return `${rolePrefix}-cm-calendar-tracking-deep-link-${eventOrTaskId}`;
}

export function platformCoreCmNotificationTrackingLinkTestId(rolePrefix: string): string {
  return `${rolePrefix}-cm-notification-tracking-link`;
}
