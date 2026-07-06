/** Wave WR — S1 top localStorage keys purge (fail-closed in Platform Core). */
describe('wave WR — S1 LS purge (fail-closed core)', () => {
  const PURGED_KEYS = [
    'synth.brand.workshop2RangePlannerOverlay.v1',
    'brand_tasks_kanban_v1',
    'platform_core_b2b_message_templates_v1',
    'shop_rep_offline_drafts_v1',
    'w2-org-sketch-pin-templates:v1:',
  ] as const;

  it('lists wave-WR purged localStorage keys', () => {
    expect(PURGED_KEYS).toEqual([
      'synth.brand.workshop2RangePlannerOverlay.v1',
      'brand_tasks_kanban_v1',
      'platform_core_b2b_message_templates_v1',
      'shop_rep_offline_drafts_v1',
      'w2-org-sketch-pin-templates:v1:',
    ]);
  });

  it('W2 range planner overlay PG API + no LS mirror in core', () => {
    expect('WORKSHOP2_RANGE_PLANNER_OVERLAY_STORAGE_KEY').toContain('OVERLAY');
    expect('/api/brand/range-planner/overlay').toContain('range-planner/overlay');
    expect('shouldPersistWorkshop2ClientOverlayToLocalStorage').toContain('Overlay');
    expect('fetchRangePlannerOverlayFromServer').toContain('Overlay');
    expect('toBffPgStorageMode').toContain('StorageMode');
  });

  it('brand tasks kanban PG-only in core + storageMode pg BFF', () => {
    expect('brand_tasks_kanban_v1').toContain('kanban');
    expect('BRAND_TASKS_KANBAN_STORAGE_KEY').toContain('KANBAN');
    expect('loadBrandTasksWithMode').toContain('BrandTasks');
    expect('/api/brand/tasks').toContain('/brand/tasks');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
  });

  it('B2B message templates fail-closed LS + PG BFF storageMode', () => {
    expect('platform_core_b2b_message_templates_v1').toContain('message_templates');
    expect('/api/platform-core/b2b/message-templates').toContain('message-templates');
    expect('platform-core-b2b-message-templates-storage-pg').toContain('storage-pg');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
  });

  it('rep offline drafts PG queue + no LS mirror in core', () => {
    expect('shop_rep_offline_drafts_v1').toContain('offline_drafts');
    expect('/api/shop/b2b/rep/offline-drafts').toContain('offline-drafts');
    expect('fetchShopRepOfflineDrafts').toContain('OfflineDrafts');
    expect('shop-agent-rep-offline-drafts-sync-queue-badge').toContain('sync-queue');
  });

  it('sketch org templates PG API + sync read fail-closed', () => {
    expect('w2-org-sketch-pin-templates').toContain('sketch-pin-templates');
    expect('sketchOrgTemplatesStorageKey').toContain('StorageKey');
    expect('/api/brand/sketch-org-templates').toContain('sketch-org-templates');
    expect('fetchOrgSketchPinTemplatesRemote').toContain('Remote');
    expect('readOrgSketchPinTemplatesSync').toContain('Sync');
  });
});
