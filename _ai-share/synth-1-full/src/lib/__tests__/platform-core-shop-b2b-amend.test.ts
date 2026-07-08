import { canShopAmendOrder } from '@/lib/platform-core-shop-b2b-amend';

describe('canShopAmendOrder', () => {
  it('returns false for brand variant', () => {
    expect(
      canShopAmendOrder({
        variant: 'brand',
        chainSteps: [
          { id: 'shop_sent', done: true },
          { id: 'brand_confirmed', done: false },
        ],
      })
    ).toBe(false);
  });

  it('uses chain steps when present', () => {
    expect(
      canShopAmendOrder({
        variant: 'shop',
        chainSteps: [
          { id: 'shop_sent', done: true },
          { id: 'brand_confirmed', done: false },
        ],
      })
    ).toBe(true);
    expect(
      canShopAmendOrder({
        variant: 'shop',
        chainSteps: [
          { id: 'shop_sent', done: true },
          { id: 'brand_confirmed', done: true },
        ],
      })
    ).toBe(false);
  });

  it('falls back to order status when chain missing', () => {
    expect(
      canShopAmendOrder({
        variant: 'shop',
        orderStatus: 'submitted',
        poHandedOff: false,
      })
    ).toBe(true);
    expect(
      canShopAmendOrder({
        variant: 'shop',
        orderStatus: 'confirmed',
        poHandedOff: false,
      })
    ).toBe(false);
  });
});
