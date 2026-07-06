import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { buildPlatformCoreShopCoGoldenPathSession } from '@/lib/platform-core-shop-co-golden-path';

describe('platform-core-shop-co-golden-path', () => {
  it('builds native /shop/core hrefs with section for matrix and checkout', () => {
    const session = buildPlatformCoreShopCoGoldenPathSession({
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
    });

    expect(session.matrixHref).toContain('/shop/core');
    expect(session.matrixHref).toContain('section=shop-co-matrix');
    expect(session.matrixHref).toContain('pcf=matrix');

    expect(session.checkoutHref).toContain('/shop/core');
    expect(session.checkoutHref).toContain('section=shop-co-checkout');
    expect(session.checkoutHref).not.toContain('/shop/b2b/');

    expect(session.registryHref).toContain('section=shop-co-registry');
    expect(session.trackingHref).toContain('section=shop-co-buyer-tracking');
  });
});
