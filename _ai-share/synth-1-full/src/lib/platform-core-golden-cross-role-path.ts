/**
 * Wave 6 · Article Spine golden path — embedded hub, один demo orderId, native `/…/core` URL.
 * Порядок полный (15 stops): brand+shop baseline (12) + mfr/sup (3 при EXTENDED_ROLES e2e).
 * SoT для core-249 e2e (без legacy `/shop/b2b/*`).
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  PLATFORM_CORE_DEMO,
  type PlatformCoreDemoContext,
} from '@/lib/platform-core-demo-context';
import {
  BRAND_DEV_DOSSIER_SECTION,
  BRAND_DEV_W2_HUB_SECTION,
  platformCoreCabinetSectionHref,
} from '@/lib/platform-core-cabinet-workspace';
import { filterGoldenCrossRoleStopsForBaseline } from '@/lib/platform-core-article-spine';

export type GoldenCrossRoleStop = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  sectionId: string;
  labelRu: string;
  href: string;
  workspaceTestId: string;
  panelTestId: string;
};

type StopTemplate = Omit<GoldenCrossRoleStop, 'href'> & {
  buildHref: (demo: PlatformCoreDemoContext) => string;
};

/** Порядок = `PLATFORM_CORE_ARTICLE_SPINE_STAGES` (см. platform-core-article-spine.ts). */
const GOLDEN_CROSS_ROLE_STOP_TEMPLATES: readonly StopTemplate[] = [
  {
    roleId: 'brand',
    pillarId: 'development',
    sectionId: BRAND_DEV_W2_HUB_SECTION,
    labelRu: 'Артикулы · hub',
    workspaceTestId: 'brand-development-cabinet-workspace',
    panelTestId: 'brand-dev-w2-hub-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('brand', 'development', BRAND_DEV_W2_HUB_SECTION, d),
  },
  {
    roleId: 'brand',
    pillarId: 'development',
    sectionId: BRAND_DEV_DOSSIER_SECTION,
    labelRu: 'Досье · ТЗ',
    workspaceTestId: 'brand-development-cabinet-workspace',
    panelTestId: 'brand-dev-dossier-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('brand', 'development', BRAND_DEV_DOSSIER_SECTION, d),
  },
  {
    roleId: 'brand',
    pillarId: 'sample_collection',
    sectionId: 'brand-sc-linesheets',
    labelRu: 'Лайншиты',
    workspaceTestId: 'role-pillar-insight-brand-sample_collection',
    panelTestId: 'brand-sc-cabinet-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('brand', 'sample_collection', 'brand-sc-linesheets', d),
  },
  {
    roleId: 'brand',
    pillarId: 'sample_collection',
    sectionId: 'brand-sc-showroom',
    labelRu: 'Витрина бренда',
    workspaceTestId: 'role-pillar-insight-brand-sample_collection',
    panelTestId: 'brand-sc-cabinet-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('brand', 'sample_collection', 'brand-sc-showroom', d),
  },
  {
    roleId: 'shop',
    pillarId: 'sample_collection',
    sectionId: 'shop-sc-showroom',
    labelRu: 'Витрина · коллекции',
    workspaceTestId: 'role-pillar-insight-shop-sample_collection',
    panelTestId: 'shop-sc-cabinet-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('shop', 'sample_collection', 'shop-sc-showroom', d),
  },
  {
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-matrix',
    labelRu: 'Матрица',
    workspaceTestId: 'shop-collection-order-cabinet-workspace',
    panelTestId: 'shop-co-matrix-embedded-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('shop', 'collection_order', 'shop-co-matrix', d),
  },
  {
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-checkout',
    labelRu: 'Оформление',
    workspaceTestId: 'shop-collection-order-cabinet-workspace',
    panelTestId: 'shop-co-checkout-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('shop', 'collection_order', 'shop-co-checkout', d),
  },
  {
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-registry',
    labelRu: 'Реестр заказов',
    workspaceTestId: 'shop-collection-order-cabinet-workspace',
    panelTestId: 'shop-co-registry-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('shop', 'collection_order', 'shop-co-registry', d),
  },
  {
    roleId: 'shop',
    pillarId: 'collection_order',
    sectionId: 'shop-co-detail',
    labelRu: 'Карточка заказа',
    workspaceTestId: 'shop-collection-order-cabinet-workspace',
    panelTestId: 'shop-co-detail-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('shop', 'collection_order', 'shop-co-detail', d),
  },
  {
    roleId: 'brand',
    pillarId: 'collection_order',
    sectionId: 'brand-co-registry',
    labelRu: 'Реестр оптовых заказов',
    workspaceTestId: 'brand-collection-order-cabinet-workspace',
    panelTestId: 'brand-co-registry-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('brand', 'collection_order', 'brand-co-registry', d),
  },
  {
    roleId: 'brand',
    pillarId: 'collection_order',
    sectionId: 'brand-co-detail',
    labelRu: 'Карточка заказа',
    workspaceTestId: 'brand-collection-order-cabinet-workspace',
    panelTestId: 'brand-order-comms-detail-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('brand', 'collection_order', 'brand-co-detail', d),
  },
  {
    roleId: 'brand',
    pillarId: 'order_production',
    sectionId: 'brand-op-handoff',
    labelRu: 'Исполнение · передача',
    workspaceTestId: 'role-pillar-insight-brand-order_production',
    panelTestId: 'brand-op-cabinet-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('brand', 'order_production', 'brand-op-handoff', d),
  },
  {
    roleId: 'manufacturer',
    pillarId: 'order_production',
    sectionId: 'mfr-op-handoff-queue',
    labelRu: 'Очередь передачи',
    workspaceTestId: 'manufacturer-order-production-cabinet-workspace',
    panelTestId: 'mfr-op-handoff-queue-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref(
        'manufacturer',
        'order_production',
        'mfr-op-handoff-queue',
        d
      ),
  },
  {
    roleId: 'manufacturer',
    pillarId: 'order_production',
    sectionId: 'mfr-op-production-orders',
    labelRu: 'Производственные заказы',
    workspaceTestId: 'manufacturer-order-production-cabinet-workspace',
    panelTestId: 'factory-production-orders-core',
    buildHref: (d) =>
      platformCoreCabinetSectionHref(
        'manufacturer',
        'order_production',
        'mfr-op-production-orders',
        d
      ),
  },
  {
    roleId: 'supplier',
    pillarId: 'order_production',
    sectionId: 'sup-op-procurement',
    labelRu: 'Закупка под PO',
    workspaceTestId: 'supplier-order-production-cabinet-workspace',
    panelTestId: 'supplier-procurement-bom-panel',
    buildHref: (d) =>
      platformCoreCabinetSectionHref('supplier', 'order_production', 'sup-op-procurement', d),
  },
] as const;

