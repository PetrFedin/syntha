/**
 * Demo href builders для hub-матрицы (коллекция / заказ / артикул) — baseline brand/shop.
 */
import { ROUTES } from '@/lib/platform-core-routes';
import { PLATFORM_CORE_DEMO, type PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';

/** Linesheets бренда с контекстом demo-коллекции. */
export function brandLinesheetsHrefForDemo(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  return `/brand/linesheets?collection=${encodeURIComponent(demo.collectionId)}`;
}

/** Showroom бренда с контекстом demo-коллекции. */
export function brandShowroomHrefForDemo(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  return `${ROUTES.brand.showroom}?collection=${encodeURIComponent(demo.collectionId)}`;
}

/** Showroom магазина с контекстом demo-коллекции. */
export function shopShowroomHrefForDemo(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  return `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(demo.collectionId)}`;
}
