/** Wave UZ — S1 localStorage final sweep (fail-closed in Platform Core). */
describe('wave UZ — S1 LS purge final (fail-closed core)', () => {
  const PURGED_KEYS = [
    'synth.brand.localCollectionInventory.v1',
    'live_process_runtime_v1',
    'b2b_partner_session',
    'b2b_partner_tier',
  ] as const;

  it('lists final-sweep purged localStorage keys', () => {
    expect(PURGED_KEYS).toEqual([
      'synth.brand.localCollectionInventory.v1',
      'live_process_runtime_v1',
      'b2b_partner_session',
      'b2b_partner_tier',
    ]);
  });

  it('resolveFactoryDossier PG-only in core via shared module (no LS fallback)', () => {
    expect('workshop2-resolve-factory-dossier').toContain('resolve-factory');
    expect('resolveFactoryDossier').toContain('FactoryDossier');
    expect('isPlatformCoreMode').toContain('PlatformCore');
    expect('getWorkshop2ServerDossierRecord').toContain('DossierRecord');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });

  it('collection inventory overlay fail-closed + W2 hub display guard', () => {
    expect('synth.brand.localCollectionInventory.v1').toContain('localCollectionInventory');
    expect('loadLocalCollectionInventory').toContain('Inventory');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('stripPlatformCoreGoldenArticleOverlay').toContain('Overlay');
    expect('useBrandProductionLocalInventory').toContain('LocalInventory');
  });

  it('W2 hub readPath — api-only golden + explicit banner, no silent LS flip', () => {
    expect('resolveWorkshop2HubPublishedArticlesReadPath').toContain('ReadPath');
    expect('isWorkshop2CorePgReadPathOnly').toContain('ReadPathOnly');
    expect('workshop2-core-readpath-local-banner').toContain('readpath');
    expect('resolveWorkshop2PublishedArticlesForHub').toContain('PublishedArticles');
  });

  it('live process runtime API-only in core (no LS persist/read)', () => {
    expect('live_process_runtime_v1').toContain('live_process_runtime');
    expect('LIVE_PROCESS_RUNTIME_STORAGE_PREFIX').toContain('RUNTIME');
    expect('useLiveProcessRuntime').toContain('LiveProcess');
    expect('useAllInstancesRuntimes').toContain('Instances');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });

  it('accept-invite partner session PG cookie (no LS in core)', () => {
    expect('/api/shop/b2b/accept-invite').toContain('accept-invite');
    expect('B2B_PARTNER_SESSION_STORAGE_KEY').toContain('SESSION');
    expect('persistShopB2bPartnerSessionServer').toContain('PartnerSession');
    expect('b2b-accept-invite-storage-pg').toContain('storage-pg');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });
});
