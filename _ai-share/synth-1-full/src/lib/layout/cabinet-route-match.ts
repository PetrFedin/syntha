import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
/**
 * Маршруты с собственным cabinet chrome — без global Header/Footer и B2C overlay.
 */
import { ROUTES } from '@/lib/routes';

/** Префиксы path; `/brand` — весь хаб (ROUTES.brand.home = `/brand/profile` уже внутри). */
export const CABINET_PATH_PREFIXES = [
  '/brand',
  ROUTES.admin.home,
  ROUTES.shop.home,
  EXTENDED_ROUTES.factory.home,
  ROUTES.distributor.home,
  ROUTES.client.home,
  ROUTES.client.orders,
  ROUTES.academyPlatform,
  '/wallet',
] as const;

export function isCabinetPathname(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const normalized = pathname.replace(/\/$/, '') || '/';
  return CABINET_PATH_PREFIXES.some((prefix) => {
    const root = prefix.replace(/\/$/, '') || '/';
    return normalized === root || normalized.startsWith(`${root}/`);
  });
}
