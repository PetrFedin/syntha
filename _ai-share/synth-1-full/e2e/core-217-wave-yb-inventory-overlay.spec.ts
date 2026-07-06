import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const COLLECTION = 'SS27';

/**
 * Wave YB: brand collection inventory overlay PG + inventory ledger WMS cross-link.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-217-wave-yb-inventory-overlay.spec.ts
 */
test.describe('core-217: wave YB collection inventory overlay PG', () => {
  test('BFF GET/PUT round-trip storageMode postgres', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { pgReachable?: boolean };
    test.skip(!health.pgReachable, 'нужен PG');

    const sku = `YB-OVR-${Date.now()}`;
    const doc = {
      v: 1 as const,
      articles: [
        {
          id: `yb-${Date.now()}`,
          sku,
          name: 'YB overlay e2e',
          season: COLLECTION,
          orderedQuantity: 1,
          price: 100,
          deliveryWindowId: 'drop1',
          categoryLeafId: 'catalog-apparel-g0-l0',
          productionSiteId: 'fab-rf-ivanovo',
          productionSiteLabel: 'Фабрика',
          fabricSuppliers: [],
          fabricMainFromBrandStock: false,
          lineStatus: 'open',
        },
      ],
    };

    const putRes = await request.put('/api/brand/collection-inventory-overlay', {
      data: { collectionId: COLLECTION, doc },
    });
    expect(putRes.ok()).toBeTruthy();
    const putJson = (await putRes.json()) as { ok?: boolean; storageMode?: string };
    expect(putJson.ok).toBe(true);
    expect(putJson.storageMode).toBe('postgres');

    const getRes = await request.get(
      `/api/brand/collection-inventory-overlay?collectionId=${encodeURIComponent(COLLECTION)}`
    );
    expect(getRes.ok()).toBeTruthy();
    const getJson = (await getRes.json()) as {
      ok?: boolean;
      storageMode?: string;
      doc?: { articles?: Array<{ sku?: string }> };
    };
    expect(getJson.ok).toBe(true);
    expect(getJson.storageMode).toBe('postgres');
    expect(getJson.doc?.articles?.some((a) => a.sku === sku)).toBe(true);
  });

  test('brand production floor: overlay PG badge + inventory ledger link', async ({ page }) => {
    const healthRes = await page.request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean; pgReachable?: boolean };
    test.skip(!health.demoSeeded || !health.pgReachable, 'нужен db:core:bootstrap + PG');

    const res = await page.goto(
      `/brand/production?collectionId=${encodeURIComponent(COLLECTION)}`,
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);

    const pgBadge = page.getByTestId('brand-collection-inventory-overlay-storage-pg');
    const unavailBadge = page.getByTestId(
      'brand-collection-inventory-overlay-storage-pg-unavailable'
    );
    const ledgerLink = page.getByTestId('brand-collection-inventory-overlay-inventory-ledger-link');

    await expect(pgBadge.or(unavailBadge).first()).toBeVisible({ timeout: 60_000 });
    await expect(pgBadge.first()).toBeVisible();
    await expect(pgBadge.first()).toContainText(/PostgreSQL/);
    await expect(ledgerLink.first()).toBeVisible();
    await expect(ledgerLink.first()).toContainText(/ledger/i);
  });
});
