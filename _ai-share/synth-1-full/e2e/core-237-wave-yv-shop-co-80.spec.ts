import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';
import {
  gotoPlatformHubAudit,
  gotoRoleCoreCabinet,
} from './helpers/core-chain-overview';
import { WAVE_YV_SHOP_CO_CELL_SCORE_MIN } from '../src/lib/platform/wave-yv-shop-co-80-bump';
import { WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID } from '../src/lib/platform/wave-yk-shop-co-golden-path';
import { waveYzReadinessScoreCellTestId } from '../src/lib/platform/wave-yz-cell-score-export';

const COLLECTION = PLATFORM_CORE_DEMO.collectionId;
const ORDER = PLATFORM_CORE_DEMO.demoOrderId;
const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave YV: shop CO audit §6 8.0 final — golden path dedup + chain + cross-links (YK/XT/WM/XL/WG).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-237-wave-yv-shop-co-80.spec.ts
 */
test.describe('core-237: wave YV shop CO audit 8.0', () => {
  test('matrix — CO golden path RU + spine peers', async ({ page, request }) => {
    const health = (await (
      await request.get('/api/workshop2/platform-core/health')
    ).json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto(`/shop/b2b/matrix?collection=${COLLECTION}`, GOTO);
    await expect(page.getByTestId('shop-co-matrix-panel')).toBeVisible({ timeout: 60_000 });
    const golden = page.getByTestId(WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID);
    await expect(golden).toBeVisible({ timeout: 30_000 });
    await expect(golden).toContainText(/Матрица/);
    await expect(golden).toContainText(/Трекинг/);
    await expect(page.getByTestId('shop-co-matrix-spine-peer-strip')).toBeVisible();
    await expect(page.getByTestId('shop-wholesale-matrix-golden-path-strip')).toHaveCount(0);
  });

  test('replenishment — CO spine + feature strip without matrix/checkout dup', async ({ page }) => {
    await page.goto(`/shop/b2b/replenishment?collection=${COLLECTION}&pcf=stock-atp`, GOTO);
    await expect(page.getByTestId(WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID)).toBeVisible({
      timeout: 60_000,
    });
    const feature = page.getByTestId('shop-replenishment-golden-path-strip');
    await expect(feature).toBeVisible();
    await expect(feature).toContainText(/Склад · ATP/);
    await expect(page.getByTestId('shop-replenishment-golden-matrix-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-replenishment-golden-checkout-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-replenishment-co-spine-peer-strip')).toBeVisible();
  });

  test('collaborative — CO spine + session feature strip', async ({ page }) => {
    await page.goto(
      `/shop/b2b/collaborative-order?collection=${COLLECTION}&pcf=session&order=${encodeURIComponent(ORDER)}`,
      GOTO
    );
    await expect(page.getByTestId(WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID)).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-collaborative-order-golden-path-strip')).toBeVisible();
    await expect(page.getByTestId('shop-collaborative-golden-matrix-link')).toHaveCount(0);
    await expect(page.getByTestId('shop-collaborative-matrix-peer-link')).toBeVisible();
  });

  test('order detail — context strip + collaborative/chat cross-links', async ({ page }) => {
    await page.goto(
      `/shop/b2b/orders/${encodeURIComponent(ORDER)}?collection=${COLLECTION}`,
      GOTO
    );
    await expect(page.getByTestId('shop-co-detail-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-co-detail-context-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('shop-co-detail-peer-strip')).toBeVisible();
    await expect(page.getByTestId('shop-co-detail-collaborative-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-detail-order-chat-link')).toBeVisible();
  });

  test('tracking — chain peer mirror visible', async ({ page }) => {
    await page.goto(
      `/shop/b2b/tracking?order=${encodeURIComponent(ORDER)}&collection=${COLLECTION}#shop-co-buyer-tracking`,
      GOTO
    );
    await expect(page.getByTestId('shop-co-tracking-panel')).toBeVisible({ timeout: 60_000 });
    await expect(
      page
        .getByTestId('shop-co-chain-peer-po-synced')
        .or(page.getByTestId('shop-co-chain-peer-po-pending'))
    ).toBeVisible({ timeout: 30_000 });
  });

  test('CO cabinet — golden path + compact spine peers', async ({ page }) => {
    await gotoRoleCoreCabinet(
      page,
      `/shop/core?pillar=collection_order&collection=${COLLECTION}`
    );
    await expect(page.getByTestId('shop-co-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId(WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID)).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('shop-co-cabinet-co-spine-peer-strip')).toBeVisible();
  });

  test('hub audit — shop CO cell score >= 8.0', async ({ page, request }) => {
    const scoresRes = await request.get(
      `/api/workshop2/platform-core/readiness-scores?collectionId=${COLLECTION}&mode=static`
    );
    expect(scoresRes.ok()).toBeTruthy();
    const scoresJson = (await scoresRes.json()) as {
      cells?: Array<{ roleId: string; pillarId: string; staticScore: number | null }>;
    };
    const shopCo = scoresJson.cells?.find(
      (c) => c.roleId === 'shop' && c.pillarId === 'collection_order'
    );
    expect(shopCo?.staticScore).toBeGreaterThanOrEqual(WAVE_YV_SHOP_CO_CELL_SCORE_MIN);

    const res = await gotoPlatformHubAudit(page, '/platform', { collectionId: COLLECTION });
    expect(res?.status() ?? 599).toBeLessThan(500);

    const cellTestId = waveYzReadinessScoreCellTestId('shop', 'collection_order');
    await expect(page.getByTestId(cellTestId)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId(cellTestId)).toContainText(/8\.0|8,/);
  });
});
