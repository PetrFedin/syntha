import {
  BRAND_SC_PUBLISH_SECTION,
  BRAND_SC_SHOWROOM_SECTION,
  brandScPublishCabinetHref,
  resolveBrandScGoldenPathOmitStep,
  resolveShopScGoldenPathOmitStep,
  shopScShowroomMatrixQuickAddHref,
} from '@/lib/platform-core-sample-collection-section';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

describe('platform-core-sample-collection-section', () => {
  it('maps brand sections to golden path omit steps', () => {
    expect(resolveBrandScGoldenPathOmitStep('brand-sc-linesheets')).toBe('linesheets');
    expect(resolveBrandScGoldenPathOmitStep('brand-sc-showroom')).toBe('showroom');
    expect(resolveBrandScGoldenPathOmitStep(BRAND_SC_PUBLISH_SECTION)).toBeUndefined();
  });

  it('maps shop showroom section to omit showroom in golden strip', () => {
    expect(resolveShopScGoldenPathOmitStep('shop-sc-showroom')).toBe('showroom');
    expect(resolveShopScGoldenPathOmitStep(undefined)).toBeUndefined();
  });

  it('builds native publish cabinet href', () => {
    const href = brandScPublishCabinetHref(PLATFORM_CORE_DEMO);
    expect(href).toContain('/brand/core');
    expect(href).toContain(`section=${BRAND_SC_PUBLISH_SECTION}`);
    expect(href).toContain('pillar=sample_collection');
  });

  it('builds matrix quick-add href with article prefill', () => {
    const href = shopScShowroomMatrixQuickAddHref('SS27', 'SS27-M-COAT-01', PLATFORM_CORE_DEMO);
    expect(href).toContain('collection=SS27');
    expect(href).toContain('article=SS27-M-COAT-01');
  });

  it('exports showroom section constant', () => {
    expect(BRAND_SC_SHOWROOM_SECTION).toBe('brand-sc-showroom');
  });
});
