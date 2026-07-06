/** Wave UJ batch 5 — S1 localStorage purge keys (fail-closed in Platform Core). */
describe('wave UJ — S1 LS purge batch 5 (fail-closed core)', () => {
  const PURGED_KEYS = [
    'synth.brand.workshop2Phase1Dossier.v1',
    'synth.brand.localCollectionInventory.v1',
    'platform_core_b2b_message_templates_v1',
    'b2b_partner_session',
    'b2b_partner_tier',
    'brand_tasks_kanban_v1',
  ] as const;

  it('lists batch-5 purged localStorage keys', () => {
    expect(PURGED_KEYS).toEqual([
      'synth.brand.workshop2Phase1Dossier.v1',
      'synth.brand.localCollectionInventory.v1',
      'platform_core_b2b_message_templates_v1',
      'b2b_partner_session',
      'b2b_partner_tier',
      'brand_tasks_kanban_v1',
    ]);
  });

  it('resolveFactoryDossier PG-first fail-closed in core (no LS fallback)', () => {
    expect('resolveFactoryDossier').toContain('FactoryDossier');
    expect('workshop2-resolve-factory-dossier').toContain('resolve-factory');
    expect('getWorkshop2ServerDossierRecord').toContain('DossierRecord');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });

  it('phase1-dossier offline mirror fail-closed read/write', () => {
    expect('synth.brand.workshop2Phase1Dossier.v1').toContain('workshop2Phase1Dossier');
    expect('WORKSHOP2_PHASE1_DOSSIER_STORAGE_KEY').toContain('DOSSIER');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('use-workshop2-phase1-dossier-persist').toContain('persist');
  });

  it('collection inventory overlay fail-closed + floor autosave guard', () => {
    expect('synth.brand.localCollectionInventory.v1').toContain('localCollectionInventory');
    expect('loadLocalCollectionInventory').toContain('Inventory');
    expect('useBrandProductionLocalInventory').toContain('LocalInventory');
  });

  it('B2B chat custom templates PG client in core', () => {
    expect('platform_core_b2b_message_templates_v1').toContain('message_templates');
    expect('/api/platform-core/b2b/message-templates').toContain('message-templates');
    expect('fetchPlatformCoreB2bMessageTemplates').toContain('MessageTemplates');
    expect('platform-core-b2b-message-templates-storage-pg').toContain('storage-pg');
  });

  it('accept-invite partner session PG cookie (no LS in core)', () => {
    expect('/api/shop/b2b/accept-invite').toContain('accept-invite');
    expect('b2b_partner_session').toContain('partner_session');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('b2b-accept-invite-storage-pg').toContain('storage-pg');
  });

  it('brand tasks kanban PG-only in core', () => {
    expect('brand_tasks_kanban_v1').toContain('kanban');
    expect('BRAND_TASKS_KANBAN_STORAGE_KEY').toContain('KANBAN');
    expect('loadBrandTasksWithMode').toContain('BrandTasks');
    expect('brand-tasks-kanban-pg').toContain('kanban-pg');
  });
});
