import { test, expect } from '@playwright/test';
import { gotoPlatformCoreWorkspace } from './helpers/core-chain-overview';

const W2_HUB_URL = '/brand/production/workshop2?w2col=SS27&pcf=hub';

async function expectNoPageOverflow(page: import('@playwright/test').Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      { timeout: 30_000 }
    )
    .toBe(true);
}

test.describe('core-98: brand W2 hub viewports', () => {
  test('iPhone 393 — hub panel, workspace tabs, gates, no overflow', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 393, height: 812 });

    const res = await gotoPlatformCoreWorkspace(page, W2_HUB_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 120_000 });

    const workspaceTabs = page.getByTestId('pillar-workspace-brand-sample-lifecycle-tabs');
    if (await workspaceTabs.isVisible({ timeout: 15_000 }).catch(() => false)) {
      await expect(workspaceTabs).toBeVisible();
      await expect(page.getByTestId('brand-sample-feature-hub')).toBeVisible();
      await expect(page.getByTestId('brand-w2-create-article-btn')).toBeVisible();
      await expect(
        page.getByTestId('pillar-workspace-brand-sample-lifecycle-cross-links')
      ).toHaveCount(0);
    }

    const gates = page.getByTestId('brand-dev-w2-hub-gates-strip');
    if ((await gates.count()) > 0) {
      await expect(gates).toBeVisible();
    }

    await expect(page.getByTestId('brand-dev-pg-sync-peer-strip')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-dev-pg-sync-range-link')).toBeVisible();
    await expect(page.getByTestId('workshop2-hub-sla-ops-panel')).toBeVisible();

    await expectNoPageOverflow(page);
  });

  test('iPad 834 — gates wrap, workspace tabs, no overflow', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 834, height: 1194 });

    const res = await gotoPlatformCoreWorkspace(page, W2_HUB_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 120_000 });

    const workspaceTabs = page.getByTestId('pillar-workspace-brand-sample-lifecycle-tabs');
    if (await workspaceTabs.isVisible({ timeout: 15_000 }).catch(() => false)) {
      await expect(workspaceTabs).toBeVisible();
      await expect(
        page.getByTestId('pillar-workspace-brand-sample-lifecycle-cross-links')
      ).toHaveCount(0);
    }

    const gates = page.getByTestId('brand-dev-w2-hub-gates-strip');
    if ((await gates.count()) > 0) {
      await expect(gates).toBeVisible();
      const box = await gates.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(834 + 2);
      }
    }

    await expect(page.getByTestId('brand-dev-pg-sync-stack')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-dev-pg-sync-peer-strip')).toBeVisible();
    const pgStrip = page.getByTestId('brand-dev-pg-sync-peer-strip');
    const stripBox = await pgStrip.boundingBox();
    expect(stripBox).not.toBeNull();
    if (stripBox) {
      expect(stripBox.width).toBeLessThanOrEqual(834 + 2);
    }

    await expectNoPageOverflow(page);
  });
});
