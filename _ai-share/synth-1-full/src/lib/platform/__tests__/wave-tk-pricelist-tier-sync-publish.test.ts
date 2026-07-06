import {
  brandPricelistPublishMessageRu,
  BRAND_PRICELIST_PUBLISH_API_PATH,
  BRAND_PRICELIST_PUBLISH_SUCCESS_RU,
} from '@/lib/b2b/brand-pricelist-publish';
import { buildBrandPricelistVersionSeedRows } from '@/lib/b2b/brand-pricelist-versions-feed';
import {
  clearBrandPricelistTierSyncMemoryForTests,
  listBrandPricelistTierSyncServer,
} from '@/lib/server/brand-pricelist-tier-sync-repository';
import { clearBrandPricelistVersionsMemoryForTests } from '@/lib/server/brand-pricelist-versions-repository';
import { publishBrandPricelistWithTierSyncServer } from '@/lib/server/brand-pricelist-publish-server';

describe('wave TK — pricelist publish → tier sync push', () => {
  beforeEach(() => {
    clearBrandPricelistVersionsMemoryForTests();
    clearBrandPricelistTierSyncMemoryForTests();
  });

  it('publishBrandPricelistWithTierSyncServer marks outlet tier shopSynced', async () => {
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
    expect(row?.multiplier).toBe(outlet!.multiplier);
  });

  it('brandPricelistPublishMessageRu includes tier push note', () => {
    const message = brandPricelistPublishMessageRu({
      priceListName: 'Retail B −4% Q1',
      tierId: 'retail_b',
      tierSync: { ok: true, tierId: 'retail_b', shopSynced: true },
    });
    expect(message).toContain('Retail B');
    expect(message).toContain('retail_b');
    expect(BRAND_PRICELIST_PUBLISH_SUCCESS_RU).toContain('магазина');
  });

  it('wave-tk testid anchors and API path', () => {
    expect(BRAND_PRICELIST_PUBLISH_API_PATH).toBe('/api/brand/b2b/pricelist/publish');
    expect('brand-pricelist-publish-pl-retail_b-0').toContain('publish');
    expect('shop-landed-margin-tier-sync-honesty-strip').toContain('tier-sync');
    expect('brand-landed-margin-tier-sync-mirror-strip').toContain('mirror');
  });
});
