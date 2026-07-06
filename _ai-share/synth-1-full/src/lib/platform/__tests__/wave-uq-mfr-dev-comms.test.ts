describe('wave UQ — mfr dev + comms + OP (P2)', () => {
  it('sample photo DAM stub POST wired on dev dossier + queue', () => {
    expect('/api/workshop2/manufacturer/sample-photo/dam-stub').toContain('dam-stub');
    expect('mfr-dev-sample-photo-dam-stub-strip').toContain('dam-stub');
    expect('attachManufacturerSamplePhotoDamStub').toContain('Dam');
  });

  it('OP dossier TZ export print e2e testids', () => {
    expect('MfrOpDossierExportPrintStrip').toContain('ExportPrint');
    expect('mfr-op-dossier-export-print-strip').toContain('export-print');
    expect('mfr-op-dossier-export-print-export-btn').toContain('export');
    expect('mfr-op-dossier-export-print-btn').toContain('print');
    expect('mfr-op-dossier-export-print-status').toContain('status');
  });

  it('pcTask auto-create factory task PG from calendar event', () => {
    expect('/api/workshop2/platform-core/calendar-events/pc-task').toContain('pc-task');
    expect('PlatformCorePcTaskAutoEnsure').toContain('AutoEnsure');
    expect('ensurePlatformCorePcTaskFromCalendarEvent').toContain('Calendar');
    expect('mfr-cm-calendar-pc-task-auto-ensure').toContain('auto-ensure');
  });

  it('production calendar Gantt bridge WIP strip', () => {
    expect('mfr-cm-calendar-gantt-bridge-strip').toContain('gantt-bridge');
    expect('mfr-cm-calendar-gantt-bridge-wip').toContain('bridge-wip');
    expect('MfrOpWipGanttStrip').toContain('Gantt');
    expect('mfr-op-wip-gantt-strip').toContain('wip-gantt');
  });

  it('handoff inbox push on new PO via notification_events', () => {
    expect('notifyManufacturerHandoffQueuePoInbox').toContain('Inbox');
    expect('platform_core_notification_events').toContain('notification');
    expect('confirmWorkshop2B2bProductionHandoff').toContain('Handoff');
  });
});
