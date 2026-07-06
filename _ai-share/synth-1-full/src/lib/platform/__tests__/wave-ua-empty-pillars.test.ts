describe('wave UA — P3 empty pillars peer workspaces', () => {
  it('shop dev bridge: dossier preview + wishlist + sample request', () => {
    expect('shop-development-bridge-dossier-preview-dialog').toContain('preview-dialog');
    expect('shop-dev-bridge-assortment-wishlist-strip').toContain('wishlist');
    expect('shop-dev-bridge-request-sample-preview-btn').toContain('request-sample');
  });

  it('supplier empty SC: linesheet BOM notify strip', () => {
    expect('sup-empty-sc-linesheet-notify-strip').toContain('linesheet-notify');
    expect('sup-empty-sc-linesheet-bom-peer-link').toContain('bom-peer');
  });

  it('supplier empty CO: expected PO date from handoff queue PG', () => {
    expect('sup-empty-co-expected-po-date-strip').toContain('expected-po-date');
    expect('sup-empty-co-expected-po-date-value').toContain('value');
  });

  it('shop CO tracking embed in cabinet (not separate pillar)', () => {
    expect('shop-co-cabinet-tracking-embed').toContain('tracking-embed');
    expect('shop-co-cabinet-tracking-embed-calendar-link').toContain('calendar-link');
  });

  it('mfr empty SC: publish status + peer strip', () => {
    expect('mfr-empty-sc-peer-strip').toContain('peer-strip');
    expect('mfr-empty-sc-shop-showroom-link').toContain('showroom');
  });
});
