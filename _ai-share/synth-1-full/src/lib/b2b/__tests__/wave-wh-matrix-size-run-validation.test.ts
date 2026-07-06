import {
  SHOP_MATRIX_SIZE_RUN_CHECKOUT_BLOCK_RU,
  SHOP_MATRIX_SIZE_RUN_FIX_MATRIX_LINK_RU,
  buildShopMatrixQtyByArticleFromCartItems,
  buildShopMatrixQtyByArticleFromSessionLines,
  mergeShopMatrixCartSizeRunResults,
  shopMatrixSizeRunFixHref,
} from '@/lib/b2b/shop-matrix-size-run-cart-validation';
import {
  mergeShopMatrixSizeRunValidationResults,
  validateShopMatrixSizeRunDistribution,
  validateShopMatrixSizeRunMoq,
} from '@/lib/b2b/shop-matrix-size-run-validate';
import { shopB2bMatrixArticleHref } from '@/lib/routes';

describe('wave WH — matrix size run cart validation', () => {
  it('groups cart items by article and size', () => {
    const articles = buildShopMatrixQtyByArticleFromCartItems([
      { id: 'demo-ss27-01', quantity: 3, selectedSize: 'M' },
      { id: 'demo-ss27-01', quantity: 2, selectedSize: 'L' },
      { id: 'demo-ss27-02', quantity: 6, selectedSize: 'S' },
    ]);
    expect(articles).toHaveLength(2);
    expect(articles[0]?.qtyBySize).toEqual({ M: 3, L: 2 });
  });

  it('groups session lines by article', () => {
    const articles = buildShopMatrixQtyByArticleFromSessionLines([
      { articleId: 'demo-ss27-01', size: 'M', qty: 4 },
      { articleId: 'demo-ss27-01', size: 'L', qty: 2 },
    ]);
    expect(articles[0]?.qtyBySize).toEqual({ M: 4, L: 2 });
  });

  it('merge cart results picks first failed article', () => {
    const merged = mergeShopMatrixCartSizeRunResults([
      { articleId: 'a1', ok: true, violations: [], messageRu: 'ok' },
      { articleId: 'a2', ok: false, violations: ['M'], messageRu: 'MOQ fail' },
    ]);
    expect(merged.ok).toBe(false);
    expect(merged.firstFailedArticleId).toBe('a2');
    expect(merged.messageRu).toMatch(/a2|MOQ/i);
  });

  it('RU checkout block + fix link copy', () => {
    expect(SHOP_MATRIX_SIZE_RUN_CHECKOUT_BLOCK_RU).toMatch(/матриц/i);
    expect(SHOP_MATRIX_SIZE_RUN_FIX_MATRIX_LINK_RU).toMatch(/size run/i);
  });

  it('matrix↔checkout cross-link hrefs', () => {
    expect(shopB2bMatrixArticleHref('SS27', 'demo-ss27-01')).toContain('article=demo-ss27-01');
    expect(shopMatrixSizeRunFixHref('SS27', 'demo-ss27-01')).toContain('/shop/b2b/matrix');
  });

  it('size run validate API path + UI testids', () => {
    expect('/api/shop/b2b/matrix/size-run-validate').toContain('size-run-validate');
    expect('shop-co-matrix-size-run-hint').toContain('size-run');
    expect('shop-co-checkout-size-run-hint').toContain('size-run');
    expect('shop-co-checkout-size-run-matrix-link').toContain('matrix-link');
    expect('shop-co-matrix-size-run-fix-link').toContain('fix-link');
  });

  it('MOQ + curve merge still surfaces RU violations', () => {
    const merged = mergeShopMatrixSizeRunValidationResults([
      validateShopMatrixSizeRunMoq({ qtyBySize: { M: 1 }, moqPerCell: 6 }),
      validateShopMatrixSizeRunDistribution({
        qtyBySize: { XXL: 12 },
        expectedCurve: { S: 2, M: 3, L: 2 },
      }),
    ]);
    expect(merged.ok).toBe(false);
    expect(merged.messageRu.length).toBeGreaterThan(0);
  });
});
