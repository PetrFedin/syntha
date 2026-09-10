import { isRouteGuardPublicPath } from '@/lib/auth/route-guard-public-path';

describe('isRouteGuardPublicPath', () => {
  it('allows retail shell, product brief and legal pages', () => {
    expect(isRouteGuardPublicPath('/')).toBe(true);
    expect(isRouteGuardPublicPath('/catalog')).toBe(false);
    expect(isRouteGuardPublicPath('/terms')).toBe(true);
    expect(isRouteGuardPublicPath('/privacy')).toBe(true);
    expect(isRouteGuardPublicPath('/login')).toBe(true);
    expect(isRouteGuardPublicPath('/auth/callback')).toBe(true);
    expect(isRouteGuardPublicPath('/b/demo')).toBe(true);
    expect(isRouteGuardPublicPath('/platform')).toBe(true);
    expect(isRouteGuardPublicPath('/investors')).toBe(true);
    expect(isRouteGuardPublicPath('/investors/preview')).toBe(true);
    expect(isRouteGuardPublicPath('/o/order-1')).toBe(true);
    expect(isRouteGuardPublicPath('/s/share')).toBe(true);
  });

  it('blocks cabinets', () => {
    expect(isRouteGuardPublicPath('/brand')).toBe(false);
    expect(isRouteGuardPublicPath('/shop/b2b')).toBe(false);
    expect(isRouteGuardPublicPath('/factory/production')).toBe(false);
  });
});
