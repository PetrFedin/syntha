import { test, expect } from '@playwright/test';
import { gotoPlatformPlanner } from './helpers/core-chain-overview';

/**
 * Hub planner panel — iPhone / iPad responsive smoke.
 */
test.describe('core-104: hub planner viewports', () => {
  test.beforeEach(() => {
    test.setTimeout(180_000);
  });

  test('iPhone 393 — planner без horizontal overflow, touch CTA', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 812 });
    await gotoPlatformPlanner(page);

    await expect(page.getByTestId('platform-core-planner-page')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('platform-core-planner')).toBeVisible();
    await expect(page.getByTestId('platform-core-planner-toolbar')).toBeVisible();
    await expect(page.getByTestId('planner-tab-development')).toBeVisible();

    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    );
    expect(noOverflow).toBe(true);

    const runBtn = page.getByTestId('planner-run-agents');
    await expect(runBtn).toBeVisible();
    const box = await runBtn.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test('iPad 834 — planner toolbar + tabs', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    await gotoPlatformPlanner(page);

    await expect(page.getByTestId('platform-core-planner-page')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('planner-tab-tech-debt')).toBeVisible();
    await expect(page.getByTestId('platform-core-planner-actions')).toBeVisible();

    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    );
    expect(noOverflow).toBe(true);
  });
});
