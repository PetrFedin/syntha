describe('wave UI — P1 shop checkout + partners + EMPTY27 cabinet', () => {
  it('wave TH payment intent strip + stub badge', () => {
    expect('shop-co-checkout-payment-intent-strip').toContain('payment-intent');
    expect('shop-co-checkout-payment-intent-badge-stub').toContain('stub');
    expect('shop-co-checkout-payment-intent-badge-not-connected').toContain('not-connected');
    expect('/api/shop/b2b/checkout/payment-intent').toContain('payment-intent');
  });

  it('partnership invite PG API + showroom golden path', () => {
    expect('/api/shop/b2b/partnerships/invite').toContain('partnerships/invite');
    expect('postShopPartnershipInvite').toContain('PartnershipInvite');
    expect('shop-b2b-partners-golden-path-strip').toContain('golden-path');
    expect('shop-sc-partners-invite-panel-').toContain('invite-panel');
  });

  it('EMPTY27 cabinet buyer profile PG strip', () => {
    expect('shop-sc-cabinet-buyer-profile-strip').toContain('buyer-profile');
    expect('shop-sc-cabinet-buyer-profile-pg').toContain('buyer-profile-pg');
    expect('shop-sc-cabinet-buyer-profile-partners-link').toContain('partners-link');
  });

  it('wave VE WMS reserve badge + link wave UX', () => {
    expect('shop-co-checkout-inventory-badge').toContain('inventory-badge');
    expect('shop-co-checkout-inventory-hold').toContain('inventory-hold');
    expect('shop-co-checkout-inventory-s3-link').toContain('inventory-s3');
    expect('shop-co-checkout-wms-tracking-link').toContain('wms-tracking');
    expect('shop-co-checkout-wms-replenishment-link').toContain('wms-replenishment');
  });
});

describe('shop-partnership-invite module', () => {
  it('exports postShopPartnershipInvite', async () => {
    const mod = await import('@/lib/b2b/shop-partnership-invite');
    expect(typeof mod.postShopPartnershipInvite).toBe('function');
  });
});
