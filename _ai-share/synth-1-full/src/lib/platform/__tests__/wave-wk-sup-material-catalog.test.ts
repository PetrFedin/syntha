import {
  SUPPLIER_DEV_PILLAR_MATERIAL_CATALOG_NAV_TESTID,
  SUPPLIER_MATERIAL_CATALOG_PG_READ_BADGE_TESTID,
  SUPPLIER_MATERIAL_CATALOG_PG_READ_STRIP_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_CATALOG_LINK_TESTID,
  SUP_DEV_COMPARE_SUPPLIERS_P2_STRIP_TESTID,
  SUP_DEV_PRICE_DELTA_ALERT_CATALOG_LINK_TESTID,
  SUP_DEV_PRICE_DELTA_ALERT_EMPTY_TESTID,
  SUP_DEV_PRICE_DELTA_ALERT_LOADING_TESTID,
  SUP_DEV_PRICE_DELTA_ALERT_STRIP_TESTID,
  SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID,
  supDevCompareSuppliersP2BadgeRu,
  supDevCompareSuppliersP2LeadRu,
  supDevMaterialCatalogCabinetHrefsForDemo,
  supDevMaterialCatalogPgReadLeadRu,
  supDevMaterialCatalogPillarNavLabelRu,
  supDevPriceDeltaAlertEmptyHonestRu,
  supDevPriceDeltaAlertLoadingRu,
} from '@/lib/fashion/supplier-dev-wave-wk';

describe('wave WK — supplier material catalog pillar nav + PG read + P2/price-delta RU', () => {
  it('pillar nav testids + RU label', () => {
    expect(SUPPLIER_DEV_PILLAR_MATERIAL_CATALOG_NAV_TESTID).toContain('pillar-material-catalog');
    expect(SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID).toContain('material-catalog');
    expect(supDevMaterialCatalogPillarNavLabelRu()).toMatch(/Каталог материалов/i);
  });

  it('catalog cabinet PG read strip testids + RU', () => {
    expect(SUPPLIER_MATERIAL_CATALOG_PG_READ_STRIP_TESTID).toContain('pg-read-strip');
    expect(SUPPLIER_MATERIAL_CATALOG_PG_READ_BADGE_TESTID).toContain('pg-read-badge');
    expect(supDevMaterialCatalogPgReadLeadRu()).toMatch(/PG read-path/i);
    expect('SupplierMaterialCatalogPgReadStrip').toContain('PgReadStrip');
    expect('/api/workshop2/supplier/material-catalog').toContain('material-catalog');
  });

  it('compare P2 polish from VG via WK module', () => {
    expect(SUP_DEV_COMPARE_SUPPLIERS_P2_STRIP_TESTID).toContain('compare-suppliers');
    expect(SUP_DEV_COMPARE_SUPPLIERS_P2_CATALOG_LINK_TESTID).toContain('catalog');
    expect(supDevCompareSuppliersP2LeadRu()).toMatch(/P2|Centric/i);
    expect(supDevCompareSuppliersP2BadgeRu()).toMatch(/Centric/i);
    expect('SupDevCompareSuppliersP2Strip').toContain('CompareSuppliers');
  });

  it('price delta alert strip RU + testids', () => {
    expect(SUP_DEV_PRICE_DELTA_ALERT_STRIP_TESTID).toContain('price-delta');
    expect(SUP_DEV_PRICE_DELTA_ALERT_LOADING_TESTID).toContain('loading');
    expect(SUP_DEV_PRICE_DELTA_ALERT_EMPTY_TESTID).toContain('empty');
    expect(SUP_DEV_PRICE_DELTA_ALERT_CATALOG_LINK_TESTID).toContain('catalog-link');
    expect(supDevPriceDeltaAlertLoadingRu()).toMatch(/расхожден/i);
    expect(supDevPriceDeltaAlertEmptyHonestRu()).toMatch(/PG/i);
    expect('SupplierPriceDeltaAlertStrip').toContain('PriceDelta');
  });

  it('cabinet hrefs resolve catalog + materials + rfq', () => {
    const hrefs = supDevMaterialCatalogCabinetHrefsForDemo({
      collectionId: 'SS27',
      demoArticleId: 'demo-ss27-01',
      demoOrderId: '',
      factoryId: '',
    });
    expect(hrefs.catalogHref).toContain('/factory/production/catalog');
    expect(hrefs.materialsHref).toContain('view=development');
    expect(hrefs.rfqHref).toContain('/factory/supplier/rfq-inbox');
  });

  it('pillar nav wired in RoleCoreCabinetHub development aside', () => {
    expect('SupplierDevPillarMaterialCatalogNav').toContain('PillarMaterialCatalogNav');
    expect('role-core-pillar-nav').toContain('pillar-nav');
    expect('supplier-sidebar-materials-catalog-nav').toContain('sidebar');
  });
});
