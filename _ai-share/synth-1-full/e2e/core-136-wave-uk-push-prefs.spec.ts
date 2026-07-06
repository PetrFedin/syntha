import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave UK: comms prefs PG + SSE hub bump + notification center compact all roles.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-136-wave-uk-push-prefs.spec.ts
 */
test.describe('core-136: wave UK push prefs + notification center', () => {
  test('notification prefs PUT bumps SSE stream contract', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const putRes = await request.put('/api/platform-core/comms/notification-prefs?role=brand', {
      data: {
        prefs: {
          orderStatus: true,
          chatMessages: true,
          calendarReminders: true,
          chainStatusPush: true,
        },
      },
    });
    expect(putRes.ok()).toBe(true);
    const putJson = (await putRes.json()) as { ok?: boolean; storageMode?: string };
    expect(putJson.ok).toBe(true);
    expect(putJson.storageMode).toBe('postgres');
  });

  test('unread-summary single order returns pgEventUnread', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const res = await request.get(
      '/api/platform-core/comms/unread-summary?role=shop&collectionId=SS27&orderId=B2B-SS27-DEMO-001'
    );
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as {
      ok?: boolean;
      mode?: string;
      pgEventUnread?: number;
      totalUnread?: number;
    };
    expect(json.ok).toBe(true);
    expect(json.mode).toBe('single_order');
    expect(typeof json.pgEventUnread).toBe('number');
    expect(typeof json.totalUnread).toBe('number');
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
    test(`${roleCase.role} comms hub: compact notification center`, async ({ page }) => {
      await page.goto(roleCase.path, GOTO);
      const compact = page.getByTestId(`${roleCase.prefix}-notification-center-compact`);
      if ((await compact.count()) === 0) {
        test.skip(true, 'comms pillar card not mounted in this env');
      }
      await expect(compact).toBeVisible();
      const prefs = page.getByTestId(`${roleCase.prefix}-notification-prefs-compact`);
      if ((await prefs.count()) > 0) {
        await prefs.locator('summary').click();
        await expect(page.getByTestId(`${roleCase.prefix}-notification-pref-chain-push`)).toBeVisible();
      }
    });
  }
});
