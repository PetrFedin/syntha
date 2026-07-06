import { roleCoreCabinetLandingHref } from '@/lib/platform-core-cabinet-url';

describe('roleCoreCabinetLandingHref', () => {
  it('opens brand dev hub with default section', () => {
    const href = roleCoreCabinetLandingHref('brand');
    expect(href).toContain('/brand/core');
    expect(href).toContain('pillar=development');
    expect(href).toContain('section=brand-dev-w2-hub');
    expect(href).not.toContain('collection=SS27');
  });

  it('opens shop sample_collection by default', () => {
    const href = roleCoreCabinetLandingHref('shop');
    expect(href).toContain('/shop/core');
    expect(href).toContain('pillar=sample_collection');
  });
});
