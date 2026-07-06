import { test, expect } from '@playwright/test';

/**
 * Wave TT: per-order PG unread in universal inbox + deep-link CTAs.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-122-wave-tt-universal-inbox-unread.spec.ts
 */
test.describe('core-122: wave TT universal inbox per-order unread', () => {
  test('unread-summary batch API returns orders array', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const res = await request.get(
      '/api/platform-core/comms/unread-summary?role=shop&collectionId=SS27&orderIds=B2B-SS27-DEMO-001'
    );
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as {
      ok?: boolean;
      mode?: string;
      orders?: Array<{ orderId: string; totalUnread: number }>;
    };
    expect(json.ok).toBe(true);
    expect(json.mode).toBe('per_order');
    expect(Array.isArray(json.orders)).toBe(true);
    expect(json.orders?.[0]?.orderId).toBe('B2B-SS27-DEMO-001');
    expect(typeof json.orders?.[0]?.totalUnread).toBe('number');
  });

  test('shop messages: PO rows with chat/tracking/calendar CTAs', async ({ page }) => {
    const res = await page.goto('/shop/messages?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('comms-universal-inbox-strip')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-cm-universal-inbox-po-list')).toBeVisible();
    await expect(page.getByTestId('shop-cm-universal-inbox-title')).toContainText('Входящие');
    const chatLink = page.getByTestId('shop-cm-universal-inbox-po-chat-link').first();
    await expect(chatLink).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-cm-universal-inbox-po-calendar-tracking-link').first()).toBeVisible();
    await expect(page.getByTestId('shop-cm-universal-inbox-po-calendar-link').first()).toBeVisible();
  });

  test('brand messages: universal inbox strip', async ({ page }) => {
    const res = await page.goto('/brand/messages?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('comms-universal-inbox-strip')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('brand-cm-universal-inbox-po-list')).toBeVisible();
  });

  test('manufacturer messages: universal inbox strip', async ({ page }) => {
    const res = await page.goto('/factory/production/messages?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('comms-universal-inbox-strip')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('mfr-cm-universal-inbox-po-list')).toBeVisible();
  });

  test('supplier messages: universal inbox strip', async ({ page }) => {
    const res = await page.goto('/factory/supplier/messages?collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('comms-universal-inbox-strip')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('sup-cm-universal-inbox-po-list')).toBeVisible();
  });
});
