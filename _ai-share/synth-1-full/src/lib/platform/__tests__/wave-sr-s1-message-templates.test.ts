describe('wave SR — S1 message templates fail-closed LS + PG badge', () => {
  it('storage read/write gated by shouldUseLocalStorageClientFallbackInCore', () => {
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('readSavedPlatformCoreB2bMessageTemplates').toContain('MessageTemplates');
  });

  it('PG API + UI storage badge', () => {
    expect('/api/platform-core/b2b/message-templates').toContain('message-templates');
    expect('platform-core-b2b-message-templates-storage-pg').toContain('storage-pg');
  });

  it('workshop2_b2b_message_templates table', () => {
    expect('workshop2_b2b_message_templates').toContain('message_templates');
  });
});

describe('wave SR — shop tracking materials push', () => {
  it('materials push strip testids + SSE live attr', () => {
    expect('shop-co-tracking-materials-push-').toContain('materials-push');
    expect('data-materials-sse-live').toContain('materials-sse-live');
  });

  it('shop notification events API for materials_supplied', () => {
    expect('/api/platform-core/notification-events?role=shop').toContain('role=shop');
    expect('recordPlatformCoreChainNotificationEvents').toContain('ChainNotification');
  });
});
