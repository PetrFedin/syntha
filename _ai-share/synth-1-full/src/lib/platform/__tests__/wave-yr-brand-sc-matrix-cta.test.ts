import fs from 'node:fs';
import path from 'node:path';
import {
  brandScCrossMatrixMiniMatrixHref,
  brandScCrossMatrixOpenShopHref,
  parseLinesheetArticleIdsParam,
} from '@/lib/b2b/brand-sc-cross-matrix';
import {
  WAVE_YR_BRAND_SC_MATRIX_DEDUP_FIXES,
  WAVE_YR_BRAND_SC_MINI_MATRIX_LINK_TESTID,
  WAVE_YR_BRAND_SC_MINI_MATRIX_STRIP_TESTID,
  WAVE_YR_BRAND_SC_OPEN_SHOP_BTN_TESTID,
  WAVE_YR_E2E_SPEC,
  brandScCrossMatrixOneClickAriaLabelRu,
} from '@/lib/platform/wave-yr-brand-sc-matrix-cta';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YR — brand SC cross-matrix one-click CTA', () => {
  it('one-click aria labels for mini-matrix and open-shop variants (RU)', () => {
    expect(brandScCrossMatrixOneClickAriaLabelRu(0, 'mini-matrix')).toMatch(/опубликуйте/i);
    expect(brandScCrossMatrixOneClickAriaLabelRu(3, 'mini-matrix')).toContain('3 SKU');
    expect(brandScCrossMatrixOneClickAriaLabelRu(2, 'open-shop')).toMatch(/матриц/i);
    expect(brandScCrossMatrixOneClickAriaLabelRu(2, 'open-shop')).toMatch(/SKU лайншита/i);
  });

  it('mini-matrix and open-shop href share UE prefill contract', () => {
    const ids = ['demo-ss27-01', 'demo-ss27-02'];
    const mini = brandScCrossMatrixMiniMatrixHref('SS27', ids, 8);
    const open = brandScCrossMatrixOpenShopHref('SS27', ids, { carryQtyTotal: 8 });
    expect(mini).toBe(open);
    expect(mini).toContain('linesheetArticleIds=demo-ss27-01%2Cdemo-ss27-02');
    expect(mini).toContain('linesheetPrefill=1');
    expect(mini).toContain('carryQtyTotal=8');
  });

  it('parseLinesheetArticleIdsParam aligns with shop prefill hint', () => {
    expect(parseLinesheetArticleIdsParam('demo-ss27-01,demo-ss27-02')).toEqual([
      'demo-ss27-01',
      'demo-ss27-02',
    ]);
  });

  it('wave YR testids are stable', () => {
    expect(WAVE_YR_BRAND_SC_MINI_MATRIX_STRIP_TESTID).toBe('brand-sample-collection-mini-matrix');
    expect(WAVE_YR_BRAND_SC_MINI_MATRIX_LINK_TESTID).toBe('brand-sc-mini-matrix-link');
    expect(WAVE_YR_BRAND_SC_OPEN_SHOP_BTN_TESTID).toBe('brand-sc-cross-matrix-open-shop-btn');
  });

  it('documents matrix CTA dedup surfaces (UE/VC)', () => {
    expect(WAVE_YR_BRAND_SC_MATRIX_DEDUP_FIXES.length).toBe(5);
    expect(WAVE_YR_BRAND_SC_MATRIX_DEDUP_FIXES.map((f) => f.surface)).toEqual([
      'cabinet',
      'cabinet',
      'linesheets',
      'showroom',
      'workspace',
    ]);
  });

  it.each(WAVE_YR_BRAND_SC_MATRIX_DEDUP_FIXES)('$id — dedup wired in source', (fix) => {
    const text = read(fix.sourceFile);
    for (const needle of fix.sourceMustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.sourceMustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
    for (const tid of fix.primaryTestids) {
      expect(tid.length).toBeGreaterThan(3);
    }
  });

  it('exports mini-matrix and open-shop strip components', async () => {
    const mini = await import('@/components/platform/BrandScCabinetMiniMatrixStrip');
    const open = await import('@/components/platform/BrandScCrossMatrixOpenShopStrip');
    expect(typeof mini.BrandScCabinetMiniMatrixStrip).toBe('function');
    expect(typeof open.BrandScCrossMatrixOpenShopStrip).toBe('function');
  });

  it(`${WAVE_YR_E2E_SPEC} — file on disk + playwright.core.config.ts entry`, () => {
    const pkgRoot = path.join(SRC, '..');
    expect(fs.existsSync(path.join(pkgRoot, 'e2e', WAVE_YR_E2E_SPEC))).toBe(true);
    const config = fs.readFileSync(path.join(pkgRoot, 'playwright.core.config.ts'), 'utf8');
    expect(config).toContain(`**/${WAVE_YR_E2E_SPEC}`);
  });
});
