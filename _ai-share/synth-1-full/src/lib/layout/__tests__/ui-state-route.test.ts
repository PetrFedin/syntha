import { shouldMountUIStateProvider } from '@/lib/layout/ui-state-route';

describe('shouldMountUIStateProvider', () => {
  it('mounts on public commerce and brand routes but skips the investor brief', () => {
    expect(shouldMountUIStateProvider('/')).toBe(true);
    expect(shouldMountUIStateProvider('/investors')).toBe(false);
    expect(shouldMountUIStateProvider('/investors/preview')).toBe(false);
    expect(shouldMountUIStateProvider('/brand/production')).toBe(true);
    expect(shouldMountUIStateProvider('/brand/settings')).toBe(true);
  });

  it('skips factory/distributor/admin/shop except settings', () => {
    expect(shouldMountUIStateProvider('/factory/production')).toBe(false);
    expect(shouldMountUIStateProvider('/factory/supplier/orders')).toBe(false);
    expect(shouldMountUIStateProvider('/distributor/inventory')).toBe(false);
    expect(shouldMountUIStateProvider('/admin/users')).toBe(false);
    expect(shouldMountUIStateProvider('/admin/calendar')).toBe(true);
    expect(shouldMountUIStateProvider('/factory/production/calendar')).toBe(true);
    expect(shouldMountUIStateProvider('/shop/analytics')).toBe(false);
    expect(shouldMountUIStateProvider('/shop/b2b/orders')).toBe(true);

    expect(shouldMountUIStateProvider('/factory/settings')).toBe(true);
    expect(shouldMountUIStateProvider('/factory/production/settings')).toBe(true);
    expect(shouldMountUIStateProvider('/distributor/settings')).toBe(true);
    expect(shouldMountUIStateProvider('/admin/settings')).toBe(true);
    expect(shouldMountUIStateProvider('/shop/settings')).toBe(true);
  });

  it('mounts UI state only on selected client routes', () => {
    expect(shouldMountUIStateProvider('/client/me')).toBe(true);
    expect(shouldMountUIStateProvider('/client/me/wardrobe')).toBe(true);
    expect(shouldMountUIStateProvider('/client/wishlist')).toBe(true);
    expect(shouldMountUIStateProvider('/client/my-outfits')).toBe(true);

    expect(shouldMountUIStateProvider('/client')).toBe(false);
    expect(shouldMountUIStateProvider('/client/wardrobe')).toBe(false);
    expect(shouldMountUIStateProvider('/client/passport')).toBe(false);
  });

  it('skips academy and wallet cabinets', () => {
    expect(shouldMountUIStateProvider('/academy/courses')).toBe(false);
    expect(shouldMountUIStateProvider('/wallet')).toBe(false);
  });
});
