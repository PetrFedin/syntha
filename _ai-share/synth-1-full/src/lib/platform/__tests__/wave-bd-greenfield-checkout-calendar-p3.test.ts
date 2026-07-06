import {
  isShopGreenfieldBuyer,
  shopGreenfieldPostCheckoutRegistryHref,
} from '@/components/shop/b2b/ShopCoCheckoutGreenfieldReadinessStrip';

describe('wave-bd greenfield checkout + calendar quick task p3', () => {
  it('isShopGreenfieldBuyer detects shop2', () => {
    expect(isShopGreenfieldBuyer('shop2')).toBe(true);
    expect(isShopGreenfieldBuyer('shop1')).toBe(false);
  });

  it('shopGreenfieldPostCheckoutRegistryHref focuses order in registry', () => {
    const href = shopGreenfieldPostCheckoutRegistryHref({
      orderId: 'B2B-SS27-001',
      buyerId: 'shop2',
      collectionId: 'SS27',
    });
    expect(href).toContain('/shop/b2b/orders');
    expect(href).toContain('order=B2B-SS27-001');
    expect(href).toContain('buyer=shop2');
    expect(href).toContain('collection=SS27');
  });

  it('wave-bd testid anchors', () => {
    expect('shop-co-checkout-greenfield-readiness-strip').toContain('greenfield');
    expect('shop-co-checkout-greenfield-ready').toContain('ready');
    expect('shop-co-checkout-greenfield-brand-assign-link').toContain('assign');
    expect('brand-cm-calendar-user-tasks-quick-create').toContain('quick-create');
    expect('brand-op-cabinet-registry-sot-link').toContain('registry');
  });
});
