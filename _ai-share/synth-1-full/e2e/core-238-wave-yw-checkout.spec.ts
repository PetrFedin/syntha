import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

/**
 * Wave YW: shop CO checkout 2.2 — env-gated payment intent (stub vs live badge RU),
 * checkout → tracking cross-link after payment, deduped payment CTAs.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-238-wave-yw-checkout.spec.ts
 */
test.describe('core-238: wave YW shop checkout payment polish', () => {
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;

  test('GET payment-intent probe returns honest RU payload', async ({ request }) => {
    const res = await request.get('/api/shop/b2b/checkout/payment-intent');
    expect(res.status()).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      provider?: string;
      status?: string;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(json.provider === 'yukassa' || json.provider === 'stripe').toBe(true);
    expect(typeof json.messageRu).toBe('string');
    expect(json.messageRu!.length).toBeGreaterThan(5);
    expect(json.messageRu).not.toMatch(/intent created|not connected/i);
  });

  test('checkout: honest payment badge + deduped CTA row + tracking cross-link', async ({
    page,
  }) => {
    const res = await page.goto(`/shop/b2b/checkout?collection=${COLLECTION}`, GOTO);
    expect(res?.status() ?? 599).toBeLessThan(500);

    const strip = page.getByTestId('shop-co-checkout-payment-intent-strip');
    await expect(strip).toBeVisible({ timeout: 60_000 });

    await expect(
      page
        .getByTestId('shop-co-checkout-payment-intent-badge-not-connected')
        .or(page.getByTestId('shop-co-checkout-payment-intent-badge-configured'))
        .or(page.getByTestId('shop-co-checkout-payment-intent-badge-intent-ready'))
    ).toBeVisible({ timeout: 45_000 });

    const message = page.getByTestId('shop-co-checkout-payment-intent-message');
    await expect(message).toBeVisible();
    await expect(message).not.toContainText(/intent created|not connected/i);

    const stubBadge = page.getByTestId('shop-co-checkout-payment-intent-badge-stub');
    const liveBadge = page.getByTestId('shop-co-checkout-payment-intent-badge-live');
    const stubOrLiveVisible =
      (await stubBadge.isVisible().catch(() => false)) ||
      (await liveBadge.isVisible().catch(() => false));
    const notConnected = page.getByTestId('shop-co-checkout-payment-intent-badge-not-connected');
    if (stubOrLiveVisible) {
      await expect(stubBadge.or(liveBadge)).toBeVisible();
      await expect(strip).toHaveAttribute('data-payment-live', /[01]/);
      await expect(strip).toHaveAttribute('data-payment-stub', /[01]/);
    } else {
      await expect(
        notConnected.or(page.getByTestId('shop-co-checkout-payment-intent-badge-configured'))
      ).toBeVisible();
    }

    const paymentLinks = page.getByTestId('shop-co-checkout-payment-intent-link');
    expect(await paymentLinks.count()).toBeLessThanOrEqual(1);

    const trackingLink = page.getByTestId('shop-co-checkout-payment-tracking-link');
    if ((await trackingLink.count()) > 0) {
      await expect(trackingLink).toBeVisible();
      await expect(trackingLink).toHaveAttribute('href', /order=B2B|b2b\/orders\/tracking/);
    }

    if (stubOrLiveVisible) {
      await expect(page.getByTestId('shop-co-checkout-payment-intent-actions')).toBeVisible();
    }
  });

  test('POST payment-intent with amount returns structured stub/live result', async ({
    request,
  }) => {
    const res = await request.post('/api/shop/b2b/checkout/payment-intent', {
      data: {
        amountRub: 15000,
        orderId: 'B2B-YW-E2E-001',
        returnUrl: 'http://localhost:3001/shop/b2b/orders/tracking?order=B2B-YW-E2E-001',
      },
    });
    expect([200, 422]).toContain(res.status());
    const json = (await res.json()) as {
      messageRu?: string;
      status?: string;
      stub?: boolean;
      paymentUrl?: string | null;
    };
    expect(typeof json.messageRu).toBe('string');
    if (res.status() === 200) {
      expect(json.status).toBe('intent_ready');
      expect(typeof json.stub).toBe('boolean');
      expect(json.messageRu).toMatch(/stub intent|live intent/i);
    }
  });

  test('checkout golden path includes tracking (no duplicate payment nav)', async ({ page }) => {
    await page.goto(`/shop/b2b/checkout?collection=${COLLECTION}`, GOTO);
    await expect(page.getByTestId('shop-co-checkout-context-strip')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-golden-path-tracking-link')).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-monetization-peer-strip')).toBeVisible();
    await expect(page.getByTestId('shop-co-checkout-monetization-peer-strip')).not.toContainText(
      /JOOR Pay|Оплата заказов/i
    );
  });
});
