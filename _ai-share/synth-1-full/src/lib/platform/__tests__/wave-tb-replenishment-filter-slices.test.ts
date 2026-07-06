describe('wave TB — replenishment filter slices PG + fail-closed LS', () => {
  it('filter-slices API + migration', () => {
    expect('/api/shop/b2b/replenishment/filter-slices').toContain('filter-slices');
    expect('057_wave_tb_replenishment_filter_slices').toContain('filter_slices');
    expect('shop_replenishment_filter_slices').toContain('filter');
  });

  it('client store fail-closed LS in core mode', () => {
    expect('fetchShopReplenishmentFilterSlices').toContain('FilterSlices');
    expect('loadShopReplenishmentFilterSlicesLocal').toContain('Local');
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('shouldMirrorPgClientStoreToLocalStorage').toContain('Mirror');
  });

  it('sidebar + stock-atp panel wiring', () => {
    expect('shop-replenishment-filter-slices-sidebar').toContain('sidebar');
    expect('shop-replenishment-slice-storage-pg').toContain('storage-pg');
    expect('ShopReplenishmentFilterSlicesSidebar').toContain('Sidebar');
    expect('ShopReplenishmentStockAtpPanel').toContain('StockAtp');
  });

  it('RU preset labels', () => {
    expect('Магазин 1 · SS27').toContain('SS27');
    expect('Все сезоны').toContain('сезон');
  });
});

describe('shop-replenishment-filter-slices-repository', () => {
  it('exports PG snapshot helpers', async () => {
    const mod = await import('@/lib/server/shop-replenishment-filter-slices-repository');
    expect(typeof mod.getShopReplenishmentFilterSlicesServer).toBe('function');
    expect(typeof mod.postShopReplenishmentFilterSliceServer).toBe('function');
    expect(typeof mod.shopReplenishmentFilterSlicesStorageMode).toBe('function');
  });

  it('persists active slice for buyer', async () => {
    const {
      getShopReplenishmentFilterSlicesServer,
      postShopReplenishmentFilterSliceServer,
    } = await import('@/lib/server/shop-replenishment-filter-slices-repository');
    const saved = await postShopReplenishmentFilterSliceServer({
      buyerId: 'shop1',
      slice: {
        orgId: 'shop1',
        seasonId: 'SS27',
        collectionId: 'SS27',
        labelRu: 'Магазин 1 · SS27',
      },
    });
    expect(saved.activeSlice.seasonId).toBe('SS27');
    const loaded = await getShopReplenishmentFilterSlicesServer('shop1');
    expect(loaded.activeSlice.collectionId).toBe('SS27');
    expect(loaded.savedSlices.some((s) => s.isActive)).toBe(true);
  });
});
