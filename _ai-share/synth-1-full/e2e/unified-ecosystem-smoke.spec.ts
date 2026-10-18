import { test, expect, type Page } from '@playwright/test';
import { gotoResilient } from './goto-resilient';

/** Next.js может добавить `?_rsc=…` к URL — сравниваем только pathname. */
function pathnameEquals(expected: string) {
  const norm = (p: string) => (p.replace(/\/$/, '') || '/') as string;
  const want = norm(expected);
  return (url: URL) => norm(url.pathname) === want;
}

/**
 * Обязательные role surfaces должны существовать именно как HTTP-маршруты.
 * DOM-assert без проверки response может замаскировать 404 shell / stale redirect.
 */
async function gotoCanonical(page: Page, path: string, timeout?: number) {
  const response = await gotoResilient(page, path, {
    waitUntil: 'domcontentloaded',
    ...(timeout ? { timeout } : {}),
  });
  expect(response, `${path} should return an HTTP response`).not.toBeNull();
  expect(response?.status() ?? 599, `${path} must not be a dead route`).toBeLessThan(400);
  await expect(page).toHaveURL(pathnameEquals(path), { timeout: timeout ?? 30_000 });
  return response;
}

/**
 * Демо-приёмка экосистемы (см. INTEGRATION_MAP §6, docs/UNIFIED_ECOSYSTEM_VERIFICATION.md).
 * Shop inventory: serial — cross-links → logistics → shop shell (порядок важен для стабильного demo-auth в CI).
 */
