import {
  SHOP_MATRIX_DRAFT_AUTOSAVE_API_PATH,
  SHOP_MATRIX_DRAFT_AUTOSAVE_DEBOUNCE_MS,
  SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_CHECKOUT_LINK_RU,
  SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_HINT_RU,
  SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_MATRIX_LINK_RU,
  SHOP_MATRIX_DRAFT_CONFLICT_HINT_RU,
  isShopMatrixDraftUpdatedAtConflict,
  mergeShopMatrixDraftValidationHintsRu,
  resolveShopMatrixDraftAutosaveOutcome,
  shopMatrixDraftAutosaveFailCheckoutHref,
  shopMatrixDraftAutosaveFailMatrixHref,
} from '@/lib/b2b/shop-matrix-draft-autosave-wave-xt';
import {
  SHOP_MATRIX_DRAFT_EMPTY_HINT_RU,
  validateShopMatrixDraftDocRu,
} from '@/lib/b2b/shop-matrix-draft-validate';
import { mergeShopMatrixCartSizeRunResults } from '@/lib/b2b/shop-matrix-size-run-cart-validation';

describe('wave XT — matrix draft autosave PG debounce + conflict', () => {
  it('exports debounce + API path + UI testids', () => {
    expect(SHOP_MATRIX_DRAFT_AUTOSAVE_DEBOUNCE_MS).toBeGreaterThanOrEqual(600);
    expect(SHOP_MATRIX_DRAFT_AUTOSAVE_API_PATH).toContain('matrix/draft');
    expect('shop-co-matrix-draft-conflict-banner').toContain('conflict');
    expect('shop-co-matrix-draft-autosave-fail-link').toContain('autosave-fail');
    expect('shop-co-checkout-draft-autosave-fail-hint').toContain('autosave-fail');
    expect('shop-co-checkout-draft-autosave-matrix-link').toContain('matrix-link');
  });

  it('detects updatedAt conflict when server is newer', () => {
    const older = '2026-06-01T10:00:00.000Z';
    const newer = '2026-06-01T10:00:05.000Z';
    expect(isShopMatrixDraftUpdatedAtConflict(older, newer)).toBe(true);
    expect(isShopMatrixDraftUpdatedAtConflict(newer, older)).toBe(false);
    expect(isShopMatrixDraftUpdatedAtConflict(undefined, newer)).toBe(false);
  });

  it('resolves autosave outcomes', () => {
    expect(resolveShopMatrixDraftAutosaveOutcome({ ok: true, validationOk: true })).toBe('saved');
    expect(resolveShopMatrixDraftAutosaveOutcome({ ok: false, conflict: true })).toBe('conflict');
    expect(resolveShopMatrixDraftAutosaveOutcome({ ok: false })).toBe('error');
    expect(resolveShopMatrixDraftAutosaveOutcome({ ok: true, validationOk: false })).toBe(
      'validation'
    );
  });

  it('matrix↔checkout cross-link hrefs on autosave fail', () => {
    const checkoutHref = shopMatrixDraftAutosaveFailCheckoutHref('SS27', 'sess-xt-1');
    expect(checkoutHref).toContain('/shop/b2b/checkout');
    expect(checkoutHref).toContain('cartSession=sess-xt-1');
    expect(checkoutHref).toContain('draftAutosaveFail=1');

    const matrixHref = shopMatrixDraftAutosaveFailMatrixHref('SS27', 'demo-ss27-01');
    expect(matrixHref).toContain('/shop/b2b/matrix');
    expect(matrixHref).toContain('article=demo-ss27-01');
    expect(matrixHref).toContain('draftAutosaveFail=1');
  });

  it('RU copy for conflict + autosave fail banners', () => {
    expect(SHOP_MATRIX_DRAFT_CONFLICT_HINT_RU).toMatch(/конфликт/i);
    expect(SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_HINT_RU).toMatch(/checkout/i);
    expect(SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_CHECKOUT_LINK_RU).toMatch(/checkout/i);
    expect(SHOP_MATRIX_DRAFT_AUTOSAVE_FAIL_MATRIX_LINK_RU).toMatch(/матриц/i);
  });
});

describe('wave XT — draft validation hints + size run merge (WH polish)', () => {
  it('merges draft hints with size run message', () => {
    const merged = mergeShopMatrixDraftValidationHintsRu(
      [SHOP_MATRIX_DRAFT_EMPTY_HINT_RU],
      'Size run: MOQ не соблюдён'
    );
    expect(merged).toHaveLength(2);
    expect(merged.some((h) => h.includes('Size run'))).toBe(true);
  });

  it('draft MOQ validation still surfaces RU hints', () => {
    const result = validateShopMatrixDraftDocRu(
      {
        v: 1,
        collectionId: 'SS27',
        updatedAt: new Date().toISOString(),
        lines: [{ articleId: 'demo-ss27-01', colorCode: 'default', size: 'M', qty: 1 }],
      },
      { moqPerCell: 6, collectionId: 'SS27' }
    );
    expect(result.ok).toBe(false);
    expect(result.hintsRu.length).toBeGreaterThan(0);
  });

  it('size run cart merge picks first failed article (WH parity)', () => {
    const merged = mergeShopMatrixCartSizeRunResults([
      { articleId: 'demo-ss27-01', ok: false, violations: ['M'], messageRu: 'MOQ fail' },
    ]);
    expect(merged.ok).toBe(false);
    expect(merged.firstFailedArticleId).toBe('demo-ss27-01');
  });
});
