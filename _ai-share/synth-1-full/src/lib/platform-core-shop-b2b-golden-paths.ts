import { ROUTES } from '@/lib/platform-core-routes';
import { PLATFORM_CORE_SHOP_B2B_LEGACY_REDIRECTS } from '@/lib/platform-core-shop-b2b-legacy-redirects';

export function normalizeShopB2bPathname(pathname: string): string {
  return (pathname || '').split('?')[0].replace(/\/$/, '') || '/';
}

const SHOP_B2B_GOLDEN_EXACT = new Set([
  '/shop/b2b',
  ROUTES.shop.b2bShowroom,
  ROUTES.shop.b2bMatrix,
  ROUTES.shop.b2bCheckout,
  ROUTES.shop.b2bOrders,
  ROUTES.shop.b2bTracking,
  ROUTES.shop.b2bCalendar,
  ROUTES.shop.b2bPartners,
  ROUTES.shop.b2bPartnersDiscover,
  ROUTES.shop.b2bCollaborativeOrder,
  ROUTES.shop.b2bReplenishment,
  ROUTES.shop.b2bMarginAnalysis,
  ROUTES.shop.b2bSalesRepPortal,
  ROUTES.shop.b2bWorkingOrder,
]);

/** Рабочие экраны golden path — без mock side-paths. */
export function isShopB2bGoldenPath(pathname: string): boolean {
  const base = normalizeShopB2bPathname(pathname);
  if (SHOP_B2B_GOLDEN_EXACT.has(base)) return true;
  if (base.startsWith('/shop/b2b/orders/')) return true;
  if (base.startsWith('/shop/b2b/partners/')) return true;
  return false;
}

/** Golden path или явное правило в `PLATFORM_CORE_SHOP_B2B_LEGACY_REDIRECTS`. */
export function isShopB2bCoreAllowedPath(pathname: string): boolean {
  const base = normalizeShopB2bPathname(pathname);
  if (isShopB2bGoldenPath(base)) return true;
  return PLATFORM_CORE_SHOP_B2B_LEGACY_REDIRECTS.some((rule) => rule.path === base);
}
