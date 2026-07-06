/** Wave UB batch 4 — S1 localStorage purge keys (fail-closed in Platform Core). */
describe('wave UB — S1 LS purge batch 4 (fail-closed core)', () => {
  const PURGED_KEYS = [
    'live_process_runtime_v1',
    'synth.brand.workshop2Phase1Dossier.v1',
    'synth.brand.localCollectionInventory.v1',
    'platform_core_b2b_message_templates_v1',
    'b2b_partner_session',
    'b2b_partner_tier',
  ] as const;

  it('lists batch-4 purged localStorage keys', () => {
    expect(PURGED_KEYS).toEqual([
      'live_process_runtime_v1',
      'synth.brand.workshop2Phase1Dossier.v1',
      'synth.brand.localCollectionInventory.v1',
      'platform_core_b2b_message_templates_v1',
      'b2b_partner_session',
      'b2b_partner_tier',
    ]);
  });

  it('live-process runtime API-only in core + storage badge', () => {
    expect('live_process_runtime_v1').toContain('live_process_runtime');
    expect('/api/processes/sample-collection/runtime').toContain('/runtime');
    expect('useLiveProcessRuntime').toContain('LiveProcess');
    expect('live-process-runtime-storage-pg').toContain('storage-pg');
  });

  it('phase1-dossier offline dual-write off in core', () => {
    expect('synth.brand.workshop2Phase1Dossier.v1').toContain('workshop2Phase1Dossier');
    expect('WORKSHOP2_PHASE1_DOSSIER_STORAGE_KEY').toContain('DOSSIER');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
  });

  it('collection inventory overlay fail-closed + floor autosave guard', () => {
    expect('synth.brand.localCollectionInventory.v1').toContain('localCollectionInventory');
    expect('loadLocalCollectionInventory').toContain('Inventory');
    expect('useBrandProductionLocalInventory').toContain('LocalInventory');
  });

  it('B2B chat custom templates PG client in core', () => {
    expect('platform_core_b2b_message_templates_v1').toContain('message_templates');
    expect('/api/platform-core/b2b/message-templates').toContain('message-templates');
    expect('platform-core-b2b-message-templates-storage-pg').toContain('storage-pg');
  });

  it('accept-invite partner session PG cookie (no LS in core)', () => {
    expect('/api/shop/b2b/accept-invite').toContain('accept-invite');
    expect('b2b_partner_session').toContain('partner_session');
    expect('b2b-accept-invite-storage-pg').toContain('storage-pg');
  });
});
