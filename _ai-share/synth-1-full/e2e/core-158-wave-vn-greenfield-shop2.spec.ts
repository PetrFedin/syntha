import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave VN: shop2 greenfield CO registry — PG buyer/pricelist/matrix seed, CRM peers, EMPTY27 honesty, BY pricelist.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-158-wave-vn-greenfield-shop2.spec.ts
 */
test.describe('core-158: wave VN greenfield shop2 registry', () => {
  test('greenfield onboarding API shop2 SS27', async ({ request }) => {
    const res = await request.get(
      '/api/shop/b2b/greenfield/onboarding?buyerId=shop2&collectionId=SS27'
    );
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      state?: { crmReady?: boolean; pricelistReady?: boolean };
      storageMode?: string;
    };
    expect(typeof json.ok).toBe('boolean');
  });

  test('shop2 CO cabinet: greenfield registry strip + BY pricelist CTA', async ({ page }) => {
    await page.goto('/shop/core?pillar=collection_order&collection=SS27&buyer=shop2', GOTO);
    await expect(page.getByTestId('shop-co-cabinet-empty-onboarding')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-co-greenfield-registry-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page
        .getByTestId('shop-co-greenfield-registry-pg')
        .or(page.getByTestId('shop-co-greenfield-registry-memory'))
    ).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-co-cabinet-greenfield-empty-peer-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-cabinet-brand-pricelist-link')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-cabinet-replenishment-link')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('EMPTY27 cabinet: buyer profile honesty badges', async ({ page }) => {
    const res = await page.goto(
      '/shop/core?collection=EMPTY27&pillar=sample_collection',
      GOTO
    );
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
