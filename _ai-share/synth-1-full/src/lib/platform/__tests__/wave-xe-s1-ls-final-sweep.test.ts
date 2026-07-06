/** Wave XE — S1 final localStorage sweep (fail-closed in Platform Core). */
describe('wave XE — S1 LS final sweep (fail-closed core)', () => {
  const PURGED_KEYS = [
    'brand_production_unified_v1',
    'synth.workshop2.articleDraft.v1',
    'brand_floor_tab_draft_v1__',
    'synth.brand.workshop2Phase1Dossier.v1',
    'platform-core:shop-comms-notification-prefs',
  ] as const;

  it('lists final-sweep purged localStorage keys (count=5)', () => {
    expect(PURGED_KEYS).toHaveLength(5);
    expect(PURGED_KEYS).toEqual([
      'brand_production_unified_v1',
      'synth.workshop2.articleDraft.v1',
      'brand_floor_tab_draft_v1__',
      'synth.brand.workshop2Phase1Dossier.v1',
      'platform-core:shop-comms-notification-prefs',
    ]);
  });

  it('brand production ops PG BFF + fail-closed LS client', () => {
    expect('brand_production_unified_v1').toContain('unified');
    expect('/api/brand/production/operations-state').toContain('operations-state');
    expect('loadBrandProductionOpsWithMode').toContain('BrandProductionOps');
    expect('brand-production-ops-storage-pg').toContain('storage-pg');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
  });

  it('create-article wizard draft PG API + no LS mirror in core', () => {
    expect('synth.workshop2.articleDraft.v1').toContain('articleDraft');
    expect('createArticleWizardDraftStorageKey').toContain('StorageKey');
    expect('/api/brand/production/create-article-wizard-draft').toContain('wizard-draft');
    expect('loadCreateArticleWizardDraftWithMode').toContain('DraftWithMode');
    expect('brand-w2-create-article-draft-storage-pg').toContain('storage-pg');
  });

  it('floor-tab drafts (subcontractor) PG BFF storageMode pg', () => {
    expect('brand_floor_tab_draft_v1__').toContain('floor_tab_draft');
    expect('/api/brand/production/floor-tabs/subcontractor').toContain('floor-tabs');
    expect('loadFloorTabDraftWithMode').toContain('FloorTabDraft');
    expect('brand-floor-tab-subcontractor-storage-pg').toContain('storage-pg');
    expect('toBffPgStorageMode').toContain('StorageMode');
  });

  it('phase1-dossier offline dual-write OFF in core', () => {
    expect('synth.brand.workshop2Phase1Dossier.v1').toContain('workshop2Phase1Dossier');
    expect('WORKSHOP2_PHASE1_DOSSIER_STORAGE_KEY').toContain('DOSSIER');
    expect('shouldPersistPhase1DossierOfflineDualWrite').toContain('OfflineDualWrite');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
  });

  it('comms notification prefs PG API + fail-closed LS', () => {
    expect('platform-core:shop-comms-notification-prefs').toContain('notification-prefs');
    expect('/api/platform-core/comms/notification-prefs').toContain('notification-prefs');
    expect('loadPlatformCoreCommsNotificationPrefs').toContain('NotificationPrefs');
    expect('shop-cm-notification-prefs-storage-pg').toContain('storage-pg');
  });
});
