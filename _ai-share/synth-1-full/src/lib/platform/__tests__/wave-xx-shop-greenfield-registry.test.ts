/** @jest-environment node */
import {
  SHOP_CO_GREENFIELD_REGISTRY_BUYER_PG_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_MATRIX_SEED_LINK_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_PG_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_PRICELIST_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_STATUS_TESTID,
  SHOP_CO_GREENFIELD_REGISTRY_STRIP_TESTID,
  SHOP_CO_REGISTRY_EMPTY_GREENFIELD_MONETIZATION_STRIP_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_FOCUS_MATRIX_SEED_LINK_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_MATRIX_SEED_LINK_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PG_TESTID,
  SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_STRIP_TESTID,
  SHOP_GREENFIELD_BUYER_CRM_PG_TABLE,
  SHOP_GREENFIELD_CRM_STRIP_TITLE_RU,
  SHOP_GREENFIELD_DEFAULT_BUYER_ID,
  SHOP_GREENFIELD_DEFAULT_COLLECTION_ID,
  SHOP_GREENFIELD_ONBOARDING_API,
  SHOP_GREENFIELD_PG_TABLE,
  SHOP_GREENFIELD_WAVE_XX_MIGRATION,
  shopGreenfieldBuyerLabelRu,
  shopGreenfieldMatrixSeedHref,
  shopGreenfieldOnboardingApiPath,
  shopGreenfieldOnboardingMessageRu,
  shopGreenfieldRegistryReady,
  shopGreenfieldStorageBadgeTestId,
} from '@/lib/b2b/shop-greenfield-registry-wave-xx';
import {
  SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU,
} from '@/lib/b2b/shop-sc-cabinet-buyer-profile-honesty';

describe('wave XX — shop2 full greenfield registry PG buyer + pricelist + matrix seed', () => {
  it('exports wave XX constants + PG tables', () => {
    expect(SHOP_GREENFIELD_ONBOARDING_API).toBe('/api/shop/b2b/greenfield/onboarding');
    expect(SHOP_GREENFIELD_PG_TABLE).toBe('shop_greenfield_onboarding');
    expect(SHOP_GREENFIELD_BUYER_CRM_PG_TABLE).toBe('shop_buyer_crm_profiles');
    expect(SHOP_GREENFIELD_WAVE_XX_MIGRATION).toContain('040_wave_sd');
    expect(SHOP_GREENFIELD_DEFAULT_BUYER_ID).toBe('shop2');
    expect(SHOP_GREENFIELD_DEFAULT_COLLECTION_ID).toBe('SS27');
  });

  it('cabinet CO greenfield registry strip testids (VN + XX polish)', () => {
    expect(SHOP_CO_GREENFIELD_REGISTRY_STRIP_TESTID).toContain('greenfield-registry');
    expect(SHOP_CO_GREENFIELD_REGISTRY_BUYER_PG_TESTID).toContain('buyer-pg');
    expect(SHOP_CO_GREENFIELD_REGISTRY_PG_TESTID).toContain('registry-pg');
    expect(SHOP_CO_GREENFIELD_REGISTRY_PRICELIST_TESTID).toContain('pricelist');
    expect(SHOP_CO_GREENFIELD_REGISTRY_MATRIX_SEED_LINK_TESTID).toContain('matrix-seed');
    expect(SHOP_CO_GREENFIELD_REGISTRY_STATUS_TESTID).toContain('registry-status');
  });

  it('registry empty onboarding strip + monetization spine testids', () => {
    expect(SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_STRIP_TESTID).toContain('onboarding-strip');
    expect(SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PG_TESTID).toContain('onboarding-pg');
    expect(SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_MATRIX_SEED_LINK_TESTID).toContain('matrix-seed');
    expect(SHOP_CO_REGISTRY_EMPTY_GREENFIELD_MONETIZATION_STRIP_TESTID).toContain('monetization');
    expect(SHOP_CO_REGISTRY_GREENFIELD_FOCUS_MATRIX_SEED_LINK_TESTID).toContain('matrix-seed');
  });

  it('onboarding API path + RU message helpers', () => {
    expect(shopGreenfieldOnboardingApiPath('shop2', 'SS27')).toContain('buyerId=shop2');
    expect(shopGreenfieldOnboardingApiPath('shop2', 'SS27')).toContain('collectionId=SS27');
    expect(shopGreenfieldBuyerLabelRu('shop2')).toMatch(/магазин/i);
    expect(
      shopGreenfieldOnboardingMessageRu({
        crmReady: true,
        pricelistReady: true,
        storageMode: 'postgres',
        buyerId: 'shop2',
      })
    ).toContain('PG');
    expect(
      shopGreenfieldOnboardingMessageRu({
        crmReady: false,
        pricelistReady: false,
        storageMode: 'memory',
        buyerId: 'shop2',
      })
    ).toContain('память');
  });

  it('registry ready gate + matrix seed href', () => {
    expect(shopGreenfieldRegistryReady({ crmReady: true, pricelistReady: true })).toBe(true);
    expect(shopGreenfieldRegistryReady({ crmReady: true, pricelistReady: false })).toBe(false);
    const href = shopGreenfieldMatrixSeedHref({
      collectionId: 'SS27',
      buyerId: 'shop2',
      state: { matrixSeedHref: '/shop/b2b/matrix?collection=SS27&buyer=shop2' },
    });
    expect(href).toContain('/shop/b2b/matrix');
    expect(href).toContain('shop2');
  });

  it('storage badge testids for cabinet vs registry', () => {
    expect(shopGreenfieldStorageBadgeTestId('postgres', 'cabinet')).toBe(
      SHOP_CO_GREENFIELD_REGISTRY_PG_TESTID
    );
    expect(shopGreenfieldStorageBadgeTestId('postgres', 'registry')).toBe(
      SHOP_CO_REGISTRY_GREENFIELD_ONBOARDING_PG_TESTID
    );
    expect(shopGreenfieldStorageBadgeTestId('memory', 'registry')).toContain('memory');
  });
});

