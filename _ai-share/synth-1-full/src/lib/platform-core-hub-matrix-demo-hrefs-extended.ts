/**
 * Demo href builders для extended hub-матрицы (factory / supplier).
 * Baseline hub-rows не импортируют этот модуль.
 */
import {
  factoryProductionHandoffQueueHref,
  ROUTES as EXTENDED_ROUTES,
} from '@/lib/platform-core-extended-routes';
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
  return `${EXTENDED_ROUTES.factory.productionMaterials}?${params.toString()}`;
}

/** Каталог материалов поставщика (CRUD listing). */
export function factoryMaterialsCatalogHrefForDemo(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  const params = new URLSearchParams({ collection: demo.collectionId });
  return `${EXTENDED_ROUTES.factory.productionCatalog}?${params.toString()}`;
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
  const base = `${EXTENDED_ROUTES.factory.productionMaterials}?${params.toString()}`;
  return appendPlatformCoreContextToHref(base, demo);
}
