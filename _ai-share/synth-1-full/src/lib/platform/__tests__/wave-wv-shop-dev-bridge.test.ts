describe('wave WV — shop dev bridge (sample notify + dossier preview + wishlist PG)', () => {
  it('request sample POST → brand notification_events', () => {
    expect('/api/shop/b2b/development/request-sample').toContain('request-sample');
    expect('appendPlatformCoreNotificationEvent').toContain('Notification');
    expect('shop-dev-bridge-request-sample-preview-btn').toContain('request-sample');
    expect('shop-dev-bridge-request-sample-msg').toContain('request-sample');
  });

  it('dossier preview dialog RU read-only (no TZ edit)', () => {
    expect('shop-development-bridge-dossier-preview-dialog').toContain('preview-dialog');
    expect('shop-development-bridge-brand-w2-preview').toContain('preview');
    expect('Только просмотр прогресса разработки').toContain('просмотр');
    expect('shop-development-bridge-preview-steps').toContain('preview-steps');
  });

  it('assortment wishlist PG polish + remove', () => {
    expect('/api/shop/b2b/development/assortment-wishlist').toContain('assortment-wishlist');
    expect('replaceShopBuyerAssortmentWishlistServer').toContain('replace');
    expect('removeShopBuyerAssortmentWishlist').toContain('Wishlist');
    expect('shop-dev-bridge-wishlist-remove-').toContain('remove');
    expect('shop-dev-bridge-wishlist-storage-pg').toContain('storage-pg');
  });

  it('dedupe ShopDevelopmentBridge — peer strip owns golden path', () => {
    expect('shop-dev-bridge-peer-strip').toContain('peer-strip');
    expect('shop-development-bridge-brand-w2-preview').toContain('preview');
    expect('shop-dev-bridge-peer-w2-link').toContain('w2');
  });
});
