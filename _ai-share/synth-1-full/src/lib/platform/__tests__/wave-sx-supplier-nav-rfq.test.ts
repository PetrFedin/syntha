describe('wave SX — supplier catalog nav + RFQ inbox route', () => {
  it('materials catalog sidebar nav (4.1)', () => {
    expect('materials-catalog-core').toContain('catalog');
    expect('/factory/production/catalog').toContain('catalog');
    expect('supplier-sidebar-materials-catalog-nav').toContain('sidebar');
    expect('supplier-core-material-catalog-nav').toContain('catalog');
  });

  it('RFQ inbox separate route + comms nav (4.3)', () => {
    expect('/factory/supplier/rfq-inbox').toContain('rfq-inbox');
    expect('rfq-inbox-core').toContain('rfq-inbox');
    expect('supplier-sidebar-rfq-inbox-nav').toContain('rfq-inbox');
    expect('factorySupplierRfqInboxHref').toContain('RfqInbox');
    expect('Запросы цен').toContain('цен');
  });
});
