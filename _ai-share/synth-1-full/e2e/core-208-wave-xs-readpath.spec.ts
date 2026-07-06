import { test, expect } from '@playwright/test';
import { gotoPlatformCoreWorkspace } from './helpers/core-chain-overview';
import {
  WORKSHOP2_CORE_HUB_READPATH_BOOTSTRAP_CMD,
  WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_RU,
  WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID,
} from '../src/lib/platform/wave-xs-brand-w2-readpath-banner';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const W2_HUB_URL = '/brand/production/workshop2?w2col=SS27&pcf=hub';

/**
 * Wave XS: brand W2 hub readPath=api-only in core + explicit PG-unavailable banner.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-208-wave-xs-readpath.spec.ts
 */
test.describe('core-208: wave XS brand W2 readPath banner', () => {
  test('platform-core health: core mode contract', async ({ request }) => {
    const res = await request.get('/api/workshop2/platform-core/health');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { coreMode?: boolean };
    test.skip(!json.coreMode, 'нужен npm run dev:core (:3001)');
    expect(json.coreMode).toBe(true);
  });

  test('published-articles API for SS27 (readPath=api when PG up)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const res = await request.get('/api/workshop2/collections/SS27/published-articles');
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as { ok?: boolean; articles?: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.articles)).toBe(true);
  });

  test('W2 hub with PG: no readPath banner, stats show API list', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean; demoSeeded?: boolean };
    test.skip(!health.pgReachable || !health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoPlatformCoreWorkspace(page, W2_HUB_URL);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId(WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID)).toHaveCount(0);

    const stats = page.getByTestId('workshop2-pg-source-stats');
    if (await stats.isVisible({ timeout: 30_000 }).catch(() => false)) {
      await expect(stats).toContainText(/список из API/i);
    }
  });

  test('W2 hub when PG health offline: explicit readPath banner', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { coreMode?: boolean };
    test.skip(!health.coreMode, 'нужен npm run dev:core (:3001)');

    const res = await page.goto(W2_HUB_URL, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 120_000 });

    await page.route('**/api/workshop2/health', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, postgres: 'down' }),
      })
    );
    await page.reload(GOTO);

    const banner = page.getByTestId(WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID);
    await expect(banner).toBeVisible({ timeout: 45_000 });
    await expect(banner).toContainText(WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_RU);
    await expect(banner).toContainText(WORKSHOP2_CORE_HUB_READPATH_BOOTSTRAP_CMD);
  });
});
