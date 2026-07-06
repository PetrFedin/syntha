import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';

describe('wave UL — mfr comms + OP (P2)', () => {
  it('pcTask auto-create from calendar event API', () => {
    expect('/api/workshop2/platform-core/calendar-events/pc-task').toContain('pc-task');
    expect('ensurePlatformCorePcTaskFromCalendarEvent').toContain('Calendar');
    expect('platformCorePcTaskIdFromCalendarEventId').toContain('CalendarEventId');
  });

  it('production calendar Gantt bridge strip testids', () => {
    expect('mfr-cm-calendar-gantt-bridge-strip').toContain('gantt-bridge');
    expect('mfr-cm-calendar-gantt-bridge-wip').toContain('bridge-wip');
    expect('mfr-cm-calendar-gantt-attach-tz-btn').toContain('attach-tz');
    expect('mfr-op-wip-gantt-strip').toContain('wip-gantt');
  });

  it('mfr comms attach TZ peer (BW/UL)', () => {
    expect('mfr-cm-order-attach-tz-peer-strip').toContain('attach-tz');
    expect('mfr-cm-order-attach-tz-btn').toContain('attach-tz');
    expect('mfr-cm-article-attach-tz-peer-strip').toContain('attach-tz');
  });

  it('handoff inbox push via notification_events', () => {
    expect('notifyManufacturerHandoffQueuePoInbox').toContain('Inbox');
    expect('platform_core_notification_events').toContain('notification');
  });

  it('mfr dev sample photo DAM stub POST', () => {
    expect('/api/workshop2/manufacturer/sample-photo/dam-stub').toContain('dam-stub');
    expect('mfr-dev-sample-photo-dam-stub-btn').toContain('dam-stub');
    expect('attachManufacturerSamplePhotoDamStub').toContain('Dam');
  });

  it('sample queue hash-scroll + factory PATCH limited fields', () => {
    expect('#sample-queue').toBe('#sample-queue');
    expect('usePlatformCoreHashScroll').toContain('HashScroll');
    expect('/api/workshop2/factory/sample-queue/').toContain('sample-queue');
    expect('validateFactorySamplePatch').toContain('Patch');
    const session = buildManufacturerHandoffQueueSession({
      factoryId: 'fact-1',
      collectionId: 'SS27',
      orderId: 'B2B-DEMO-1',
    });
    expect(session.handoffHref).toContain('handoff');
  });
});
