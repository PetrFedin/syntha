import { test, expect } from '@playwright/test';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

const CHECKOUT_RESERVE_COPY =
  'Резерв склада — после подтверждения брендом и передачи в цех.';

/**
 * Wave UI P1 shop: payment intent, partnership invite PG, EMPTY27 buyer profile, live WMS badge.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-135-wave-ui-shop-checkout.spec.ts
 */
test.describe('core-135: wave UI shop checkout + partners', () => {
  test('checkout: payment intent strip + inventory badge + S3 link', async ({ page }) => {
    const res = await page.goto('/shop/b2b/checkout?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    await expect(page.getByTestId('shop-co-checkout-payment-intent-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page
        .getByTestId('shop-co-checkout-payment-intent-badge-not-connected')
        .or(page.getByTestId('shop-co-checkout-payment-intent-badge-intent-ready'))
    ).toBeVisible({ timeout: 45_000 });

    const hold = page.getByTestId('shop-co-checkout-inventory-hold');
    await expect(hold).toBeVisible({ timeout: 45_000 });
    await expect(hold).toContainText(CHECKOUT_RESERVE_COPY);
    await expect(page.getByTestId('shop-co-checkout-inventory-badge')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-checkout-inventory-s3-link')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('partnership invite POST PG', async ({ request }) => {
    const res = await request.post('/api/shop/b2b/partnership-invite', {
      data: {
        action: 'request',
        brandId: 'brand_syntha_lab',
        buyerId: 'shop1',
        collectionId: 'SS27',
      },
    });
    expect([200, 400, 503]).toContain(res.status());
    const json = (await res.json()) as { ok?: boolean; messageRu?: string; action?: string };
    expect(typeof json.messageRu).toBe('string');
    if (json.ok) {
      expect(json.action).toBe('request');
    }
  });

  test('showroom partners discover: golden path + invite panel', async ({ page }) => {
    const res = await page.goto('/shop/b2b/partners/discover?collection=SS27', GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-b2b-partners-golden-path-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByTestId('shop-sc-partners-panel')).toBeVisible({ timeout: 45_000 });
    await expect(
      page.getByTestId('shop-sc-partners-invite-panel-brand_nordic_wool').or(
        page.locator('[data-testid^="shop-sc-partners-invite-panel-"]').first()
      )
    ).toBeVisible({ timeout: 45_000 });
  });

  test('EMPTY27 cabinet: buyer profile PG strip', async ({ page }) => {
    const res = await page.goto(
      '/shop/core?collection=EMPTY27&pillar=sample_collection',
      GOTO
    );
    expect(res?.status() ?? 599).toBeLessThan(500);
    await expect(page.getByTestId('shop-sc-cabinet-buyer-profile-strip')).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page
        .getByTestId('shop-sc-cabinet-buyer-profile-pg')
        .or(page.getByTestId('shop-sc-cabinet-buyer-profile-segment'))
    ).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('shop-sc-cabinet-buyer-profile-partners-link')).toBeVisible({
      timeout: 45_000,
    });
  });
});
