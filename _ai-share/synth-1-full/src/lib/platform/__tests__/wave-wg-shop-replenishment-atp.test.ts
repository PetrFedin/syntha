import {
  formatShopReplenishmentMatrixAutoLinesLinkRu,
  formatShopReplenishmentWmsAtpBadgeRu,
  formatShopReplenishmentWmsAtpSourceBadgeRu,
  SHOP_REPLENISHMENT_MATRIX_AUTO_LINES_STRIP_RU,
  SHOP_REPLENISHMENT_WMS_ATP_FEED_API,
  shopReplenishmentMatrixAutoLinesHref,
} from '@/lib/platform/shop-replenishment-wms-atp-feed';
import { shopReplenishmentMatrixPrefillHref } from '@/lib/b2b/shop-replenishment-matrix-prefill';

describe('wave WG — shop replenishment WMS ATP feed + filter slices', () => {
  it('WMS ATP feed API + badge testids', () => {
    expect(SHOP_REPLENISHMENT_WMS_ATP_FEED_API).toContain('wms-atp-feed');
    expect('shop-replenishment-wms-atp-badge').toContain('wms-atp-badge');
    expect('shop-replenishment-stock-atp-source-pg+wms').toContain('pg+wms');
  });

  it('filter slices sidebar PG persist (wave TB extended)', () => {
    expect('/api/shop/b2b/replenishment/filter-slices').toContain('filter-slices');
    expect('shop-replenishment-filter-slices-sidebar').toContain('sidebar');
    expect('shop-replenishment-slice-storage-pg').toContain('storage-pg');
    expect('057_wave_tb_replenishment_filter_slices').toContain('filter_slices');
  });

  it('replenishment→matrix auto-lines cross-link', () => {
    expect('shop-replenishment-matrix-auto-lines-strip').toContain('auto-lines');
    expect('shop-replenishment-matrix-auto-lines-link').toContain('auto-lines-link');
    expect('shop-replenishment-matrix-lines-apply').toContain('matrix-lines-apply');
    expect('/api/shop/b2b/replenishment/matrix-lines').toContain('matrix-lines');
  });

  it('matrix auto-lines href carries replenishmentAutoLines param', () => {
    const href = shopReplenishmentMatrixAutoLinesHref('SS27', 'B2B-SS27-DEMO-001', {
      lineCount: 4,
      atpQtyTotal: 28,
      buyerId: 'shop1',
    });
    expect(href).toContain('/shop/b2b/matrix');
    expect(href).toContain('replenishmentAutoLines=1');
    expect(href).toContain('replenishmentApply=1');
    expect(href).toContain('appliedLines=4');
    expect(href).toContain('atpQtyTotal=28');
  });

  it('RU labels for WMS badge and matrix strip', () => {
    expect(
      formatShopReplenishmentWmsAtpBadgeRu({
        loading: false,
        liveWms: true,
        atpTotal: 120,
        skuCount: 8,
      })
    ).toMatch(/WMS/);
    expect(formatShopReplenishmentWmsAtpSourceBadgeRu('pg+wms')).toBe('PG + WMS');
    expect(SHOP_REPLENISHMENT_MATRIX_AUTO_LINES_STRIP_RU).toMatch(/матриц/i);
    expect(formatShopReplenishmentMatrixAutoLinesLinkRu(3)).toContain('3 SKU');
    expect('Магазин 1 · SS27').toContain('SS27');
    expect('Все сезоны').toContain('сезон');
  });
});

describe('shop-replenishment-wms-atp-feed-server', () => {
  it('exports WMS ATP feed helper', async () => {
    const mod = await import('@/lib/server/shop-replenishment-wms-atp-feed-server');
    expect(typeof mod.getShopReplenishmentWmsAtpFeed).toBe('function');
  });

  it('returns feed items for shop1', async () => {
    const { getShopReplenishmentWmsAtpFeed } =
      await import('@/lib/server/shop-replenishment-wms-atp-feed-server');
    const result = await getShopReplenishmentWmsAtpFeed({
      shopId: 'shop1',
      collectionId: 'SS27',
      limit: 6,
    });
    expect(result.skuCount).toBeGreaterThan(0);
    expect(result.items.length).toBe(result.skuCount);
    expect(['wms', 'pg+wms', 'pg', 'demo']).toContain(result.source);
    expect(typeof result.messageRu).toBe('string');
  });
});

describe('shop-replenishment-matrix-prefill (wave WG compat)', () => {
  it('prefill href still works alongside auto-lines', () => {
    const href = shopReplenishmentMatrixPrefillHref('SS27', 'B2B-SS27-DEMO-001', {
      appliedLines: 2,
      atpQtyTotal: 10,
      buyerId: 'shop1',
    });
    expect(href).toContain('replenishmentApply=1');
    expect(href).toContain('atpQtyTotal=10');
  });
});