describe('wave XX — extends wave VN peers + EMPTY27 honesty', () => {
  it('cabinet CO greenfield empty peer strip (BY pricelist wire)', () => {
    expect('shop-co-cabinet-greenfield-empty-peer-strip').toContain('greenfield-empty-peer');
    expect('shop-co-cabinet-brand-pricelist-link').toContain('pricelist');
    expect('shop-co-cabinet-replenishment-link').toContain('replenishment');
    const monetization = require('node:fs').readFileSync(
      require('node:path').join(
        __dirname,
        '../../../components/shop/b2b/ShopCoRegistryEmptyGreenfieldMonetizationStrip.tsx'
      ),
      'utf8'
    );
    expect(monetization).toContain('shopMarginPricelistHref');
    expect(monetization).not.toContain("brandCrmSegmentationFeatureHref('pricelist'");
  });

  it('greenfield CRM strip cross-links replenishment + matrix', () => {
    expect('shop-dev-bridge-crm-replenishment-link').toContain('replenishment');
    expect('shop-dev-bridge-crm-matrix-link').toContain('matrix');
    expect('shop-development-bridge-greenfield-crm-strip').toContain('greenfield-crm');
    expect(SHOP_GREENFIELD_CRM_STRIP_TITLE_RU).toContain('CRM');
  });

  it('empty registry dedupes buyer CRM strip in core mode', () => {
    const ordersCore = require('node:fs').readFileSync(
      require('node:path').join(__dirname, '../../../app/shop/b2b/orders/orders-core.tsx'),
      'utf8'
    );
    expect(ordersCore).toContain('ShopCoRegistryEmptyGreenfieldMonetizationStrip');
    expect(ordersCore).toContain('ShopCoRegistryBuyerCrmOnboardingStrip');
    expect(ordersCore).toMatch(
      /coreMode\s*\?\s*\([\s\S]*ShopCoRegistryEmptyGreenfieldMonetizationStrip[\s\S]*\)\s*:\s*\([\s\S]*ShopCoRegistryBuyerCrmOnboardingStrip/
    );
  });

  it('EMPTY27 buyer profile badge honesty', () => {
    expect('shop-sc-cabinet-buyer-profile-no-segment').toContain('no-segment');
    expect(SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU).toContain('Сегмент');
    expect('shop-sc-empty27-onboarding-memory').toContain('memory');
  });
});

describe('shop-greenfield-onboarding-repository', () => {
  it('exports getShopGreenfieldOnboardingServer', async () => {
    const mod = await import('@/lib/server/shop-greenfield-onboarding-repository');
    expect(typeof mod.getShopGreenfieldOnboardingServer).toBe('function');
    expect(typeof mod.markShopGreenfieldFirstOrderServer).toBe('function');
  });

  it('GET greenfield onboarding route returns shop2 snapshot', async () => {
    const { GET } = await import('@/app/api/shop/b2b/greenfield/onboarding/route');
    const { NextRequest } = await import('next/server');
    const req = new NextRequest(
      `http://localhost${shopGreenfieldOnboardingApiPath(SHOP_GREENFIELD_DEFAULT_BUYER_ID, SHOP_GREENFIELD_DEFAULT_COLLECTION_ID)}`
    );
    const res = await GET(req);
    const json = (await res.json()) as {
      ok?: boolean;
      state?: { crmReady?: boolean; pricelistReady?: boolean; matrixSeedHref?: string };
      storageMode?: string;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(['postgres', 'memory']).toContain(json.storageMode);
    expect(typeof json.messageRu).toBe('string');
    expect(json.messageRu).toMatch(/магазин|CRM|прайс/i);
  });
});
