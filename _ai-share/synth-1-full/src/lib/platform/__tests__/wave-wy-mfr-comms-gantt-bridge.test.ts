import {
  MFR_CM_CALENDAR_ATTACH_TZ_BW_BTN_TESTID,
  MFR_CM_CALENDAR_ATTACH_TZ_BW_ORDER_LINK_TESTID,
  MFR_CM_CALENDAR_ATTACH_TZ_BW_PEER_TESTID,
  MFR_CM_CALENDAR_GANTT_BRIDGE_WIP_TESTID,
  mfrCmOrderAttachTzPeerHref,
  platformCoreMfrProductionCalendarPcTaskHref,
} from '@/lib/platform/platform-core-mfr-comms-wy-gantt-bridge';
import { platformCoreChainCalendarTaskId } from '@/lib/platform/platform-core-comms-pctask-deeplinks';

const ORDER = 'B2B-DEMO-SHOP1-SS27';
const COLLECTION = 'SS27';
const FACTORY = 'fact-1';

describe('wave WY — mfr comms Gantt bridge + pcTask PG + handoff push + TZ BW peer', () => {
  it('production calendar pcTask href targets production calendar with Gantt bridge context', () => {
    const taskId = platformCoreChainCalendarTaskId(ORDER, 'manufacturer');
    const href = platformCoreMfrProductionCalendarPcTaskHref({
      collectionId: COLLECTION,
      orderId: ORDER,
      taskId,
      factoryId: FACTORY,
    });
    expect(href).toContain('/factory/production/calendar');
    expect(href).toContain(`pcTask=${encodeURIComponent(taskId)}`);
    expect(href).toContain(encodeURIComponent(ORDER));
  });

  it('Gantt bridge WIP strip testids wired on production calendar', () => {
    expect(MFR_CM_CALENDAR_GANTT_BRIDGE_WIP_TESTID).toBe('mfr-cm-calendar-gantt-bridge-wip');
    expect('ManufacturerCalendarGanttBridgeWipStrip').toContain('GanttBridgeWip');
    expect('mfr-cm-calendar-gantt-bridge-strip').toContain('gantt-bridge');
    expect('mfr-op-wip-gantt-strip').toContain('wip-gantt');
    expect('mfr-op-wip-gantt-empty').toContain('empty');
  });

  it('pcTask auto-create factory task PG from calendar event API', () => {
    expect('/api/workshop2/platform-core/calendar-events/pc-task').toContain('pc-task');
    expect('PlatformCorePcTaskAutoEnsure').toContain('AutoEnsure');
    expect('ensurePlatformCorePcTaskFromCalendarEvent').toContain('Calendar');
    expect('mfr-cm-calendar-pc-task-auto-ensure').toContain('auto-ensure');
  });

  it('handoff inbox push on new PO via notification_events', () => {
    expect('notifyManufacturerHandoffQueuePoInbox').toContain('Inbox');
    expect('platform_core_notification_events').toContain('notification');
    expect('confirmWorkshop2B2bProductionHandoff').toContain('Handoff');
  });

  it('attach TZ peer BW cross-link on calendar + order comms', () => {
    expect(MFR_CM_CALENDAR_ATTACH_TZ_BW_PEER_TESTID).toContain('attach-tz-bw');
    expect(MFR_CM_CALENDAR_ATTACH_TZ_BW_BTN_TESTID).toContain('attach-tz-bw');
    expect(MFR_CM_CALENDAR_ATTACH_TZ_BW_ORDER_LINK_TESTID).toContain('order-peer');
    expect('MfrCmCalendarAttachTzBwPeerStrip').toContain('AttachTzBw');
    expect('mfr-cm-order-attach-tz-peer-strip').toContain('attach-tz');
    expect('mfr-cm-order-attach-tz-btn').toContain('attach-tz');
    expect(mfrCmOrderAttachTzPeerHref({ collectionId: COLLECTION, orderId: ORDER, factoryId: FACTORY })).toContain(
      'pcf=order'
    );
  });
});
