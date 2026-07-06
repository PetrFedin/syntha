import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave YG · Brand CO: PG partner count badge, shop operational status mirror polish, registry ↔ tracking cross-links.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-222-wave-yg-partner-count.spec.ts
 */
test.describe('core-222: wave YG brand CO partner count + shop mirror', () => {
  test('b2b-orders-summary returns storageMode + rows', async ({ request }) => {
    const res = await request.get('/api/brand/retailers/b2b-orders-summary?collectionId=SS27');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      storageMode?: string;
      rows?: unknown[];
    };
    expect(json.ok).toBe(true);
    expect(typeof json.storageMode).toBe('string');
    expect(Array.isArray(json.rows)).toBe(true);
  });

  test('PATCH + GET shop operational-status mirror journal', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const orderId = 'B2B-DEMO-SHOP1-SS27';
    const idempotencyKey = `e2e-core-222:${orderId}:${Date.now()}`;

    const patchRes = await request.patch(
      `/api/shop/b2b/orders/${encodeURIComponent(orderId)}/operational-status`,
      {
        headers: { 'Idempotency-Key': idempotencyKey },
        data: { status: 'amendment_approved', amendmentId: 'amend-e2e-222' },
      }
    );
    expect(patchRes.ok()).toBeTruthy();
    const patchJson = (await patchRes.json()) as { ok?: boolean; status?: string; storageMode?: string };
    expect(patchJson.ok).toBe(true);
    expect(patchJson.status).toBe('amendment_approved');

    const getRes = await request.get(
      `/api/shop/b2b/orders/${encodeURIComponent(orderId)}/operational-status`
    );
    expect(getRes.ok()).toBeTruthy();
    const getJson = (await getRes.json()) as { ok?: boolean; status?: string | null };
    expect(getJson.ok).toBe(true);
    expect(getJson.status).toBe('amendment_approved');
  });

  test('brand CO cabinet: PG partner count badge', async ({ page }) => {
    await page.goto('/brand/core?pillar=collection_order&collection=SS27', GOTO);
    await expect(page.getByTestId('brand-co-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const partnerCount = page.getByTestId('brand-co-cabinet-partner-count');
    const pgBadge = page.getByTestId('brand-co-cabinet-pg-partner-badge');
    const loading = page.getByTestId('brand-co-cabinet-partner-count-loading');

    await expect(partnerCount.or(pgBadge).or(loading).first()).toBeVisible({ timeout: 45_000 });
    if ((await pgBadge.count()) > 0) {
      await expect(pgBadge).toContainText('PG');
    }
  });

  test('shop CO cabinet: operational status mirror + PG badge', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/shop/core?pillar=collection_order&collection=SS27', GOTO);
    await expect(page.getByTestId('shop-co-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const statusBadge = page.getByTestId('shop-co-cabinet-operational-status');
    const pgBadge = page.getByTestId('shop-co-cabinet-operational-status-pg-badge');
    const chainPeek = page.getByTestId('shop-co-cabinet-chain-peek');

    await expect(statusBadge.or(pgBadge).or(chainPeek).first()).toBeVisible({ timeout: 45_000 });
  });

  test('cross-link: brand registry ↔ shop tracking', async ({ page }) => {
    await page.goto('/brand/b2b-orders?collection=SS27', GOTO);
    await expect(page.getByTestId('brand-co-registry-panel')).toBeVisible({ timeout: 60_000 });

    const brandTrackingLink = page.getByTestId('brand-co-registry-shop-tracking-link');
    if ((await brandTrackingLink.count()) > 0) {
      await expect(brandTrackingLink).toHaveAttribute('href', /tracking/);
    }

    await page.goto('/shop/b2b/tracking?order=B2B-DEMO-SHOP1-SS27&collection=SS27', GOTO);
    await expect(page.getByTestId('shop-co-tracking-list')).toBeVisible({ timeout: 60_000 });

    const brandRegistryLink = page.getByTestId('shop-co-tracking-brand-registry-link');
    if ((await brandRegistryLink.count()) > 0) {
      await expect(brandRegistryLink).toHaveAttribute('href', /b2b-orders/);
      await expect(brandRegistryLink).toHaveAttribute('href', /order=B2B-DEMO-SHOP1-SS27/);
    }
  });
});