export function goldenCrossRoleOrderId(
  demo: Pick<PlatformCoreDemoContext, 'demoOrderId'> = PLATFORM_CORE_DEMO
): string {
  const id = demo.demoOrderId?.trim();
  return id && !id.startsWith('__') ? id : PLATFORM_CORE_DEMO.demoOrderId;
}

export function buildPlatformCoreGoldenCrossRoleStops(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): GoldenCrossRoleStop[] {
  const orderId = goldenCrossRoleOrderId(demo);
  const demoWithOrder: PlatformCoreDemoContext = { ...demo, demoOrderId: orderId };

  return GOLDEN_CROSS_ROLE_STOP_TEMPLATES.map((stop) => ({
    roleId: stop.roleId,
    pillarId: stop.pillarId,
    sectionId: stop.sectionId,
    labelRu: stop.labelRu,
    workspaceTestId: stop.workspaceTestId,
    panelTestId: stop.panelTestId,
    href: stop.buildHref(demoWithOrder),
  }));
}

/** UI/e2e baseline: brand + shop; mfr/sup — только с `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`. */
export function buildPlatformCoreGoldenCrossRoleStopsForUi(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): GoldenCrossRoleStop[] {
  return filterGoldenCrossRoleStopsForBaseline(buildPlatformCoreGoldenCrossRoleStops(demo));
}

export function isNativeGoldenCrossRoleHref(href: string): boolean {
  if (!href.trim()) return false;
  if (href.includes('/shop/b2b/')) return false;
  if (href.includes('/brand/b2b-orders')) return false;
  return (
    href.includes('/brand/core') ||
    href.includes('/shop/core') ||
    href.includes('/factory/production/core') ||
    href.includes('/factory/supplier/core')
  );
}
