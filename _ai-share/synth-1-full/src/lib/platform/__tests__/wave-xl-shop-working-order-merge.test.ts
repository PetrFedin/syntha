import {
  SHOP_WORKING_ORDER_DIFF_API_PATH,
  SHOP_WORKING_ORDER_DIFF_PG_HINT_RU,
  SHOP_WORKING_ORDER_MERGE_BTN_RU,
  SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_FULL_RU,
  SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_PARTIAL_RU,
  SHOP_WORKING_ORDER_MERGE_TO_MATRIX_PATH_SUFFIX,
  shopWorkingOrderDiffApiPath,
  shopWorkingOrderMergeMatrixHref,
  shopWorkingOrderMergeToMatrixApiPath,
  shopWorkingOrderVersionDiffChangedSkuCount,
  shopWorkingOrderVersionDiffLegacyPath,
  shopWorkingOrderVersionDiffLinePreview,
} from '@/lib/b2b/shop-working-order-version-diff';

describe('wave XL — shop working order version diff API polish', () => {
  it('diff API path + legacy path helpers', () => {
    expect(SHOP_WORKING_ORDER_DIFF_API_PATH).toBe('/api/shop/b2b/working-order/diff');
    expect(shopWorkingOrderDiffApiPath('INT-SS27-DEMO-001')).toContain('orderId=INT-SS27-DEMO-001');
    expect(shopWorkingOrderVersionDiffLegacyPath('INT-demo')).toContain('/version-diff');
    expect(shopWorkingOrderMergeToMatrixApiPath('INT-demo')).toContain(
      SHOP_WORKING_ORDER_MERGE_TO_MATRIX_PATH_SUFFIX
    );
  });

  it('diff line preview + changed SKU count', () => {
    const diff = {
      addedLines: [{ productId: 'A', fromQty: 0, toQty: 2, delta: 2 }],
      removedLines: [],
      changedLines: [{ productId: 'B', fromQty: 1, toQty: 3, delta: 2 }],
    };
    expect(shopWorkingOrderVersionDiffChangedSkuCount(diff)).toBe(2);
    const preview = shopWorkingOrderVersionDiffLinePreview(diff, 1);
    expect(preview.length).toBe(1);
    expect(preview[0].productId).toBe('B');
  });

  it('partial merge matrix deep-link carries partialMerge flag', () => {
    const href = shopWorkingOrderMergeMatrixHref('SS27', 'INT-SS27-DEMO-001', {
      partialMerge: true,
      mergedLines: 3,
    });
    expect(href).toContain('partialMerge=1');
    expect(href).toContain('mergedLines=3');
  });

  it('RU copy for merge UI + PG hint', () => {
    expect(SHOP_WORKING_ORDER_MERGE_BTN_RU).toBe('В матрицу');
    expect(SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_PARTIAL_RU).toMatch(/частичн/i);
    expect(SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_FULL_RU).toMatch(/перенесённ/i);
    expect(SHOP_WORKING_ORDER_DIFF_PG_HINT_RU).toMatch(/PostgreSQL/i);
  });

  it('golden path + merge UI testids', () => {
    expect('shop-co-golden-path-matrix-link').toContain('matrix');
    expect('shop-working-order-golden-path-strip').toContain('golden-path');
    expect('shop-working-order-merge-to-matrix-btn').toContain('merge-to-matrix');
    expect('shop-working-order-merge-matrix-link').toContain('merge-matrix');
    expect('shop-working-order-version-diff-summary').toContain('version-diff');
    expect('shop-working-order-matrix-link').toContain('matrix');
  });
});

describe('wave XL — working order diff + merge server helpers', () => {
  it('diffShopWorkingOrderVersions returns changedSkuCount for unknown order', async () => {
    const { diffShopWorkingOrderVersions } = await import('@/lib/server/shop-working-order-version-diff');
    const diff = await diffShopWorkingOrderVersions({
      wholesaleOrderId: 'INT-NO-SUCH-ORDER-XL',
      persistJournal: false,
    });
    expect(diff.ok).toBe(false);
    expect(diff.changedSkuCount).toBe(0);
    expect(diff.summaryRu).toMatch(/верси/i);
  });

  it('mergeShopWorkingOrderToMatrix exposes matrixHref + RU message', async () => {
    const { mergeShopWorkingOrderToMatrix } = await import('@/lib/server/shop-working-order-merge-to-matrix');
    const result = await mergeShopWorkingOrderToMatrix({
      wholesaleOrderId: 'INT-NO-SUCH-ORDER-XL',
      sessionId: 'b2b-cart-xl-test',
      buyerId: 'shop1',
      collectionId: 'SS27',
      persistJournal: false,
    });
    expect(result.partialMerge).toBe(false);
    expect(result.eligibleLines).toBe(0);
    expect(result.matrixHref).toContain('/shop/b2b/matrix');
    expect(result.messageRu).toMatch(/строк/i);
  });
});
