import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import { ROUTES } from '@/lib/routes';
import {
  isShopB2bCoreAllowedPath,
  isShopB2bGoldenPath,
} from '@/lib/platform-core-shop-b2b-golden-paths';

describe('platform-core-shop-b2b-golden-paths', () => {
  it('golden paths include showroom, matrix, orders detail', () => {
    expect(isShopB2bGoldenPath('/shop/b2b/showroom')).toBe(true);
    expect(isShopB2bGoldenPath('/shop/b2b/matrix')).toBe(true);
    expect(isShopB2bGoldenPath('/shop/b2b/orders/B2B-DEMO-SHOP1-SS27')).toBe(true);
    expect(isShopB2bGoldenPath('/shop/b2b/partners/discover')).toBe(true);
    expect(isShopB2bGoldenPath(LEGACY_ROUTES.shop.b2bCollaborativeOrder)).toBe(true);
    expect(isShopB2bGoldenPath(LEGACY_ROUTES.shop.b2bReplenishment)).toBe(true);
    expect(isShopB2bGoldenPath(LEGACY_ROUTES.shop.b2bMarginAnalysis)).toBe(true);
    expect(isShopB2bGoldenPath(LEGACY_ROUTES.shop.b2bSalesRepPortal)).toBe(true);
    expect(isShopB2bGoldenPath(ROUTES.shop.b2bWorkingOrder)).toBe(true);
  });

  it('side-paths are not golden', () => {
    expect(isShopB2bGoldenPath('/shop/b2b/tenders')).toBe(false);
    expect(isShopB2bGoldenPath('/shop/b2b/finance')).toBe(false);
    expect(isShopB2bGoldenPath('/shop/b2b/social-feed')).toBe(false);
  });

  it('registered legacy redirects are allowed without golden flag', () => {
    expect(isShopB2bCoreAllowedPath(LEGACY_ROUTES.shop.b2bCatalog)).toBe(true);
    expect(isShopB2bCoreAllowedPath('/shop/b2b/tenders')).toBe(false);
    expect(isShopB2bCoreAllowedPath('/shop/b2b/finance')).toBe(false);
  });
});
