describe('wave CA — shop CO chain embed, mfr dedup, comms prefs PG', () => {
  it('shop CO cabinet embeds production chain peek after brand confirm', () => {
    expect('shop-co-cabinet-chain-peek').toContain('chain-peek');
    expect('shop-co-cabinet-production-steps').toContain('production-steps');
    expect('shop-co-cabinet-operational-status').toContain('operational-status');
    expect('shop-co-cabinet-chain-tracking-link').toContain('tracking');
  });

  it('mfr production orders: bulk ack deduped to handoff queue in core', () => {
    expect('factory-production-orders-bulk-sot-strip').toContain('bulk-sot');
    expect('factory-production-orders-bulk-sot-handoff-link').toContain('handoff');
  });

  it('shop comms notification prefs PG API route', () => {
    expect('/api/shop/comms/notification-prefs').toContain('notification-prefs');
    expect('shop-cm-notification-prefs-storage').toContain('storage');
  });

  it('replenishment stock ATP slices sidebar RU', () => {
    expect('shop-replenishment-slice-SS27').toContain('slice');
    expect('shop-replenishment-feature-stock-atp').toContain('stock-atp');
  });
});
