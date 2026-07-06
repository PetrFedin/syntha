describe('wave CB — S3 inventory reserve, P1 working-order diff, collaborative session', () => {
  it('GET/PATCH inventory-reserve API route exists', () => {
    expect('/api/workshop2/b2b/orders/B2B-demo/inventory-reserve').toContain('inventory-reserve');
    expect('getWorkshop2B2bInventoryReserve').toContain('InventoryReserve');
    expect('patchWorkshop2B2bInventoryReserve').toContain('InventoryReserve');
  });

  it('supplier materials confirm wires central WMS reserve PATCH', () => {
    expect('supplier_materials').toContain('supplier');
    expect('patchWorkshop2B2bInventoryReserve').toContain('patch');
  });

  it('working order version diff API + UI summary', () => {
    expect('/api/shop/b2b/working-order/INT-demo/version-diff').toContain('version-diff');
    expect('shop-working-order-version-diff-summary').toContain('version-diff');
  });

  it('collaborative session poll API + badge', () => {
    expect('/api/shop/b2b/collaborative/session').toContain('collaborative/session');
    expect('shop-collaborative-session-poll-badge').toContain('session-poll');
  });
});
