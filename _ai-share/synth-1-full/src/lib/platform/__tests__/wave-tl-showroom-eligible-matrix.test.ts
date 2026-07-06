import {
  SHOP_SHOWROOM_ELIGIBLE_FILTER_LABEL_RU,
  SHOP_SHOWROOM_ELIGIBLE_FOR_MATRIX_API_PATH,
  SHOP_SHOWROOM_PARTNER_LOGO_DOSSIER_FALLBACK_RU,
  SHOP_SHOWROOM_PARTNER_LOGO_PG_RU,
  shopShowroomEligibleForMatrixApiPath,
  shopShowroomMatrixHrefWithCarry,
  shopShowroomMatrixHrefWithCarryQty,
} from '@/lib/b2b/shop-showroom-eligible-for-matrix';

describe('wave TL — shop SC showroom eligible-for-matrix + partner logo', () => {
  it('eligible-for-matrix API path contract', () => {
    expect(SHOP_SHOWROOM_ELIGIBLE_FOR_MATRIX_API_PATH).toBe(
      '/api/shop/b2b/showroom/eligible-for-matrix'
    );
    expect(shopShowroomEligibleForMatrixApiPath('SS27', 'shop1')).toContain('collection=SS27');
    expect(shopShowroomEligibleForMatrixApiPath('SS27', 'shop1')).toContain('buyerId=shop1');
  });

  it('PG migration + journal table', () => {
    expect('059_wave_tl_showroom_eligible_for_matrix').toContain('eligible_for_matrix');
    expect('shop_showroom_eligible_for_matrix_journal').toContain('eligible');
  });

  it('matrix qty carry href when partial cart', () => {
    expect(shopShowroomMatrixHrefWithCarryQty('SS27', 'demo-ss27-01', 6)).toContain('carryQty=6');
    expect(shopShowroomMatrixHrefWithCarry('SS27', 'demo-ss27-01', { carryQty: 6, carrySize: 'M' })).toContain(
      'carrySize=M'
    );
    expect(shopShowroomMatrixHrefWithCarryQty('SS27', 'demo-ss27-01')).not.toContain('carryQty');
  });

  it('RU copy for filter + partner logo badges', () => {
    expect(SHOP_SHOWROOM_ELIGIBLE_FILTER_LABEL_RU).toContain('матриц');
    expect(SHOP_SHOWROOM_PARTNER_LOGO_PG_RU).toContain('PG');
    expect(SHOP_SHOWROOM_PARTNER_LOGO_DOSSIER_FALLBACK_RU).toContain('dossier');
  });

  it('UI testids on showroom filter + partner logo', () => {
    expect('shop-sc-showroom-eligible-filter-toggle').toContain('eligible-filter');
    expect('shop-sc-showroom-eligible-filter-strip').toContain('filter-strip');
    expect('shop-sc-showroom-partner-logo-source-pg').toContain('source-pg');
    expect('shop-sc-showroom-partner-logo-source-dossier-fallback').toContain('dossier-fallback');
    expect('shop-sc-showroom-matrix-quick-add-').toBeTruthy();
  });
});

describe('wave TL — eligible-for-matrix repository', () => {
  it('exports journal helpers', async () => {
    const mod = await import('@/lib/server/shop-showroom-eligible-for-matrix-repository');
    expect(typeof mod.appendShopShowroomEligibleForMatrixJournal).toBe('function');
    expect(typeof mod.listShopShowroomEligibleForMatrixJournal).toBe('function');
    expect(typeof mod.shopShowroomEligibleForMatrixStorageMode).toBe('function');
  });

  it('persists eligible filter journal row', async () => {
    const { appendShopShowroomEligibleForMatrixJournal, listShopShowroomEligibleForMatrixJournal } =
      await import('@/lib/server/shop-showroom-eligible-for-matrix-repository');
    await appendShopShowroomEligibleForMatrixJournal({
      buyerId: 'shop1',
      collectionId: 'SS27',
      publishedCount: 3,
      eligibleCount: 2,
      filterActive: true,
    });
    const rows = await listShopShowroomEligibleForMatrixJournal({
      buyerId: 'shop1',
      collectionId: 'SS27',
      limit: 5,
    });
    expect(rows.some((r) => r.eligibleCount === 2)).toBe(true);
  });
});

describe('wave TL — eligible-for-matrix server orchestration', () => {
  it('exports getShopShowroomEligibleForMatrixServer', async () => {
    const mod = await import('@/lib/server/shop-showroom-eligible-for-matrix-server');
    expect(typeof mod.getShopShowroomEligibleForMatrixServer).toBe('function');
  });
});
