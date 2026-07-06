import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const W2_DEV_HEADERS = {
  'x-syntha-dev-actor': 'brand-demo',
  'x-syntha-workshop2-dev': '1',
};

/**
 * Wave TA · Brand 1.1 range planner: overlay PG API + bulk tier PATCH.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-112-range-planner-overlay-bulk.spec.ts
 */
test.describe('core-112: range planner overlay + bulk tier assign', () => {
  test('overlay GET returns storageMode', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await request.get('/api/brand/range-planner/overlay?collectionId=SS27', {
      headers: W2_DEV_HEADERS,
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok && json.storageMode) {
      expect(['postgres', 'memory', 'file']).toContain(json.storageMode);
    }
  });

  test('bulk tier PATCH accepts assignTier + articleIds', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const devRes = await request.get('/api/workshop2/collections/SS27/development-status', {
      headers: W2_DEV_HEADERS,
    });
    expect(devRes.ok()).toBeTruthy();
    const devJson = (await devRes.json()) as {
      status?: { rangePlanner?: { unassignedArticles?: Array<{ articleId: string }> } };
    };
    const unassigned = devJson.status?.rangePlanner?.unassignedArticles ?? [];
    test.skip(unassigned.length < 2, 'нужно ≥2 unassigned для bulk smoke');

    const articleIds = unassigned.slice(0, 2).map((row) => row.articleId);
    const res = await request.patch('/api/workshop2/collections/SS27/range-planner', {
      headers: W2_DEV_HEADERS,
      data: { assignTier: true, tier: 'core', articleIds },
    });
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; bulkAssigned?: boolean; assigned?: number };
    expect(json.ok).toBe(true);
    expect(json.bulkAssigned).toBe(true);
    expect((json.assigned ?? 0) >= 1).toBe(true);
  });

  test('range planner page exposes overlay sync testids when loaded', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'health API недоступен');

    const res = await page.goto('/brand/range-planner?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-range-panel')).toBeVisible({ timeout: 60_000 });

    const bulkBtn = page.getByTestId('range-planner-tier-bulk-assign-btn');
    const assignPanel = page.getByTestId('range-planner-tier-assign-panel');
    if ((await assignPanel.count()) > 0 && (await bulkBtn.count()) > 0) {
      await expect(bulkBtn).toBeVisible();
      await expect(page.getByTestId('range-planner-tier-bulk-select')).toBeVisible();
    } else {
      await expect(page.getByTestId('range-planner-core-pg-tier-core')).toBeVisible({
        timeout: 30_000,
      });
    }
  });
});
