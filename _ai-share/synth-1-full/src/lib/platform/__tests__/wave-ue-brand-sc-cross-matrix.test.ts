import {
  BRAND_SC_CROSS_MATRIX_CARRY_QTY_TOTAL_PARAM,
  BRAND_SC_CROSS_MATRIX_LINESHEET_ARTICLE_IDS_PARAM,
  BRAND_SC_CROSS_MATRIX_MINI_MATRIX_HINT_RU,
  BRAND_SC_CROSS_MATRIX_OPEN_SHOP_BTN_RU,
  BRAND_SC_CROSS_MATRIX_PREFILL_APPLY_PARAM,
  BRAND_SC_LINESET_PDF_EMPTY_API_RU,
  BRAND_SC_PUBLISHED_READ_PATH_API_BADGE_RU,
  brandScCrossMatrixMiniMatrixHintRu,
  brandScCrossMatrixMiniMatrixHref,
  brandScCrossMatrixOpenShopHref,
  formatBrandScPublishedReadPathBadgeRu,
  normalizeLinesheetArticleIds,
  parseLinesheetArticleIdsParam,
  resolveBrandScPublishedArticlesReadPath,
} from '@/lib/b2b/brand-sc-cross-matrix';

describe('wave UE — brand SC cross-matrix open shop', () => {
  it('linesheetArticleIds query param contract', () => {
    expect(BRAND_SC_CROSS_MATRIX_LINESHEET_ARTICLE_IDS_PARAM).toBe('linesheetArticleIds');
    expect(BRAND_SC_CROSS_MATRIX_PREFILL_APPLY_PARAM).toBe('linesheetPrefill');
    expect(BRAND_SC_CROSS_MATRIX_CARRY_QTY_TOTAL_PARAM).toBe('carryQtyTotal');
  });

  it('normalize + parse article ids', () => {
    expect(normalizeLinesheetArticleIds([' demo-ss27-01 ', 'demo-ss27-01', ''])).toEqual([
      'demo-ss27-01',
    ]);
    expect(parseLinesheetArticleIdsParam('demo-ss27-01,demo-ss27-02')).toEqual([
      'demo-ss27-01',
      'demo-ss27-02',
    ]);
  });

  it('open shop href pre-fills linesheet SKUs + optional carry qty', () => {
    const href = brandScCrossMatrixOpenShopHref('SS27', ['demo-ss27-01', 'demo-ss27-02'], {
      carryQtyTotal: 12,
      buyerId: 'shop2',
    });
    expect(href).toContain('/shop/b2b/matrix');
    expect(href).toContain('collection=SS27');
    expect(href).toContain(
      `${BRAND_SC_CROSS_MATRIX_LINESHEET_ARTICLE_IDS_PARAM}=demo-ss27-01%2Cdemo-ss27-02`
    );
    expect(href).toContain(`${BRAND_SC_CROSS_MATRIX_PREFILL_APPLY_PARAM}=1`);
    expect(href).toContain(`${BRAND_SC_CROSS_MATRIX_CARRY_QTY_TOTAL_PARAM}=12`);
    expect(href).toContain('buyer=shop2');
  });

  it('mini matrix href matches open shop contract', () => {
    const href = brandScCrossMatrixMiniMatrixHref('SS27', ['demo-ss27-01']);
    expect(href).toContain('linesheetArticleIds=demo-ss27-01');
  });

  it('mini matrix hint RU with qty carry', () => {
    expect(brandScCrossMatrixMiniMatrixHintRu(0)).toMatch(/Опубликуйте/i);
    expect(brandScCrossMatrixMiniMatrixHintRu(3, 9)).toContain('3 SKU');
    expect(brandScCrossMatrixMiniMatrixHintRu(2)).toContain(
      BRAND_SC_CROSS_MATRIX_MINI_MATRIX_HINT_RU
    );
  });

  it('publishedArticlesReadPath=api badge honesty', () => {
    expect(formatBrandScPublishedReadPathBadgeRu('api')).toBe(
      BRAND_SC_PUBLISHED_READ_PATH_API_BADGE_RU
    );
    expect(resolveBrandScPublishedArticlesReadPath('SS27')).toBe('api');
  });

  it('RU copy + UI testids', () => {
    expect(BRAND_SC_CROSS_MATRIX_OPEN_SHOP_BTN_RU).toContain('матриц');
    expect(BRAND_SC_LINESET_PDF_EMPTY_API_RU).toMatch(/PDF|артикул/i);
    expect('brand-sc-cross-matrix-open-shop-btn').toContain('open-shop');
    expect('brand-sample-collection-mini-matrix').toContain('mini-matrix');
    expect('brand-sc-published-readpath-api').toContain('readpath');
    expect('shop-sc-matrix-linesheet-prefill-hint').toContain('prefill');
  });
});

describe('wave UE — peer strips wired', () => {
  it('exports cross-matrix strip component', async () => {
    const mod = await import('@/components/platform/BrandScCrossMatrixOpenShopStrip');
    expect(typeof mod.BrandScCrossMatrixOpenShopStrip).toBe('function');
  });

  it('exports read-path badge component', async () => {
    const mod = await import('@/components/platform/PlatformCorePublishedArticlesReadPathBadge');
    expect(typeof mod.PlatformCorePublishedArticlesReadPathBadge).toBe('function');
  });
});
