import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave XX: shop2 full greenfield registry — PG buyer + pricelist + matrix seed (extends VN).
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-213-wave-xx-greenfield.spec.ts
 */
test.describe('core-213: wave XX greenfield shop2 full registry', () => {
  test('greenfield onboarding API shop2 SS27 — PG buyer CRM + pricelist + matrix seed', async ({
    request,
  }) => {
    const res = await request.get(
      '/api/shop/b2b/greenfield/onboarding?buyerId=shop2&collectionId=SS27'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      state?: {
        crmReady?: boolean;
        pricelistReady?: boolean;
        matrixSeedHref?: string;
      };
      storageMode?: string;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(['postgres', 'memory']).toContain(json.storageMode);
    expect(typeof json.messageRu).toBe('string');
    expect(json.messageRu).toMatch(/Магазин|CRM|прайс/i);
    if (json.state?.crmReady && json.state?.pricelistReady) {
      expect(json.state.matrixSeedHref).toContain('/shop/b2b/matrix');
    }
  });

  test('shop2 CO cabinet: greenfield registry strip + buyer PG + pricelist badges', async ({
    page,
  }) => {
    await page.goto('/shop/core?pillar=collection_order&collection=SS27&buyer=shop2', GOTO);
    await expect(page.getByTestId('shop-co-cabinet-empty-onboarding')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-co-greenfield-registry-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-greenfield-registry-buyer')).toContainText('shop2');
    await expect(page.getByTestId('shop-co-greenfield-registry-buyer-pg')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-greenfield-registry-status')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('shop-co-greenfield-registry-pg')
        .or(page.getByTestId('shop-co-greenfield-registry-memory'))
    ).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-co-greenfield-registry-pricelist')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-cabinet-greenfield-empty-peer-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-cabinet-brand-pricelist-link')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('shop2 registry EMPTY27: monetization spine + PG onboarding pricelist + matrix seed', async ({
    page,
    request,
  }) => {
    const ordersRes = await request.get('/api/shop/b2b/orders?buyerId=shop2&collectionId=EMPTY27');
    expect(ordersRes.status()).toBeLessThan(500);
    const ordersJson = (await ordersRes.json()) as { orders?: unknown[] };
    if (Array.isArray(ordersJson.orders) && ordersJson.orders.length > 0) {
      test.skip(true, 'shop2 EMPTY27 уже имеет заказы — empty registry недоступен');
    }

    const res = await page.goto('/shop/b2b/orders?buyer=shop2&collection=EMPTY27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-co-registry-empty-onboarding')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-co-registry-empty-greenfield-monetization-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-registry-greenfield-onboarding-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('shop-co-registry-greenfield-onboarding-pg')
        .or(page.getByTestId('shop-co-registry-greenfield-onboarding-memory'))
    ).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-co-registry-greenfield-onboarding-pricelist')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-registry-empty-greenfield-brand-pricelist-link')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('EMPTY27 cabinet: buyer profile honesty badges', async ({ page }) => {
    const res = await page.goto('/shop/core?collection=EMPTY27&pillar=sample_collection', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-empty27-onboarding-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-sc-cabinet-buyer-profile-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-cabinet-buyer-profile-segment')
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-no-segment'))
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-pg'))
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-memory'))
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-demo'))
    ).toBeVisible({ timeout: 45_000 });
  });

  test('shop dev bridge: CRM strip replenishment + matrix links', async ({ page }) => {
    const res = await page.goto('/shop/core?collection=EMPTY27&pillar=development', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-development-bridge-greenfield-crm-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-dev-bridge-crm-matrix-link')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-dev-bridge-crm-replenishment-link')).toBeVisible({
      timeout: 45_000,
    });
  });
});
