describe('wave SI — core PG read-path policy + supplier catalog nav', () => {
  it('read-path policy module exports', () => {
    expect('workshop2-pg-read-path-policy').toContain('read-path');
    expect('isWorkshop2CorePgReadPathOnly').toContain('CorePgReadPathOnly');
    expect('shouldPersistWorkshop2ClientOverlayToLocalStorage').toContain('Overlay');
  });

  it('supplier nav catalog link', () => {
    expect('materials-catalog').toContain('catalog');
    expect('/factory/production/catalog').toContain('catalog');
    expect('sup-dev-cabinet-catalog-link').toContain('catalog');
    expect('supplier-core-material-catalog-nav').toContain('catalog');
  });

  it('range planner overlay skips LS write helper', () => {
    expect('shouldPersistWorkshop2ClientOverlayToLocalStorage').toContain('LocalStorage');
  });
});
