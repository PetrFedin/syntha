import {
  isLegacyOperationalB2bOrderId,
  isPlatformCoreDemoB2bOrder,
  isPlatformCorePgB2bOrder,
  isPlatformCoreWholesaleOrderId,
} from '@/lib/platform-core-demo-order';
import { resolveBrandB2bLegacyRedirect } from '@/lib/platform-core-brand-b2b-legacy-redirects';
import { ROUTES } from '@/lib/routes';

describe('platform-core-demo-order', () => {
  it('treats demo and PG registry ids as core B2B orders', () => {
    expect(isPlatformCorePgB2bOrder('B2B-DEMO-SHOP1-SS27')).toBe(true);
    expect(isPlatformCorePgB2bOrder('B2B-DEMO-SHOP1-FW27')).toBe(true);
    expect(isPlatformCorePgB2bOrder('B2B-1780083154637')).toBe(true);
    expect(isPlatformCoreDemoB2bOrder('B2B-DEMO-SHOP1-SS27')).toBe(true);
  });

  it('isPlatformCoreWholesaleOrderId aliases pg B2B ids', () => {
    expect(isPlatformCoreWholesaleOrderId('B2B-DEMO-SHOP1-SS27')).toBe(true);
    expect(isPlatformCoreWholesaleOrderId('B2B-1780083154637')).toBe(true);
    expect(isPlatformCoreWholesaleOrderId('B2B-0012')).toBe(false);
  });

  it('excludes legacy JOOR snapshot ids (B2B-00xx)', () => {
    expect(isLegacyOperationalB2bOrderId('B2B-0012')).toBe(true);
    expect(isPlatformCorePgB2bOrder('B2B-0012')).toBe(false);
    expect(isPlatformCorePgB2bOrder('B2B-0013')).toBe(false);
  });

  it('rejects empty and non-B2B ids', () => {
    expect(isPlatformCorePgB2bOrder('')).toBe(false);
    expect(isPlatformCorePgB2bOrder('ORD-4521')).toBe(false);
  });
});

describe('platform-core-brand-b2b-legacy-redirects', () => {
  it('redirects brand B2B side-paths to core registry', () => {
    const live = resolveBrandB2bLegacyRedirect(`${ROUTES.brand.b2bOrders}/live`);
    expect(live?.href).toBe(ROUTES.brand.b2bOrders);
    expect(live?.testId).toBe('platform-core-brand-b2b-live-legacy-redirect');

    const approval = resolveBrandB2bLegacyRedirect(`${ROUTES.brand.b2bOrders}/approval-live`);
    expect(approval?.href).toBe(ROUTES.brand.b2bOrders);

    expect(resolveBrandB2bLegacyRedirect(ROUTES.brand.b2bOrders)).toBeNull();
    expect(
      resolveBrandB2bLegacyRedirect(`${ROUTES.brand.b2bOrders}/B2B-DEMO-SHOP1-SS27`)
    ).toBeNull();
  });

  it('redirects trade-shows and showroom legacy tabs with collection context', () => {
    const tradeShows = resolveBrandB2bLegacyRedirect(ROUTES.brand.tradeShows, 'FW27');
    expect(tradeShows?.href).toBe('/brand/linesheets?collection=FW27');
    expect(tradeShows?.testId).toBe('platform-core-brand-trade-shows-legacy-redirect');

    const banners = resolveBrandB2bLegacyRedirect(`${ROUTES.brand.showroom}/banners`, 'FW27');
    expect(banners?.href).toBe(`${ROUTES.brand.showroom}?collection=FW27`);
    expect(banners?.testId).toBe('platform-core-brand-showroom-banners-legacy-redirect');

    const vr = resolveBrandB2bLegacyRedirect(ROUTES.brand.showroomVr, null);
    expect(vr?.href).toBe(`${ROUTES.brand.showroom}?collection=SS27`);

    expect(resolveBrandB2bLegacyRedirect(ROUTES.brand.showroom, null)).toBeNull();
  });
});
