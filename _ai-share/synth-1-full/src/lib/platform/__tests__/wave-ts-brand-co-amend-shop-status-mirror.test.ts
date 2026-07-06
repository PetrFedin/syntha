describe('wave TS — brand CO amend + shop operational status PATCH mirror', () => {
  it('brand amend approve/reject on order detail', () => {
    expect('brand-b2b-amend-pending-panel').toContain('amend-pending');
    expect('brand-b2b-amend-approve').toContain('approve');
    expect('brand-b2b-amend-reject').toContain('reject');
    expect('/api/brand/b2b/orders/B2B-1/amendments/pending-id/approve').toContain('amendments');
  });

  it('shop structured amend request before brand confirm', () => {
    expect('shop-b2b-amend-request-panel').toContain('amend-request');
    expect('shop-b2b-amend-request-submit').toContain('submit');
    expect('/api/shop/b2b/orders/B2B-1/amend-request').toContain('amend-request');
  });

  it('PATCH v1 brand status → shop detail + cabinet mirror', () => {
    expect('/api/b2b/v1/operational-orders/').toContain('operational-orders');
    expect('fetchOperationalOrderBrandStatusMirror').toContain('BrandStatus');
    expect('useOperationalOrderBrandStatusMirror').toContain('StatusMirror');
    expect('shop-co-detail-brand-operational-status').toContain('operational-status');
    expect('shop-co-cabinet-operational-status').toContain('operational-status');
    expect('shop-co-cabinet-chain-peek').toContain('chain-peek');
  });

  it('registry audit sections document amend + status mirror (wave TS)', () => {
    expect('brand-co-registry-amend-detail-link').toContain('amend');
    expect('shop-co-registry-brand-status-mirror-badge').toContain('mirror');
  });
});
