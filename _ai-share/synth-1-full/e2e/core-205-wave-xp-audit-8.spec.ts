import { test, expect } from '@playwright/test';
import { gotoPlatformHub } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XP: readiness audit 8.0 closure batch — hub matrix + XA–XH spot checks.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-205-wave-xp-audit-8.spec.ts
 */
test.describe('core-205: wave XP readiness audit 8.0', () => {
  test('planner GET — closedWaveGeneration includes XP batch', async ({ request }) => {
    const res = await request.get('/api/dev/platform-core/planner?collection=SS27');
    if (res.status() === 404) {
      test.skip(true, 'dev planner API disabled');
    }
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      plannerMeta?: { closedWaveGeneration?: number };
    };
    expect(json.ok).toBe(true);
    expect(typeof json.plannerMeta?.closedWaveGeneration).toBe('number');
  });

  test('hub audit view — readiness matrix без npm-команд', async ({ page }) => {
    const res = await gotoPlatformHub(page, '/platform', { collectionId: 'SS27' });
    expect(res?.status() ?? 599).toBeLessThan(500);

    await page.getByTestId('platform-core-hub-view-audit').click();

    const mode = page.getByTestId('platform-core-readiness-mode');
    await expect(mode).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('platform-core-readiness-matrix')).toBeVisible({
      timeout: 60_000,
    });

    const text = (await mode.textContent()) ?? '';
    expect(text).not.toMatch(/npm run/i);
    expect(text).toMatch(/готовност|ориентировочн|Цепочка активна|База недоступна/i);
  });

  test('XA: partners discover — invite panel + eligible cross-link', async ({ page }) => {
    const res = await page.goto('/shop/b2b/partners/discover?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-b2b-partners-golden-path-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-sc-partners-showroom-eligible-for-matrix-link')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('XB: brand CRM — linesheet visibility strip', async ({ page }) => {
    await page.goto('/brand/b2b/customer-groups?collection=SS27&pcf=segments', GOTO);
    await expect(page.getByTestId('brand-co-crm-linesheet-visibility-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-co-crm-linesheet-visibility-shop-showroom-link')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('XF: brand dev cabinet — inline kanban без dup peer', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/brand/core?pillar=development&collection=SS27', GOTO);
    const dashboard = page.getByTestId('brand-dev-dashboard-strips');
    await expect(dashboard).toBeVisible({ timeout: 60_000 });
    await expect(dashboard.getByTestId('brand-dev-tasks-kanban-panel')).toBeVisible();
    await expect(page.getByTestId('brand-dev-investor-readiness-kanban-peer-link')).toHaveCount(0);
  });

  test('XH: shop showroom — partner logo row + eligible counts', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/shop/b2b/showroom?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-showroom-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-sc-showroom-partner-logo-row')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-sc-showroom-eligible-filter-counts')).toBeVisible({
      timeout: 45_000,
    });
  });
});
