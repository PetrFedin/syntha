import {
  BRAND_CO_CABINET_PARTNER_COUNT_TESTID,
  BRAND_CO_CABINET_PG_PARTNER_BADGE_TESTID,
  BRAND_CO_REGISTRY_SHOP_TRACKING_LINK_TESTID,
  BRAND_CO_REGISTRY_TRACKING_LINK_TESTID,
  BRAND_RETAILERS_B2B_ORDERS_SUMMARY_API_PATH,
  SHOP_CO_CABINET_OPERATIONAL_STATUS_PG_BADGE_TESTID,
  SHOP_CO_CABINET_OPERATIONAL_STATUS_TESTID,
  SHOP_CO_TRACKING_BRAND_REGISTRY_LINK_TESTID,
  brandCoRegistryShopTrackingHref,
  brandRetailersB2bOrdersSummaryApiPath,
  shopCoOperationalStatusMirrorApiPath,
  shopCoOperationalStatusPgBadgeLabelRu,
  shopCoTrackingBrandRegistryHref,
  summarizeBrandCoPartnerCountPg,
} from '@/lib/b2b/brand-co-wave-yg';

describe('wave YG — brand CO partner count PG badge', () => {
  it('partner count API path + cabinet testids', () => {
    expect(BRAND_RETAILERS_B2B_ORDERS_SUMMARY_API_PATH).toContain('b2b-orders-summary');
    expect(brandRetailersB2bOrdersSummaryApiPath('SS27')).toContain('collectionId=SS27');
    expect(BRAND_CO_CABINET_PARTNER_COUNT_TESTID).toContain('partner-count');
    expect(BRAND_CO_CABINET_PG_PARTNER_BADGE_TESTID).toContain('pg-partner');
  });

  it('summarizeBrandCoPartnerCountPg counts active buyers', () => {
    const summary = summarizeBrandCoPartnerCountPg([
      { retailerId: 'shop1', displayNameRu: 'Shop 1', orderCount: 2 },
      { retailerId: 'shop2', displayNameRu: 'Shop 2', orderCount: 0 },
    ]);
    expect(summary.activePartners).toBe(1);
    expect(summary.pgLabel).toContain('1 партн.');
    expect(summary.pgLabel).not.toMatch(/^PG /);
  });
});

describe('wave YG — operational status PATCH mirror polish (shop)', () => {
  it('shop operational status mirror API + PG badge testids', () => {
    expect(shopCoOperationalStatusMirrorApiPath('B2B-1')).toContain('operational-status');
    expect(SHOP_CO_CABINET_OPERATIONAL_STATUS_TESTID).toContain('operational-status');
    expect(SHOP_CO_CABINET_OPERATIONAL_STATUS_PG_BADGE_TESTID).toContain('pg-badge');
    expect(shopCoOperationalStatusPgBadgeLabelRu('postgres')).toContain('journal');
    expect(shopCoOperationalStatusPgBadgeLabelRu('memory')).toContain('mirror');
  });
});

describe('wave YG — cross-link brand registry ↔ shop tracking', () => {
  it('registry → shop tracking href', () => {
    expect(BRAND_CO_REGISTRY_TRACKING_LINK_TESTID).toContain('tracking');
    expect(BRAND_CO_REGISTRY_SHOP_TRACKING_LINK_TESTID).toContain('shop-tracking');
    const href = brandCoRegistryShopTrackingHref('B2B-DEMO-SHOP1-SS27', 'SS27');
    expect(href).toContain('tracking');
    expect(href).toContain('B2B-DEMO-SHOP1-SS27');
  });

  it('shop tracking → brand registry href', () => {
    expect(SHOP_CO_TRACKING_BRAND_REGISTRY_LINK_TESTID).toContain('brand-registry');
    const href = shopCoTrackingBrandRegistryHref('B2B-DEMO-SHOP1-SS27');
    expect(href).toContain('b2b-orders');
    expect(href).toContain('order=B2B-DEMO-SHOP1-SS27');
  });
});

describe('wave YG — b2b-orders-summary storageMode', () => {
  it('BFF normalizes postgres storage to pg label', async () => {
    const { toBffPgStorageMode } = await import('@/lib/server/bff-pg-storage-mode');
    expect(toBffPgStorageMode('postgres')).toBe('pg');
    expect(toBffPgStorageMode('memory')).toBe('memory');
  });
});
