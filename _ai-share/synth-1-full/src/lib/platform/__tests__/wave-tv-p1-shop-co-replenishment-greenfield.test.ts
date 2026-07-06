describe('wave TV — P1 shop CO replenishment ATP allocate + greenfield registry', () => {
  it('replenishment allocate POST from WMS ATP', () => {
    expect('/api/shop/b2b/replenishment/allocate').toContain('replenishment/allocate');
    expect('allocateShopReplenishmentFromWmsAtp').toContain('WmsAtp');
    expect('shop-replenishment-matrix-prefill').toContain('prefill');
  });

  it('matrix prefill deep-link params', () => {
    expect('replenishmentApply').toContain('replenishment');
    expect('atpQtyTotal').toContain('atp');
    expect('appliedLines').toContain('applied');
  });

  it('replenishment→matrix CTA with ATP qty', () => {
    expect('shop-replenishment-matrix-lines-apply').toContain('matrix-lines-apply');
    expect('shop-replenishment-matrix-lines-hint').toContain('matrix-lines-hint');
  });

  it('cabinet CO greenfield registry strip shop2', () => {
    expect('shop-co-greenfield-registry-strip').toContain('greenfield-registry');
    expect('shop-co-greenfield-registry-pg').toContain('registry-pg');
    expect('shop-co-greenfield-registry-matrix-seed-link').toContain('matrix-seed');
  });

  it('greenfield onboarding GET for shop2', () => {
    expect('/api/shop/b2b/greenfield/onboarding').toContain('greenfield/onboarding');
  });

  it('RU filter slice presets', () => {
    expect('Магазин 1 · SS27').toContain('SS27');
    expect('Магазин 2 · SS27').toContain('Магазин 2');
    expect('Все сезоны').toContain('сезон');
  });
});

describe('shop-replenishment-allocate-server', () => {
  it('exports WMS ATP allocate helper', async () => {
    const mod = await import('@/lib/server/shop-replenishment-allocate-server');
    expect(typeof mod.allocateShopReplenishmentFromWmsAtp).toBe('function');
  });
});

describe('shop-replenishment-matrix-prefill', () => {
  it('builds matrix href with replenishment prefill', async () => {
    const { shopReplenishmentMatrixPrefillHref } = await import(
      '@/lib/b2b/shop-replenishment-matrix-prefill'
    );
    const href = shopReplenishmentMatrixPrefillHref('SS27', 'B2B-SS27-DEMO-001', {
      appliedLines: 3,
      atpQtyTotal: 42,
      buyerId: 'shop1',
    });
    expect(href).toContain('/shop/b2b/matrix');
    expect(href).toContain('replenishmentApply=1');
    expect(href).toContain('atpQtyTotal=42');
    expect(href).toContain('appliedLines=3');
  });
});
