import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XH: shop SC showroom partner logo PG vs dossier fallback, eligible filter polish, hero dedupe.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-197-wave-xh-showroom-logo.spec.ts
 */
test.describe('core-197: wave XH shop showroom partner logo', () => {
  test('eligible-for-matrix API path + counts contract', async ({ request }) => {
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
      filterActive?: boolean;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.publishedCount).toBe('number');
    expect(typeof json.eligibleCount).toBe('number');
    expect(json.filterActive).toBe(false);
    expect(json.messageRu).toMatch(/матриц|eligible|signoff/i);
  });

  test('showroom SS27: partner logo badge + dossier hero dedupe', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-panel')).toBeVisible({ timeout: 60_000 });

    await expect(page.getByTestId('shop-sc-showroom-partner-logo-row')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-showroom-partner-logo-source-pg')
        .or(page.getByTestId('shop-sc-showroom-partner-logo-source-dossier-fallback'))
        .or(page.getByTestId('shop-sc-showroom-partner-logo-source-catalog-fallback'))
    ).toBeVisible({ timeout: 45_000 });

    await expect(page.getByTestId('shop-sc-showroom-cover-hero')).toBeVisible({ timeout: 45_000 });
    const dossierHero = page.getByTestId('shop-sc-showroom-cover-hero-source-dossier');
    if (await dossierHero.isVisible().catch(() => false)) {
      await expect(page.getByTestId('shop-sc-showroom-cover-hero-priority-strip')).toHaveCount(0);
      await expect(
        page.getByTestId('shop-sc-showroom-partner-logo-source-dossier-fallback')
      ).toBeVisible();
    }
  });

  test('eligible filter counts + hint on toggle', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-toggle')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-counts')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-hint')).toHaveCount(0);

    await page.getByTestId('shop-sc-showroom-eligible-filter-toggle').click();
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-hint')).toBeVisible({
      timeout: 30_000,
    });
  });
});
