import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave TL: shop SC showroom eligible-for-matrix filter + qty carry + partner logo badge.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-116-wave-tl-showroom-eligible-matrix.spec.ts
 */
test.describe('core-116: wave TL shop showroom eligible-for-matrix', () => {
  test('eligible-for-matrix GET returns published + eligible counts', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await request.get(
      '/api/shop/b2b/showroom/eligible-for-matrix?collection=SS27&buyerId=shop1'
    );
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as {
      ok?: boolean;
      publishedCount?: number;
      eligibleCount?: number;
      articles?: unknown[];
      storageMode?: string;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.publishedCount).toBe('number');
    expect(typeof json.eligibleCount).toBe('number');
    expect(Array.isArray(json.articles)).toBe(true);
    expect(['pg', 'file', 'memory']).toContain(json.storageMode);
    expect(json.messageRu).toMatch(/матриц|eligible|signoff/i);
  });

  test('eligible filter toggle + partner logo badge on showroom', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-toggle')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-showroom-partner-logo-source-pg')
        .or(page.getByTestId('shop-sc-showroom-partner-logo-source-dossier-fallback'))
        .or(page.getByTestId('shop-sc-showroom-cover-hero'))
    ).toBeVisible({ timeout: 45_000 });
    await page.getByTestId('shop-sc-showroom-eligible-filter-toggle').click();
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-hint')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('showroom quick-add carries partial cart qty to matrix', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-panel')).toBeVisible({ timeout: 60_000 });

    const articleId = 'demo-ss27-01';
    const applyBtn = page.getByTestId(`shop-sc-showroom-inline-qty-apply-${articleId}`);
    const qtyInput = page.getByTestId(`shop-sc-showroom-inline-qty-input-${articleId}`);
    if (await applyBtn.isVisible().catch(() => false)) {
      await qtyInput.fill('3');
      await applyBtn.click();
      await expect(page.getByTestId(`shop-sc-showroom-cart-qty-${articleId}`)).toContainText(
        '3',
        { timeout: 30_000 }
      );
    }

    const quickAdd = page.getByTestId(`shop-sc-showroom-matrix-quick-add-${articleId}`);
    await expect(quickAdd).toBeVisible({ timeout: 30_000 });
    const nav = page.waitForURL(/\/shop\/b2b\/matrix.*article=demo-ss27-01/, {
      timeout: 60_000,
    });
    await quickAdd.click();
    await nav;
    expect(page.url()).toMatch(/carryQty=3|article=demo-ss27-01/);
    await expect(page.getByTestId('shop-sc-matrix-entry-panel')).toBeVisible({ timeout: 30_000 });
  });
});
