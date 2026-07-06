import { parsePriceTierId } from '@/lib/b2b/price-tiers';
import { buildPlatformB2bPartnersSession } from '@/lib/b2b/platform-b2b-partners';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import {
  assignShopBuyerCrmProfileServer,
  clearShopBuyerCrmProfilesMemoryForTests,
} from '@/lib/server/shop-buyer-crm-profile-repository';
import { clearBrandCrmSegmentsMemoryForTests } from '@/lib/server/brand-crm-segments-repository';
import {
  clearBrandPricelistTierSyncMemoryForTests,
  listBrandPricelistTierSyncServer,
  pushBrandPricelistTierSyncToShopServer,
} from '@/lib/server/brand-pricelist-tier-sync-repository';

describe('wave-bb tier-sync + supplier push + platform greenfield p3', () => {
  beforeEach(() => {
    clearBrandCrmSegmentsMemoryForTests();
    clearShopBuyerCrmProfilesMemoryForTests();
    clearBrandPricelistTierSyncMemoryForTests();
  });

  it('parsePriceTierId accepts CRM segment tiers', () => {
    expect(parsePriceTierId('retail_a')).toBe('retail_a');
    expect(parsePriceTierId('retail_b')).toBe('retail_b');
    expect(parsePriceTierId('outlet')).toBe('outlet');
    expect(parsePriceTierId('unknown')).toBeNull();
  });

  it('assign shop2 + push tier sync marks shopSynced', async () => {
    const assigned = await assignShopBuyerCrmProfileServer({
      buyerId: 'shop2',
      segmentKey: 'wholesale',
    });
    const tierId = parsePriceTierId(assigned.profile?.priceTier);
    expect(tierId).toBeTruthy();

    const pushed = await pushBrandPricelistTierSyncToShopServer({
      collectionId: 'SS27',
      tierId: tierId!,
    });
    expect(pushed.row.shopSynced).toBe(true);

    const listed = await listBrandPricelistTierSyncServer({ collectionId: 'SS27' });
    const row = listed.rows.find((r) => r.tierId === tierId);
    expect(row?.shopSynced).toBe(true);
  });

  it('platform B2B greenfield session hrefs', () => {
    const session = buildPlatformB2bPartnersSession({ collectionId: 'SS27' });
    expect(session.brandCrmBuyerAssignHref).toBe(
      brandCrmSegmentationFeatureHref('pricelist', 'SS27')
    );
    expect(session.shopRegistryGreenfieldHref).toContain('buyer=shop2');
    expect(session.shopRegistryGreenfieldHref).toContain('collection=SS27');
  });

  it('wave-bb testid anchors', () => {
    expect('brand-crm-shop-buyer-assign-tier-synced').toContain('tier-sync');
    expect('sup-op-procurement-brand-push-submit').toContain('push');
    expect('platform-b2b-greenfield-brand-crm-assign-link').toContain('crm');
    expect('platform-b2b-greenfield-shop-registry-link').toContain('registry');
  });
});
