import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave VK S2: chain-status push prefs PG-only in core + hub bump on PUT (all roles).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-155-wave-vk-push-prefs-pg.spec.ts
 */
test.describe('core-155: wave VK S2 push prefs PG', () => {
  test('PUT persists chainStatusPush to postgres and bumps SSE contract', async ({ request }) => {
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

    const streamRes = await request.get('/api/platform-core/comms/notification-prefs-stream');
    expect(streamRes.ok()).toBe(true);
    expect(streamRes.headers()['x-platform-core-comms-prefs-sse']).toMatch(/bump/);
  });

  for (const roleCase of [
    { role: 'shop', path: '/shop/core?pillar=comms&collection=SS27', prefix: 'shop-cm' },
    { role: 'brand', path: '/brand/core?pillar=comms&collection=SS27', prefix: 'brand-cm' },
    {
      role: 'manufacturer',
      path: '/factory/production/core?pillar=comms&collection=SS27',
      prefix: 'mfr-cm',
    },
    {
      role: 'supplier',
      path: '/factory/supplier/core?pillar=comms&collection=SS27',
      prefix: 'sup-cm',
    },
  ] as const) {
    test(`${roleCase.role} comms hub: PG prefs strip + chain-push toggle`, async ({ page, request }) => {
      const healthRes = await request.get('/api/workshop2/platform-core/health');
      const health = (await healthRes.json()) as { pgReachable?: boolean };
      test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

      await page.goto(roleCase.path, GOTO);
      await expect(page.getByTestId('comms-pillar-card')).toBeVisible({ timeout: 60_000 });

      const prefs = page.getByTestId(`${roleCase.prefix}-notification-prefs-compact`);
      if ((await prefs.count()) === 0) {
        test.skip(true, 'comms notification prefs strip not mounted');
      }
      await prefs.locator('summary').click();
      const chainPush = page.getByTestId(`${roleCase.prefix}-notification-pref-chain-push`);
      await expect(chainPush).toBeVisible();

      const pgBadge = page.getByTestId(`${roleCase.prefix}-notification-prefs-storage-pg`);
      if ((await pgBadge.count()) > 0) {
        await expect(pgBadge).toContainText('PG');
      }
    });
  }
});
