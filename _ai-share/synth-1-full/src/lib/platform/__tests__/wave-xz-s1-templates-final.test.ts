/** Wave XZ — S1 final message templates (B2B + entity thread) PG in core mode. */
describe('wave XZ — S1 templates final (fail-closed LS + PG BFF)', () => {
  const CLOSED_KEYS = [
    'platform_core_b2b_message_templates_v1',
    'platform_core_entity_thread_templates_v1',
  ] as const;

  it('lists wave-XZ fail-closed localStorage keys', () => {
    expect(CLOSED_KEYS).toEqual([
      'platform_core_b2b_message_templates_v1',
      'platform_core_entity_thread_templates_v1',
    ]);
  });

  it('B2B message templates PG API + storage-pg badge + client fetch', () => {
    expect('PLATFORM_CORE_B2B_MESSAGE_TEMPLATES_LS_KEY').toContain('TEMPLATES');
    expect('readSavedPlatformCoreB2bMessageTemplates').toContain('MessageTemplates');
    expect('/api/platform-core/b2b/message-templates').toContain('message-templates');
    expect('fetchPlatformCoreB2bMessageTemplates').toContain('MessageTemplates');
    expect('platform-core-b2b-message-templates-storage-pg').toContain('storage-pg');
    expect('workshop2_b2b_message_templates').toContain('message_templates');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('toBffPgStorageMode').toContain('StorageMode');
  });

  it('entity thread chat custom templates PG API + storage-pg badge', () => {
    expect('PLATFORM_CORE_ENTITY_THREAD_TEMPLATES_LS_KEY').toContain('ENTITY_THREAD');
    expect('readSavedPlatformCoreEntityThreadTemplates').toContain('EntityThread');
    expect('/api/platform-core/comms/entity-thread-templates').toContain('entity-thread-templates');
    expect('fetchPlatformCoreEntityThreadTemplates').toContain('EntityThread');
    expect('savePlatformCoreEntityThreadTemplateRemote').toContain('EntityThread');
    expect('platform-core-entity-thread-templates-storage-pg').toContain('storage-pg');
    expect('workshop2_entity_thread_templates').toContain('entity_thread_templates');
  });

  it('RU hub sweep — matrix published badge', () => {
    expect('shop-sc-matrix-entry-published-yes').toContain('published');
    expect('Опубликовано').toContain('Опублик');
    expect('Черновик').toContain('Чернов');
  });
});
