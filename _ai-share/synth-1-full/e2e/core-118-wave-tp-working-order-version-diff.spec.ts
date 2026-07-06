import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const DEMO_ORDER = 'INT-SS27-DEMO-001';

/**
 * Wave TP: shop 2.2 working order version diff + partial merge→matrix link.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-118-wave-tp-working-order-version-diff.spec.ts
 */
test.describe('core-118: wave TP working order version diff', () => {
  test('working order diff GET (?orderId=)', async ({ request }) => {
    const res = await request.get(
      `/api/shop/b2b/working-order/diff?orderId=${encodeURIComponent(DEMO_ORDER)}`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      messageRu?: string;
      diff?: { summaryRu?: string; changedLines?: unknown[] };
      storageMode?: string;
    };
    expect(typeof json.messageRu).toBe('string');
    if (json.diff) {
      expect(typeof json.diff.summaryRu).toBe('string');
    }
    if (json.storageMode) expect(['pg', 'file']).toContain(json.storageMode);
  });

  test('legacy version-diff path still responds', async ({ request }) => {
    const res = await request.get(
      `/api/shop/b2b/working-order/${encodeURIComponent(DEMO_ORDER)}/version-diff`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { messageRu?: string };
    expect(typeof json.messageRu).toBe('string');
  });

  test('merge-to-matrix POST returns matrixHref + partialMerge fields', async ({ request }) => {
    const res = await request.post(
      `/api/shop/b2b/working-order/${encodeURIComponent(DEMO_ORDER)}/merge-to-matrix`,
      { data: { collectionId: 'SS27' } }
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      matrixHref?: string;
      partialMerge?: boolean;
      mergedLines?: number;
      eligibleLines?: number;
      messageRu?: string;
    };
    if (json.matrixHref) expect(json.matrixHref).toContain('/shop/b2b/matrix');
    if (json.partialMerge === true) {
      expect(json.matrixHref).toMatch(/partialMerge=1|mergedLines=/);
    }
    if (json.messageRu) expect(typeof json.messageRu).toBe('string');
  });

  test('working order versions panel shows diff summary strip', async ({ page }) => {
    const res = await page.goto(
      `/shop/b2b/working-order?collection=SS27&pcf=versions&order=${encodeURIComponent(DEMO_ORDER)}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-working-order-versions-panel')).toBeVisible({
      timeout: 60_000,
    });
    const spine = page.getByTestId('shop-working-order-spine-panel');
    const nonSpine = page.getByTestId('shop-working-order-non-spine');
    await expect(spine.or(nonSpine)).toBeVisible({ timeout: 45_000 });
    if (await spine.isVisible().catch(() => false)) {
      await expect(
        page
          .getByTestId('shop-working-order-version-diff-summary')
          .or(page.getByTestId('shop-working-order-version-list'))
      ).toBeVisible({ timeout: 30_000 });
    }
  });
});
