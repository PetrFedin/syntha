import {
  createShopCoCheckoutPaymentIntent,
  probeShopCoCheckoutPaymentIntent,
  resolveShopCoCheckoutPaymentProvider,
} from '@/lib/b2b/shop-co-checkout-payment-intent';

describe('wave-th checkout payment intent', () => {
  const cleanYukassaEnv = () => {
    delete process.env.YUKASSA_SHOP_ID;
    delete process.env.YUKASSA_SECRET_KEY;
    delete process.env.WORKSHOP2_YUKASSA_SHOP_ID;
    delete process.env.WORKSHOP2_YUKASSA_SECRET_KEY;
  };

  const cleanStripeEnv = () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.WORKSHOP2_STRIPE_SECRET_KEY;
  };

  beforeEach(() => {
    cleanYukassaEnv();
    cleanStripeEnv();
    delete process.env.WORKSHOP2_MARKET;
  });

  it('defaults to yukassa on RU market', () => {
    expect(resolveShopCoCheckoutPaymentProvider({ WORKSHOP2_MARKET: 'ru' })).toBe('yukassa');
  });

  it('uses stripe on global market', () => {
    expect(resolveShopCoCheckoutPaymentProvider({ WORKSHOP2_MARKET: 'global' })).toBe('stripe');
  });

  it('probe reports not_connected without YuKassa keys', () => {
    const probe = probeShopCoCheckoutPaymentIntent({});
    expect(probe.provider).toBe('yukassa');
    expect(probe.status).toBe('not_connected');
    expect(probe.messageRu).toMatch(/YUKASSA/i);
  });

  it('create returns honest instruction without keys (no fake ACK)', () => {
    const result = createShopCoCheckoutPaymentIntent({ amountRub: 12_000, orderId: 'B2B-TH-1' });
    expect(result.ok).toBe(false);
    expect(result.paymentUrl).toBeNull();
    expect(result.paymentIntentId).toBeNull();
    expect(result.status).toBe('not_connected');
    expect(result.messageRu).toMatch(/YUKASSA/i);
  });

  it('creates intent when YuKassa keys configured', () => {
    const result = createShopCoCheckoutPaymentIntent({
      amountRub: 8000,
      orderId: 'B2B-TH-2',
      env: { YUKASSA_SHOP_ID: 'shop-1', YUKASSA_SECRET_KEY: 'secret' },
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('intent_ready');
    expect(result.paymentIntentId).toMatch(/^pi_yukassa_/);
    expect(result.paymentUrl).toMatch(/yookassa/i);
    expect(result.stub).toBe(true);
  });

  it('wave-th testid anchors', () => {
    expect('shop-co-checkout-payment-intent-strip').toContain('payment-intent');
    expect('shop-co-checkout-payment-intent-badge-not-connected').toContain('not-connected');
    expect('shop-co-checkout-payment-intent-badge-intent-ready').toContain('intent-ready');
    expect('shop-co-checkout-payment-intent-badge-stub').toContain('stub');
    expect('shop-co-checkout-payment-intent-link').toContain('payment-intent-link');
    expect('/api/shop/b2b/checkout/payment-intent').toContain('payment-intent');
    expect('/api/integrations/payments/yukassa/create-payment').toContain('yukassa/create-payment');
  });

  it('stub badge when keys configured but stub mode', () => {
    const result = createShopCoCheckoutPaymentIntent({
      amountRub: 5000,
      orderId: 'B2B-TH-3',
      env: { YUKASSA_SHOP_ID: 'shop-1', YUKASSA_SECRET_KEY: 'secret' },
    });
    expect(result.stub).toBe(true);
    expect(result.status).toBe('intent_ready');
  });
});
