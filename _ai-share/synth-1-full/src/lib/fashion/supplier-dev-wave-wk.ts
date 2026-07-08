/**
 * Wave WK — supplier material catalog pillar nav + cabinet PG read stub + P2/price-delta RU polish.
 */
import {
  factoryMaterialsCatalogHrefForDemo,
  factoryMaterialsHrefForDemo,
  type PlatformCoreDemoContext,
} from '@/lib/platform-core-hub-matrix';
import { factorySupplierRfqInboxHref } from '@/lib/routes';

export {
  SUP_DEV_COMPARE_SUPPLIERS_P2_STRIP_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_CATALOG_LINK_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_MATERIALS_LINK_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_RFQ_LINK_TESTID,
  SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID,
  SUPPLIER_CORE_MATERIAL_CATALOG_MATERIALS_PEER_TESTID,
  SUPPLIER_CORE_MATERIAL_CATALOG_RFQ_PEER_TESTID,
  supDevCompareSuppliersHrefsForDemo,
  supDevMaterialCatalogMaterialsPeerLabelRu,
  supDevMaterialCatalogRfqPeerLabelRu,
} from '@/lib/fashion/supplier-dev-wave-vg';

/** Pillar aside nav (development context) — distinct from sidebar `supplier-sidebar-materials-catalog-nav`. */
export const SUPPLIER_DEV_PILLAR_MATERIAL_CATALOG_NAV_TESTID =
  'supplier-dev-pillar-material-catalog-nav';

export const SUPPLIER_MATERIAL_CATALOG_PG_READ_STRIP_TESTID =
  'supplier-material-catalog-pg-read-strip';
export const SUPPLIER_MATERIAL_CATALOG_PG_READ_BADGE_TESTID =
  'supplier-material-catalog-pg-read-badge';

export const SUP_DEV_PRICE_DELTA_ALERT_STRIP_TESTID = 'sup-dev-price-delta-alert-strip';
export const SUP_DEV_PRICE_DELTA_ALERT_LOADING_TESTID = 'sup-dev-price-delta-alert-loading';
export const SUP_DEV_PRICE_DELTA_ALERT_EMPTY_TESTID = 'sup-dev-price-delta-alert-empty';
export const SUP_DEV_PRICE_DELTA_ALERT_CATALOG_LINK_TESTID =
  'sup-dev-price-delta-alert-catalog-link';

export function supDevMaterialCatalogPillarNavLabelRu(): string {
  return 'Каталог материалов';
}

export function supDevCompareSuppliersP2LeadRu(): string {
  return 'Сравнение поставщиков по материалам — P2 (Centric RFQ matrix). Peer-ссылки: материалы, каталог, RFQ.';
}

export function supDevCompareSuppliersP2BadgeRu(): string {
  return 'P2 · Centric';
}

export function supDevMaterialCatalogPgReadLeadRu(): string {
  return 'PG read-path · listing из workshop2_supplier_material_catalog (без memory seed).';
}

export function supDevMaterialCatalogPgReadBadgeRu(): string {
  return 'PG read';
}

export function supDevPriceDeltaAlertLoadingRu(): string {
  return 'Проверка расхождений цен журнал vs BOM…';
}

export function supDevPriceDeltaAlertErrorRu(): string {
  return 'Не удалось загрузить алерты Δ цены.';
}

export function supDevPriceDeltaAlertEmptyHonestRu(): string {
  return 'Расхождений между журналом и BOM нет (или нет price events в PG).';
}

export function supDevPriceDeltaAlertEmptyThresholdRu(): string {
  return 'Алертов по порогу 5% нет.';
}

export function supDevPriceDeltaAlertBadgeRu(count: number): string {
  return `Алерты Δ цены · ${count}`;
}

export function supDevPriceDeltaAlertDeltaBadgeRu(): string {
  return 'Δ цены';
}

export function supDevPriceDeltaAlertCatalogLinkRu(): string {
  return 'Каталог материалов →';
}

export function supDevPriceDeltaAlertCatalogLinkShortRu(): string {
  return 'Каталог →';
}

export function supDevMaterialCatalogCabinetHrefsForDemo(demo: PlatformCoreDemoContext): {
  catalogHref: string;
  materialsHref: string;
  rfqHref: string;
} {
  return {
    catalogHref: factoryMaterialsCatalogHrefForDemo(demo),
    materialsHref: factoryMaterialsHrefForDemo(demo),
    rfqHref: factorySupplierRfqInboxHref({
      collectionId: demo.collectionId,
      articleId: demo.demoArticleId,
    }),
  };
}
