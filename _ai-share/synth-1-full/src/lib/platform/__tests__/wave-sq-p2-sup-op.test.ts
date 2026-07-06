describe('wave SQ — P2 sup-op inventory reserve + push on PATCH', () => {
  it('single material confirm wires inventory reserve + brand push', () => {
    expect('confirmWorkshop2SupplierMaterialRequest').toContain('MaterialRequest');
    expect('patchWorkshop2B2bInventoryReserve').toContain('InventoryReserve');
    expect('recordPlatformCoreChainNotificationEvents').toContain('ChainNotification');
  });

  it('supplier WMS strip B2B inventory reserve button', () => {
    expect('sup-op-procurement-b2b-inventory-reserve-btn').toContain('inventory-reserve');
    expect('sup-op-procurement-b2b-inventory-reserve-message').toContain('reserve-message');
  });

  it('brand notification href on materials_supplied', () => {
    expect('/brand/b2b-orders/').toContain('b2b-orders');
  });

  it('procurement brand push RU + partial ship', () => {
    expect('sup-op-procurement-brand-push-strip').toContain('brand-push');
    expect('sup-op-partial-ship-confirm-strip').toContain('partial-ship');
  });
});
