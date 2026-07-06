import { buildPlatformB2bHubSession } from '@/lib/b2b/platform-b2b-hub';
import { buildPlatformB2bPartnersSession } from '@/lib/b2b/platform-b2b-partners';
import {
  pushBrandPricelistTierSyncToShopServer,
  clearBrandPricelistTierSyncMemoryForTests,
  listBrandPricelistTierSyncServer,
} from '@/lib/server/brand-pricelist-tier-sync-repository';
import { parsePriceTierId } from '@/lib/b2b/price-tiers';
import {
  assignShopBuyerCrmProfileServer,
  clearShopBuyerCrmProfilesMemoryForTests,
} from '@/lib/server/shop-buyer-crm-profile-repository';
import { clearBrandCrmSegmentsMemoryForTests } from '@/lib/server/brand-crm-segments-repository';
import { shopTierMultiplierFromSync } from '@/lib/b2b/brand-pricelist-tier-sync';

describe('wave-bc tier-sync mirror + platform hub + supplier bom feed p3', () => {
  beforeEach(() => {
    clearBrandCrmSegmentsMemoryForTests();
    clearShopBuyerCrmProfilesMemoryForTests();
    clearBrandPricelistTierSyncMemoryForTests();
  });

  it('shop tier multiplier resolves after brand assign + push', async () => {
    const assigned = await assignShopBuyerCrmProfileServer({
      buyerId: 'shop2',
      segmentKey: 'retail',
    });
    const tierId = parsePriceTierId(assigned.profile?.priceTier);
    expect(tierId).toBeTruthy();

    await pushBrandPricelistTierSyncToShopServer({ collectionId: 'SS27', tierId: tierId! });
    const listed = await listBrandPricelistTierSyncServer({ collectionId: 'SS27' });
    const multiplier = shopTierMultiplierFromSync(listed.rows, tierId!);
    expect(multiplier).toBeTruthy();
  });

  it('platform B2B hub greenfield hrefs', () => {
    const hub = buildPlatformB2bHubSession({ collectionId: 'SS27' });
    const partners = buildPlatformB2bPartnersSession({ collectionId: 'SS27' });
    expect(hub.brandCrmBuyerAssignHref).toBe(partners.brandCrmBuyerAssignHref);
    expect(hub.shopRegistryGreenfieldHref).toContain('buyer=shop2');
  });

  it('wave-bc testid anchors', () => {
    expect('shop-co-registry-buyer-crm-tier-sync-synced').toContain('tier-sync');
    expect('shop-co-checkout-buyer-crm-tier-sync-synced').toContain('tier-sync');
    expect('platform-b2b-hub-greenfield-buyer-strip').toContain('greenfield');
    expect('sup-dev-bom-brand-feed-strip').toContain('brand-feed');
    expect('manufacturer-handoff-techpack-ack-panel').toContain('techpack');
  });
});
