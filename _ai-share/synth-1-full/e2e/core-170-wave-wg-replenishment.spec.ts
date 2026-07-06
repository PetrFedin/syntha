import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave WG: shop replenishment WMS ATP feed + saved filter slices PG + matrix auto-lines.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-170-wave-wg-replenishment.spec.ts
 */
test.describe('core-170: wave WG shop replenishment ATP', () => {
  test('wms-atp-feed GET returns items + source', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/replenishment/wms-atp-feed?collection=SS27&buyerId=shop1&limit=12'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      source?: string;
      items?: Array<{ sku?: string; qtyAvailable?: number }>;
      skuCount?: number;
      atpTotal?: number;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.messageRu).toBe('string');
    expect(typeof json.skuCount).toBe('number');
    expect(typeof json.atpTotal).toBe('number');
    expect(Array.isArray(json.items)).toBe(true);
    if (json.source) {
      expect(['wms', 'pg+wms', 'pg', 'demo']).toContain(json.source);
    }
  });

  test('filter-slices GET/POST roundtrip (PG)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен db:core:bootstrap + PG');

    const postRes = await request.post('/api/shop/b2b/replenishment/filter-slices', {
      data: {
        buyerId: 'shop1',
        slice: {
          orgId: 'shop1',
          seasonId: 'SS27',
          collectionId: 'SS27',
          labelRu: 'Магазин 1 · SS27',
        },
      },
    });
    expect(postRes.ok()).toBe(true);
    const postJson = (await postRes.json()) as { ok?: boolean; storageMode?: string };
    expect(postJson.ok).toBe(true);
    expect(['pg', 'file', 'memory']).toContain(postJson.storageMode);

    const getRes = await request.get('/api/shop/b2b/replenishment/filter-slices?buyerId=shop1');
    expect(getRes.ok()).toBe(true);
    const getJson = (await getRes.json()) as {
      ok?: boolean;
      savedSlices?: Array<{ isActive?: boolean }>;
    };
    expect(getJson.ok).toBe(true);
    expect(getJson.savedSlices?.some((s) => s.isActive)).toBe(true);
  });

  test('matrix-lines GET returns apply hint', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/replenishment/matrix-lines?collectionId=SS27&buyerId=shop1'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      lines?: unknown[];
      matrixHref?: string;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.messageRu).toBe('string');
    expect(json.matrixHref).toContain('/shop/b2b/matrix');
  });

  test('stock-atp tab: WMS badge + filter slices sidebar + auto-lines strip', async ({ page }) => {
    const res = await page.goto('/shop/b2b/replenishment?collection=SS27&pcf=stock-atp', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-replenishment-feature-stock-atp')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-replenishment-wms-atp-badge')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-replenishment-filter-slices-sidebar')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-replenishment-matrix-auto-lines-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-replenishment-matrix-lines-apply')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('filter slice PG badge only in sidebar (no duplicate in toolbar)', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    await page.goto('/shop/b2b/replenishment?collection=SS27&pcf=stock-atp', GOTO);
    await expect(page.getByTestId('shop-replenishment-filter-slices-sidebar')).toBeVisible({
      timeout: 60_000,
    });
    const pgBadges = page.getByTestId('shop-replenishment-slice-storage-pg');
    await expect(pgBadges).toHaveCount(1, { timeout: 30_000 });
  });

  test('matrix auto-lines link navigates with replenishmentAutoLines param', async ({ page }) => {
    await page.goto('/shop/b2b/replenishment?collection=SS27&pcf=stock-atp', GOTO);
    await expect(page.getByTestId('shop-replenishment-matrix-auto-lines-link')).toBeVisible({
      timeout: 60_000,
    });
    const nav = page.waitForURL(/replenishmentAutoLines=1/, { timeout: 60_000 });
    await page.getByTestId('shop-replenishment-matrix-auto-lines-link').click();
    await nav;
    expect(page.url()).toMatch(/replenishmentApply=1/);
  });
});
