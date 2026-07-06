/**
 * @jest-environment node
 */
import { coercePlatformCoreNativeHref } from '@/lib/platform-core-native-href';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

describe('platform-core-native-href', () => {
  const prevMode = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    if (prevMode === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevMode;
  });

  it('passes through when MODE off', () => {
    delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    expect(coercePlatformCoreNativeHref('/shop/b2b/matrix?collection=SS27')).toBe(
      '/shop/b2b/matrix?collection=SS27'
    );
  });

  it('rewrites workshop2 hub to brand core development', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const href = coercePlatformCoreNativeHref(
      '/brand/production/workshop2?w2col=SS27',
      PLATFORM_CORE_DEMO
    );
    expect(href).toContain('/brand/core');
    expect(href).toContain('pillar=development');
    expect(href).toContain('collection=SS27');
  });

  it('rewrites shop b2b matrix to shop core collection_order', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const href = coercePlatformCoreNativeHref(
      '/shop/b2b/matrix?collection=SS27',
      PLATFORM_CORE_DEMO
    );
    expect(href).toContain('/shop/core');
    expect(href).toContain('pillar=collection_order');
    expect(href).not.toContain('/shop/b2b/matrix');
  });

  it('rewrites brand retailers to core collection_order', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const href = coercePlatformCoreNativeHref('/brand/retailers?collection=SS27');
    expect(href).toContain('/brand/core');
    expect(href).toContain('pillar=collection_order');
    expect(href).not.toContain('/brand/retailers');
  });

  it('rewrites shop replenishment to core collection_order', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const href = coercePlatformCoreNativeHref(
      '/shop/b2b/replenishment?collection=SS27&feature=stock-atp'
    );
    expect(href).toContain('/shop/core');
    expect(href).toContain('pillar=collection_order');
  });
});
