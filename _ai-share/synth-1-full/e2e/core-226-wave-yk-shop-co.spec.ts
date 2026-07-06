import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const COLLECTION = 'SS27';
const DEMO_ORDER = PLATFORM_CORE_DEMO.demoOrderId;

/**
 * Wave YK: shop CO golden path matrix→checkout→replenishment→tracking + peer dedup.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-226-wave-yk-shop-co.spec.ts
 */
test.describe('core-226: wave YK shop CO golden path', () => {
  test('matrix — CO golden path RU + spine peers without replenishment/tracking dup', async ({
    page,
  }) => {
    await page.goto(`/shop/b2b/matrix?collection=${COLLECTION}`, GOTO);
    const panel = page.getByTestId('shop-co-matrix-panel');
    await expect(panel).toBeVisible({ timeout: 60_000 });

    const golden = page.getByTestId('shop-co-golden-path-strip');
    await expect(golden).toBeVisible({ timeout: 30_000 });
    await expect(golden).toContainText(/Матрица/);
    await expect(golden).toContainText(/Оформление/);
    await expect(golden).toContainText(/Пополнение/);
    await expect(golden).toContainText(/Трекинг/);
    await expect(golden).not.toContainText(/Checkout|Matrix|Registry/i);

    const spine = page.getByTestId('shop-co-matrix-spine-peer-strip');
    await expect(spine).toBeVisible();
    await expect(page.getByTestId('shop-co-matrix-collaborative-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-matrix-replenishment-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-co-matrix-tracking-link')).toHaveCount(0);
  });

  test('checkout — golden path context + monetization peers without registry/tracking dup', async ({
    page,
  }) => {
    await page.goto(`/shop/b2b/checkout?collection=${COLLECTION}`, GOTO);
    await expect(page.getByTestId('shop-co-checkout-panel')).toBeVisible({ timeout: 60_000 });

    const context = page.getByTestId('shop-co-checkout-context-strip');
    await expect(context).toBeVisible({ timeout: 30_000 });
    await expect(context).toContainText(/Матрица/);
    await expect(context).toContainText(/Пополнение/);
    await expect(context).toContainText(/Трекинг/);

    const peers = page.getByTestId('shop-co-checkout-monetization-peer-strip');
    await expect(peers).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-brand-crm-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-collaborative-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-registry-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-co-checkout-tracking-link')).toHaveCount(0);
  });

  test('replenishment — CO golden path + feature path + peers without checkout dup', async ({
    page,
  }) => {
    await page.goto(`/shop/b2b/replenishment?collection=${COLLECTION}&pcf=stock-atp`, GOTO);
    await expect(page.getByTestId('shop-co-golden-path-strip')).toBeVisible({ timeout: 60_000 });
    const feature = page.getByTestId('shop-replenishment-golden-path-strip');
    await expect(feature).toBeVisible();
    await expect(feature).toContainText(/Склад · ATP/);
    await expect(page.getByTestId('shop-replenishment-golden-matrix-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-replenishment-golden-checkout-link')).toHaveCount(0);

    const peers = page.getByTestId('shop-replenishment-co-spine-peer-strip');
    await expect(peers).toBeVisible();
    await expect(page.getByTestId('shop-replenishment-working-order-link')).toBeVisible();
    await expect(page.getByTestId('shop-replenishment-collaborative-link')).toBeVisible();
    await expect(page.getByTestId('shop-replenishment-checkout-link')).toHaveCount(0);
  });

  test('registry — golden path context strip RU', async ({ page }) => {
    await page.goto(`/shop/b2b/orders?collection=${COLLECTION}`, GOTO);
    await expect(page.getByTestId('shop-co-registry-panel')).toBeVisible({ timeout: 60_000 });

    const strip = page.getByTestId('shop-co-registry-context-strip');
    await expect(strip).toBeVisible({ timeout: 30_000 });
    await expect(strip).toContainText(/Матрица/);
    await expect(strip).toContainText(/Оформление/);
    await expect(strip).toContainText(/Пополнение/);
    await expect(strip).toContainText(/Трекинг/);
  });

  test('order detail — golden path context + collaborative peer strip', async ({ page }) => {
    await page.goto(
      `/shop/b2b/orders/${encodeURIComponent(DEMO_ORDER)}?collection=${COLLECTION}`,
      GOTO
    );
    await expect(page.getByTestId('shop-co-detail-panel')).toBeVisible({ timeout: 60_000 });

    const context = page.getByTestId('shop-co-detail-context-strip');
    await expect(context).toBeVisible({ timeout: 30_000 });
    await expect(context).toContainText(/Матрица/);
    await expect(context).toContainText(/Оформление/);
    await expect(context).toContainText(/Трекинг/);

    const peers = page.getByTestId('shop-co-detail-peer-strip');
    await expect(peers).toBeVisible();
    await expect(page.getByTestId('shop-co-detail-collaborative-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-detail-order-chat-link')).toBeVisible();
  });

  test('shop CO cabinet — golden path + compact peers', async ({ page }) => {
    await gotoRoleCoreCabinet(
      page,
      `/shop/core?pillar=collection_order&collection=${COLLECTION}`
    );
    await expect(page.getByTestId('shop-co-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const golden = page.getByTestId('shop-co-golden-path-strip');
    await expect(golden).toBeVisible({ timeout: 30_000 });

    const peers = page.getByTestId('shop-co-cabinet-co-spine-peer-strip');
    await expect(peers).toBeVisible();
    await expect(page.getByTestId('shop-co-cabinet-collaborative-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-cabinet-brand-pricelist-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-cabinet-matrix-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-co-cabinet-checkout-link')).toHaveCount(0);
  });
});
