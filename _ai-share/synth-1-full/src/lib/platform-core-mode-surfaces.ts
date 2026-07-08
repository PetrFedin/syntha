/** B2B Platform Core — отдельные экраны, не скролл-якоря на одной странице. */
export const PLATFORM_CORE_B2B_BASE = '/platform/b2b';

export const PLATFORM_CORE_B2B_MARKETROOM_HREF = `${PLATFORM_CORE_B2B_BASE}/marketroom`;

export const PLATFORM_CORE_B2B_PARTNERS_HREF = `${PLATFORM_CORE_B2B_BASE}/partners`;

/** Дефолтный вход в B2B — hub overview. */
export const PLATFORM_CORE_B2B_HUB_HREF = PLATFORM_CORE_B2B_BASE;

export const PLATFORM_CORE_B2C_HUB_HREF = '/platform';

export type PlatformCoreB2bNavView = 'hub' | 'partners' | 'marketroom';

export function isPlatformCoreB2bHubPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const base = pathname.split('#')[0] ?? pathname;
  return base === PLATFORM_CORE_B2B_BASE || base.startsWith(`${PLATFORM_CORE_B2B_BASE}/`);
}

export function isPlatformCoreB2cHubPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === PLATFORM_CORE_B2C_HUB_HREF;
}

export type PlatformCoreSurfaceMode = 'b2b' | 'b2c';

export function resolvePlatformCoreSurfaceMode(
  pathname: string | null | undefined
): PlatformCoreSurfaceMode {
  const base = pathname?.split('#')[0] ?? pathname;
  return isPlatformCoreB2bHubPath(base) ? 'b2b' : 'b2c';
}

export function resolvePlatformCoreB2bNavView(
  pathname: string | null | undefined
): PlatformCoreB2bNavView {
  const base = pathname?.split('#')[0] ?? pathname ?? '';
  if (
    base === PLATFORM_CORE_B2B_MARKETROOM_HREF ||
    base.startsWith(`${PLATFORM_CORE_B2B_MARKETROOM_HREF}?`)
  ) {
    return 'marketroom';
  }
  if (
    base === PLATFORM_CORE_B2B_PARTNERS_HREF ||
    base.startsWith(`${PLATFORM_CORE_B2B_PARTNERS_HREF}?`)
  ) {
    return 'partners';
  }
  return 'hub';
}

/** @deprecated Якоря scroll-nav; маршруты — marketroom/partners. */
export const PLATFORM_CORE_B2B_SECTION = {
  showcase: 'SHOWCASE_b2b',
  partners: 'PARTNERS_b2b',
} as const;
