import { test, expect } from '@playwright/test';
import {
  expectOrderDetailResponsiveLayout,
  gotoPlatformCoreWorkspace,
} from './helpers/core-chain-overview';

const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';
const BRAND_ORDER = `/brand/b2b-orders/${DEMO_ORDER}?collection=SS27`;
const SHOP_ORDER = `/shop/b2b/orders/${DEMO_ORDER}?collection=SS27`;

async function expectNoPageOverflow(page: import('@playwright/test').Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      { timeout: 30_000 }
    )
    .toBe(true);
}

test.describe('core-106: order detail viewports', () => {
  test('iPhone 393 — shop order stack + cross-role под контентом', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 393, height: 812 });

    const res = await gotoPlatformCoreWorkspace(page, SHOP_ORDER);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('shop-b2b-order-detail-core')).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByTestId('shop-co-detail-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('platform-core-order-lines-scroll')).toBeVisible();
    await expectOrderDetailResponsiveLayout(page);
    await expectNoPageOverflow(page);
  });

  test('iPad 834 — brand order rail внизу, workspace tabs', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 834, height: 1194 });

    const res = await gotoPlatformCoreWorkspace(page, BRAND_ORDER);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-co-detail-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('pillar-workspace-brand-order-comms-tabs')).toBeVisible();
    await expect(page.getByTestId('pillar-workspace-brand-order-comms-cross-links')).toHaveCount(
      0
    );
    await expectOrderDetailResponsiveLayout(page);
    await expectNoPageOverflow(page);
  });

  test('desktop 1280 — brand order rail справа', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 1280, height: 800 });

    const res = await gotoPlatformCoreWorkspace(page, BRAND_ORDER);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-co-detail-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('platform-core-order-detail-rail')).toBeVisible();
    await expect(page.getByTestId('platform-core-order-detail-cross-role-mobile')).toBeHidden();
    await expectOrderDetailResponsiveLayout(page);
  });
});
