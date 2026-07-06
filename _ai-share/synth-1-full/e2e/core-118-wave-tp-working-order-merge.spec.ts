import { test, expect } from '@playwright/test';

const DEMO_ORDER = 'INT-SS27-DEMO-001';

/**
 * Wave TP: shop working order merge-to-matrix + structured version diff (PG journal).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-118-wave-tp-working-order-merge.spec.ts
 */
test.describe('core-118: wave TP working order merge', () => {
  test('version-diff API returns structured diff + journalId', async ({ request }) => {
    const res = await request.get(
      `/api/shop/b2b/working-order/${encodeURIComponent(DEMO_ORDER)}/version-diff`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      messageRu?: string;
      journalId?: string;
      storageMode?: string;
      diff?: {
        summaryRu?: string;
        addedLines?: unknown[];
        removedLines?: unknown[];
        changedLines?: unknown[];
      };
    };
    expect(typeof json.messageRu).toBe('string');
    expect(json.diff).toBeTruthy();
    expect(Array.isArray(json.diff?.addedLines)).toBe(true);
    expect(Array.isArray(json.diff?.removedLines)).toBe(true);
    expect(Array.isArray(json.diff?.changedLines)).toBe(true);
    if (json.storageMode) expect(['pg', 'file', 'postgres']).toContain(json.storageMode);
  });

  test('merge-to-matrix POST happy path API', async ({ request }) => {
    const res = await request.post(
      `/api/shop/b2b/working-order/${encodeURIComponent(DEMO_ORDER)}/merge-to-matrix`,
      { data: { collectionId: 'SS27', sessionId: `b2b-cart-core118-${Date.now()}` } }
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      messageRu?: string;
      matrixHref?: string;
      mergedLines?: number;
      eligibleLines?: number;
      partialMerge?: boolean;
      journalId?: string;
      storageMode?: string;
    };
    expect(typeof json.messageRu).toBe('string');
    expect(typeof json.ok).toBe('boolean');
    if (json.matrixHref) expect(json.matrixHref).toContain('/shop/b2b/matrix');
    if (json.partialMerge === true) {
      expect(json.matrixHref).toMatch(/partialMerge=1|mergedLines=/);
    }
  });

  test('working order diff query API (?orderId=)', async ({ request }) => {
    const res = await request.get(
      `/api/shop/b2b/working-order/diff?orderId=${encodeURIComponent(DEMO_ORDER)}`
    );
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { diff?: { summaryRu?: string } };
    expect(typeof json.diff?.summaryRu).toBe('string');
  });
});
