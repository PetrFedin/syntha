describe('wave UH — comms entity threads + chain calendar + contextual POST', () => {
  it('entity thread templates PG store extends SR message templates', () => {
    expect('062_wave_uh_entity_thread_templates').toContain('entity_thread_templates');
    expect('workshop2_entity_thread_templates').toContain('entity_thread');
    expect('/api/platform-core/comms/entity-thread-templates').toContain('entity-thread-templates');
    expect('platform-core-entity-thread-templates-storage-pg').toContain('storage-pg');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });

  it('POST calendar-events from chain-status step', () => {
    expect('createPlatformCoreChainStepCalendarEvents').toContain('ChainStepCalendar');
    expect('hookPlatformCoreChainCalendarOnBump').toContain('ChainCalendar');
    expect('/api/workshop2/platform-core/calendar-events').toContain('calendar-events');
    expect('chain-materials_supplied-').toContain('chain-');
  });

  it('contextual POST thread for order/article chat', () => {
    expect('/api/platform-core/comms/contextual-thread').toContain('contextual-thread');
    expect('ensurePlatformCoreCommsContextualThread').toContain('ContextualThread');
    expect('ensureWorkshop2ArticleContextualThread').toContain('ArticleContextual');
    expect('postPlatformCoreCommsContextualThread').toContain('ContextualThread');
  });

  it('compact notification strip deduped via CommsNotificationCenterStrip', () => {
    expect('CommsNotificationCenterStrip').toContain('Notification');
    expect('brand-cm-notification-center-compact').toContain('notification-center-compact');
    expect('shop-cm-notification-center-compact').toContain('notification-center-compact');
    expect('mfr-cm-notification-center-compact').toContain('notification-center-compact');
    expect('sup-cm-notification-center-compact').toContain('notification-center-compact');
  });

  it('entity thread template strip on panels', () => {
    expect('brand-comms-entity-thread-templates').toContain('entity-thread-templates');
    expect('manufacturer-comms-entity-thread-templates').toContain('entity-thread-templates');
    expect('supplier-comms-entity-thread-templates').toContain('entity-thread-templates');
  });
});
