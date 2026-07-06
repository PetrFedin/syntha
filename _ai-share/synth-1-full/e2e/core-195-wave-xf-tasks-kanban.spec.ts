import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XF: brand W2 hub Kanban ↔ calendar UI, greenfield PG segment, deduped task strips.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-195-wave-xf-tasks-kanban.spec.ts
 */
test.describe('core-195: wave XF brand tasks kanban + calendar', () => {
  test('W2 hub: kanban strip + calendar peer + greenfield PG', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/brand/production/workshop2?w2col=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-w2-hub-panel')).toBeVisible({ timeout: 60_000 });

    const kanbanStrip = page.getByTestId('brand-dev-w2-hub-tasks-kanban-strip');
    await expect(kanbanStrip).toBeVisible({ timeout: 45_000 });
    await expect(kanbanStrip.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible();
    await expect(kanbanStrip.getByTestId('brand-dev-tasks-kanban-board')).toBeVisible();
    await expect(page.getByTestId('brand-dev-w2-hub-tasks-calendar-link')).toContainText(/Календарь/);

    await expect(page.getByTestId('brand-dev-greenfield-monetization-segment-strip')).toBeVisible();
    await expect(page.getByTestId('brand-dev-greenfield-label')).toContainText(/монетизации/);
    await expect(page.getByTestId('brand-dev-greenfield-badge')).not.toContainText(/^Greenfield/);
  });

  test('brand calendar: kanban calendar strip GET/POST UI', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/brand/calendar?collection=SS27&layers=tasks', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    const strip = page.getByTestId('brand-dev-tasks-kanban-calendar-strip');
    await expect(strip).toBeVisible({ timeout: 60_000 });
    await expect(strip.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible();
    await expect(strip.getByTestId('brand-dev-tasks-kanban-column-todo')).toBeVisible();
    await expect(
      strip.getByTestId('brand-dev-tasks-kanban-pg').or(strip.getByTestId('brand-dev-tasks-kanban-pg-unavailable')).first()
    ).toBeVisible();
    await expect(strip.getByTestId('brand-dev-tasks-kanban-calendar-link')).toBeVisible();
  });

  test('brand dev cabinet: inline kanban без dup peer link', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await gotoRoleCoreCabinet(page, '/brand/core?pillar=development&collection=SS27');
    const dashboard = page.getByTestId('brand-dev-dashboard-strips');
    await expect(dashboard).toBeVisible({ timeout: 60_000 });
    await expect(dashboard.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible();
    await expect(page.getByTestId('brand-dev-investor-readiness-kanban-peer-link')).toHaveCount(0);
    await expect(page.getByTestId('brand-dev-investor-readiness-release-gate-peer-link')).toBeVisible();
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

    const taskId = `xf-e2e-${Date.now()}`;
    const postRes = await request.post('/api/brand/tasks', {
      data: {
        tasks: [
          {
            id: taskId,
            title: 'Wave XF e2e',
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

  test('greenfield CRM assign API for monetization PG strip', async ({ request }) => {
    const res = await request.get('/api/brand/b2b/shop-buyer-crm-assign?buyerId=shop2');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      profile?: { segmentNameRu?: string } | null;
      storageMode?: string;
    };
    expect(json.ok).toBe(true);
    if (json.storageMode) {
      expect(['pg', 'file', 'memory', 'demo']).toContain(json.storageMode);
    }
  });
});
