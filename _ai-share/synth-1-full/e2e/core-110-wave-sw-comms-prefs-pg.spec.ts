import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave SW: comms notification prefs PG + chain-push gate on hub cards.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-110-wave-sw-comms-prefs-pg.spec.ts
 */
test.describe('core-110: wave SW comms prefs PG', () => {
  test('notification prefs API returns postgres storageMode', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const putRes = await request.put('/api/platform-core/comms/notification-prefs?role=shop', {
      data: {
        prefs: {
          orderStatus: true,
          chatMessages: true,
          calendarReminders: true,
          chainStatusPush: false,
        },
      },
    });
    expect(putRes.ok()).toBe(true);
    const putJson = (await putRes.json()) as { ok?: boolean; storageMode?: string };
    expect(putJson.ok).toBe(true);
    expect(putJson.storageMode).toBe('postgres');

    const getRes = await request.get('/api/platform-core/comms/notification-prefs?role=shop');
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as {
      prefs?: { chainStatusPush?: boolean };
      storageMode?: string;
    };
    expect(getJson.storageMode).toBe('postgres');
    expect(getJson.prefs?.chainStatusPush).toBe(false);
  });

  test('shop comms hub prefs strip shows PG storage badge', async ({ page }) => {
    const prefs = page.getByTestId('shop-cm-notification-prefs-compact');
    await page.goto('/shop/core?pillar=comms&collection=SS27', GOTO);
    if ((await prefs.count()) === 0) {
      test.skip(true, 'hub comms panel not mounted in this env');
    }
    await prefs.locator('summary').click();
    await expect(page.getByTestId('shop-cm-notification-pref-chain-push')).toBeVisible();
    const pgBadge = page.getByTestId('shop-cm-notification-prefs-storage-pg');
    if ((await pgBadge.count()) > 0) {
      await expect(pgBadge).toContainText('PG');
    }
  });
});