test.describe('Unified ecosystem smoke (demo)', () => {
  test.describe('Shop inventory contour (serial)', () => {
    /** Shell + upload + cold `next dev` — лимит describe **210s** (см. `playwright.config.ts`). */
    test.describe.configure({ mode: 'serial', timeout: 210_000 });

    test('Brand ↔ Shop inventory cross-links (stock contour)', async ({ page }) => {
      await gotoCanonical(page, '/brand/inventory', 60_000);
      await expect(page.getByTestId('brand-inventory-page')).toBeVisible({ timeout: 30_000 });
      const toShop = page.getByTestId('brand-inventory-shop-stock-upload-link');
      await expect(toShop).toHaveAttribute('href', '/shop/inventory');
      await Promise.all([
        page.waitForURL(pathnameEquals('/shop/inventory'), { timeout: 45_000 }),
        toShop.click({ timeout: 45_000 }),
      ]);
      /** Холодный `next dev`: сегмент `/shop` после клика из `/brand` в CI иногда компилируется дольше 20s (без `waitForLoadState('load')` — при SPA нет второго `load`). */
      await expect(page.getByTestId('shop-inventory-page')).toBeVisible({ timeout: 60_000 });
      await expect(page.getByTestId('shop-stock-sync')).toBeVisible({ timeout: 45_000 });
      const back = page.getByTestId('shop-inventory-brand-matrix-link');
      await back.scrollIntoViewIfNeeded();
      await expect(back).toBeVisible({ timeout: 15_000 });
      await expect(back).toHaveAttribute('href', '/brand/inventory');
      await back.click();
      await page.waitForURL(pathnameEquals('/brand/inventory'), { timeout: 45_000 });
      await expect(page.getByTestId('brand-inventory-page')).toBeVisible({ timeout: 20_000 });
    });

    test('Brand logistics hub → Shop stock upload link', async ({ page }) => {
      await gotoCanonical(page, '/brand/logistics', 60_000);
      await expect(page.getByTestId('brand-logistics-hub-page')).toBeVisible();
      const toShop = page.getByTestId('brand-logistics-shop-stock-upload-link');
      await expect(toShop).toHaveAttribute('href', '/shop/inventory');
      await Promise.all([
        page.waitForURL(pathnameEquals('/shop/inventory'), { timeout: 45_000 }),
        toShop.click({ timeout: 45_000 }),
      ]);
      await expect(page.getByTestId('shop-inventory-page')).toBeVisible({ timeout: 60_000 });
      await expect(page.getByTestId('shop-stock-sync')).toBeVisible({ timeout: 45_000 });
    });

    test('Shop inventory shell', async ({ page }) => {
      /** `load` на SPA иногда гонится с Suspense (`shop/loading`); `domcontentloaded` + проверка URL ловят редирект на `/`. */
      await gotoCanonical(page, '/shop/inventory', 60_000);
      await expect(page.getByTestId('shop-inventory-page')).toBeVisible({ timeout: 90_000 });
      await expect(page.getByTestId('shop-stock-sync')).toBeVisible({ timeout: 45_000 });
      await page.getByTestId('shop-stock-sync-open-excel').click();
      await expect(page.getByTestId('shop-stock-sync-dialog')).toBeVisible();
      await expect(page.getByTestId('shop-stock-sync-upload-input')).toBeAttached();
      const audit = await page.request.get('/api/shop/inventory/stock-upload');
      expect(audit.status()).toBe(200);
      const auditJson = (await audit.json()) as { ok?: boolean; items?: unknown };
      expect(auditJson.ok).toBe(true);
      expect(Array.isArray(auditJson.items)).toBe(true);

      const uploadDone = page.waitForResponse(
        (res) =>
          res.url().includes('/api/shop/inventory/stock-upload') &&
          res.request().method() === 'POST' &&
          res.ok(),
        { timeout: 30_000 }
      );
      await page.getByTestId('shop-stock-sync-upload-input').setInputFiles({
        name: 'unified-smoke-stock.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('brand,sku,color,qty\ndemo,sku-1,,\n'),
      });
      await uploadDone;
      await expect(page.getByTestId('shop-stock-sync-last-accepted')).toContainText(
        /unified-smoke-stock\.csv/i,
        { timeout: 15_000 }
      );
    });
  });

  /** Ритейл-дашборд и срез аналитики + хаб маржи (см. docs/RETAIL_CABINET_FULL_PLAYBOOK.md). Параллельно serial inventory. Дублирует контракт ERP с `shop-erp-analytics-strip.spec.ts` на уровне HTTP. */
  test('Shop retail hub + analytics segment + margin hub shell', async ({ page }) => {
    test.setTimeout(120_000);
    const erpSync = await page.request.get('/api/shop/erp-sync-status');
    expect(erpSync.ok()).toBeTruthy();
    const erpBody = (await erpSync.json()) as { lastSuccessAt?: unknown };
    expect(typeof erpBody.lastSuccessAt).toBe('string');

    await gotoCanonical(page, '/shop', 60_000);
    await expect(page.getByTestId('page-shop-retail-dashboard')).toBeVisible({ timeout: 90_000 });
    await expect(page.getByTestId('shop-analytics-segment-nav')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-dashboard-analytics-footfall-link')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('shop-dashboard-analytics-margin-link')).toBeVisible({
      timeout: 15_000,
    });

    await gotoCanonical(page, '/shop/analytics/footfall', 60_000);
    await expect(page.getByTestId('shop-analytics-segment-nav')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-footfall-retail-analytics-link')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('shop-footfall-b2b-link')).toBeVisible({ timeout: 15_000 });

    await gotoCanonical(page, '/shop/b2b/margin-analysis', 60_000);
    await expect(page.getByTestId('page-shop-b2b-margin-analysis')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-analytics-segment-nav')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('margin-hub-retail-analytics-link')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('margin-hub-b2b-analytics-link')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('Brand logistics hub shell (/brand/logistics)', async ({ page }) => {
    await gotoCanonical(page, '/brand/logistics', 60_000);
    await expect(page.getByTestId('brand-logistics-hub-page')).toBeVisible();
  });

  test('Brand integrations hub shell (/brand/integrations)', async ({ page }) => {
    await gotoCanonical(page, '/brand/integrations', 60_000);
    await expect(page.getByTestId('brand-integrations-page')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('related-modules-block')).toBeVisible({ timeout: 30_000 });
    const registry = page.getByTestId('brand-integrations-b2b-registry-card');
    await expect(registry).toBeVisible({ timeout: 15_000 });
    await expect(registry).toHaveAttribute('href', '/brand/b2b-orders');
  });
});
