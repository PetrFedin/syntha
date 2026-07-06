import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const W2_DEV_HEADERS = {
  'x-syntha-dev-actor': 'brand-demo',
  'x-syntha-workshop2-dev': '1',
};

/**
 * Wave UM · Brand range planner: bulk tier POST + overlay conflict resolver strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-138-wave-um-range-planner.spec.ts
 */
test.describe('core-138: wave UM bulk tier assign POST', () => {
  test('POST bulk-tier-assign accepts collectionId + tier + articleIds', async ({ request }) => {
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
    const res = await request.post('/api/workshop2/range-planner/bulk-tier-assign', {
      headers: { ...W2_DEV_HEADERS, 'content-type': 'application/json' },
      data: { collectionId: 'SS27', tier: 'core', articleIds },
    });
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { ok?: boolean; bulkAssigned?: boolean; assigned?: number };
    expect(json.ok).toBe(true);
    expect(json.bulkAssigned).toBe(true);
    expect((json.assigned ?? 0) >= 1).toBe(true);
  });
});

test.describe('core-138: wave UM overlay conflict resolver strip', () => {
  test('conflict resolver strip visible after stale PG overlay', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean; demoSeeded?: boolean };
    test.skip(!health.pgReachable || !health.demoSeeded, 'нужен db:core:bootstrap + PG');

    const devRes = await request.get('/api/workshop2/collections/SS27/development-status', {
      headers: W2_DEV_HEADERS,
    });
    expect(devRes.ok()).toBeTruthy();
    const devJson = (await devRes.json()) as {
      status?: {
        rangePlanner?: {
          collectionId: string;
          tiers: Array<{
            id: string;
            budget: number;
            targetMargin: number;
            planSkuCount: number;
            pgSkuCount: number;
            budgetFromPg?: boolean;
          }>;
          dataSource: string;
          tiersFromPg: boolean;
          budgetFromPg: boolean;
          articleCount: number;
        };
      };
    };
    const snapshot = devJson.status?.rangePlanner;
    test.skip(!snapshot?.tiersFromPg, 'range planner PG snapshot required');

    const staleOverlay = {
      v: 1 as const,
      collectionId: snapshot!.collectionId,
      tiers: snapshot!.tiers.map((tier) => ({
        id: tier.id,
        budget: tier.budget,
        targetMargin: tier.targetMargin,
        planSkuCount: tier.planSkuCount + 5,
        pgSkuCount: tier.pgSkuCount + 5,
        ...(tier.budgetFromPg ? { budgetFromPg: true } : {}),
      })),
      dataSource: snapshot!.dataSource,
      tiersFromPg: true,
      budgetFromPg: snapshot!.budgetFromPg,
      articleCount: snapshot!.articleCount,
      syncedFromPgAt: new Date(Date.now() - 86_400_000).toISOString(),
    };

    const putRes = await request.put('/api/brand/range-planner/overlay', {
      headers: { ...W2_DEV_HEADERS, 'content-type': 'application/json' },
      data: { collectionId: snapshot!.collectionId, overlay: staleOverlay },
    });
    expect(putRes.ok()).toBeTruthy();

    const res = await page.goto('/brand/range-planner?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-dev-range-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-range-planner-conflict-resolver-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-range-planner-overlay-conflict-banner')).toBeVisible();
    await expect(page.getByTestId('brand-range-planner-conflict-resolver-summary')).toContainText(
      'расходится с PG'
    );
    await expect(page.getByTestId('brand-range-planner-conflict-resolver-sync-btn')).toBeVisible();
    await expect(page.getByTestId('brand-range-planner-overlay-sync-btn')).toBeVisible();
    await expect(page.getByTestId('brand-range-planner-conflict-resolver-tier-core')).toBeVisible();
  });
});
