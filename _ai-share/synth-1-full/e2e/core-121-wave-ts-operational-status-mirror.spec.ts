import { test, expect } from '@playwright/test';

/**
 * Wave TS: shop operational status PATCH mirror after brand amend.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-121-wave-ts-operational-status-mirror.spec.ts
 */
test.describe('core-121: wave TS shop operational status mirror', () => {
  test('PATCH + GET operational-status journal for demo order', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    const orderId = 'B2B-DEMO-SHOP1-SS27';
    const idempotencyKey = `e2e-core-121:${orderId}:${Date.now()}`;

    const patchRes = await request.patch(
      `/api/shop/b2b/orders/${encodeURIComponent(orderId)}/operational-status`,
      {
        headers: { 'Idempotency-Key': idempotencyKey },
        data: { status: 'amendment_approved', amendmentId: 'amend-e2e-121' },
      }
    );
    expect(patchRes.ok()).toBeTruthy();
    const patchJson = (await patchRes.json()) as { ok?: boolean; status?: string };
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

  test('shop CO cabinet shows operational status badge when mirrored', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    const health = (await healthRes.json()) as { demoSeeded?: boolean };
    test.skip(!health.demoSeeded, 'нужен db:core:bootstrap');

    await page.goto('/shop/core?pillar=collection_order&collection=SS27', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-co-cabinet-panel')).toBeVisible({ timeout: 60_000 });

    const statusBadge = page.getByTestId('shop-co-cabinet-operational-status');
    const chainPeek = page.getByTestId('shop-co-cabinet-chain-peek');
    await expect(statusBadge.or(chainPeek).first()).toBeVisible({ timeout: 30_000 });
  });
});
