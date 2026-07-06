import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave TB: replenishment filter slices sidebar PG persisted (fail-closed LS in core).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-113-wave-tb-replenishment-filter-slices.spec.ts
 */
test.describe('core-113: wave TB replenishment filter slices', () => {
  test('filter-slices GET/POST roundtrip (PG)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const postRes = await request.post('/api/shop/b2b/replenishment/filter-slices', {
      data: {
        buyerId: 'shop1',
        slice: {
          orgId: 'shop1',
          seasonId: 'FW27',
          collectionId: 'FW27',
          labelRu: 'Shop1 · FW27',
        },
      },
    });
    expect(postRes.ok()).toBe(true);
    const postJson = (await postRes.json()) as {
      ok?: boolean;
      storageMode?: string;
      activeSlice?: { seasonId?: string };
    };
    expect(postJson.ok).toBe(true);
    expect(postJson.activeSlice?.seasonId).toBe('FW27');
    expect(['pg', 'file', 'memory']).toContain(postJson.storageMode);

    const getRes = await request.get('/api/shop/b2b/replenishment/filter-slices?buyerId=shop1');
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as {
      ok?: boolean;
      savedSlices?: Array<{ labelRu?: string; isActive?: boolean }>;
      activeSlice?: { labelRu?: string };
    };
    expect(getJson.ok).toBe(true);
    expect(getJson.activeSlice?.labelRu).toContain('FW27');
    expect(getJson.savedSlices?.some((s) => s.isActive)).toBe(true);
  });

  test('stock-atp tab shows filter slices sidebar + PG badge', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const res = await page.goto('/shop/b2b/replenishment?collection=SS27&pcf=stock-atp', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-replenishment-feature-stock-atp')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-replenishment-filter-slices-sidebar')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-replenishment-slice-SS27')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page.getByTestId('shop-replenishment-slice-storage-pg').or(
        page.getByTestId('shop-replenishment-slice-storage-unavailable')
      )
    ).toBeVisible({ timeout: 45_000 });
  });

  test('selecting slice updates URL rsSeason param', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    await page.goto('/shop/b2b/replenishment?collection=SS27&pcf=stock-atp', GOTO);
    await expect(page.getByTestId('shop-replenishment-slice-FW27')).toBeVisible({ timeout: 60_000 });
    await page.getByTestId('shop-replenishment-slice-FW27').click();
    await page.waitForURL(/rsSeason=FW27/, { timeout: 30_000 });
    expect(page.url()).toContain('rsSeason=FW27');
  });
});
