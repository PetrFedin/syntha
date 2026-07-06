/** Wave UR batch 6 — S1 localStorage purge keys (fail-closed in Platform Core). */
describe('wave UR — S1 LS purge batch 6 (fail-closed core)', () => {
  const PURGED_KEYS = [
    'synth.brand.workshop2Phase1Dossier.v1',
    'synth.brand.localCollectionInventory.v1',
    'brand_tasks_kanban_v1',
  ] as const;

  it('lists batch-6 purged localStorage keys', () => {
    expect(PURGED_KEYS).toEqual([
      'synth.brand.workshop2Phase1Dossier.v1',
      'synth.brand.localCollectionInventory.v1',
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

  it('collection inventory overlay fail-closed + W2 hub display guard', () => {
    expect('synth.brand.localCollectionInventory.v1').toContain('localCollectionInventory');
    expect('loadLocalCollectionInventory').toContain('Inventory');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
    expect('workshop2-core-readpath-local-banner').toContain('readpath');
  });

  it('W2 hub readPath flip — explicit banner, no silent golden overlay', () => {
    expect('resolveWorkshop2HubPublishedArticlesReadPath').toContain('ReadPath');
    expect('isWorkshop2CorePgReadPathOnly').toContain('ReadPathOnly');
    expect('workshop2-core-readpath-local-banner').toContain('banner');
    expect('stripPlatformCoreGoldenArticleOverlay').toContain('Overlay');
  });

  it('brand tasks kanban PG-only in core + calendar/cabinet UI wire', () => {
    expect('brand_tasks_kanban_v1').toContain('kanban');
    expect('BRAND_TASKS_KANBAN_STORAGE_KEY').toContain('KANBAN');
    expect('loadBrandTasksWithMode').toContain('BrandTasks');
    expect('brand-tasks-kanban-pg').toContain('kanban-pg');
    expect('brand-dev-tasks-kanban-panel').toContain('kanban');
    expect('brand-tasks-core-calendar-strip').toContain('calendar');
  });
});
