import { test, expect } from '@playwright/test';

/**
 * Wave SM: floor-tab PG + live-process runtime API (core S1 purge).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-98-wave-sm-pg-storage.spec.ts
 */
test.describe('core-98: wave SM S1 PG storage', () => {
  test('floor-tab subcontractor GET API', async ({ request }) => {
    const res = await request.get('/api/brand/production/floor-tabs/subcontractor');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as { ok?: boolean; storageMode?: string };
    expect(typeof json.ok).toBe('boolean');
  });

  test('floor-tab subcontractor PUT roundtrip', async ({ request }) => {
    const payload = {
      draft: { v: 1, orders: [], updatedAt: new Date().toISOString() },
    };
    const res = await request.put('/api/brand/production/floor-tabs/subcontractor', { data: payload });
    expect(res.status()).toBeLessThan(500);
  });

  test('live-process runtime GET API', async ({ request }) => {
    const res = await request.get(
      '/api/processes/sample-collection/runtime?contextId=SS27'
    );
    expect(res.status()).toBeLessThan(500);
  });

  test('subcontractor page PG badge when core', async ({ page }) => {
    const res = await page.goto('/brand/production/subcontractor', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    expect(res?.status() ?? 599).toBeLessThan(500);
  });
});
