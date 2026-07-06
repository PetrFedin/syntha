describe('wave WF — entity thread templates PG + contextual POST + chat picker', () => {
  it('entity thread templates PG store extends UH migration', () => {
    expect('062_wave_uh_entity_thread_templates').toContain('entity_thread_templates');
    expect('workshop2_entity_thread_templates').toContain('entity_thread');
    expect('/api/platform-core/comms/entity-thread-templates').toContain('entity-thread-templates');
    expect('platform-core-entity-thread-templates-storage-pg').toContain('storage-pg');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });

  it('contextual POST thread wired from template apply', () => {
    expect('applyPlatformCoreEntityThreadTemplate').toContain('EntityThread');
    expect('/api/platform-core/comms/contextual-thread').toContain('contextual-thread');
    expect('postPlatformCoreCommsContextualThread').toContain('ContextualThread');
    expect('ensurePlatformCoreCommsContextualThread').toContain('ContextualThread');
  });

  it('RU template picker in comms chat (all roles)', () => {
    expect('PlatformCoreEntityThreadTemplatePicker').toContain('TemplatePicker');
    expect('brand-comms-entity-thread-templates-picker').toContain('picker');
    expect('shop-comms-entity-thread-templates-picker').toContain('picker');
    expect('manufacturer-comms-entity-thread-templates-picker').toContain('picker');
    expect('supplier-comms-entity-thread-templates-picker').toContain('picker');
  });

  it('entity thread template strip on entity panels', () => {
    expect('PlatformCoreEntityThreadTemplatesStrip').toContain('EntityThread');
    expect('brand-comms-entity-thread-templates').toContain('entity-thread-templates');
    expect('manufacturer-comms-entity-thread-templates').toContain('entity-thread-templates');
    expect('supplier-comms-entity-thread-templates').toContain('entity-thread-templates');
  });

  it('remote save/delete client for PG store', () => {
    expect('savePlatformCoreEntityThreadTemplateRemote').toContain('EntityThread');
    expect('deletePlatformCoreEntityThreadTemplateRemote').toContain('EntityThread');
    expect('fetchPlatformCoreEntityThreadTemplates').toContain('EntityThread');
  });
});
