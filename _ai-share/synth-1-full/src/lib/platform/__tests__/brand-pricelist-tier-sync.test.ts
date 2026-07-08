import {
  pushBrandPricelistTierSyncToShopServer,
  clearBrandPricelistTierSyncMemoryForTests,
  listBrandPricelistTierSyncServer,
} from '@/lib/server/brand-pricelist-tier-sync-repository';
import {
  shopTierMultiplierFromSync,
  summarizeBrandPricelistTierSync,
} from '@/lib/b2b/brand-pricelist-tier-sync';
import { buildPillarWorkspaceContext } from '@/lib/platform/pillar-workspace-context';

describe('brand-pricelist-tier-sync', () => {
  it('summarizes synced tiers', () => {
    const summary = summarizeBrandPricelistTierSync([
      {
        tierId: 'retail_b',
        priceListId: 'pl-1',
        priceListName: 'Retail B',
        multiplier: 0.96,
        shopSynced: true,
        collectionId: 'SS27',
      },
      {
        tierId: 'outlet',
        priceListId: 'pl-2',
        priceListName: 'Outlet',
        multiplier: 0.95,
        shopSynced: false,
        collectionId: 'SS27',
      },
    ]);
    expect(summary.synced).toBe(1);
    expect(summary.pending).toBe(1);
    expect(
      shopTierMultiplierFromSync(
        [
          {
            tierId: 'retail_b',
            priceListId: 'pl-1',
            priceListName: 'Retail B',
            multiplier: 0.96,
            shopSynced: true,
            collectionId: 'SS27',
          },
        ],
        'retail_b'
      )
    ).toBe(0.96);
  });
});

describe('brand-pricelist-tier-sync-repository', () => {
  beforeEach(() => {
    clearBrandPricelistTierSyncMemoryForTests();
  });

  it('seeds tiers and pushes shop sync for outlet', async () => {
    const listed = await listBrandPricelistTierSyncServer({ collectionId: 'SS27' });
    expect(listed.rows.length).toBeGreaterThanOrEqual(3);

    const pushed = await pushBrandPricelistTierSyncToShopServer({
      collectionId: 'SS27',
      tierId: 'outlet',
    });
    expect(pushed.row.shopSynced).toBe(true);
    expect(pushed.rows.find((r) => r.tierId === 'outlet')?.shopSynced).toBe(true);
  });
});

describe('pillar-workspace-context', () => {
  it('inherits role from workspace definition', () => {
    const ctx = buildPillarWorkspaceContext('brand-pricelist', { collectionId: 'SS27' });
    expect(ctx.role).toBe('brand');
    expect(ctx.workspaceId).toBe('brand-pricelist');
  });
});
