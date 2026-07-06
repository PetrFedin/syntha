import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave VF: brand dev dashboard strips (investor + greenfield + kanban) + calendar kanban.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-151-wave-vf-brand-dev-dashboard.spec.ts
 */
test.describe('core-151: wave VF brand dev dashboard', () => {
  test('brand dev cabinet: dashboard strips wrapper + all PG strips', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoRoleCoreCabinet(page, '/brand/core?pillar=development&collection=SS27');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const dashboard = page.getByTestId('brand-dev-dashboard-strips');
    await expect(dashboard).toBeVisible({ timeout: 45_000 });
    await expect(dashboard.getByTestId('brand-dev-investor-readiness-strip')).toBeVisible();
    await expect(dashboard.getByTestId('brand-dev-greenfield-monetization-segment-strip')).toBeVisible();
    await expect(dashboard.getByTestId('brand-dev-greenfield-label')).toContainText('монетизации');
    await expect(dashboard.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible();
    await expect(dashboard.getByTestId('brand-dev-tasks-kanban-board')).toBeVisible();
  });

  test('brand calendar comms: tasks kanban mini-panel GET/POST', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/brand/calendar?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-dev-tasks-kanban-column-todo')).toBeVisible();
    await expect(page.getByTestId('brand-dev-tasks-kanban-pg').or(page.getByTestId('brand-dev-tasks-kanban-pg-unavailable')).first()).toBeVisible();
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

    const taskId = `vf-e2e-${Date.now()}`;
    const postRes = await request.post('/api/brand/tasks', {
      data: {
        tasks: [
          {
            id: taskId,
            title: 'Wave VF e2e',
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

  test('investor-readiness API for dashboard strip', async ({ request }) => {
    const res = await request.get('/api/workshop2/investor-readiness');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      readyForInvestorDemo?: boolean;
      ss27?: { articleCount?: number; avgTzFillPct?: number | null };
    };
    expect(typeof json.readyForInvestorDemo).toBe('boolean');
    expect(json.ss27?.articleCount).toBeGreaterThanOrEqual(0);
  });

  test('greenfield CRM assign API for monetization strip', async ({ request }) => {
    const res = await request.get('/api/brand/b2b/shop-buyer-crm-assign?buyerId=shop2');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      profile?: { segmentNameRu?: string } | null;
      storageMode?: string;
    };
    expect(json.ok).toBe(true);
    if (json.profile?.segmentNameRu) {
      expect(json.profile.segmentNameRu.length).toBeGreaterThan(0);
    }
  });
});
