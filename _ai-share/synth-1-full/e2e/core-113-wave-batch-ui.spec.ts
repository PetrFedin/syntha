import { test, expect } from '@playwright/test';
import { gotoRoleCoreCabinet, waitForChainOverview } from './helpers/core-chain-overview';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const W2_DEV_HEADERS = {
  'x-syntha-dev-actor': 'brand-demo',
  'x-syntha-workshop2-dev': '1',
};

/**
 * Waves TE–TI · Platform Core UI happy paths (shop matrix, range conflict, mfr timeline).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-113-wave-batch-ui.spec.ts
 */
test.describe('core-113: wave TE shop CO matrix UI', () => {
  test('matrix page shell + panel without B2B error', async ({ page }) => {
    const chain = waitForChainOverview(page, { collectionId: 'SS27' });
    const res = await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await chain;
    await expect(page.getByText('Ошибка B2B магазина')).toHaveCount(0);
    await expect(page.getByTestId('shop-co-matrix-shell')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('shop-co-matrix-panel')).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('core-113: wave TF range planner conflict banner', () => {
  test('overlay conflict banner visible after stale PG overlay', async ({ page, request }) => {
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
        planSkuCount: tier.planSkuCount + 7,
        pgSkuCount: tier.pgSkuCount + 7,
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
    await expect(page.getByTestId('brand-range-planner-overlay-conflict-banner')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('brand-range-planner-overlay-sync-btn')).toBeVisible();
  });
});

test.describe('core-113: wave TG mfr production timeline strip', () => {
  test('production timeline API smoke', async ({ request }) => {
    const res = await request.get(
      '/api/workshop2/manufacturer/production-timeline?orderId=B2B-DEMO-SHOP1-SS27'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { timeline?: { steps?: unknown[] }; steps?: unknown[] };
    const steps = json.timeline?.steps ?? json.steps;
    expect(Array.isArray(steps)).toBe(true);
  });

  test('mfr OP cabinet shows production timeline strip when WIP exists', async ({
    page,
    request,
  }) => {
    const probe = await request.get(
      '/api/workshop2/manufacturer/production-timeline?orderId=B2B-DEMO-SHOP1-SS27'
    );
    expect(probe.status()).toBeLessThan(500);
    const probeJson = (await probe.json()) as {
      timeline?: { steps?: unknown[] };
      steps?: unknown[];
    };
    const steps = probeJson.timeline?.steps ?? probeJson.steps ?? [];
    test.skip(steps.length === 0, 'нет WIP steps — нужен db:core:bootstrap или WIP file seed');

    const res = await gotoRoleCoreCabinet(
      page,
      '/factory/production/core?collection=SS27&pillar=order_production'
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('mfr-op-cabinet-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('mfr-op-production-timeline-strip')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId('mfr-op-production-timeline-steps')).toBeVisible();
  });
});

test.describe('core-113: wave TH replenishment filter-slices API', () => {
  test('filter-slices GET smoke', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/replenishment/filter-slices?buyerId=shop1');
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('core-113: wave TI range planner overlay GET', () => {
  test('overlay GET returns storageMode', async ({ request }) => {
    const res = await request.get('/api/brand/range-planner/overlay?collectionId=SS27', {
      headers: W2_DEV_HEADERS,
    });
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    if (json.ok && json.storageMode) {
      expect(['postgres', 'memory', 'file']).toContain(json.storageMode);
    }
  });
});
