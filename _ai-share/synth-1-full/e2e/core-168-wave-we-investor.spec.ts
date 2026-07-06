import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WE: investor-readiness PG dashboard + peer strip (kanban + release gate).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-168-wave-we-investor.spec.ts
 */
test.describe('core-168: wave WE investor-readiness dashboard', () => {
  test('brand dev cabinet: PG investor strip + peer links', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await gotoRoleCoreCabinet(page, '/brand/core?pillar=development&collection=SS27');
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const dashboard = page.getByTestId('brand-dev-dashboard-strips');
    await expect(dashboard).toBeVisible({ timeout: 45_000 });

    const strip = dashboard.getByTestId('brand-dev-investor-readiness-strip');
    await expect(strip).toBeVisible();
    await expect(strip.getByTestId('brand-dev-investor-readiness-label')).toContainText(
      'Готовность инвестору'
    );
    await expect(strip.getByTestId('brand-dev-investor-readiness-pg-source')).toBeVisible({
      timeout: 30_000,
    });
    await expect(strip.getByTestId('brand-dev-investor-readiness-ready')).toBeVisible();
    await expect(strip.getByTestId('brand-dev-investor-readiness-link')).toContainText('Сводка');

    const peer = dashboard.getByTestId('brand-dev-investor-readiness-peer-strip');
    await expect(peer).toBeVisible();
    await expect(peer.getByTestId('brand-dev-investor-readiness-kanban-peer-link')).toBeVisible();
    await expect(peer.getByTestId('brand-dev-investor-readiness-release-gate-peer-link')).toBeVisible();
    await expect(peer.getByTestId('brand-dev-investor-readiness-tasks-peer-link')).toBeVisible();
  });

  test('brand dev cabinet: kanban mini-panel adjacent to investor peer strip', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await gotoRoleCoreCabinet(page, '/brand/core?pillar=development&collection=SS27');
    const dashboard = page.getByTestId('brand-dev-dashboard-strips');
    await expect(dashboard.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible({
      timeout: 45_000,
    });
    await expect(dashboard.getByTestId('brand-dev-tasks-kanban-board')).toBeVisible();
  });

  test('investor-readiness API PG metrics for dashboard strip', async ({ request }) => {
    const res = await request.get('/api/workshop2/investor-readiness');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      readyForInvestorDemo?: boolean;
      pgOnly?: boolean;
      ss27?: { articleCount?: number; avgTzFillPct?: number | null };
      stagingMode?: boolean;
      stagingNoteRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.readyForInvestorDemo).toBe('boolean');
    expect(typeof json.pgOnly).toBe('boolean');
    expect(json.ss27?.articleCount).toBeGreaterThanOrEqual(0);
    expect(typeof json.stagingMode).toBe('boolean');
    expect(json.stagingNoteRu?.length).toBeGreaterThan(0);
  });

  test('release gate peer href resolves (techpack-gate workspace)', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto(
      '/brand/merch/launch-readiness?pcf=techpack-gate&collection=SS27',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible({ timeout: 60_000 });
  });

  test('calendar comms: kanban peer target panel', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const res = await page.goto('/brand/calendar?collection=SS27#brand-dev-tasks-kanban-panel', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible({ timeout: 60_000 });
  });
});
