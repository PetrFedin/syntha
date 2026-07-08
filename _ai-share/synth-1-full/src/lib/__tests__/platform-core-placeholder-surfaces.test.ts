import {
  matchPlatformCorePlaceholderSurface,
  PLATFORM_CORE_PLACEHOLDER_SURFACES,
} from '@/lib/platform-core-placeholder-surfaces';

describe('platform-core-placeholder-surfaces', () => {
  it('lists known non-PG screens for demo badge rollout', () => {
    expect(PLATFORM_CORE_PLACEHOLDER_SURFACES.length).toBeGreaterThanOrEqual(6);
    expect(PLATFORM_CORE_PLACEHOLDER_SURFACES.some((s) => s.route === '/brand/analytics')).toBe(
      true
    );
    expect(PLATFORM_CORE_PLACEHOLDER_SURFACES.some((s) => s.route === '/shop')).toBe(true);
    expect(matchPlatformCorePlaceholderSurface('/brand/merch/assortment-mix')?.route).toBe(
      '/brand/merch'
    );
  });
});
