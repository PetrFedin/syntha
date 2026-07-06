import {
  platformCoreRolePillarHref,
  type CoreChainRoleId,
} from '@/lib/platform-core-hub-matrix';
import { platformCorePillarChainStatusRolePrefix } from '@/lib/platform-core-chain-status-pillar-sse';

/** Wave YX — hub notification center compact on all pillar cards (S4). */
export const WAVE_YX_PC_NOTIFICATION_PARAM = 'pcNotification' as const;
export const WAVE_YX_PC_NOTIFICATION_DETAIL_VALUE = 'detail' as const;

export const WAVE_YX_NOTIFICATION_DETAIL_RU = 'Уведомления' as const;
export const WAVE_YX_TRACKING_CTA_RU = 'Трекинг' as const;
export const WAVE_YX_NOTIFICATION_EVENTS_COMPACT_RU = 'Календарь' as const;

export const WAVE_YX_NOTIFICATION_CENTER_COMPACT_TESTIDS = [
  'shop-cm-notification-center-compact',
  'brand-cm-notification-center-compact',
  'mfr-cm-notification-center-compact',
  'sup-cm-notification-center-compact',
] as const;

/** Pillar insight cards that embed compact notification center (wave YX). */
export const WAVE_YX_PILLAR_NOTIFICATION_COMPACT_WIRES = [
  { id: 'brand-dev', file: 'components/platform/DevelopmentPillarCard.tsx', variant: 'brand' },
  { id: 'mfr-dev', file: 'components/platform/DevelopmentPillarCard.tsx', variant: 'manufacturer' },
  { id: 'brand-sc', file: 'components/platform/BrandSampleCollectionMini.tsx', variant: 'brand' },
  { id: 'shop-sc', file: 'components/platform/ShopShowroomMini.tsx', variant: 'shop' },
  { id: 'brand-co', file: 'components/platform/CollectionOrderPillarCard.tsx', variant: 'brand' },
  { id: 'shop-co', file: 'components/platform/CollectionOrderPillarCard.tsx', variant: 'shop' },
  { id: 'brand-op', file: 'components/platform/OrderProductionPillarCard.tsx', variant: 'brand' },
  { id: 'mfr-op', file: 'components/platform/OrderProductionPillarCard.tsx', variant: 'manufacturer' },
  { id: 'shop-op', file: 'components/platform/ShopOrderProductionPillarCard.tsx', variant: 'shop' },
  { id: 'sup-op', file: 'components/platform/SupplierProcurementPillarCard.tsx', variant: 'supplier' },
  { id: 'sup-co', file: 'components/platform/empty-cells/supplier-collection-order-forecast-panel.tsx', variant: 'supplier' },
  { id: 'comms', file: 'components/platform/CommsPillarCard.tsx', variant: 'all' },
] as const;

/** Comms pillar cabinet with notification detail panel focus (tracking/calendar CTA target). */
export function platformCoreCommsNotificationDetailHref(
  roleId: CoreChainRoleId,
  collectionId?: string,
  orderId?: string
): string {
  const base = platformCoreRolePillarHref(roleId, 'comms', collectionId);
  const url = new URL(base, 'http://local');
  url.searchParams.set(WAVE_YX_PC_NOTIFICATION_PARAM, WAVE_YX_PC_NOTIFICATION_DETAIL_VALUE);
  const oid = orderId?.trim();
  if (oid) url.searchParams.set('order', oid);
  return `${url.pathname}${url.search}`;
}

export function platformCoreCmCalendarNotificationDetailLinkTestId(
  roleId: CoreChainRoleId
): string {
  return `${platformCorePillarChainStatusRolePrefix(roleId)}-cm-calendar-notification-detail-link`;
}

/** Wave YX — notification center compact all roles final (prefs dedupe + hub wiring SoT). */
export const WAVE_YX_E2E_SPEC = 'core-248-wave-yt-notifications.spec.ts';

export const WAVE_YX_COMMS_NOTIFICATION_ROLES = [
  'shop',
  'brand',
  'manufacturer',
  'supplier',
] as const satisfies readonly CoreChainRoleId[];

export type WaveYxCommsNotificationRole = (typeof WAVE_YX_COMMS_NOTIFICATION_ROLES)[number];

export const WAVE_YX_NOTIFICATION_CENTER_COMPACT_ATTR = 'data-compact';

export const WAVE_YX_COMMS_UNREAD_LOADING_RU = 'Уведомления…';
export const WAVE_YX_COMMS_UNREAD_EMPTY_RU = 'Нет непрочитанных';

const COMMS_NOTIFICATION_ROLE_PREFIX: Record<WaveYxCommsNotificationRole, string> = {
  shop: 'shop-cm',
  brand: 'brand-cm',
  manufacturer: 'mfr-cm',
  supplier: 'sup-cm',
};

export function commsNotificationCenterRolePrefix(role: WaveYxCommsNotificationRole): string {
  return COMMS_NOTIFICATION_ROLE_PREFIX[role];
}

export function commsNotificationCenterCompactTestId(role: WaveYxCommsNotificationRole): string {
  return `${commsNotificationCenterRolePrefix(role)}-notification-center-compact`;
}

export function commsNotificationCenterPanelTestId(role: WaveYxCommsNotificationRole): string {
  return `${commsNotificationCenterRolePrefix(role)}-notification-center-panel`;
}

export function commsNotificationPrefsCompactTestId(role: WaveYxCommsNotificationRole): string {
  return `${commsNotificationCenterRolePrefix(role)}-notification-prefs-compact`;
}

export function commsNotificationCenterLinkTestId(role: WaveYxCommsNotificationRole): string {
  return `${commsNotificationCenterRolePrefix(role)}-notification-center`;
}

export function mapCommsStripVariantToNotificationRole(
  variant: 'shop' | 'brand' | 'manufacturer' | 'supplier'
): WaveYxCommsNotificationRole {
  return variant;
}

/** Prefs owner: single embed inside CommsNotificationCenterStrip (no parallel prefs strip on same mount). */
export function shouldEmbedCommsNotificationPrefsInCenterStrip(input: {
  includePrefs?: boolean;
}): boolean {
  return input.includePrefs !== false;
}

/** Compact `<details>` prefs in hub/panel; full block only on non-compact workspace bar. */
export function commsNotificationPrefsCompactForStrip(input: {
  compact?: boolean;
  panel?: boolean;
}): boolean {
  if (input.panel) return true;
  return Boolean(input.compact);
}

/** Hub cabinet paths per role for core-239 e2e. */
export const WAVE_YX_COMMS_HUB_PATHS = [
  {
    role: 'shop' as const,
    path: '/shop/core?pillar=comms&collection=SS27',
    prefix: 'shop-cm',
  },
  {
    role: 'brand' as const,
    path: '/brand/core?pillar=comms&collection=SS27',
    prefix: 'brand-cm',
  },
  {
    role: 'manufacturer' as const,
    path: '/factory/production/core?pillar=comms&collection=SS27',
    prefix: 'mfr-cm',
  },
  {
    role: 'supplier' as const,
    path: '/factory/supplier/core?pillar=comms&collection=SS27',
    prefix: 'sup-cm',
  },
] as const;
