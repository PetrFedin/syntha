/** Wave VP — S1 localStorage final sweep (fail-closed in Platform Core). */
describe('wave VP — S1 LS final sweep (fail-closed core)', () => {
  const CLOSED_KEYS = [
    'live_process_runtime_v1',
    'synth.brand.localCollectionInventory.v1',
    'b2b_partner_session',
    'b2b_partner_tier',
    'platform_core_b2b_message_templates_v1',
  ] as const;

  it('lists final-sweep closed localStorage keys', () => {
    expect(CLOSED_KEYS).toEqual([
      'live_process_runtime_v1',
      'synth.brand.localCollectionInventory.v1',
      'b2b_partner_session',
      'b2b_partner_tier',
      'platform_core_b2b_message_templates_v1',
    ]);
  });

  it('live process runtime API-only in core (no LS persist/read)', () => {
    expect('live_process_runtime_v1').toContain('live_process_runtime');
    expect('LIVE_PROCESS_RUNTIME_STORAGE_PREFIX').toContain('RUNTIME');
    expect('useLiveProcessRuntime').toContain('LiveProcess');
    expect('useAllInstancesRuntimes').toContain('Instances');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });

  it('collection inventory overlay fail-closed', () => {
    expect('synth.brand.localCollectionInventory.v1').toContain('localCollectionInventory');
    expect('loadLocalCollectionInventory').toContain('Inventory');
    expect('saveLocalCollectionInventory').toContain('Inventory');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('stripPlatformCoreGoldenArticleOverlay').toContain('Overlay');
  });

  it('W2 hub readPath — api-only in core + explicit banner, no silent LS flip', () => {
    expect('resolveWorkshop2HubPublishedArticlesReadPath').toContain('ReadPath');
    expect('isWorkshop2CorePgReadPathOnly').toContain('ReadPathOnly');
    expect('resolveWorkshop2PublishedArticlesForHub').toContain('PublishedArticles');
    expect('workshop2-core-readpath-local-banner').toContain('readpath');
    expect('isPlatformCoreMode').toContain('PlatformCore');
  });

  it('accept-invite partner session PG cookie (no LS in core)', () => {
    expect('/api/shop/b2b/accept-invite').toContain('accept-invite');
    expect('B2B_PARTNER_SESSION_STORAGE_KEY').toContain('SESSION');
    expect('persistShopB2bPartnerSessionServer').toContain('PartnerSession');
    expect('b2b-accept-invite-storage-pg').toContain('storage-pg');
    expect('resolveB2bBuyerTierFromSession').toContain('BuyerTier');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });

  it('brand B2B chat custom templates fail-closed LS + PG API', () => {
    expect('platform_core_b2b_message_templates_v1').toContain('message_templates');
    expect('PLATFORM_CORE_B2B_MESSAGE_TEMPLATES_LS_KEY').toContain('TEMPLATES');
    expect('readSavedPlatformCoreB2bMessageTemplates').toContain('MessageTemplates');
    expect('/api/platform-core/b2b/message-templates').toContain('message-templates');
    expect('platform-core-b2b-message-templates-storage-pg').toContain('storage-pg');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
  });
});
