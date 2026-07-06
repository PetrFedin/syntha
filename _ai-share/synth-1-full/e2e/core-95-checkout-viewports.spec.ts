import { test, expect } from '@playwright/test';
import { expectWorkspacePillarStrip, waitForChainOverview } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 120_000 };

test.describe('core-95: shop checkout viewports', () => {
  test('iPhone 393 — panel, sticky actions, no page overflow', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 812 });
    const chain = waitForChainOverview(page, { collectionId: 'SS27' });
    const res = await page.goto('/shop/b2b/checkout?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await chain.catch(() => undefined);

    const chrome = page.getByTestId('platform-core-list-chrome');
    await expect(chrome).toBeVisible({ timeout: 60_000 });
    await expectWorkspacePillarStrip(page, chrome);
    await expect(page.getByTestId('shop-co-checkout-step-partner')).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-step-cart')).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-step-confirm')).toBeVisible();

    await expect
      .poll(
        async () =>
          page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        { timeout: 15_000 }
      )
      .toBe(true);

    const layout = await page.evaluate(() => {
      const vh = window.innerHeight;
      const confirm = document.querySelector('[data-testid="shop-co-checkout-confirm"]');
      const confirmRect = confirm?.getBoundingClientRect();
      return {
        confirmVisible: confirmRect ? confirmRect.bottom <= vh + 2 : false,
        confirmH: confirmRect?.height ?? 0,
      };
    });
    expect(layout.confirmVisible).toBe(true);
    expect(layout.confirmH).toBeGreaterThanOrEqual(44);
  });

  test('iPad 834 — context strip + form visible', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    const res = await page.goto('/shop/b2b/checkout?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-checkout-form')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-co-checkout-buyer-picker')).toBeVisible();
    await expectWorkspacePillarStrip(page);
  });
});
