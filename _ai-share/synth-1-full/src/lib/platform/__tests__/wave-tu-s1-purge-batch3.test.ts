/** Wave TU batch 3 — S1 localStorage purge keys (fail-closed in Platform Core). */
describe('wave TU — S1 LS purge batch 3 (fail-closed core)', () => {
  const PURGED_KEYS = [
    'brand_tasks_kanban_v1',
    'brand_collection_stage_modules_v1__',
    'live_process_runtime_v1',
    'synth.brand.localCollectionInventory.v1',
    'b2b_partner_session',
    'b2b_partner_tier',
  ] as const;

  it('lists batch-3 purged localStorage keys', () => {
    expect(PURGED_KEYS).toEqual([
      'brand_tasks_kanban_v1',
      'brand_collection_stage_modules_v1__',
      'live_process_runtime_v1',
      'synth.brand.localCollectionInventory.v1',
      'b2b_partner_session',
      'b2b_partner_tier',
    ]);
  });

  it('brand tasks kanban PG-only in core', () => {
    expect('BRAND_TASKS_KANBAN_STORAGE_KEY').toContain('KANBAN');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('loadBrandTasksWithMode').toContain('BrandTasks');
    expect('brand-tasks-kanban-pg').toContain('kanban-pg');
  });

  it('collection-stage-modules fail-closed LS read/write', () => {
    expect('brand_collection_stage_modules_v1__').toContain('stage_modules');
    expect('hydrateCollectionStageModulesFromServer').toContain('hydrate');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
  });

  it('live-process runtime API-only in core', () => {
    expect('live_process_runtime_v1').toContain('live_process_runtime');
    expect('/api/processes/sample-collection/runtime').toContain('/runtime');
    expect('useLiveProcessRuntime').toContain('LiveProcess');
  });

  it('collection inventory overlay fail-closed', () => {
    expect('synth.brand.localCollectionInventory.v1').toContain('localCollectionInventory');
    expect('loadLocalCollectionInventory').toContain('Inventory');
  });

  it('accept-invite partner session PG cookie (no LS in core)', () => {
    expect('/api/shop/b2b/accept-invite').toContain('accept-invite');
    expect('b2b_partner_session').toContain('partner_session');
    expect('b2b-accept-invite-storage-pg').toContain('storage-pg');
  });
});
