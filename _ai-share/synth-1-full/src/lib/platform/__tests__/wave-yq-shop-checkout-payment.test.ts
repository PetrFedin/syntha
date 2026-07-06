import fs from 'node:fs';
import path from 'node:path';
import {
  createShopCoCheckoutPaymentIntent,
  probeShopCoCheckoutPaymentIntent,
  resolveShopCoCheckoutPaymentProvider,
} from '@/lib/b2b/shop-co-checkout-payment-intent';
import {
  buildShopCheckoutPostCreateTrackingHref,
  buildShopCheckoutPostPaymentTrackingHref,
  dedupeShopCheckoutPaymentCtaSurfaces,
  formatShopCheckoutPaymentIntentMessageRu,
  formatShopCheckoutPaymentStubAbsentBadgeRu,
  resolveShopCheckoutPostCreateNavigationHref,
  shouldShowShopCheckoutPaymentStubAbsentBadge,
  shouldShowShopCheckoutPostPaymentStrip,
  WAVE_YQ_CORE_CHECKOUT_E2E_SPEC,
  WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS,
  WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API,
  WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID,
  WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID,
  WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID,
  WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID,
  WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID,
  waveYqCheckoutE2eSpecGlob,
} from '@/lib/platform/wave-yq-shop-checkout-payment';

const PKG_ROOT = path.join(__dirname, '..', '..', '..', '..');
const E2E_DIR = path.join(PKG_ROOT, 'e2e');
const PLAYWRIGHT_CORE_CONFIG = path.join(PKG_ROOT, 'playwright.core.config.ts');

function readConfig(): string {
  return fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8');
}

describe('wave YQ shop checkout payment intent polish', () => {
  const cleanYukassaEnv = () => {
    delete process.env.YUKASSA_SHOP_ID;
    delete process.env.YUKASSA_SECRET_KEY;
    delete process.env.WORKSHOP2_YUKASSA_SHOP_ID;
    delete process.env.WORKSHOP2_YUKASSA_SECRET_KEY;
    delete process.env.YUKASSA_LIVE_API;
    delete process.env.WORKSHOP2_YUKASSA_LIVE;
  };

  const cleanStripeEnv = () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.WORKSHOP2_STRIPE_SECRET_KEY;
    delete process.env.STRIPE_LIVE_API;
    delete process.env.WORKSHOP2_STRIPE_LIVE;
  };

  beforeEach(() => {
    cleanYukassaEnv();
    cleanStripeEnv();
    delete process.env.WORKSHOP2_MARKET;
  });

  it('defaults to yukassa on RU market', () => {
    expect(resolveShopCoCheckoutPaymentProvider({ WORKSHOP2_MARKET: 'ru' })).toBe('yukassa');
  });

  it('probe reports not_connected without YuKassa keys', () => {
    const probe = probeShopCoCheckoutPaymentIntent({});
    expect(probe.provider).toBe('yukassa');
    expect(probe.status).toBe('not_connected');
    expect(probe.messageRu).toMatch(/YUKASSA|ЮKassa/i);
  });

  it('honest stub-absent badge copy when keys missing (wave YQ)', () => {
    expect(
      shouldShowShopCheckoutPaymentStubAbsentBadge({
        loading: false,
        probe: { provider: 'yukassa', status: 'not_connected', messageRu: 'x', market: 'ru' },
      })
    ).toBe(true);
    expect(formatShopCheckoutPaymentStubAbsentBadgeRu('yukassa')).toMatch(/Заглушка.*ключи не заданы/i);
    expect(formatShopCheckoutPaymentStubAbsentBadgeRu('stripe')).toMatch(/Stripe/i);
    expect(
      formatShopCheckoutPaymentIntentMessageRu({
        loading: false,
        probe: probeShopCoCheckoutPaymentIntent({}),
        intent: null,
      })
    ).toMatch(/YUKASSA|ЮKassa|не подключ/i);
  });

  it('create returns honest instruction without keys (no fake ACK)', () => {
    const result = createShopCoCheckoutPaymentIntent({ amountRub: 12_000, orderId: 'B2B-YQ-1' });
    expect(result.ok).toBe(false);
    expect(result.paymentUrl).toBeNull();
    expect(result.stub).toBe(true);
  });

  it('creates stub intent when YuKassa keys configured without live flag', () => {
    const result = createShopCoCheckoutPaymentIntent({
      amountRub: 8000,
      orderId: 'B2B-YQ-2',
      env: { YUKASSA_SHOP_ID: 'shop-1', YUKASSA_SECRET_KEY: 'secret' },
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('intent_ready');
    expect(result.stub).toBe(true);
    expect(result.messageRu).toMatch(/stub intent/i);
  });

  it('checkout → tracking after create (wave YQ cross-link)', () => {
    const href = buildShopCheckoutPostCreateTrackingHref('B2B-YQ-3', 'SS27');
    expect(href).toContain('order=B2B-YQ-3');
    expect(href).toContain('collection=SS27');
    expect(href).toBe(buildShopCheckoutPostPaymentTrackingHref('B2B-YQ-3', 'SS27'));
    expect(
      resolveShopCheckoutPostCreateNavigationHref({ orderId: 'B2B-YQ-3', collectionId: 'SS27' })
    ).toBe(href);
    expect(shouldShowShopCheckoutPostPaymentStrip({ createdOrderId: 'B2B-YQ-3' })).toBe(true);
    expect(shouldShowShopCheckoutPostPaymentStrip({})).toBe(false);
  });

  it('dedupes payment CTAs — single intent strip, no legacy checkout pay', () => {
    const surfaces = dedupeShopCheckoutPaymentCtaSurfaces();
    expect(surfaces.intentStrip).toBe(true);
    expect(surfaces.legacyCheckoutPay).toBe(false);
  });

  it('wave YQ testid anchors + e2e spec registration', () => {
    expect(WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID).toContain('payment-intent-strip');
    expect(WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.stubAbsent).toContain('stub-absent');
    expect(WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.stub).toContain('stub');
    expect(WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID).toContain('payment-intent-link');
    expect(WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID).toContain('payment-tracking');
    expect(WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID).toContain('post-payment');
    expect(WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID).toContain('post-payment');
    expect(WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API).toContain('payment-intent');
    expect(WAVE_YQ_CORE_CHECKOUT_E2E_SPEC).toBe('core-232-wave-yq-checkout.spec.ts');
    expect(fs.existsSync(path.join(E2E_DIR, WAVE_YQ_CORE_CHECKOUT_E2E_SPEC))).toBe(true);
    expect(readConfig()).toContain(waveYqCheckoutE2eSpecGlob());
  });
});
