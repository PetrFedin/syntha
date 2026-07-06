import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave VA: sample webhook stub, brand tasks kanban GET/POST, greenfield PG strip, dev SSE badge.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-146-wave-va-dev-webhook-tasks.spec.ts
 */
test.describe('core-146: wave VA brand dev webhook + tasks', () => {
  test('brand dev cabinet: SSE badge + greenfield segment strip + kanban', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoRoleCoreCabinet(page, '/brand/core?pillar=development&collection=SS27');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-dev-cabinet-panel')).toHaveAttribute(
      'data-development-sse-live',
      /[01]/
    );
    const sseOrPoll = page
      .getByTestId('brand-dev-development-sse-live-badge')
      .or(page.getByTestId('brand-dev-development-poll-badge'));
    await expect(sseOrPoll.first()).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('brand-dev-greenfield-monetization-segment-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible();
  });

  test('brand calendar comms: tasks kanban mini-panel', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/brand/calendar?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-dev-tasks-kanban-column-todo')).toBeVisible();
  });

  test('brand tasks API GET/POST round-trip', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const getRes = await request.get('/api/brand/tasks');
    expect(getRes.ok()).toBeTruthy();
    const listed = (await getRes.json()) as { ok?: boolean; tasks?: unknown[] };
    expect(listed.ok).toBe(true);
    expect(Array.isArray(listed.tasks)).toBe(true);

    const taskId = `va-e2e-${Date.now()}`;
    const postRes = await request.post('/api/brand/tasks', {
      data: {
        tasks: [
          {
            id: taskId,
            title: 'Wave VA e2e',
            status: 'todo',
            assignee: 'QA',
            due: '—',
            project: 'Разработка',
            collectionId: 'SS27',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });
    expect(postRes.ok()).toBeTruthy();
    const posted = (await postRes.json()) as { ok?: boolean; httpMethod?: string };
    expect(posted.ok).toBe(true);
    expect(posted.httpMethod).toBe('POST');
  });

  test('sample state-change webhook POST stub', async ({ request }) => {
    const eventId = `va-webhook-${Date.now()}`;
    const res = await request.post('/api/workshop2/samples/state-change-webhook', {
      data: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        eventId,
        fromStatus: 'draft',
        toStatus: 'sent',
        orderId: 'sample-va-1',
      },
    });
    const json = (await res.json()) as {
      ok?: boolean;
      journalRecorded?: boolean;
      messageRu?: string;
    };
    if (res.status() === 503) {
      test.skip(true, 'webhook disabled');
    }
    expect(res.ok()).toBeTruthy();
    expect(json.ok).toBe(true);
    expect(json.journalRecorded).toBe(true);
    expect(json.messageRu?.length).toBeGreaterThan(0);

    const replay = await request.post('/api/workshop2/samples/state-change-webhook', {
      data: {
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        eventId,
        toStatus: 'sent',
      },
    });
    const replayJson = (await replay.json()) as { idempotent?: boolean };
    expect(replay.ok()).toBeTruthy();
    expect(replayJson.idempotent).toBe(true);
  });

  test('W2 hub: greenfield monetization segment strip', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/brand/production/workshop2?w2col=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-dev-greenfield-monetization-segment-strip')).toBeVisible({
      timeout: 45_000,
    });
  });
});
