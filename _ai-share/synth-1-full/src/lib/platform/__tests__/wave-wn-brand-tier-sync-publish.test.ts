import {
  BRAND_PRICELIST_TIER_SYNC_API_PATH,
  BRAND_PRICELIST_TIER_SYNC_HONESTY_OK_RU,
  BRAND_PRICELIST_TIER_SYNC_HONESTY_STRIP_TESTID,
  BRAND_PRICELIST_TIER_SYNC_PENDING_BADGE_TESTID,
  BRAND_PRICELIST_TIER_SYNC_PUSH_CTA_RU,
  BRAND_PRICELIST_SHOP_MATRIX_TIER_BADGE_LINK_TESTID,
  SHOP_CO_MATRIX_TIER_SYNC_RECEIVE_BADGE_TESTID,
  SHOP_PRICELIST_TIER_RECEIVE_BADGE_TESTID,
  SHOP_PRICELIST_TIER_RECEIVE_SYNCED_RU,
  brandCoTierSyncPublishWnContract,
  brandPricelistShopMatrixTierBadgeHref,
  brandPricelistTierSyncHonestyPendingRu,
  isBrandPricelistPublishTierSyncEnabled,
} from '@/lib/b2b/brand-co-tier-sync-publish-wn';
import {
  brandPricelistPublishMessageRu,
  BRAND_PRICELIST_PUBLISH_API_PATH,
} from '@/lib/b2b/brand-pricelist-publish';
import { buildBrandPricelistVersionSeedRows } from '@/lib/b2b/brand-pricelist-versions-feed';
import {
  clearBrandPricelistTierSyncMemoryForTests,
  listBrandPricelistTierSyncServer,
} from '@/lib/server/brand-pricelist-tier-sync-repository';
import { clearBrandPricelistVersionsMemoryForTests } from '@/lib/server/brand-pricelist-versions-repository';
import { publishBrandPricelistWithTierSyncServer } from '@/lib/server/brand-pricelist-publish-server';

describe('wave WN — brand CO pricelist publish → tier sync', () => {
  const prevEnv = process.env.BRAND_PRICELIST_PUBLISH_TIER_SYNC;

  beforeEach(() => {
    delete process.env.BRAND_PRICELIST_PUBLISH_TIER_SYNC;
    clearBrandPricelistVersionsMemoryForTests();
    clearBrandPricelistTierSyncMemoryForTests();
  });

  afterEach(() => {
    if (prevEnv === undefined) delete process.env.BRAND_PRICELIST_PUBLISH_TIER_SYNC;
    else process.env.BRAND_PRICELIST_PUBLISH_TIER_SYNC = prevEnv;
  });

  it('isBrandPricelistPublishTierSyncEnabled defaults true, off when env=0', () => {
    expect(isBrandPricelistPublishTierSyncEnabled()).toBe(true);
    process.env.BRAND_PRICELIST_PUBLISH_TIER_SYNC = '0';
    expect(isBrandPricelistPublishTierSyncEnabled()).toBe(false);
  });

  it('publishBrandPricelistWithTierSyncServer pushes outlet tier to shop (PG stub)', async () => {
    const rows = buildBrandPricelistVersionSeedRows('SS27');
    const outlet = rows.find((row) => row.channel === 'outlet');
    expect(outlet).toBeTruthy();

    const published = await publishBrandPricelistWithTierSyncServer({
      collectionId: 'SS27',
      id: outlet!.id,
    });
    expect(published.ok).toBe(true);
    expect(published.tierSync?.ok).toBe(true);
    expect(published.tierSync?.shopSynced).toBe(true);
    expect(published.tierSync?.tierId).toBe('outlet');
    expect(published.messageRu).toContain('outlet');

    const listed = await listBrandPricelistTierSyncServer({ collectionId: 'SS27' });
    const row = listed.rows.find((r) => r.tierId === 'outlet');
    expect(row?.shopSynced).toBe(true);
    expect(['pg', 'file', 'memory', 'demo']).toContain(listed.storageMode);
  });

  it('publish skips tier sync when env gate disabled', async () => {
    process.env.BRAND_PRICELIST_PUBLISH_TIER_SYNC = '0';
    const rows = buildBrandPricelistVersionSeedRows('SS27');
    const outlet = rows.find((row) => row.channel === 'outlet');
    expect(outlet).toBeTruthy();

    const published = await publishBrandPricelistWithTierSyncServer({
      collectionId: 'SS27',
      id: outlet!.id,
    });
    expect(published.ok).toBe(true);
    expect(published.tierSync?.skipped).toBe(true);
    expect(published.tierSync?.reason).toBe('sync_disabled');
  });

  it('brandPricelistPublishMessageRu RU tier push note', () => {
    const message = brandPricelistPublishMessageRu({
      priceListName: 'Retail B −4% Q1',
      tierId: 'retail_b',
      tierSync: { ok: true, tierId: 'retail_b', shopSynced: true },
    });
    expect(message).toContain('Retail B');
    expect(message).toContain('retail_b');
  });

  it('wave WN testid anchors, RU strings, cross-links', () => {
    const contract = brandCoTierSyncPublishWnContract();
    expect(contract.publishApiPath).toBe(BRAND_PRICELIST_PUBLISH_API_PATH);
    expect(contract.tierSyncApiPath).toBe(BRAND_PRICELIST_TIER_SYNC_API_PATH);
    expect(BRAND_PRICELIST_TIER_SYNC_HONESTY_STRIP_TESTID).toContain('honesty-strip');
    expect(BRAND_PRICELIST_TIER_SYNC_PENDING_BADGE_TESTID).toContain('pending-badge');
    expect(BRAND_PRICELIST_SHOP_MATRIX_TIER_BADGE_LINK_TESTID).toContain('matrix-tier-badge');
    expect(SHOP_PRICELIST_TIER_RECEIVE_BADGE_TESTID).toContain('receive-badge');
    expect(SHOP_CO_MATRIX_TIER_SYNC_RECEIVE_BADGE_TESTID).toContain('matrix-tier-sync-receive');
    expect(brandPricelistTierSyncHonestyPendingRu(2, 3)).toContain('2/3');
    expect(BRAND_PRICELIST_TIER_SYNC_HONESTY_OK_RU).toContain('синхронизированы');
    expect(BRAND_PRICELIST_TIER_SYNC_PUSH_CTA_RU).toContain('магазин');
    expect(SHOP_PRICELIST_TIER_RECEIVE_SYNCED_RU).toContain('бренда');
    expect(brandPricelistShopMatrixTierBadgeHref('SS27')).toContain('/shop/b2b/matrix');
    expect('brand-pricelist-publish-pl-outlet-0').toContain('publish');
  });
});
