import { test, expect } from '@playwright/test';

const FACTORY_ID = 'fact-1';
const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';
const DEMO_ARTICLE = 'demo-ss27-01';

/**
 * Wave UL: mfr P2 comms + OP — pcTask, Gantt bridge, attach TZ, handoff push, DAM stub, sample queue.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-137-wave-ul-mfr-comms.spec.ts
 */
test.describe('core-137: wave UL mfr comms + OP', () => {
  test('pc-task API creates PG task from calendar event', async ({ request }) => {
    const eventsRes = await request.get(
      `/api/workshop2/platform-core/calendar-events?collectionId=${COLLECTION}&orderId=${encodeURIComponent(DEMO_ORDER)}`
    );
    test.skip(!eventsRes.ok(), 'calendar events API недоступен');
    const eventsJson = (await eventsRes.json()) as {
      events?: Array<{ id: string; title: string }>;
    };
    const event = eventsJson.events?.[0];
    test.skip(!event?.id, 'нет событий календаря');

    const post = await request.post('/api/workshop2/platform-core/calendar-events/pc-task', {
      data: {
        collectionId: COLLECTION,
        eventId: event.id,
        ownerRole: 'manufacturer',
        orderId: DEMO_ORDER,
      },
    });
    expect(post.ok()).toBeTruthy();
    const json = (await post.json()) as { ok?: boolean; pcTask?: string; taskId?: string };
    expect(json.ok).toBe(true);
    expect(json.pcTask ?? json.taskId).toBeTruthy();
  });

  test('sample photo DAM stub POST', async ({ request }) => {
    const post = await request.post('/api/workshop2/manufacturer/sample-photo/dam-stub', {
      data: {
        collectionId: COLLECTION,
        articleId: DEMO_ARTICLE,
        factoryId: FACTORY_ID,
        filename: 'sample-photo-front.jpg',
      },
    });
    expect(post.ok()).toBeTruthy();
    const json = (await post.json()) as { ok?: boolean; assetId?: string; url?: string };
    expect(json.ok).toBe(true);
    expect(json.assetId).toBeTruthy();
    expect(json.url).toContain('dam-stub');
  });

  test('factory sample-queue PATCH limited fields', async ({ request }) => {
    const queueRes = await request.get(
      `/api/workshop2/factory/sample-queue?factoryId=${FACTORY_ID}&status=draft,sent,in_progress`
    );
    test.skip(!queueRes.ok(), 'PG sample queue недоступен');
    const queue = (await queueRes.json()) as {
      items?: Array<{ orderId: string; collectionId: string; articleId: string; status: string }>;
    };
    const item = queue.items?.[0];
    test.skip(!item, 'нет образцов в очереди');

    const targetStatus = item.status === 'sent' ? 'in_progress' : 'received';
    const patch = await request.patch(
      `/api/workshop2/factory/sample-queue/${encodeURIComponent(item.orderId)}`,
      {
        data: {
          collectionId: item.collectionId,
          articleId: item.articleId,
          status: targetStatus,
          note: 'core-137 factory PATCH',
        },
      }
    );
    expect(patch.ok()).toBeTruthy();
  });

  test('handoff queue notification_events for manufacturer', async ({ request }) => {
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

  test('UI: production calendar Gantt bridge + user tasks', async ({ page }) => {
    await page.goto(
      `/factory/production/calendar?role=manufacturer&collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}`
    );
    await expect(page.getByTestId('mfr-cm-calendar-gantt-bridge-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByTestId('mfr-cm-calendar-gantt-bridge-wip').or(page.getByTestId('mfr-op-wip-gantt-empty'))
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('mfr-cm-calendar-user-tasks-strip')).toBeVisible({ timeout: 30_000 });
  });

  test('UI: mfr comms attach TZ peer + sample queue hash-scroll', async ({ page }) => {
    await page.goto(
      `/factory/production/messages?collection=${COLLECTION}&order=${encodeURIComponent(DEMO_ORDER)}&pcf=order`
    );
    await expect(page.getByTestId('mfr-cm-order-attach-tz-peer-strip')).toBeVisible({
      timeout: 60_000,
    });

    await page.goto(`/factory/production?collection=${COLLECTION}#sample-queue`);
    await expect(page.getByTestId('factory-w2-sample-queue')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-dev-sample-photo-dam-stub-strip')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('UI: dossier DAM stub strip', async ({ page }) => {
    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(DEMO_ARTICLE)}?collection=${COLLECTION}`
    );
    await expect(page.getByTestId('mfr-dev-sample-photo-dam-stub-strip')).toBeVisible({
      timeout: 60_000,
    });
  });
});
