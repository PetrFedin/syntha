import type {
  CoreChainRoleId,
  CoreHubPillarId,
  PlatformCoreDemoContext,
} from '@/lib/platform-core-hub-matrix';
import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import { buildShopCollaborativeOrderSession } from '@/lib/b2b/shop-collaborative-order';
import { buildShopOrderCommsSession } from '@/lib/b2b/shop-order-comms';
import { buildBrandProductionHandoffSession } from '@/lib/brand-production/brand-production-handoff';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { brandDevelopmentSamplePeerHref } from '@/lib/platform-core-brand-sample-peer';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix-demo-hrefs-extended';
import {
  factoryProductionDossierHref,
  ROUTES,
  shopB2bCheckoutCollectionHref,
  shopB2bMatrixReorderHref,
} from '@/lib/routes';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';

export type PillarCrossLink = {
  id: string;
  label: string;
  href: string;
  kind: 'integration' | 'peer';
};

function activeOrderId(demo: PlatformCoreDemoContext): string | null {
  const id = demo.demoOrderId?.trim();
  if (!id || id.startsWith('__')) return null;
  return id;
}

/**
 * Курируемые cross-links столпа (замена *PeerStrip / golden path в compact).
 * Приоритет: интеграции по заказу → handoff → матрицы партнёра.
 */
export function buildPillarRegistryCrossLinks(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext
): PillarCrossLink[] {
  const collectionId = demo.collectionId;
  const orderId = activeOrderId(demo);
  const links: PillarCrossLink[] = [];

  if (roleId === 'brand' && pillarId === 'development') {
    links.push(
      {
        id: 'brand-dev-w2',
        label: 'W2 hub',
        href: `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${encodeURIComponent(collectionId)}`,
        kind: 'integration',
      },
      {
        id: 'brand-dev-planner',
        label: 'Планировщик',
        href: `${ROUTES.brand.rangePlanner}?collection=${encodeURIComponent(collectionId)}`,
        kind: 'integration',
      },
      {
        id: 'brand-dev-sample',
        label: 'Образцы → цех',
        href: brandDevelopmentSamplePeerHref(collectionId, demo.demoArticleId, {}),
        kind: 'integration',
      }
    );
  }

  if (roleId === 'brand' && pillarId === 'sample_collection') {
    links.push({
      id: 'brand-sc-publish',
      label: 'Публикация витрины',
      href: `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${encodeURIComponent(collectionId)}&feature=publish`,
      kind: 'integration',
    });
  }

  if (roleId === 'brand' && pillarId === 'collection_order' && orderId) {
    const session = buildBrandOrderCommsSession({ collectionId, orderId });
    links.push(
      {
        id: 'brand-co-shop-matrix',
        label: 'Матрица магазина',
        href: session.shopMatrixHref,
        kind: 'integration',
      },
      {
        id: 'brand-co-shop-tracking',
        label: 'Трекинг магазина',
        href: session.shopTrackingHref,
        kind: 'integration',
      }
    );
  }

  if (roleId === 'brand' && pillarId === 'order_production' && orderId) {
    const session = buildBrandProductionHandoffSession({
      orderId,
      collectionId,
      factoryId: demo.factoryId,
    });
    links.push(
      {
        id: 'brand-op-handoff',
        label: 'Передача в цех',
        href: session.handoffTabHref,
        kind: 'integration',
      },
      {
        id: 'brand-op-mfr-comms',
        label: 'Связь с цехом',
        href: session.manufacturerOrderCommsHref,
        kind: 'integration',
      },
      {
        id: 'brand-op-tracking',
        label: 'Трекинг магазина',
        href: session.shopTrackingHref,
        kind: 'integration',
      }
    );
  }

  if (roleId === 'shop' && pillarId === 'sample_collection') {
    links.push(
      {
        id: 'shop-sc-showroom',
        label: 'Витрина',
        href: `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(collectionId)}`,
        kind: 'integration',
      },
      {
        id: 'shop-sc-matrix',
        label: 'Матрица',
        href: `${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`,
        kind: 'integration',
      }
    );
  }

  if (roleId === 'shop' && pillarId === 'collection_order' && orderId) {
    const collaborative = buildShopCollaborativeOrderSession({ collectionId, orderId });
    links.push(
      {
        id: 'shop-co-matrix',
        label: 'Матрица',
        href: shopB2bMatrixReorderHref(collectionId, orderId),
        kind: 'integration',
      },
      {
        id: 'shop-co-checkout',
        label: 'Оформление',
        href: shopB2bCheckoutCollectionHref(collectionId),
        kind: 'integration',
      },
      {
        id: 'shop-co-collaborative',
        label: 'Согласования',
        href: collaborative.approvalsHref,
        kind: 'integration',
      }
    );
  }

  if (roleId === 'shop' && pillarId === 'order_production' && orderId) {
    const session = buildShopOrderCommsSession({ collectionId, orderId });
    links.push(
      {
        id: 'shop-op-tracking',
        label: 'Трекинг',
        href: session.trackingHref,
        kind: 'integration',
      },
      {
        id: 'shop-op-brand-handoff',
        label: 'Передача бренда',
        href: session.brandOrderHandoffHref,
        kind: 'integration',
      },
      {
        id: 'shop-op-inventory',
        label: 'Остатки',
        href: session.inventoryOverviewHref,
        kind: 'integration',
      }
    );
  }

  if (roleId === 'manufacturer' && pillarId === 'development') {
    links.push({
      id: 'mfr-dev-dossier',
      label: 'Досье артикула',
      href: factoryProductionDossierHref(demo.demoArticleId, { collectionId }),
      kind: 'integration',
    });
  }

  if (roleId === 'manufacturer' && pillarId === 'order_production' && orderId) {
    const session = buildManufacturerProductionOpsSession({
      collectionId,
      orderId,
      factoryId: demo.factoryId,
      articleId: demo.demoArticleId,
    });
    links.push(
      {
        id: 'mfr-op-handoff-queue',
        label: 'Очередь передачи',
        href: session.handoffQueueHref,
        kind: 'integration',
      },
      {
        id: 'mfr-op-brand-handoff',
        label: 'Передача бренда',
        href: session.brandOrderHandoffHref,
        kind: 'integration',
      },
      {
        id: 'mfr-op-materials',
        label: 'Материалы',
        href: session.materialsHref,
        kind: 'integration',
      }
    );
  }

  if (roleId === 'manufacturer' && pillarId === 'comms' && orderId) {
    links.push({
      id: 'mfr-cm-po-inbox',
      label: 'PO inbox',
      href: factoryHandoffQueueHrefForDemo(demo),
      kind: 'integration',
    });
  }

  if (roleId === 'supplier' && pillarId === 'order_production' && orderId) {
    links.push({
      id: 'sup-op-procurement',
      label: 'Подтвердить поставку',
      href: factoryMaterialsProcurementHrefForDemo(demo, { role: 'supplier' }),
      kind: 'integration',
    });
  }

  if (roleId === 'supplier' && pillarId === 'development') {
    links.push({
      id: 'sup-dev-bom',
      label: 'BOM материалов',
      href: factoryMaterialsProcurementHrefForDemo(demo, { role: 'supplier' }),
      kind: 'integration',
    });
  }

  return links;
}
