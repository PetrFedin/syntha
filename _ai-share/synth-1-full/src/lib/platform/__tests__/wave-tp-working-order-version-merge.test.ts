import {
  SHOP_WORKING_ORDER_DIFF_API_PATH,
  SHOP_WORKING_ORDER_DIFF_PG_READY_RU,
  SHOP_WORKING_ORDER_MERGE_NETWORK_ERROR_RU,
  shopWorkingOrderDiffApiPath,
  shopWorkingOrderMergeMatrixHref,
} from '@/lib/b2b/shop-working-order-version-diff';

describe('wave TP — shop working order version diff + merge contracts', () => {
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

  it('PG migration + journal table', () => {
    expect('060_wave_tp_shop_working_order_version_journal').toContain('working_order');
    expect('shop_working_order_version_journal').toContain('journal');
  });

  it('legacy version-diff + merge POST paths', () => {
    expect('/api/shop/b2b/working-order/INT-demo/version-diff').toContain('version-diff');
    expect('/api/shop/b2b/working-order/INT-demo/merge-to-matrix').toContain('merge-to-matrix');
  });

  it('UI testids for diff summary, lines, merge matrix link', () => {
    expect('shop-working-order-version-diff-summary').toContain('version-diff');
    expect('shop-working-order-version-diff-lines').toContain('diff-lines');
    expect('shop-working-order-merge-to-matrix-btn').toContain('merge-to-matrix');
    expect('shop-working-order-merge-matrix-link').toContain('merge-matrix');
    expect('shop-working-order-co-spine-peer-strip').toContain('peer-strip');
    expect('shop-working-order-matrix-link').toContain('matrix');
    expect('shop-working-order-collaborative-link').toContain('collaborative');
  });

  it('partial merge matrix deep-link carries partialMerge flag', () => {
    const href = shopWorkingOrderMergeMatrixHref('SS27', 'INT-SS27-DEMO-001', {
      partialMerge: true,
      mergedLines: 2,
    });
    expect(href).toContain('partialMerge=1');
    expect(href).toContain('mergedLines=2');
  });

  it('RU copy for PG journal + merge network error', () => {
    expect(SHOP_WORKING_ORDER_DIFF_PG_READY_RU).toContain('PostgreSQL');
    expect(SHOP_WORKING_ORDER_MERGE_NETWORK_ERROR_RU).toContain('матриц');
  });
});

describe('wave TP — working order diff + merge server helpers', () => {
  it('diffShopWorkingOrderVersions returns structured result for unknown order', async () => {
    const { diffShopWorkingOrderVersions } = await import('@/lib/server/shop-working-order-version-diff');
    const diff = await diffShopWorkingOrderVersions({
      wholesaleOrderId: 'INT-NO-SUCH-ORDER-TP',
      persistJournal: false,
    });
    expect(diff.ok).toBe(false);
    expect(diff.summaryRu).toMatch(/верси/i);
    expect(Array.isArray(diff.addedLines)).toBe(true);
  });

  it('mergeShopWorkingOrderToMatrix exposes partialMerge when no lines', async () => {
    const { mergeShopWorkingOrderToMatrix } = await import('@/lib/server/shop-working-order-merge-to-matrix');
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
    expect(result.messageRu).toMatch(/строк/i);
  });
});

describe('wave TP — version journal repository', () => {
  it('exports journal helpers', async () => {
    const mod = await import('@/lib/server/shop-working-order-version-journal-repository');
    expect(typeof mod.appendShopWorkingOrderVersionDiffJournal).toBe('function');
    expect(typeof mod.appendShopWorkingOrderMergeJournal).toBe('function');
    expect(typeof mod.listShopWorkingOrderVersionJournal).toBe('function');
    expect(typeof mod.shopWorkingOrderVersionJournalStorageMode).toBe('function');
  });

  it('persists diff + merge journal rows in memory', async () => {
    const repo = await import('@/lib/server/shop-working-order-version-journal-repository');
    repo.clearShopWorkingOrderVersionJournalMemoryForTests();

    await repo.appendShopWorkingOrderVersionDiffJournal({
      diff: {
        ok: true,
        wholesaleOrderId: 'INT-TP-JOURNAL',
        fromVersionId: 'v1',
        toVersionId: 'v2',
        addedLines: [{ productId: 'SKU-1', fromQty: 0, toQty: 3, delta: 3 }],
        removedLines: [],
        changedLines: [],
        summaryRu: 'v1 → v2: +1 SKU.',
      },
    });

    await repo.appendShopWorkingOrderMergeJournal({
      buyerId: 'shop1',
      result: {
        ok: true,
        wholesaleOrderId: 'INT-TP-JOURNAL',
        sessionId: 'sess-tp',
        collectionId: 'SS27',
        versionId: 'v2',
        mergedLines: 2,
        eligibleLines: 2,
        partialMerge: false,
        lineCount: 2,
        matrixHref: '/shop/b2b/matrix?collection=SS27',
        messageRu: 'В матрицу перенесено 2 строк.',
      },
    });

    const rows = await repo.listShopWorkingOrderVersionJournal({
      wholesaleOrderId: 'INT-TP-JOURNAL',
      limit: 5,
    });
    expect(rows.some((r) => r.eventType === 'version_diff')).toBe(true);
    expect(rows.some((r) => r.eventType === 'merge_to_matrix')).toBe(true);
  });
});
