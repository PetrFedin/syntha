import { test, expect } from '@playwright/test';

/**
 * Wave SX 4.1 + 4.3: supplier sidebar catalog nav + RFQ inbox comms peer route.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-109-wave-sx-supplier-nav.spec.ts
 */
test.describe('core-109: wave SX supplier nav + RFQ inbox', () => {
  test('sidebar: materials catalog + RFQ inbox links (distinct testids)', async ({ page }) => {
    const res = await page.goto('/factory/supplier/core?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);

    const catalogNav = page.getByTestId('supplier-sidebar-materials-catalog-nav');
    await expect(catalogNav).toBeVisible({ timeout: 45_000 });
    await expect(catalogNav).toHaveAttribute('href', /\/factory\/production\/catalog/);

    const rfqNav = page.getByTestId('supplier-sidebar-rfq-inbox-nav');
    await expect(rfqNav).toBeVisible();
    await expect(rfqNav).toHaveAttribute('href', /\/factory\/supplier\/rfq-inbox/);
    await expect(rfqNav).not.toHaveAttribute('href', /feature=rfq/);

    await expect(page.getByTestId('supplier-core-material-catalog-nav')).toBeVisible();
  });

  test('RFQ inbox route renders core page (not messages alias)', async ({ page }) => {
    const res = await page.goto('/factory/supplier/rfq-inbox?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page).toHaveURL(/\/factory\/supplier\/rfq-inbox/);
    await expect(page.getByTestId('supplier-rfq-inbox-core')).toBeVisible({ timeout: 45_000 });
  });

  test('catalog nav opens material catalog workspace', async ({ page }) => {
    await page.goto('/factory/supplier/core?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.getByTestId('supplier-sidebar-materials-catalog-nav').click();
    await expect(page).toHaveURL(/\/factory\/production\/catalog/, { timeout: 45_000 });
    await expect(page.getByTestId('supplier-material-catalog-core')).toBeVisible({ timeout: 45_000 });
  });
});
