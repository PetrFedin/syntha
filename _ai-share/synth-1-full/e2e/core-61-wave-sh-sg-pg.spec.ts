import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave SH+SG: prefs PG, merge-to-matrix, unread-summary, WMS ATP, dev wishlist.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-61-wave-sh-sg-pg.spec.ts
 */
test.describe('core-61: wave SH+SG PG contracts', () => {
  test('unified comms notification prefs (shop PG)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const putRes = await request.put('/api/platform-core/comms/notification-prefs?role=shop', {
      data: {
        prefs: {
          orderStatus: true,
          chatMessages: true,
          calendarReminders: false,
          chainStatusPush: true,
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
      prefs?: { calendarReminders?: boolean; chainStatusPush?: boolean };
      storageMode?: string;
    };
    expect(getJson.storageMode).toBe('postgres');
    expect(getJson.prefs?.calendarReminders).toBe(false);
    expect(getJson.prefs?.chainStatusPush).toBe(true);
  });

  test('comms unread-summary for demo order', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const res = await request.get(
      '/api/platform-core/comms/unread-summary?role=shop&orderId=B2B-SS27-DEMO-001&collectionId=SS27'
    );
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as { ok?: boolean; totalUnread?: number };
    expect(json.ok).toBe(true);
    expect(typeof json.totalUnread).toBe('number');
  });

  test('working order merge-to-matrix API', async ({ request }) => {
    const orderId = 'INT-CORE61-WO';
    const res = await request.post(
      `/api/shop/b2b/working-order/${encodeURIComponent(orderId)}/merge-to-matrix`,
      {
        data: { collectionId: 'SS27' },
      }
    );
    const json = (await res.json()) as { ok?: boolean; messageRu?: string };
    expect(json.messageRu).toBeTruthy();
    expect(typeof json.ok).toBe('boolean');
  });

  test('shop dev wishlist PG API', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const putRes = await request.put('/api/shop/b2b/development/assortment-wishlist', {
      data: {
        buyerId: 'shop1',
        items: [{ articleId: 'demo-ss27-01', noteRu: 'core-61' }],
      },
    });
    expect(putRes.ok()).toBe(true);
  });
});

test.describe('core-61: hub UI badges (optional smoke)', () => {
  test('shop hub comms prefs compact renders chain push', async ({ page }) => {
    await page.goto('/shop/core?pillar=comms&collection=SS27', GOTO);
    const prefs = page.getByTestId('shop-cm-notification-prefs-compact');
    if ((await prefs.count()) === 0) {
      test.skip(true, 'hub comms panel not mounted in this env');
    }
    await prefs.locator('summary').click();
    await expect(page.getByTestId('shop-cm-notification-pref-chain-push')).toBeVisible();
  });
});
