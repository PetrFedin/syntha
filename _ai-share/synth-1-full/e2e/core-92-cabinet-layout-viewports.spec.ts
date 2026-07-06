import { test, expect } from '@playwright/test';
import {
  expectCabinetAboveFold,
  expectCabinetAsidePanelLayout,
  expectCabinetPillarNav,
  expectWorkspacePillarStrip,
  gotoRoleCoreCabinet,
  waitForChainOverview,
} from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 120_000 };

test.describe('core-92: cabinet + workspace layout viewports', () => {
  test('iPhone 393 — brand cabinet above fold + matrix strip', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 812 });
    let res = await gotoRoleCoreCabinet(page, '/brand/core?collection=SS27');
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 60_000 });
    await expectCabinetPillarNav(page);

    res = await gotoRoleCoreCabinet(page, '/brand/core?collection=SS27&pillar=development');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-pillar-primary-cta')).toBeVisible();
    await expectCabinetAboveFold(page);

    res = await gotoRoleCoreCabinet(page, '/shop/core?collection=SS27');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-shop')).toBeVisible({ timeout: 60_000 });
    await expectCabinetPillarNav(page);
    await expectCabinetAboveFold(page);

    const chainMatrix = waitForChainOverview(page, { collectionId: 'SS27' });
    res = await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await chainMatrix;
    await expect(page.getByText('Ошибка B2B магазина')).toHaveCount(0);
    const matrixChrome = page.getByTestId('platform-core-list-chrome');
    await expect(matrixChrome).toBeVisible({ timeout: 60_000 });
    await expectWorkspacePillarStrip(page, matrixChrome);
  });

  test('iPad 834 — brand cabinet aside + shop matrix strip', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    await gotoRoleCoreCabinet(page, '/brand/core?collection=SS27&pillar=development');
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 60_000 });
    await expectCabinetPillarNav(page);
    await expect(page.getByTestId('role-core-pillar-panel')).toBeVisible();

    const res = await page.goto('/shop/core?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('role-core-cabinet-shop')).toBeVisible({ timeout: 60_000 });
    await expectCabinetPillarNav(page);

    await gotoRoleCoreCabinet(page, '/shop/core?collection=SS27&pillar=collection_order');
    await expect(page.getByTestId('role-pillar-primary-cta')).toBeVisible();
    await expectCabinetAboveFold(page);

    const matrixRes = await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    expect(matrixRes?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByText('Ошибка B2B магазина')).toHaveCount(0);
    await expect(page.getByTestId('platform-core-list-chrome')).toBeVisible({ timeout: 60_000 });
    await expectWorkspacePillarStrip(page);

    const brandOrdersLoad = page.waitForResponse(
      (r) => r.url().includes('/api/brand/b2b/orders') && r.ok(),
      { timeout: 120_000 }
    );
    const brandOrdersRes = await page.goto('/brand/b2b-orders', GOTO);
    expect(brandOrdersRes?.status() ?? 599).toBeLessThan(500);
    await brandOrdersLoad.catch(() => undefined);
    await expect(page.getByTestId('brand-co-registry-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-co-registry-card-grid')).toBeVisible({
      timeout: 60_000,
    });
    const gridCols = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="brand-co-registry-card-grid"]');
      if (!grid) return 0;
      return window.getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
    });
    expect(gridCols).toBeGreaterThanOrEqual(2);

    const shopOrdersLoad = page.waitForResponse(
      (r) => r.url().includes('/api/shop/b2b') && r.ok(),
      { timeout: 120_000 }
    );
    const shopOrdersRes = await page.goto('/shop/b2b/orders', GOTO);
    expect(shopOrdersRes?.status() ?? 599).toBeLessThan(500);
    await shopOrdersLoad.catch(() => undefined);
    await expect(page.getByTestId('shop-co-registry-card-grid')).toBeVisible({ timeout: 60_000 });
  });

  test('desktop 1280 — cabinet aside + panel, matrix strip hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoRoleCoreCabinet(page, '/brand/core?collection=SS27&pillar=development');
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 60_000 });
    await expectCabinetAsidePanelLayout(page);

    const chainMatrix = waitForChainOverview(page, { collectionId: 'SS27' });
    const res = await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await chainMatrix;
    await expect(page.getByText('Ошибка B2B магазина')).toHaveCount(0);
    await expectWorkspacePillarStrip(page);
    await expect(page.getByTestId('role-pillar-primary-cta')).toHaveCount(0);
  });
});
