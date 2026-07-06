import { test, expect } from '@playwright/test';
import { gotoPlatformCoreWorkspace } from './helpers/core-chain-overview';

const BRAND_LINESHEETS = '/brand/linesheets?collection=SS27';
const SHOP_SHOWROOM = '/shop/b2b/showroom?collection=SS27';

async function expectNoPageOverflow(page: import('@playwright/test').Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      { timeout: 30_000 }
    )
    .toBe(true);
}

test.describe('core-107: sample collection viewports', () => {
  test('iPhone 393 — brand linesheets card grid, no table', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 393, height: 812 });

    const res = await gotoPlatformCoreWorkspace(page, BRAND_LINESHEETS);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-sc-linesheets-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('brand-sc-linesheets-list')).toBeHidden();
    const grid = page.getByTestId('brand-sc-linesheets-card-grid');
    if (await grid.isVisible().catch(() => false)) {
      await expect(grid).toBeVisible();
      const cols = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      });
      expect(cols).toBe(1);
    }

    await expectNoPageOverflow(page);
  });

  test('iPad 834 — brand linesheets 2-col card grid', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 834, height: 1194 });

    const res = await gotoPlatformCoreWorkspace(page, BRAND_LINESHEETS);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-sc-linesheets-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('brand-sc-linesheets-list')).toBeHidden();

    const grid = page.getByTestId('brand-sc-linesheets-card-grid');
    if (await grid.isVisible().catch(() => false)) {
      const cols = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      });
      expect(cols).toBeGreaterThanOrEqual(2);
    }

    await expectNoPageOverflow(page);
  });

  test('iPhone 393 — shop showroom hero + article cards', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 393, height: 812 });

    const res = await gotoPlatformCoreWorkspace(page, SHOP_SHOWROOM);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('shop-sc-showroom-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('shop-sc-showroom-context-strip')).toBeVisible();

    const coverHero = page.getByTestId('shop-sc-showroom-cover-hero');
    if (await coverHero.isVisible().catch(() => false)) {
      const heroBox = await coverHero.boundingBox();
      expect(heroBox?.width ?? 0).toBeLessThanOrEqual(393 + 1);
    }

    await expect(page.getByTestId('shop-sc-showroom-hero-demo-ss27-01')).toBeVisible({
      timeout: 60_000,
    });

    await expectNoPageOverflow(page);
  });
});
