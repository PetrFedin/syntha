/**
 * Demo href builders для hub-матрицы (коллекция / заказ / артикул).
 */
import { ROUTES, factoryProductionHandoffQueueHref } from '@/lib/platform-core-routes';
import { PLATFORM_CORE_DEMO, type PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';
import { appendPlatformCoreContextToHref } from '@/lib/platform-core-hub-matrix-context';

/** Материалы цеха с контекстом demo-артикула (P1: BOM bridge). */
export function factoryMaterialsHrefForDemo(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  const params = new URLSearchParams({
    collection: demo.collectionId,
    article: demo.demoArticleId,
    view: 'development',
  });
  return `${ROUTES.factory.productionMaterials}?${params.toString()}`;
}

/** Каталог материалов поставщика (CRUD listing). */
export function factoryMaterialsCatalogHrefForDemo(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  const params = new URLSearchParams({ collection: demo.collectionId });
  return `${ROUTES.factory.productionCatalog}?${params.toString()}`;
}

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

/** Очередь handoff цеха с контекстом demo-заказа. */
export function factoryHandoffQueueHrefForDemo(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  return factoryProductionHandoffQueueHref(demo.demoOrderId, {
    factoryId: demo.factoryId,
    collectionId: demo.collectionId,
  });
}

/** BOM × qty производственного заказа — столп order_production (цех read / поставщик write). */
export function factoryMaterialsProcurementHrefForDemo(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO,
  opts?: { role?: 'manufacturer' | 'supplier' }
): string {
  const params = new URLSearchParams({
    collection: demo.collectionId,
    article: demo.demoArticleId,
    view: 'procurement',
    po: demo.productionOrderId,
    order: demo.demoOrderId,
    orderId: demo.demoOrderId,
  });
  if (opts?.role === 'supplier') params.set('role', 'supplier');
  const base = `${ROUTES.factory.productionMaterials}?${params.toString()}`;
  return appendPlatformCoreContextToHref(base, demo);
}
