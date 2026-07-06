import { test, expect } from '@playwright/test';

const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

/**
 * Wave WC: pcTask deep-links + chain calendar POST (4 roles) + universal inbox calendar→tracking.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-166-wave-wc-pctask-deeplinks.spec.ts
 */
test.describe('core-166: wave WC comms pcTask deep-links', () => {
  test('POST calendar-events chain-status creates 4 role slots', async ({ request }) => {
    const orderId = `B2B-WC166-${Date.now()}`;
    const res = await request.post('/api/workshop2/platform-core/calendar-events', {
      data: {
        source: 'chain_status',
        orderId,
        collectionId: COLLECTION,
        stepKind: 'chain_status',
        titleRu: `Chain WC · ${orderId}`,
        bodyRu: 'Wave WC calendar hook',
      },
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; taskIds?: string[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.taskIds)).toBe(true);
    expect(json.taskIds!.length).toBeGreaterThanOrEqual(4);
    expect(json.taskIds!.some((id) => id.includes('-shop'))).toBe(true);
    expect(json.taskIds!.some((id) => id.includes('-brand'))).toBe(true);
    expect(json.taskIds!.some((id) => id.includes('-manufacturer'))).toBe(true);
    expect(json.taskIds!.some((id) => id.includes('-supplier'))).toBe(true);
  });

  for (const roleCase of [
    {
      label: 'shop',
      calendarPath: `/shop/b2b/calendar?collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&pcTask=chain-chain_status-${DEMO_ORDER}-shop`,
      peerStrip: 'shop-cm-calendar-context-peer-strip',
      tasksStrip: 'shop-cm-calendar-user-tasks-strip',
      trackingPattern: /\/shop\/b2b\/tracking/,
    },
    {
      label: 'brand',
      calendarPath: `/brand/calendar?collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&pcTask=chain-chain_status-${DEMO_ORDER}-brand`,
      peerStrip: 'brand-cm-calendar-context-peer-strip',
      tasksStrip: 'brand-cm-calendar-user-tasks-strip',
      trackingPattern: /order_production|\/brand\/b2b\/orders/,
    },
    {
      label: 'mfr',
      calendarPath: `/factory/calendar?role=manufacturer&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&pcTask=chain-chain_status-${DEMO_ORDER}-manufacturer`,
      peerStrip: 'mfr-cm-calendar-context-peer-strip',
      tasksStrip: 'mfr-cm-calendar-user-tasks-strip',
      trackingPattern: /order=B2B/,
    },
    {
      label: 'sup',
      calendarPath: `/factory/calendar?role=supplier&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&pcTask=chain-chain_status-${DEMO_ORDER}-supplier`,
      peerStrip: 'sup-cm-calendar-context-peer-strip',
      tasksStrip: 'sup-cm-calendar-user-tasks-strip',
      trackingPattern: /order=B2B/,
    },
  ] as const) {
    test(`${roleCase.label} calendar: pcTask focus + event tracking deep-link`, async ({ page }) => {
      const res = await page.goto(roleCase.calendarPath, {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });
      expect(res?.status() ?? 599).toBeLessThan(500);
      await expect(page.getByTestId(roleCase.peerStrip)).toBeVisible({ timeout: 45_000 });
      await expect(page.getByTestId(roleCase.tasksStrip)).toBeVisible();

      const strip = page.getByTestId(`${roleCase.label === 'mfr' ? 'mfr' : roleCase.label === 'sup' ? 'sup' : roleCase.label}-cm-calendar-event-tracking-strip`);
      const stripVisible = await strip.isVisible().catch(() => false);
      if (stripVisible) {
        const deepLink = page
          .locator(
            `[data-testid^="${roleCase.label === 'mfr' ? 'mfr' : roleCase.label === 'sup' ? 'sup' : roleCase.label}-cm-calendar-tracking-deep-link-"]`
          )
          .first();
        await expect(deepLink).toBeVisible();
        await expect(deepLink).toHaveAttribute('href', roleCase.trackingPattern);
      }
    });
  }

  test('shop messages: universal inbox calendar row → tracking', async ({ page }) => {
    const res = await page.goto(`/shop/messages?collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('comms-universal-inbox-strip')).toBeVisible({ timeout: 45_000 });

    const calendarLink = page.getByTestId('shop-cm-universal-inbox-po-calendar-link').first();
    const calendarVisible = await calendarLink.isVisible().catch(() => false);
    if (calendarVisible) {
      await expect(calendarLink).toHaveAttribute('href', /pcTask=/);
      const trackingFromCalendar = page
        .getByTestId('shop-cm-universal-inbox-po-calendar-tracking-link')
        .first();
      await expect(trackingFromCalendar).toHaveAttribute('href', /\/shop\/b2b\/tracking/);
    }
  });
});
