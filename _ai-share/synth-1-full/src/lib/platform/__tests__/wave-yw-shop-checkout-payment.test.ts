import {
  createShopCoCheckoutPaymentIntent,
  probeShopCoCheckoutPaymentIntent,
  resolveShopCoCheckoutPaymentProvider,
} from '@/lib/b2b/shop-co-checkout-payment-intent';
import {
  buildShopCheckoutPaymentReturnUrl,
  buildShopCheckoutPostPaymentTrackingHref,
  formatShopCheckoutPaymentBadgeRu,
  formatShopCheckoutPaymentSecondaryBadgeRu,
  isShopCheckoutPaymentLiveMode,
  resolveShopCheckoutPaymentBadgeKind,
  shopCheckoutPaymentCtaLabelRu,
  shouldShowShopCheckoutLegacyPaymentCta,
  shouldShowShopCheckoutPaymentIntentCta,
  shouldShowShopCheckoutPaymentTrackingCrossLink,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID,
  WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID,
  WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID,
} from '@/lib/platform/wave-yw-shop-checkout-payment';

describe('wave YW shop checkout payment intent polish', () => {
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

  it('probe reports stub configured copy when keys set without live flag', () => {
    const probe = probeShopCoCheckoutPaymentIntent({
      YUKASSA_SHOP_ID: 'shop-1',
      YUKASSA_SECRET_KEY: 'secret',
    });
    expect(probe.status).toBe('configured');
    expect(probe.messageRu).toMatch(/stub intent/i);
  });

  it('probe reports live configured copy when YUKASSA_LIVE_API=1', () => {
    const probe = probeShopCoCheckoutPaymentIntent({
      YUKASSA_SHOP_ID: 'shop-1',
      YUKASSA_SECRET_KEY: 'secret',
      YUKASSA_LIVE_API: '1',
    });
    expect(probe.messageRu).toMatch(/live intent/i);
  });

  it('create returns honest instruction without keys (no fake ACK)', () => {
    const result = createShopCoCheckoutPaymentIntent({ amountRub: 12_000, orderId: 'B2B-YW-1' });
    expect(result.ok).toBe(false);
    expect(result.paymentUrl).toBeNull();
    expect(result.stub).toBe(true);
  });

  it('creates stub intent when YuKassa keys configured without live flag', () => {
    const result = createShopCoCheckoutPaymentIntent({
      amountRub: 8000,
      orderId: 'B2B-YW-2',
      env: { YUKASSA_SHOP_ID: 'shop-1', YUKASSA_SECRET_KEY: 'secret' },
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('intent_ready');
    expect(result.stub).toBe(true);
    expect(result.messageRu).toMatch(/stub intent/i);
  });

  it('creates live intent when YuKassa keys + YUKASSA_LIVE_API=1', () => {
    const result = createShopCoCheckoutPaymentIntent({
      amountRub: 9000,
      orderId: 'B2B-YW-3',
      env: {
        YUKASSA_SHOP_ID: 'shop-1',
        YUKASSA_SECRET_KEY: 'secret',
        YUKASSA_LIVE_API: '1',
      },
    });
    expect(result.ok).toBe(true);
    expect(result.stub).toBe(false);
    expect(result.messageRu).toMatch(/live intent/i);
  });

  it('isShopCheckoutPaymentLiveMode respects provider env flags', () => {
    expect(isShopCheckoutPaymentLiveMode('yukassa', { YUKASSA_LIVE_API: '1' })).toBe(true);
    expect(isShopCheckoutPaymentLiveMode('stripe', { STRIPE_LIVE_API: 'true' })).toBe(true);
    expect(isShopCheckoutPaymentLiveMode('yukassa', {})).toBe(false);
  });

  it('resolveShopCheckoutPaymentBadgeKind distinguishes stub vs live intent', () => {
    expect(
      resolveShopCheckoutPaymentBadgeKind({
        loading: false,
        probe: { provider: 'yukassa', status: 'configured', messageRu: '', market: 'ru' },
        intent: {
          ok: true,
          provider: 'yukassa',
          status: 'intent_ready',
          paymentIntentId: 'pi_yukassa_x',
          paymentUrl: 'https://yookassa.ru/stub',
          messageRu: '',
          stub: true,
        },
        amountRub: 1000,
      })
    ).toBe('intent_ready_stub');
    expect(
      resolveShopCheckoutPaymentBadgeKind({
        loading: false,
        probe: { provider: 'yukassa', status: 'configured', messageRu: '', market: 'ru' },
        intent: {
          ok: true,
          provider: 'yukassa',
          status: 'intent_ready',
          paymentIntentId: 'pi_yukassa_x',
          paymentUrl: 'https://yookassa.ru/live',
          messageRu: '',
          stub: false,
        },
        amountRub: 1000,
      })
    ).toBe('intent_ready_live');
  });

  it('formatShopCheckoutPaymentSecondaryBadgeRu is honest for stub vs live', () => {
    expect(formatShopCheckoutPaymentSecondaryBadgeRu('intent_ready_stub')).toMatch(/Заглушка/i);
    expect(formatShopCheckoutPaymentSecondaryBadgeRu('intent_ready_live')).toMatch(/Live/i);
  });

  it('buildShopCheckoutPostPaymentTrackingHref cross-links checkout to tracking', () => {
    const href = buildShopCheckoutPostPaymentTrackingHref('B2B-YW-4', 'SS27');
    expect(href).toContain('order=B2B-YW-4');
    expect(href).toContain('collection=SS27');
    expect(href).toMatch(/tracking|b2b\/orders\/tracking/);
  });

  it('buildShopCheckoutPaymentReturnUrl lands on tracking after payment', () => {
    const url = buildShopCheckoutPaymentReturnUrl({
      orderId: 'B2B-YW-5',
      collectionId: 'SS27',
      origin: 'http://localhost:3001',
    });
    expect(url).toContain('http://localhost:3001');
    expect(url).toContain('order=B2B-YW-5');
  });

  it('dedupes payment CTAs — single intent link, no legacy checkout pay button', () => {
    expect(shouldShowShopCheckoutLegacyPaymentCta('checkout')).toBe(false);
    expect(
      shouldShowShopCheckoutPaymentIntentCta({
        intentReady: true,
        paymentUrl: 'https://yookassa.ru/stub',
      })
    ).toBe(true);
    expect(
      shouldShowShopCheckoutPaymentIntentCta({
        intentReady: false,
        paymentUrl: 'https://yookassa.ru/stub',
      })
    ).toBe(false);
  });

  it('shows tracking cross-link only when orderId + intent ready', () => {
    expect(
      shouldShowShopCheckoutPaymentTrackingCrossLink({ orderId: 'B2B-YW-6', intentReady: true })
    ).toBe(true);
    expect(shouldShowShopCheckoutPaymentTrackingCrossLink({ intentReady: true })).toBe(false);
  });

  it('wave YW testid anchors + RU CTA labels', () => {
    expect(WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID).toContain('payment-intent-strip');
    expect(WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.stub).toContain('stub');
    expect(WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.live).toContain('live');
    expect(WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID).toContain('payment-intent-link');
    expect(WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID).toContain('payment-tracking');
    expect(WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID).toContain('post-payment');
    expect(WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID).toContain('post-payment');
    expect(WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API).toContain('payment-intent');
    expect(formatShopCheckoutPaymentBadgeRu('not_connected')).toMatch(/Не подключено/i);
    expect(shopCheckoutPaymentCtaLabelRu(true)).toMatch(/заглушку/i);
    expect(shopCheckoutPaymentCtaLabelRu(false)).toMatch(/оплате/i);
  });
});
