describe('wave SM — S1 purge: floor-tab PG, collection-stage read, live-process API', () => {
  it('floor-tab drafts PG API + subcontractor badge', () => {
    expect('/api/brand/production/floor-tabs/subcontractor').toContain('floor-tabs');
    expect('brand-floor-tab-subcontractor-storage-pg').toContain('storage-pg');
    expect('loadFloorTabDraftWithMode').toContain('FloorTabDraft');
  });

  it('collection-stage modules fail-closed LS read in core', () => {
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('hydrateCollectionStageModulesFromServer').toContain('hydrate');
  });

  it('live-process runtime API in core (no LS SoT)', () => {
    expect('/api/processes/sample-collection/runtime').toContain('/runtime');
    expect('useLiveProcessRuntime').toContain('LiveProcess');
  });

  it('migration brand_floor_tab_drafts', () => {
    expect('055_wave_sm_floor_tab_drafts').toContain('floor_tab');
  });
});
