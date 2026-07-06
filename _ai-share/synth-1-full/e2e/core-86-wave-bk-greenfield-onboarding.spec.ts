import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };

/**
 * Wave BK · greenfield monetization onboarding (browser + API loop).
 */
test.describe('wave-bk greenfield onboarding', () => {
  test('shop2 checkout shows greenfield readiness strip', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'PG health unavailable');

    const res = await page.goto('/shop/b2b/checkout?collection=SS27&buyer=shop2', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-checkout-greenfield-readiness-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-co-checkout-greenfield-brand-assign-link')).toBeVisible();
  });

  test('brand CRM assign → shop tier sync readiness (API)', async ({ request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'PG health unavailable');

    const assignRes = await request.post('/api/brand/b2b/shop-buyer-crm-assign', {
      data: {
        buyerId: 'shop2',
        segmentKey: 'retail',
        collectionId: 'SS27',
        syncTierToShop: true,
      },
    });
    expect(assignRes.ok()).toBeTruthy();
    const assignJson = (await assignRes.json()) as {
      ok?: boolean;
      profile?: { assignedAt?: string; priceTier?: string };
      tierSync?: { ok?: boolean; shopSynced?: boolean };
    };
    expect(assignJson.ok).toBe(true);
    expect(assignJson.profile?.assignedAt).toBeTruthy();

    const profileRes = await request.get('/api/brand/b2b/shop-buyer-crm-assign?buyerId=shop2');
    expect(profileRes.ok()).toBeTruthy();
    const profileJson = (await profileRes.json()) as { ok?: boolean; profile?: { assignedAt?: string } };
    expect(profileJson.ok).toBe(true);
    expect(profileJson.profile?.assignedAt).toBeTruthy();
  });

  test('EMPTY27 shop2 registry: empty onboarding or focus strip', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'PG health unavailable');

    const ordersRes = await request.get('/api/shop/b2b/orders?buyerId=shop2&collectionId=EMPTY27');
    expect(ordersRes.ok()).toBeTruthy();
    const ordersJson = (await ordersRes.json()) as { orders?: unknown[] };

    const res = await page.goto('/shop/b2b/orders?buyer=shop2&collection=EMPTY27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    if ((ordersJson.orders?.length ?? 0) === 0) {
      await expect(page.getByTestId('shop-co-registry-empty-greenfield-monetization-strip')).toBeVisible({
        timeout: 60_000,
      });
      await expect(page.getByTestId('shop-co-registry-empty-greenfield-checkout-link')).toBeVisible();
    } else {
      await expect(page.getByTestId('shop-co-registry-stream-health-strip').or(page.locator('[data-testid^="shop-b2b-order-"]'))).toBeVisible({
        timeout: 60_000,
      });
    }
  });

  test('release checklist auto-blockers strip renders', async ({ page, request }) => {
    const healthRes = await request.get('/api/workshop2/platform-core/health');
    test.skip(!healthRes.ok(), 'PG health unavailable');

    const res = await page.goto('/brand/merch/launch-readiness?pcf=checklist', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('brand-release-checklist-auto-blockers-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('brand-release-checklist-auto-blockers-count')).toBeVisible();
  });
});
