describe('wave SO — P1 shop CO replenishment→matrix apply + greenfield empty registry', () => {
  it('replenishment matrix-lines suggest + apply API', () => {
    expect('/api/shop/b2b/replenishment/matrix-lines').toContain('matrix-lines');
    expect('/api/shop/b2b/replenishment/matrix-lines/apply').toContain('matrix-lines/apply');
    expect('applyShopReplenishmentMatrixLines').toContain('ReplenishmentMatrix');
  });

  it('replenishment ATP panel apply CTA', () => {
    expect('shop-replenishment-matrix-lines-apply').toContain('matrix-lines-apply');
    expect('shop-replenishment-matrix-lines-hint').toContain('matrix-lines-hint');
  });

  it('empty greenfield registry PG onboarding strip', () => {
    expect('shop-co-registry-empty-greenfield-monetization-strip').toContain(
      'greenfield-monetization'
    );
    expect('shop-co-registry-greenfield-onboarding-strip').toContain('onboarding-strip');
    expect('shop-co-registry-greenfield-onboarding-matrix-seed-link').toContain('matrix-seed');
  });

  it('greenfield onboarding GET for shop2', () => {
    expect('/api/shop/b2b/greenfield/onboarding').toContain('greenfield/onboarding');
  });
});
