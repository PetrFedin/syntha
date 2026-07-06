import { test, expect } from '@playwright/test';

/**
 * Wave SN: calendar↔tracking CTA + chain-status push on shop calendar.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-96-wave-sn-comms-calendar.spec.ts
 */
test.describe('core-96: wave SN comms calendar chain', () => {
  test('shop calendar with order: peer strip + notification compact', async ({ page }) => {
    const res = await page.goto(
      '/shop/b2b/calendar?collection=SS27&order=B2B-SS27-DEMO-001',
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-cm-calendar-context-peer-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-cm-calendar-tracking-link')).toBeVisible();
  });

  test('calendar user-task API', async ({ request }) => {
    const res = await request.get(
      '/api/workshop2/platform-core/calendar-events/user-task?collectionId=SS27&limit=3'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean };
    expect(typeof json.ok).toBe('boolean');
  });

  test('notification events API for shop order', async ({ request }) => {
    const res = await request.get(
      '/api/platform-core/notification-events?role=shop&orderId=B2B-SS27-DEMO-001&collectionId=SS27'
    );
    expect(res.status()).toBeLessThan(500);
  });
});
