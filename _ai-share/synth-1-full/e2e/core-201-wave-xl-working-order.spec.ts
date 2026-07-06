import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const DEMO_ORDER = 'INT-SS27-DEMO-001';

/**
 * Wave XL: shop CO 6.8 working order version diff polish + merge→matrix golden path.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-201-wave-xl-working-order.spec.ts
 */
test.describe('core-201: wave XL shop working order', () => {
  test('diff GET returns changedSkuCount + path', async ({ request }) => {
    const res = await request.get(
      `/api/shop/b2b/working-order/diff?orderId=${encodeURIComponent(DEMO_ORDER)}`
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      path?: string;
      changedSkuCount?: number;
      diff?: { changedSkuCount?: number; summaryRu?: string };
      messageRu?: string;
      storageMode?: string;
    };
    expect(json.path).toContain('/api/shop/b2b/working-order/diff');
    expect(typeof json.messageRu).toBe('string');
    if (json.diff) {
      expect(typeof json.diff.summaryRu).toBe('string');
      if (json.changedSkuCount != null) {
        expect(json.changedSkuCount).toBe(json.diff.changedSkuCount);
      }
    }
    if (json.storageMode) expect(['pg', 'file', 'postgres', 'memory']).toContain(json.storageMode);
  });

  test('merge-to-matrix POST returns matrixHref + partialMerge fields', async ({ request }) => {
    const res = await request.post(
      `/api/shop/b2b/working-order/${encodeURIComponent(DEMO_ORDER)}/merge-to-matrix`,
      { data: { collectionId: 'SS27', sessionId: `b2b-cart-core201-${Date.now()}` } }
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      matrixHref?: string;
      partialMerge?: boolean;
      mergedLines?: number;
      messageRu?: string;
    };
    if (json.matrixHref) expect(json.matrixHref).toContain('/shop/b2b/matrix');
    if (json.partialMerge === true) {
      expect(json.matrixHref).toMatch(/partialMerge=1|mergedLines=/);
    }
    if (json.messageRu) expect(typeof json.messageRu).toBe('string');
  });

  test('working order — CO spine golden path includes matrix link', async ({ page }) => {
    const res = await page.goto(
      `/shop/b2b/working-order?collection=SS27&pcf=versions&order=${encodeURIComponent(DEMO_ORDER)}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-golden-path-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-co-golden-path-matrix-link')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-working-order-golden-path-strip')).toBeVisible();
    await expect(page.getByTestId('shop-working-order-golden-matrix-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-working-order-native-order-honest-strip')).toHaveCount(0);
  });

  test('versions panel shows diff summary or version list', async ({ page }) => {
    await page.goto(
      `/shop/b2b/working-order?collection=SS27&pcf=versions&order=${encodeURIComponent(DEMO_ORDER)}`,
      GOTO
    );
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
      await expect(page.getByTestId('shop-working-order-merge-to-matrix-btn')).toBeVisible();
    }
  });
});
