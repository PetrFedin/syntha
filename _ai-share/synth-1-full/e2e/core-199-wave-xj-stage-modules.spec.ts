import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const COLLECTION = 'SS27';

/**
 * Wave XJ: brand collection stage modules PG — BFF GET/PUT + hub card badge (no LS fallback in core).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-199-wave-xj-stage-modules.spec.ts
 */
test.describe('core-199: wave XJ collection stage modules PG', () => {
  test('BFF GET/PUT round-trip storageMode postgres', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const stepId = 'costing';
    const fieldValue = `xj-e2e-${Date.now()}`;
    const doc = {
      v: 1 as const,
      steps: {
        [stepId]: {
          fields: { landedCostPolicy: fieldValue },
          attachments: [],
          history: [],
        },
      },
    };

    const putRes = await request.put('/api/brand/collection-stage-modules', {
      data: { collectionId: COLLECTION, doc },
    });
    expect(putRes.ok()).toBeTruthy();
    const putJson = (await putRes.json()) as { ok?: boolean; storageMode?: string };
    expect(putJson.ok).toBe(true);
    expect(putJson.storageMode).toBe('postgres');

    const getRes = await request.get(
      `/api/brand/collection-stage-modules?collectionId=${encodeURIComponent(COLLECTION)}`
    );
    expect(getRes.ok()).toBeTruthy();
    const getJson = (await getRes.json()) as {
      ok?: boolean;
      storageMode?: string;
      doc?: { steps?: Record<string, { fields?: Record<string, string> }> };
    };
    expect(getJson.ok).toBe(true);
    expect(getJson.storageMode).toBe('postgres');
    expect(getJson.doc?.steps?.[stepId]?.fields?.landedCostPolicy).toBe(fieldValue);
  });

  test('brand production floor: stage module hub PG badge', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean; pgReachable?: boolean };
    test.skip(!health.demoSeeded || !health.pgReachable, 'нужен db:core:bootstrap + PG');

    const res = await page.goto(
      `/brand/production?collectionId=${encodeURIComponent(COLLECTION)}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const pgBadge = page.getByTestId('brand-collection-stage-modules-storage-pg');
    const unavailBadge = page.getByTestId('brand-collection-stage-modules-storage-pg-unavailable');
    await expect(pgBadge.or(unavailBadge).first()).toBeVisible({ timeout: 60_000 });
    await expect(pgBadge.first()).toBeVisible();
    await expect(pgBadge.first()).toContainText(/PostgreSQL/);
    await expect(page.getByText('Себестоимость и маржа').first()).toBeVisible();
  });
});
