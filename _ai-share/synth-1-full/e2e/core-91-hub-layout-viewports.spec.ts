import { test, expect } from '@playwright/test';
import { clickHubRoleQuickEntry, gotoPlatformHub } from './helpers/core-chain-overview';

async function stabilizeHubChrome(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => document.fonts?.ready).catch(() => undefined);
  await page.waitForTimeout(150);
}

const SCREENSHOT_OPTS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.05,
  caret: 'hide' as const,
};

/**
 * Hub layout — iPhone / iPad / desktop (preview targets).
 * Быстрый вход: роль → кабинет default pillar.
 */
test.describe('core-91: hub layout viewports', () => {
  test.beforeEach(() => {
    test.setTimeout(180_000);
  });

  test('iPhone 393×812 — hero + роли above the fold, кабинет после выбора', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 812 });
    await gotoPlatformHub(page, '/platform?views=business');

    await expect(page.getByTestId('platform-core-syntha-style-banner')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('platform-core-syntha-style-tagline')).toHaveText(
      'ИНТЕЛЛЕКТ СТИЛЯ'
    );
    await expect(page.getByTestId('platform-core-hub-quick-entry')).toBeVisible();
    await expect(page.getByTestId('role-block-brand')).toBeVisible();
    await expect(page.getByTestId('role-block-shop')).toBeVisible();
    await expect(page.getByTestId('hub-pillar-development')).toHaveCount(0);

    const fold = await page.evaluate(() => {
      const ids = [
        'platform-core-syntha-style-banner',
        'role-block-brand',
        'role-block-shop',
      ];
      const vh = window.innerHeight;
      for (const id of ids) {
        const el = document.querySelector(`[data-testid="${id}"]`);
        if (!el) return { ok: false, reason: `missing ${id}` };
        const { bottom } = el.getBoundingClientRect();
        if (bottom > vh + 2) return { ok: false, reason: `${id} bottom ${bottom} > ${vh}` };
      }
      return { ok: true };
    });
    expect(fold.ok, fold.reason).toBe(true);

    const cardsInView = await page.evaluate(() => {
      const vw = window.innerWidth;
      const check = (id: string) => {
        const el = document.querySelector(`[data-testid="${id}"]`);
        if (!el) return false;
        const { left, right } = el.getBoundingClientRect();
        return left >= 0 && right <= vw + 1;
      };
      return { brand: check('role-block-brand'), shop: check('role-block-shop') };
    });
    expect(cardsInView.brand).toBe(true);
    expect(cardsInView.shop).toBe(true);

    await clickHubRoleQuickEntry(page, 'brand');
    await expect(page).toHaveURL(/\/brand\/core\?.*pillar=/);
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('pillar-cabinet-section-list')).toBeVisible();

    await stabilizeHubChrome(page);
    await expect(page.getByTestId('role-core-cabinet-brand')).toHaveScreenshot(
      'hub-layout-iphone-393.png',
      SCREENSHOT_OPTS
    );
  });

  test('iPad 834×1194 — роли 2×2, кабинет после выбора роли', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    await gotoPlatformHub(page, '/platform?views=business');

    await expect(page.getByTestId('platform-core-role-blocks')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('hub-pillar-development')).toHaveCount(0);

    await expect(page.getByTestId('role-block-brand')).toBeVisible();
    await expect(page.getByTestId('role-block-shop')).toBeVisible();
    await expect(page.getByTestId('role-block-manufacturer')).toBeVisible();
    await expect(page.getByTestId('role-block-supplier')).toBeVisible();

    await clickHubRoleQuickEntry(page, 'brand');
    await expect(page).toHaveURL(/\/brand\/core\?.*pillar=/);
    await expect(page.getByTestId('role-core-cabinet-brand')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('role-core-pillar-nav')).toBeVisible();

    await stabilizeHubChrome(page);
    await expect(page.getByTestId('role-core-cabinet-brand')).toHaveScreenshot(
      'hub-layout-ipad-834.png',
      SCREENSHOT_OPTS
    );
  });

  test('desktop 1280 — hub + inline матрица оценки', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await gotoPlatformHub(page, '/platform?views=business,audit');

    await expect(page.getByTestId('platform-core-hub-main-column')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('platform-core-hub-audit-launcher')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('platform-core-hub-audit-launcher')).toContainText(
      'Оценка готовности'
    );
    await expect(page.getByTestId('platform-core-hub-audit-launcher')).toContainText(
      'Матрица 5×4'
    );
    await expect(page.getByTestId('platform-core-hub-audit-open')).toHaveCount(0);
    await expect(page.getByTestId('platform-core-readiness-matrix')).toBeVisible({
      timeout: 60_000,
    });
  });

  test('iPad 834 — audit-only роли 2×2 + audit launcher', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    await gotoPlatformHub(page, '/platform?views=audit');

    await expect(page.getByTestId('platform-core-role-blocks')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('platform-core-hub-audit-launcher')).toBeVisible({
      timeout: 60_000,
    });

    const grid = await page.evaluate(() => {
      const ids = [
        'role-block-brand',
        'role-block-shop',
        'role-block-manufacturer',
        'role-block-supplier',
      ];
      const rects = ids.map((id) => {
        const el = document.querySelector(`[data-testid="${id}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { id, top: r.top, left: r.left, bottom: r.bottom, right: r.right };
      });
      if (rects.some((r) => !r)) return { ok: false, reason: 'missing card' };

      const [brand, shop, mfr, sup] = rects as NonNullable<(typeof rects)[number]>[];
      const sameRow = (a: typeof brand, b: typeof brand) => Math.abs(a.top - b.top) < 8;
      const brandShopRow = sameRow(brand, shop) && shop.left > brand.right - 4;
      const mfrSupRow = sameRow(mfr, sup) && sup.left > mfr.right - 4;
      const twoRows = mfr.top > brand.bottom - 4;

      return { ok: brandShopRow && mfrSupRow && twoRows };
    });
    expect(grid.ok).toBe(true);
  });
});
