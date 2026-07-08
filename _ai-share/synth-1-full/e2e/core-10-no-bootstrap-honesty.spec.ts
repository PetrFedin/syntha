import { test, expect } from '@playwright/test';
import { gotoPlatformHub } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };
const NO_BOOTSTRAP = process.env.CORE_VERIFY_NO_BOOTSTRAP === '1';

test.describe('core-10: prod без bootstrap (честность)', () => {
  test('health: флаги pgReachable и demoSeeded', async ({ request }) => {
    const res = await request.get('/api/workshop2/platform-core/health');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      pgReachable?: boolean;
      demoSeeded?: boolean;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(json.pgReachable).toBe(true);

    if (NO_BOOTSTRAP) {
      expect(json.demoSeeded).toBe(false);
      expect(json.messageRu).toContain('без seed');
    } else {
      expect(json.demoSeeded).toBe(true);
    }
  });

  test('hub: bootstrap-banner при PG без seed', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(
      health.demoSeeded !== false,
      'только migrate-only окружение (core:verify:no-bootstrap)'
    );

    expect(health.demoSeeded).toBe(false);

    const res = await gotoPlatformHub(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    // Strict Platform Core mode hides the floating banner; honesty = health.demoSeeded=false + hub loads.
    const banner = page.getByTestId('platform-core-bootstrap-banner');
    if (await banner.count()) {
      await expect(banner).toHaveAttribute('data-variant', 'no-seed');
    } else {
      await expect(page.getByTestId('platform-core-hub-main-column')).toBeVisible({ timeout: 60_000 });
    }
  });

  test('hub: без banner при полном bootstrap', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoPlatformHub(page);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('platform-core-bootstrap-banner')).toHaveCount(0);
  });

  test('W2 API: fail-closed без seed на development-status', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(health.demoSeeded !== false, 'только migrate-only окружение');

    const res = await request.get('/api/workshop2/collections/SS27/development-status');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      status?: { articleCount?: number };
    };
    expect(json.ok).toBe(true);
    expect(json.status?.articleCount ?? 0).toBe(0);
  });

  test('golden order: нет demo-заказа без seed', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(health.demoSeeded !== false, 'только migrate-only окружение');

    const chainRes = await request.get(
      '/api/workshop2/b2b/orders/B2B-DEMO-SHOP1-SS27/chain-status'
    );
    const chainJson = chainRes.ok() ? ((await chainRes.json()) as { ok?: boolean }) : { ok: false };
    expect(chainJson.ok).not.toBe(true);

    const res = await page.goto('/shop/b2b/orders/B2B-DEMO-SHOP1-SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
  });
});
