import { buildShopMatrixPrepackBreakdown } from '@/lib/b2b/shop-matrix-prepack-curve';
import { rowMatchesReplenishmentStockSlice } from '@/lib/platform/shop-replenishment-stock-slices';
import { buildShopReplenishmentStockRows } from '@/lib/platform/shop-replenishment-stock-atp';

describe('shop-matrix-prepack-curve', () => {
  it('builds size breakdown for pack count', () => {
    const b = buildShopMatrixPrepackBreakdown({ packCount: 2 });
    expect(b.totalUnits).toBe(24);
    expect(Object.values(b.bySize).reduce((s, n) => s + n, 0)).toBe(24);
  });
});

describe('shop-replenishment-stock-slices', () => {
  it('filters rows by season slice', () => {
    const all = buildShopReplenishmentStockRows(12);
    const ss27 = buildShopReplenishmentStockRows(12, {
      orgId: 'shop1',
      seasonId: 'SS27',
      collectionId: 'SS27',
      labelRu: 'SS27',
    });
    expect(ss27.length).toBeLessThanOrEqual(all.length);
    expect(
      rowMatchesReplenishmentStockSlice(
        { seasonTag: 'SS27', orgId: 'shop1' },
        {
          orgId: 'shop1',
          seasonId: 'SS27',
          collectionId: 'SS27',
          labelRu: 'x',
        }
      )
    ).toBe(true);
  });
});
