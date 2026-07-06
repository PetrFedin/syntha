import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };
const DEMO_ORDER = 'B2B-DEMO-SHOP1-SS27';

/**
 * Wave WL · Brand CO: registry amend API, multi-buyer PG filter, shop tracking peer strip.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-175-wave-wl-brand-amend.spec.ts
 */
test.describe('core-175: wave WL brand CO registry amend', () => {
  test('registry amendments GET + partner PG filter on orders API', async ({ request }) => {
    const amendRes = await request.get('/api/brand/b2b/registry/amendments?collectionId=SS27');
    expect(amendRes.status()).toBeLessThan(500);
    const amendJson = (await amendRes.json()) as {
      ok?: boolean;
      pending?: unknown[];
      storageMode?: string;
      messageRu?: string;
    };
    expect(amendJson.ok).toBe(true);
    expect(Array.isArray(amendJson.pending)).toBe(true);
    expect(typeof amendJson.messageRu).toBe('string');

    const allRes = await request.get('/api/brand/b2b/orders?collectionId=SS27');
    expect(allRes.ok()).toBeTruthy();
    const allJson = (await allRes.json()) as {
      partnerIds?: string[];
      storageMode?: string;
      orders?: unknown[];
    };
    expect(Array.isArray(allJson.partnerIds)).toBe(true);

    const shop2Res = await request.get('/api/brand/b2b/orders?collectionId=SS27&partner=shop2');
    expect(shop2Res.ok()).toBeTruthy();
    const shop2Json = (await shop2Res.json()) as { partner?: string; orders?: unknown[] };
    expect(shop2Json.partner).toBe('shop2');
    if (Array.isArray(allJson.orders) && Array.isArray(shop2Json.orders)) {
      expect(shop2Json.orders.length).toBeLessThanOrEqual(allJson.orders.length);
    }
  });

  test('b2b-orders-summary accepts collectionId for cabinet multi-buyer', async ({ request }) => {
    const res = await request.get('/api/brand/retailers/b2b-orders-summary?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      collectionId?: string | null;
      rows?: unknown[];
    };
    expect(json.ok).toBe(true);
    expect(json.collectionId).toBe('SS27');
    expect(Array.isArray(json.rows)).toBe(true);
  });

  test('brand approve amend mirrors shop operational status', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const orderId = DEMO_ORDER;
    const amendmentsRes = await request.get(
      `/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/amendments`
    );
    const amendmentsJson = (await amendmentsRes.json()) as {
      pending?: { id?: string } | null;
    };
    const pendingId = amendmentsJson.pending?.id;
    test.skip(!pendingId, 'нет pending amend для demo order');

    const approveRes = await request.post(
      `/api/brand/b2b/orders/${encodeURIComponent(orderId)}/amendments/${encodeURIComponent(
        pendingId!
      )}/approve`,
      { data: {} }
    );
    expect(approveRes.status()).toBeLessThan(500);

    const statusRes = await request.get(
      `/api/shop/b2b/orders/${encodeURIComponent(orderId)}/operational-status`
    );
    expect(statusRes.ok()).toBeTruthy();
    const statusJson = (await statusRes.json()) as { ok?: boolean; status?: string | null };
    expect(statusJson.ok).toBe(true);
    if (approveRes.ok()) {
      expect(statusJson.status).toBe('amendment_approved');
    }
  });

  test('brand CO registry: partner filter + amend queue + shop tracking peer strip', async ({
    page,
  }) => {
    await page.goto('/brand/b2b-orders?collection=SS27', GOTO);
    await expect(page.getByTestId('brand-co-registry-panel')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('brand-co-registry-partner-filter')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('brand-co-registry-amend-queue-strip')).toBeVisible({
      timeout: 45_000,
    });

    const pgBadge = page.getByTestId('brand-co-registry-pg-partner-badge');
    if ((await pgBadge.count()) > 0) {
      await expect(pgBadge).toContainText('PG');
    }

    const trackingStrip = page.getByTestId('brand-co-registry-shop-tracking-peer-strip');
    if ((await trackingStrip.count()) > 0) {
      await expect(page.getByTestId('brand-co-registry-shop-tracking-link')).toBeVisible();
    }
  });

  test('brand CO cabinet: multi-buyer partner filter chips', async ({ page }) => {
    await page.goto('/brand/core?pillar=collection_order&collection=SS27', GOTO);
    await expect(page.getByTestId('brand-co-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const partnerFilter = page.getByTestId('brand-co-cabinet-partner-filter');
    if ((await partnerFilter.count()) > 0) {
      await expect(partnerFilter).toBeVisible();
      const shop2 = page.getByTestId('brand-co-cabinet-partner-shop2');
      if ((await shop2.count()) > 0) {
        await shop2.click();
        await expect(page.getByTestId('brand-co-cabinet-partner-shop2')).toHaveClass(/bg-sky-100/);
      }
    }

    const trackingLink = page.getByTestId('brand-co-cabinet-shop-tracking-link');
    if ((await trackingLink.count()) > 0) {
      await expect(trackingLink).toHaveAttribute('href', /order=B2B|tracking/);
    }
  });
});
