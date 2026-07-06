import { test, expect } from '@playwright/test';

/**
 * Wave SR: message templates PG + shop tracking materials push.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-103-wave-sr-templates-tracking-push.spec.ts
 */
test.describe('core-103: wave SR templates + tracking push', () => {
  test('message templates PG API', async ({ request }) => {
    const res = await request.get(
      '/api/platform-core/b2b/message-templates?context=b2b_order'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { storageMode?: string; templates?: unknown[] };
    if (json.storageMode) expect(['postgres', 'file', 'memory']).toContain(json.storageMode);
    expect(Array.isArray(json.templates)).toBe(true);
  });

  test('shop materials notification events', async ({ request }) => {
    const res = await request.get(
      '/api/platform-core/notification-events?role=shop&orderId=B2B-SS27-DEMO-001&limit=5'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { events?: Array<{ kind?: string }> };
    expect(Array.isArray(json.events)).toBe(true);
  });

  test('shop tracking page loads chain row', async ({ page }) => {
    await page.goto('/shop/b2b/tracking?order=B2B-SS27-DEMO-001');
    const row = page
      .locator('[data-testid^="shop-co-tracking-row-"], [data-testid="shop-co-tracking-focus-row"]')
      .first();
    await expect(row).toBeVisible({ timeout: 45_000 });
    const strip = page.locator('[data-testid^="shop-co-tracking-materials-push-"]');
    if ((await strip.count()) > 0) {
      await expect(strip.first().locator('[data-testid$="-calendar-link"]')).toBeVisible();
    }
  });
});
