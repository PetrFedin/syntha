import { shouldMountB2BStateProvider } from '@/lib/layout/b2b-state-route';

describe('shouldMountB2BStateProvider', () => {
  it('mounts on public routes', () => {
    expect(shouldMountB2BStateProvider('/')).toBe(true);
    expect(shouldMountB2BStateProvider('/catalog')).toBe(true);
  });

  it('mounts on shop/brand Platform Core cabinets', () => {
    expect(shouldMountB2BStateProvider('/shop/core')).toBe(true);
    expect(shouldMountB2BStateProvider('/brand/core')).toBe(true);
  });

  it('mounts on brand and shop hub / B2B cabinets', () => {
    expect(shouldMountB2BStateProvider('/brand/production')).toBe(true);
    expect(shouldMountB2BStateProvider('/shop')).toBe(true);
    expect(shouldMountB2BStateProvider('/shop/b2b/orders')).toBe(true);
  });

  it('skips shop retail subroutes without B2B tree', () => {
    expect(shouldMountB2BStateProvider('/shop/analytics')).toBe(false);
    expect(shouldMountB2BStateProvider('/shop/bopis')).toBe(false);
  });

  it('skips lightweight cabinets without B2B tree', () => {
    expect(shouldMountB2BStateProvider('/factory/production')).toBe(false);
    expect(shouldMountB2BStateProvider('/distributor')).toBe(false);
    expect(shouldMountB2BStateProvider('/client/me')).toBe(false);
    expect(shouldMountB2BStateProvider('/admin/users')).toBe(false);
    expect(shouldMountB2BStateProvider('/academy/courses')).toBe(false);
    expect(shouldMountB2BStateProvider('/wallet')).toBe(false);
  });
});
