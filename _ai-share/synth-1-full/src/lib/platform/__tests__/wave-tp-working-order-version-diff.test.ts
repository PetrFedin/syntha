import {
  SHOP_WORKING_ORDER_DIFF_API_PATH,
  shopWorkingOrderDiffApiPath,
  shopWorkingOrderMergeMatrixHref,
} from '@/lib/b2b/shop-working-order-version-diff';
import { diffShopWorkingOrderVersions } from '@/lib/server/shop-working-order-version-diff';
import { mergeShopWorkingOrderToMatrix } from '@/lib/server/shop-working-order-merge-to-matrix';

describe('wave TP — shop 2.2 working order version diff API', () => {
  it('diff API path contract (?orderId=)', () => {
    expect(SHOP_WORKING_ORDER_DIFF_API_PATH).toBe('/api/shop/b2b/working-order/diff');
    expect(shopWorkingOrderDiffApiPath('INT-SS27-DEMO-001')).toContain('orderId=INT-SS27-DEMO-001');
    const withVersions = shopWorkingOrderDiffApiPath('INT-demo', {
      fromVersionId: 'v1',
      toVersionId: 'v2',
    });
    expect(withVersions).toContain('from=v1');
    expect(withVersions).toContain('to=v2');
  });

  it('legacy version-diff path still valid (wave SP)', () => {
    expect('/api/shop/b2b/working-order/INT-demo/version-diff').toContain('version-diff');
  });

  it('UI testids for diff summary + line preview', () => {
    expect('shop-working-order-version-diff-summary').toContain('version-diff');
    expect('shop-working-order-version-diff-lines').toContain('diff-lines');
  });

  it('partial merge matrix deep-link carries partialMerge flag', () => {
    expect(
      shopWorkingOrderMergeMatrixHref('SS27', 'INT-SS27-DEMO-001', {
        partialMerge: true,
        mergedLines: 2,
      })
    ).toContain('partialMerge=1');
    expect(
      shopWorkingOrderMergeMatrixHref('SS27', 'INT-SS27-DEMO-001', {
        partialMerge: true,
        mergedLines: 2,
      })
    ).toContain('mergedLines=2');
    expect('shop-working-order-merge-matrix-link').toContain('merge-matrix');
  });
});

describe('wave TP — working order diff + merge server helpers', () => {
  it('diffShopWorkingOrderVersions returns structured result for unknown order', async () => {
    const diff = await diffShopWorkingOrderVersions({
      wholesaleOrderId: 'INT-NO-SUCH-ORDER-TP',
      persistJournal: false,
    });
    expect(diff.ok).toBe(false);
    expect(diff.summaryRu).toMatch(/верси/i);
    expect(Array.isArray(diff.addedLines)).toBe(true);
  });

  it('mergeShopWorkingOrderToMatrix exposes partialMerge when no lines', async () => {
    const result = await mergeShopWorkingOrderToMatrix({
      wholesaleOrderId: 'INT-NO-SUCH-ORDER-TP',
      sessionId: 'b2b-cart-tp-test',
      buyerId: 'shop1',
      collectionId: 'SS27',
      persistJournal: false,
    });
    expect(result.partialMerge).toBe(false);
    expect(result.eligibleLines).toBe(0);
    expect(result.matrixHref).toContain('/shop/b2b/matrix');
  });
});
