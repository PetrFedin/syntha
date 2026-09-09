import { isCabinetPathname } from '@/lib/layout/cabinet-route-match';
import { isInvestorBriefPathname } from '@/lib/investors/investor-brief-route';

/** Кабинеты без useB2BState / useUserContext в дереве страниц — не грузим b2b-state chunk. */
const B2B_LIGHT_CABINET_PREFIXES = [
  '/admin',
  '/factory',
  '/distributor',
  '/client',
  '/academy',
  '/wallet',
] as const;

function isShopRetailWithoutB2b(pathname: string): boolean {
  if (!pathname.startsWith('/shop')) return false;
  if (pathname.startsWith('/shop/b2b')) return false;
  /** Platform Core `/shop/core` — embedded matrix/checkout через useB2BState. */
  if (pathname.startsWith('/shop/core')) return false;
  const normalized = pathname.replace(/\/$/, '') || '/';
  /** Hub `/shop` вызывает useUserContext → useB2BState. */
  if (normalized === '/shop') return false;
  return true;
}

/**
 * Нужен ли `B2BStateProvider` (тяжёлый mock + products import).
 * Public shell, `/brand/*`, `/shop/b2b/*`, hub `/shop` — да; investor brief,
 * retail `/shop/*` (кроме hub) и light cabinets — нет.
 */
export function shouldMountB2BStateProvider(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  if (isInvestorBriefPathname(pathname)) return false;
  if (!isCabinetPathname(pathname)) return true;

  const normalized = pathname.replace(/\/$/, '') || '/';

  if (isShopRetailWithoutB2b(normalized)) return false;

  const isLightCabinet = B2B_LIGHT_CABINET_PREFIXES.some((prefix) => {
    const root = prefix.replace(/\/$/, '') || '/';
    return normalized === root || normalized.startsWith(`${root}/`);
  });
  return !isLightCabinet;
}
