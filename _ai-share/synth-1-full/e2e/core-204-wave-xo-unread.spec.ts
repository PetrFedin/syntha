import { test, expect } from '@playwright/test';

const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

/**
 * Wave XO: PG unread per order in universal inbox (4 roles) + tracking→calendar CTA polish.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-204-wave-xo-unread.spec.ts
 */
test.describe('core-204: wave XO universal inbox PG unread', () => {
  test('unread-summary batch API — shop + brand + mfr + supplier', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    for (const role of ['shop', 'brand', 'manufacturer', 'supplier'] as const) {
      const res = await request.get(
        `/api/platform-core/comms/unread-summary?role=${role}&collectionId=${COLLECTION}&orderIds=${encodeURIComponent(DEMO_ORDER)}`
      );
      expect(res.ok()).toBe(true);
      const json = (await res.json()) as {
        ok?: boolean;
        mode?: string;
        role?: string;
        orders?: Array<{ orderId: string; totalUnread: number; threadUnread: number; pgEventUnread: number }>;
      };
      expect(json.ok).toBe(true);
      expect(json.mode).toBe('per_order');
      expect(json.role).toBe(role);
      expect(Array.isArray(json.orders)).toBe(true);
      expect(json.orders?.[0]?.orderId).toBe(DEMO_ORDER);
      expect(typeof json.orders?.[0]?.totalUnread).toBe('number');
      expect(typeof json.orders?.[0]?.threadUnread).toBe('number');
      expect(typeof json.orders?.[0]?.pgEventUnread).toBe('number');
    }
  });

  for (const roleCase of [
    {
      label: 'shop',
      messagesPath: `/shop/messages?collection=${COLLECTION}`,
      prefix: 'shop-cm',
      tasksStrip: 'shop-cm-calendar-user-tasks-strip',
    },
    {
      label: 'brand',
      messagesPath: `/brand/messages?collection=${COLLECTION}`,
      prefix: 'brand-cm',
      tasksStrip: 'brand-cm-calendar-user-tasks-strip',
    },
    {
      label: 'mfr',
      messagesPath: `/factory/production/messages?collection=${COLLECTION}`,
      prefix: 'mfr-cm',
      tasksStrip: 'mfr-cm-calendar-user-tasks-strip',
    },
    {
      label: 'sup',
      messagesPath: `/factory/supplier/messages?collection=${COLLECTION}`,
      prefix: 'sup-cm',
      tasksStrip: 'sup-cm-calendar-user-tasks-strip',
    },
  ] as const) {
    test(`${roleCase.label} messages: live PG unread row + tracking→calendar CTAs`, async ({ page }) => {
      const res = await page.goto(roleCase.messagesPath, {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });
      expect(res?.status() ?? 599).toBeLessThan(500);
      await expect(page.getByTestId('comms-universal-inbox-strip')).toBeVisible({ timeout: 45_000 });
      await expect(page.getByTestId(`${roleCase.prefix}-universal-inbox-po-list`)).toBeVisible();

      const row = page.locator(`[data-testid="${roleCase.prefix}-universal-inbox-po-row"]`).first();
      await expect(row).toBeVisible({ timeout: 45_000 });
      const orderId = (await row.getAttribute('data-order-id'))?.trim();
      expect(orderId).toBeTruthy();
      const unreadAttr = await row.getAttribute('data-unread');
      expect(unreadAttr).not.toBeNull();

      const trackingLink = page.getByTestId(`${roleCase.prefix}-universal-inbox-po-calendar-tracking-link`).first();
      const calendarLink = page.getByTestId(`${roleCase.prefix}-universal-inbox-po-calendar-link`).first();
      await expect(trackingLink).toBeVisible();
      await expect(calendarLink).toBeVisible();
      await expect(trackingLink).toContainText('Трекинг');

      const calendarHref = await calendarLink.getAttribute('href');
      expect(calendarHref).toContain('pcTask=');
      const pcTask = await calendarLink.getAttribute('data-pc-task');
      expect(pcTask).toContain(orderId!);

      const unreadBadge = page.locator(
        `[data-testid="${roleCase.prefix}-universal-inbox-order-unread-${orderId}"]`
      );
      if (Number(unreadAttr) > 0) {
        await expect(unreadBadge).toBeVisible();
      }

      await calendarLink.click();
      await page.waitForURL(/pcTask=/, { timeout: 45_000 });
      await expect(page.getByTestId(roleCase.tasksStrip)).toBeVisible({ timeout: 45_000 });
    });
  }
});
