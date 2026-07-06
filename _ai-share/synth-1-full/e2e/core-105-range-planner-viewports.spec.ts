import { test, expect } from '@playwright/test';
import { gotoPlatformCoreWorkspace } from './helpers/core-chain-overview';

const RANGE_URL = '/brand/range-planner?collection=SS27';

async function expectNoPageOverflow(page: import('@playwright/test').Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      { timeout: 30_000 }
    )
    .toBe(true);
}

test.describe('core-105: brand range planner viewports', () => {
  test('iPhone 393 — panel, context strip, tier grid, no overflow', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 393, height: 812 });

    const res = await gotoPlatformCoreWorkspace(page, RANGE_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-dev-range-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('range-planner-core-pg-badge')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-range-context-strip')).toBeVisible();
    await expect(page.getByTestId('range-planner-tier-margin-input-core')).toBeVisible({
      timeout: 60_000,
    });

    const boardScroll = page.getByTestId('brand-dev-range-tier-board-scroll');
    if (await boardScroll.isVisible().catch(() => false)) {
      const canScroll = await boardScroll.evaluate((el) => el.scrollWidth > el.clientWidth + 4);
      expect(canScroll).toBe(true);
    }

    await expectNoPageOverflow(page);
  });

  test('iPad 834 — tier cards 2-col, context strip visible', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 834, height: 1194 });

    const res = await gotoPlatformCoreWorkspace(page, RANGE_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-dev-range-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('range-planner-core-pg-badge')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-dev-range-tier-plan-grid')).toBeVisible({
      timeout: 60_000,
    });

    const gridCols = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="brand-dev-range-tier-plan-grid"]');
      if (!grid) return 0;
      return window.getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
    });
    expect(gridCols).toBeGreaterThanOrEqual(2);

    await expectNoPageOverflow(page);
  });
});
