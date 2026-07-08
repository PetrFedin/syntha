import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { buildShopLandedMarginSession } from '@/lib/b2b/shop-landed-margin';
import { shopLandedMarginTabHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { ROUTES } from '@/lib/routes';

describe('wave BS — margin host + OP/dev/supplier spine peers', () => {
  it('margin-analysis href resolves to host page', () => {
    const href = shopLandedMarginTabHref('hub', 'SS27', 'B2B-DEMO-1');
    expect(href).toContain(LEGACY_ROUTES.shop.b2bMarginAnalysis);
    expect(href).toContain('pcf=hub');
    expect('shop-landed-margin-hub-panel').toContain('hub');
  });

  it('landed margin session + CO spine peer', () => {
    const session = buildShopLandedMarginSession({ collectionId: 'SS27', orderId: 'B2B-DEMO-1' });
    expect(session.matrixHref).toContain('matrix');
    expect('shop-co-landed-margin-spine-peer-strip').toContain('spine-peer');
    expect('shop-co-landed-margin-brand-pricelist-link').toContain('pricelist');
  });

  it('shop OP cabinet and order-status spine peers', () => {
    expect('shop-op-cabinet-spine-peer-strip').toContain('spine-peer');
    expect('shop-op-cabinet-landed-margin-link').toContain('landed-margin');
    expect('shop-op-order-status-spine-peer-strip').toContain('spine-peer');
  });

  it('brand dev cabinet CO peer', () => {
    expect('brand-dev-cabinet-co-peer-strip').toContain('co-peer');
    expect('brand-dev-cabinet-shop-checkout-link').toContain('checkout');
  });

  it('supplier procurement CO peer on messages workspace', () => {
    expect('sup-op-procurement-co-peer-strip').toContain('co-peer');
    expect('sup-op-procurement-forecast-link').toContain('forecast');
  });
});
