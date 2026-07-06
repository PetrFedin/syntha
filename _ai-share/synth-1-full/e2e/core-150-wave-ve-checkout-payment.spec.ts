import { test, expect } from '@playwright/test';
import { PLATFORM_CORE_DEMO } from '../src/lib/platform-core-hub-matrix';

const GOTO = { waitUntil: 'domcontentloaded' as const, timeout: 90_000 };

const CHECKOUT_RESERVE_COPY =
  'Резерв склада — после подтверждения брендом и передачи в цех.';

/**
 * Wave VE: payment intent strip (honest RU badges) + WMS reserve link wave UX on checkout.
 * PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:core -- e2e/core-150-wave-ve-checkout-payment.spec.ts
 */
test.describe('core-150: wave VE checkout payment + WMS reserve', () => {
  const COLLECTION = PLATFORM_CORE_DEMO.collectionId;

  test('GET payment-intent probe returns RU probe payload', async ({ request }) => {
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
  });

  test('checkout: payment strip honest badge + WMS reserve wave links', async ({ page }) => {
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

    const hold = page.getByTestId('shop-co-checkout-inventory-hold');
    await expect(hold).toBeVisible({ timeout: 45_000 });
    await expect(hold).toHaveAttribute('data-reserve-honest', '1');
    await expect(hold).toContainText(CHECKOUT_RESERVE_COPY);

    const badge = page.getByTestId('shop-co-checkout-inventory-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute('data-reserve-phase', 'pre-handoff');

    await expect(page.getByTestId('shop-co-checkout-inventory-s3-link')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByTestId('shop-co-checkout-wms-tracking-link')).toBeVisible({
      timeout: 45_000,
    });
  });

  test('POST payment-intent with amount returns structured result', async ({ request }) => {
    const res = await request.post('/api/shop/b2b/checkout/payment-intent', {
      data: { amountRub: 15000, orderId: 'B2B-VE-E2E-001' },
    });
    expect([200, 422]).toContain(res.status());
    const json = (await res.json()) as { messageRu?: string; status?: string; stub?: boolean };
    expect(typeof json.messageRu).toBe('string');
    if (res.status() === 200) {
      expect(json.status).toBe('intent_ready');
      expect(json.stub).toBe(true);
    }
  });
});
