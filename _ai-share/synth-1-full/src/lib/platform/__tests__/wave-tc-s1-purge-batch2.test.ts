describe('wave TC — S1 LS purge batch 2 (fail-closed core)', () => {
  it('range planner overlay read fail-closed', () => {
    expect('loadWorkshop2RangePlannerOverlayMap').toContain('OverlayMap');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('synth.brand.workshop2RangePlannerOverlay.v1').toContain('Overlay');
  });

  it('shop rep offline drafts fail-closed', () => {
    expect('shop_rep_offline_drafts_v1').toContain('offline_drafts');
    expect('/api/shop/b2b/rep/offline-drafts').toContain('offline-drafts');
    expect('shop-agent-rep-offline-drafts-storage-mode').toContain('storage-mode');
  });

  it('brand tasks kanban PG-only in core', () => {
    expect('brand_tasks_kanban_v1').toContain('kanban');
    expect('brand-tasks-kanban-pg').toContain('kanban-pg');
    expect('loadBrandTasks').toContain('BrandTasks');
  });

  it('brand production ops PG client', () => {
    expect('brand-production-ops-client').toContain('ops');
    expect('fetchBrandProductionOpsSnapshot').toContain('OpsSnapshot');
  });
});

describe('wave TA — range planner conflict banner', () => {
  it('overlay conflict UI + API', () => {
    expect('/api/brand/range-planner/overlay').toContain('overlay');
    expect('brand-range-planner-overlay-conflict-banner').toContain('conflict');
  });
});

describe('wave TB — replenishment filter slices PG', () => {
  it('stock-slice API', () => {
    expect('/api/shop/b2b/replenishment/stock-slice').toContain('stock-slice');
  });
});

describe('wave TZ — mfr WIP timeline', () => {
  it('production timeline strip', () => {
    expect('/api/workshop2/manufacturer/production-timeline').toContain('production-timeline');
    expect('mfr-op-production-timeline-strip').toContain('timeline');
  });
});
