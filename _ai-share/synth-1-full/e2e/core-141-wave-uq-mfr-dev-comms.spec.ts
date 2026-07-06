import { test, expect } from '@playwright/test';

const FACTORY_ID = 'fact-1';
const COLLECTION = 'SS27';
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';
const DEMO_ARTICLE = 'demo-ss27-01';

/**
 * Wave UQ: mfr dev DAM stub, OP dossier export/print, pcTask PG, Gantt bridge WIP, handoff push.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-141-wave-uq-mfr-dev-comms.spec.ts
 */
test.describe('core-141: wave UQ mfr dev + comms', () => {
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

  test('UI: OP dossier export print strip', async ({ page }) => {
    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(DEMO_ARTICLE)}?collection=${COLLECTION}&pillar=order_production&order=${encodeURIComponent(DEMO_ORDER)}`
    );
    await expect(page.getByTestId('mfr-op-dossier-export-print-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('mfr-op-dossier-export-print-export-btn')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-op-dossier-export-print-btn')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('UI: production calendar Gantt bridge WIP + pcTask strip', async ({ page }) => {
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

  test('UI: dev dossier + sample queue DAM stub strip', async ({ page }) => {
    await page.goto(
      `/factory/production/dossier/${encodeURIComponent(DEMO_ARTICLE)}?collection=${COLLECTION}`
    );
    await expect(page.getByTestId('mfr-dev-sample-photo-dam-stub-strip')).toBeVisible({
      timeout: 60_000,
    });

    await page.goto(`/factory/production?collection=${COLLECTION}#sample-queue`);
    await expect(page.getByTestId('factory-w2-sample-queue')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-dev-sample-photo-dam-stub-strip')).toBeVisible({
      timeout: 30_000,
    });
  });
});
