import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { ROUTES } from '@/lib/routes';
import { platformCoreCalendarPcTaskHref } from '@/lib/platform/platform-core-comms-pctask-deeplinks';

/** Wave WY · production calendar Gantt bridge testids (mfr comms 3.3). */
export const MFR_CM_CALENDAR_GANTT_BRIDGE_WIP_TESTID = 'mfr-cm-calendar-gantt-bridge-wip';
export const MFR_CM_CALENDAR_ATTACH_TZ_BW_PEER_TESTID = 'mfr-cm-calendar-attach-tz-bw-peer-strip';
export const MFR_CM_CALENDAR_ATTACH_TZ_BW_BTN_TESTID = 'mfr-cm-calendar-attach-tz-bw-btn';
export const MFR_CM_CALENDAR_ATTACH_TZ_BW_ORDER_LINK_TESTID =
  'mfr-cm-calendar-attach-tz-bw-order-peer-link';

/** Production calendar deep-link with pcTask for Gantt bridge focus (Wave WY). */
export function platformCoreMfrProductionCalendarPcTaskHref(input: {
  collectionId: string;
  orderId: string;
  taskId: string;
  factoryId?: string;
}): string {
  const orderId = input.orderId.trim();
  const taskId = input.taskId.trim();
  const collectionId = input.collectionId.trim() || 'SS27';
  if (!orderId || !taskId) {
    return `${EXTENDED_ROUTES.factory.productionCalendar}?role=manufacturer&collection=${encodeURIComponent(collectionId)}`;
  }
  return platformCoreCalendarPcTaskHref({
    role: 'manufacturer',
    collectionId,
    orderId,
    taskId,
    factoryId: input.factoryId,
  });
}

/** Order comms attach TZ peer href (BW cross-link target from calendar). */
export function mfrCmOrderAttachTzPeerHref(input: {
  collectionId: string;
  orderId: string;
  factoryId?: string;
}): string {
  const sp = new URLSearchParams({
    collection: input.collectionId.trim() || 'SS27',
    order: input.orderId.trim(),
    pcf: 'order',
  });
  if (input.factoryId?.trim()) sp.set('factoryId', input.factoryId.trim());
  return `${EXTENDED_ROUTES.factory.messages}?${sp.toString()}`;
}
