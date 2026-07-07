/**
 * @jest-environment node
 */
import {
  buildPlatformCoreStrictRedirectUrl,
  isPlatformCoreStrictPageAllowed,
} from '@/lib/platform-core-strict-routes';

describe('platform-core-strict-routes', () => {
  it('allows platform hub and core cabinets', () => {
    expect(isPlatformCoreStrictPageAllowed('/platform')).toBe(true);
    expect(isPlatformCoreStrictPageAllowed('/platform/b2b')).toBe(true);
    expect(isPlatformCoreStrictPageAllowed('/brand/core')).toBe(true);
    expect(isPlatformCoreStrictPageAllowed('/shop/core')).toBe(true);
    expect(isPlatformCoreStrictPageAllowed('/factory/production/core')).toBe(true);
  });

  it('blocks legacy shop b2b long tail', () => {
    expect(isPlatformCoreStrictPageAllowed('/shop/b2b/matrix')).toBe(false);
    expect(isPlatformCoreStrictPageAllowed('/shop/b2b/checkout')).toBe(false);
  });

  it('blocks archived client-b2c routes in strict mode', () => {
    expect(isPlatformCoreStrictPageAllowed('/client')).toBe(false);
    expect(isPlatformCoreStrictPageAllowed('/client/me')).toBe(false);
    expect(isPlatformCoreStrictPageAllowed('/client/wishlist')).toBe(false);
  });

  it('allows core split order detail', () => {
    expect(isPlatformCoreStrictPageAllowed('/brand/b2b-orders/B2B-DEMO-SHOP1-SS27')).toBe(true);
    expect(isPlatformCoreStrictPageAllowed('/shop/b2b/orders/B2B-DEMO-SHOP1-SS27')).toBe(true);
  });

  it('builds archived redirect query', () => {
    expect(buildPlatformCoreStrictRedirectUrl('/shop/b2b/matrix')).toContain('archived=1');
    expect(buildPlatformCoreStrictRedirectUrl('/shop/b2b/matrix')).toContain(
      'from=%2Fshop%2Fb2b%2Fmatrix'
    );
  });
});
