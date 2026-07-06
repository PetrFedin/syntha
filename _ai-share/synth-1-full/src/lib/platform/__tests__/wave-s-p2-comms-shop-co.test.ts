describe('wave S + P2-comms — localStorage PG purge, replenishment matrix, calendar tracking', () => {
  it('brand range planner overlay PG API', () => {
    expect('/api/brand/range-planner/overlay').toContain('range-planner/overlay');
    expect('brand-range-planner-overlay-conflict-banner').toContain('overlay-conflict');
  });

  it('sketch org templates PG API', () => {
    expect('/api/brand/sketch-org-templates').toContain('sketch-org-templates');
  });

  it('shop rep offline drafts PG storage mode', () => {
    expect('/api/shop/b2b/rep/offline-drafts').toContain('offline-drafts');
    expect('shop-agent-rep-offline-drafts-storage-mode').toContain('storage-mode');
  });

  it('replenishment matrix-lines API + hint', () => {
    expect('/api/shop/b2b/replenishment/matrix-lines').toContain('matrix-lines');
    expect('shop-replenishment-matrix-lines-hint').toContain('matrix-lines');
  });

  it('shop comms calendar event → tracking deep-link', () => {
    expect('shop-cm-notification-event-tracking-').toContain('tracking');
    expect('shop-cm-notification-tracking-link').toContain('tracking');
  });
});
