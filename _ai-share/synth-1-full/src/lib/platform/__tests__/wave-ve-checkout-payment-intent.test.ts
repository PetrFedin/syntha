import {
  createShopCoCheckoutPaymentIntent,
  probeShopCoCheckoutPaymentIntent,
  resolveShopCoCheckoutPaymentProvider,
} from '@/lib/b2b/shop-co-checkout-payment-intent';
import {
  formatPlatformCoreWmsCheckoutAtpBadgeRu,
  formatPlatformCoreWmsStockAtpSourceRu,
} from '@/lib/platform-core-wms-reserve-copy';

describe('wave VE checkout payment intent + WMS reserve UX', () => {
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

  it('uses stripe on global market with RU probe copy', () => {
    expect(resolveShopCoCheckoutPaymentProvider({ WORKSHOP2_MARKET: 'global' })).toBe('stripe');
    const probe = probeShopCoCheckoutPaymentIntent({ WORKSHOP2_MARKET: 'global' });
    expect(probe.provider).toBe('stripe');
    expect(probe.messageRu).toMatch(/Stripe не подключён/i);
  });

  it('probe reports not_connected without YuKassa keys', () => {
    const probe = probeShopCoCheckoutPaymentIntent({});
    expect(probe.provider).toBe('yukassa');
    expect(probe.status).toBe('not_connected');
    expect(probe.messageRu).toMatch(/YUKASSA/i);
  });

  it('create returns honest instruction without keys (no fake ACK)', () => {
    const result = createShopCoCheckoutPaymentIntent({ amountRub: 12_000, orderId: 'B2B-VE-1' });
    expect(result.ok).toBe(false);
    expect(result.paymentUrl).toBeNull();
    expect(result.paymentIntentId).toBeNull();
    expect(result.status).toBe('not_connected');
    expect(result.messageRu).toMatch(/YUKASSA|ЮKassa/i);
  });

  it('creates payment link when YuKassa keys configured (RU message, stub)', () => {
    const result = createShopCoCheckoutPaymentIntent({
      amountRub: 8000,
      orderId: 'B2B-VE-2',
      env: { YUKASSA_SHOP_ID: 'shop-1', YUKASSA_SECRET_KEY: 'secret' },
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('intent_ready');
    expect(result.paymentIntentId).toMatch(/^pi_yukassa_/);
    expect(result.paymentUrl).toMatch(/yookassa/i);
    expect(result.stub).toBe(true);
    expect(result.messageRu).toMatch(/stub intent|ссылка на оплату/i);
    expect(result.messageRu).toMatch(/без списания/i);
  });

  it('wave VE payment strip testid anchors', () => {
    expect('shop-co-checkout-payment-intent-strip').toContain('payment-intent');
    expect('shop-co-checkout-payment-intent-badge-not-connected').toContain('not-connected');
    expect('shop-co-checkout-payment-intent-badge-configured').toContain('configured');
    expect('shop-co-checkout-payment-intent-badge-intent-ready').toContain('intent-ready');
    expect('shop-co-checkout-payment-intent-badge-stub').toContain('stub');
    expect('shop-co-checkout-payment-intent-badge-live').toContain('badge-live');
    expect('shop-co-checkout-payment-intent-link').toContain('payment-intent-link');
    expect('/api/shop/b2b/checkout/payment-intent').toContain('payment-intent');
    expect('/api/integrations/payments/yukassa/create-payment').toContain('yukassa/create-payment');
    expect('/api/integrations/payments/stripe/create-payment').toContain('stripe/create-payment');
  });

  it('wave VE WMS reserve badge + link wave UX', () => {
    expect('shop-co-checkout-inventory-badge').toContain('inventory-badge');
    expect('shop-co-checkout-inventory-hold').toContain('inventory-hold');
    expect('shop-co-checkout-inventory-s3-link').toContain('inventory-s3');
    expect('shop-co-checkout-wms-tracking-link').toContain('wms-tracking');
    expect('shop-co-checkout-wms-replenishment-link').toContain('wms-replenishment');
    expect(formatPlatformCoreWmsCheckoutAtpBadgeRu({ loading: true, liveWms: false, atpTotal: 0 })).toMatch(
      /проверка/i
    );
    expect(formatPlatformCoreWmsStockAtpSourceRu('pg+wms')).toMatch(/PG \+ склад WMS/);
  });
});
