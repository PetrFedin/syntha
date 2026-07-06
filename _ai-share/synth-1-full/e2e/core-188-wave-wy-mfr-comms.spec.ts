import { test, expect } from '@playwright/test';

import { platformCoreChainCalendarTaskId } from '@/lib/platform/platform-core-comms-pctask-deeplinks';

const FACTORY_ID = 'fact-1';
const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';
const DEMO_ARTICLE = 'demo-ss27-01';

/**
 * Wave WY: mfr comms 3.3 — pcTask Gantt bridge, factory task PG, handoff push, TZ BW peer.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-188-wave-wy-mfr-comms.spec.ts
 */
test.describe('core-188: wave WY mfr comms Gantt bridge', () => {
  test('pc-task API creates PG factory task from calendar event', async ({ request }) => {
    const eventsRes = await request.get(
      `/api/workshop2/platform-core/calendar-events?collectionId=${COLLECTION}&orderId=${encodeURIComponent(DEMO_ORDER)}`
    );
    test.skip(!eventsRes.ok(), 'calendar events API недоступен');
    const eventsJson = (await eventsRes.json()) as {
      events?: Array<{ id: string; title: string }>;
    };
    const event = eventsJson.events?.[0];
    test.skip(!event?.id, 'нет событий календаря');

    const pcTaskId = platformCoreChainCalendarTaskId(DEMO_ORDER, 'manufacturer');
    const post = await request.post('/api/workshop2/platform-core/calendar-events/pc-task', {
      data: {
        collectionId: COLLECTION,
        eventId: event.id,
        ownerRole: 'manufacturer',
        orderId: DEMO_ORDER,
        taskId: pcTaskId,
      },
    });
    expect(post.ok()).toBeTruthy();
    const json = (await post.json()) as { ok?: boolean; pcTask?: string; taskId?: string; created?: boolean };
    expect(json.ok).toBe(true);
    expect(json.pcTask ?? json.taskId).toBeTruthy();
  });

  test('handoff queue notification_events for manufacturer on new PO', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const res = await request.get(
      `/api/platform-core/notification-events?role=manufacturer&orderId=${encodeURIComponent(DEMO_ORDER)}&limit=5`
    );
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { events?: unknown[] };
    expect(Array.isArray(json.events)).toBe(true);
  });

  test('UI: production calendar Gantt bridge WIP + pcTask auto-ensure strip', async ({ page }) => {
    const pcTaskId = platformCoreChainCalendarTaskId(DEMO_ORDER, 'manufacturer');
    await page.goto(
      `/factory/production/calendar?role=manufacturer&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&pcTask=${encodeURIComponent(pcTaskId)}`
    );
    await expect(page.getByTestId('mfr-cm-calendar-gantt-bridge-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-cm-calendar-gantt-bridge-wip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByTestId('mfr-op-wip-gantt-strip').or(page.getByTestId('mfr-op-wip-gantt-empty'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-cm-calendar-user-tasks-strip')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-cm-calendar-attach-tz-bw-peer-strip')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('UI: order comms attach TZ BW peer cross-link', async ({ page }) => {
    await page.goto(
      `/factory/production/messages?collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&pcf=order`
    );
    await expect(page.getByTestId('mfr-cm-order-attach-tz-peer-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-cm-order-brand-w2-peer-link')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-cm-order-attach-tz-btn')).toBeVisible({ timeout: 30_000 });
  });

  test('UI: calendar attach TZ BW peer links to brand W2 + order peer', async ({ page }) => {
    await page.goto(
      `/factory/production/calendar?role=manufacturer&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}`
    );
    await expect(page.getByTestId('mfr-cm-calendar-attach-tz-bw-peer-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-cm-calendar-brand-w2-peer-link')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-cm-calendar-attach-tz-bw-order-peer-link')).toHaveAttribute(
      'href',
      /pcf=order/
    );
  });
});
