import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const W2_DEV_HEADERS = {
  'x-syntha-dev-actor': 'brand-demo',
  'x-syntha-workshop2-dev': '1',
};

/**
 * Wave XG · Brand range planner: bulk tier POST (extends UM), conflict resolver RU polish,
 * cross-link range planner ↔ shop matrix tier badge.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-196-wave-xg-range-planner.spec.ts
 */
test.describe('core-196: wave XG bulk tier assign POST (extends UM)', () => {
  test('POST bulk-tier-assign returns wave xg envelope with tier + messageRu', async ({ request }) => {
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
    test.skip(unassigned.length < 1, 'нужен ≥1 unassigned для bulk smoke');

    const articleIds = unassigned.slice(0, 2).map((row) => row.articleId);
    const res = await request.post('/api/workshop2/range-planner/bulk-tier-assign', {
      headers: { ...W2_DEV_HEADERS, 'content-type': 'application/json' },
      data: { collectionId: 'SS27', tier: 'core', articleIds, allowPartial: true },
    });
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      ok?: boolean;
      bulkAssigned?: boolean;
      assigned?: number;
      tier?: string;
      wave?: string;
      messageRu?: string;
      partial?: boolean;
    };
    expect(json.ok).toBe(true);
    expect(json.bulkAssigned).toBe(true);
    expect(json.tier).toBe('core');
    expect(json.wave).toBe('xg');
    expect(json.messageRu).toContain('Назначено');
    expect((json.assigned ?? 0) >= 1).toBe(true);
  });

  test('POST rejects batch larger than wave XG max', async ({ request }) => {
    const ids = Array.from({ length: 49 }, (_, i) => `art-bulk-${i}`);
    const res = await request.post('/api/workshop2/range-planner/bulk-tier-assign', {
      headers: { ...W2_DEV_HEADERS, 'content-type': 'application/json' },
      data: { collectionId: 'SS27', tier: 'core', articleIds: ids },
    });
    expect(res.status()).toBe(400);
    const json = (await res.json()) as { ok?: boolean; error?: string; messageRu?: string };
    expect(json.ok).toBe(false);
    expect(json.error).toBe('batch_too_large');
    expect(json.messageRu).toContain('48');
  });
});

test.describe('core-196: wave XG overlay conflict resolver RU polish', () => {
  test('conflict resolver strip + overlay sync banner after stale PG overlay', async ({
    page,
    request,
  }) => {
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
    await expect(page.getByTestId('brand-range-planner-conflict-resolver-summary')).toContainText(
      'SKU'
    );
    await expect(page.getByTestId('brand-range-planner-overlay-conflict-last-sync')).toBeVisible();
    await expect(page.getByTestId('brand-range-planner-conflict-resolver-sync-btn')).toBeVisible();
    await expect(page.getByTestId('brand-range-planner-overlay-sync-btn')).toBeVisible();
    await expect(page.getByTestId('brand-range-planner-conflict-resolver-tier-core')).toBeVisible();
  });
});

test.describe('core-196: wave XG range planner ↔ shop matrix tier badge cross-link', () => {
  test('brand range planner shows shop matrix tier badge link', async ({ page }) => {
    await page.goto('/brand/range-planner?collection=SS27', GOTO);
    await expect(page.getByTestId('brand-dev-range-panel')).toBeVisible({ timeout: 60_000 });
    const matrixLink = page.getByTestId('brand-dev-range-shop-matrix-tier-badge-link');
    await expect(matrixLink).toBeVisible({ timeout: 45_000 });
    await expect(matrixLink).toHaveAttribute('href', /\/shop\/b2b\/matrix/);
  });

  test('shop matrix shows range planner tier badge back-link', async ({ page }) => {
    await page.goto('/shop/b2b/matrix?collection=SS27', GOTO);
    await expect(page.getByTestId('shop-co-matrix-shell')).toBeVisible({ timeout: 60_000 });
    const backLink = page.getByTestId('shop-co-matrix-range-planner-tier-badge-link');
    await expect(backLink).toBeVisible({ timeout: 45_000 });
    await expect(backLink).toHaveAttribute('href', /\/brand\/range-planner/);
    await expect(backLink).toHaveAttribute('href', /collection=SS27/);
  });
});
