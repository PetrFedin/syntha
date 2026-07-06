/**
 * Wave YT — S4 notification center compact on all pillar cards (final polish).
 * SoT extends wave YX; E2E: core-235-wave-yt-notifications.spec.ts
 */
export {
  WAVE_YX_PC_NOTIFICATION_PARAM,
  WAVE_YX_PC_NOTIFICATION_DETAIL_VALUE,
  WAVE_YX_NOTIFICATION_DETAIL_RU,
  WAVE_YX_TRACKING_CTA_RU,
  WAVE_YX_NOTIFICATION_EVENTS_COMPACT_RU,
  WAVE_YX_NOTIFICATION_CENTER_COMPACT_TESTIDS,
  WAVE_YX_PILLAR_NOTIFICATION_COMPACT_WIRES,
  WAVE_YX_COMMS_NOTIFICATION_ROLES,
  WAVE_YX_NOTIFICATION_CENTER_COMPACT_ATTR,
  WAVE_YX_COMMS_UNREAD_LOADING_RU,
  WAVE_YX_COMMS_UNREAD_EMPTY_RU,
  WAVE_YX_COMMS_HUB_PATHS,
  platformCoreCommsNotificationDetailHref,
  platformCoreCmCalendarNotificationDetailLinkTestId,
  commsNotificationCenterRolePrefix,
  commsNotificationCenterCompactTestId,
  commsNotificationCenterPanelTestId,
  commsNotificationPrefsCompactTestId,
  commsNotificationCenterLinkTestId,
  mapCommsStripVariantToNotificationRole,
  shouldEmbedCommsNotificationPrefsInCenterStrip,
  commsNotificationPrefsCompactForStrip,
  type WaveYxCommsNotificationRole,
} from '@/lib/platform/wave-yx-notification-center-final';

import { WAVE_YX_PILLAR_NOTIFICATION_COMPACT_WIRES } from '@/lib/platform/wave-yx-notification-center-final';

export const WAVE_YT_E2E_SPEC = 'core-248-wave-yt-notifications.spec.ts' as const;

export const WAVE_YT_PILLAR_NOTIFICATION_COMPACT_WIRES = WAVE_YX_PILLAR_NOTIFICATION_COMPACT_WIRES;
