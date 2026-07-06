import { test, expect } from '@playwright/test';

/**
 * Wave SI: core readPath=api-only policy + supplier catalog nav.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-62-wave-si-pg-readpath.spec.ts
 */
test.describe('core-62: wave SI PG read-path + supplier catalog', () => {
  test('supplier material catalog API (PG health)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const res = await request.get('/api/workshop2/supplier/material-catalog?supplierId=sup-demo-001');
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as { ok?: boolean; listings?: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.listings)).toBe(true);
  });

  test('published-articles API for SS27 (readPath=api contract)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const res = await request.get('/api/workshop2/collections/SS27/published-articles');
    expect(res.ok()).toBe(true);
    const json = (await res.json()) as { ok?: boolean; articles?: unknown[] };
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.articles)).toBe(true);
  });

  test('range planner overlay PG round-trip', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const putRes = await request.put('/api/brand/range-planner/overlay', {
      data: {
        collectionId: 'SS27',
        overlay: {
          v: 1,
          collectionId: 'SS27',
          tiers: [{ id: 'core62', budget: 100, targetMargin: 0.5, planSkuCount: 1, pgSkuCount: 1 }],
          tiersFromPg: true,
          syncedFromPgAt: new Date().toISOString(),
        },
      },
    });
    expect(putRes.ok()).toBe(true);

    const getRes = await request.get('/api/brand/range-planner/overlay?collectionId=SS27');
    expect(getRes.ok()).toBe(true);
  });
});
