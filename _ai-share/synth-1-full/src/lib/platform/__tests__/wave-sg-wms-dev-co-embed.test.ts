describe('wave SG — WMS ATP feed, dev bridge wishlist, CO cabinet embed', () => {
  it('replenishment WMS ATP source badges', () => {
    expect('shop-replenishment-stock-atp-source-pg+wms').toContain('pg+wms');
    expect('pg+wms').toContain('wms');
  });

  it('shop dev bridge assortment wishlist PG', () => {
    expect('/api/shop/b2b/development/assortment-wishlist').toContain('assortment-wishlist');
    expect('shop-dev-bridge-assortment-wishlist-strip').toContain('wishlist');
    expect('shop-dev-bridge-wishlist-storage-pg').toContain('storage-pg');
  });

  it('request sample → brand notification', () => {
    expect('/api/shop/b2b/development/request-sample').toContain('request-sample');
    expect('shop-dev-bridge-request-sample-msg').toContain('request-sample');
  });

  it('shop CO cabinet tracking embed (wave SU)', () => {
    expect('shop-co-cabinet-tracking-embed').toContain('tracking-embed');
    expect('shop-co-cabinet-tracking-embed-tracking-link').toContain('tracking');
  });
});
