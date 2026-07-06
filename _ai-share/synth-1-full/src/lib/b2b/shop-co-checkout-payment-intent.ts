/**
 * Wave VE / YW / YQ — shop checkout payment intent (YuKassa RU / Stripe global), env-gated via existing stubs.
 */
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import type { Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';
import { getWorkshop2MarketProfile } from '@/lib/production/workshop2-market-profile';
import { isShopCheckoutPaymentLiveMode } from '@/lib/platform/wave-yw-shop-checkout-payment';
import {
  createWorkshop2StripePaymentLink,
  probeWorkshop2Stripe,
} from '@/lib/production/workshop2-stripe-stub';
import {
  createWorkshop2YukassaPaymentLink,
  probeWorkshop2Yukassa,
} from '@/lib/production/workshop2-yukassa-stub';

export type ShopCoCheckoutPaymentProvider = 'yukassa' | 'stripe';

export type ShopCoCheckoutPaymentIntentConnectionStatus = 'not_connected' | 'configured';

export type ShopCoCheckoutPaymentIntentProbe = {
  provider: ShopCoCheckoutPaymentProvider;
  status: ShopCoCheckoutPaymentIntentConnectionStatus;
  messageRu: string;
  market: 'ru' | 'global';
};

export type ShopCoCheckoutPaymentIntentResult = {
  ok: boolean;
  provider: ShopCoCheckoutPaymentProvider;
  status: ShopCoCheckoutPaymentIntentConnectionStatus | 'intent_ready';
  paymentIntentId: string | null;
  paymentUrl: string | null;
  messageRu: string;
  stub: boolean;
};

export function resolveShopCoCheckoutPaymentProvider(
  env: Workshop2ProcessEnvLike = process.env
): ShopCoCheckoutPaymentProvider {
  return getWorkshop2MarketProfile(env) === 'global' ? 'stripe' : 'yukassa';
}

export function probeShopCoCheckoutPaymentIntent(
  env: Workshop2ProcessEnvLike = process.env
): ShopCoCheckoutPaymentIntentProbe {
  const market = getWorkshop2MarketProfile(env);
  const provider = resolveShopCoCheckoutPaymentProvider(env);
  if (provider === 'stripe') {
    const stripe = probeWorkshop2Stripe(env);
    const live = isShopCheckoutPaymentLiveMode('stripe', env);
    return {
      provider,
      market,
      status: stripe.status === 'not_connected' ? 'not_connected' : 'configured',
      messageRu:
        stripe.status === 'not_connected'
          ? 'Stripe не подключён — задайте STRIPE_SECRET_KEY в .env (рынок global).'
          : live
            ? 'Stripe: ключ задан — live intent при оформлении (STRIPE_LIVE_API=1).'
            : 'Stripe: ключ задан — stub intent при оформлении (без live-списания).',
    };
  }
  const yukassa = probeWorkshop2Yukassa(env);
  const live = isShopCheckoutPaymentLiveMode('yukassa', env);
  return {
    provider,
    market,
    status: yukassa.status === 'not_connected' ? 'not_connected' : 'configured',
    messageRu:
      yukassa.status === 'not_connected'
        ? yukassa.messageRu
        : live
          ? 'ЮKassa: ключи заданы — live intent при оформлении (YUKASSA_LIVE_API=1).'
          : 'ЮKassa: ключи заданы — stub intent при оформлении (без live-списания).',
  };
}

function buildPaymentIntentId(provider: ShopCoCheckoutPaymentProvider, orderRef: string): string {
  const safe = orderRef.replace(/[^\w-]+/g, '-').slice(0, 48) || 'checkout';
  return `pi_${provider}_${safe}`;
}

export type ShopCoCheckoutPaymentIntentInput = {
  amountRub: number;
  orderId?: string;
  returnUrl?: string;
  descriptionRu?: string;
  env?: Workshop2ProcessEnvLike;
};

/** Server-side: create payment intent via YuKassa/Stripe stub (no secrets in response). */
export function createShopCoCheckoutPaymentIntent(
  input: ShopCoCheckoutPaymentIntentInput
): ShopCoCheckoutPaymentIntentResult {
  const env = input.env ?? process.env;
  const probe = probeShopCoCheckoutPaymentIntent(env);
  const amountRub = Math.max(0, Math.round(input.amountRub));
  const orderRef = (input.orderId ?? `checkout-${Date.now()}`).trim();

  if (amountRub <= 0) {
    return {
      ok: false,
      provider: probe.provider,
      status: probe.status,
      paymentIntentId: null,
      paymentUrl: null,
      messageRu: 'Сумма заказа должна быть больше 0 ₽.',
      stub: true,
    };
  }

  if (probe.status === 'not_connected') {
    return {
      ok: false,
      provider: probe.provider,
      status: 'not_connected',
      paymentIntentId: null,
      paymentUrl: null,
      messageRu: probe.messageRu,
      stub: true,
    };
  }

  const liveMode = isShopCheckoutPaymentLiveMode(probe.provider, env);

  if (probe.provider === 'stripe') {
    const stripe = createWorkshop2StripePaymentLink({
      amountCents: amountRub * 100,
      currency: 'usd',
      descriptionEn: input.descriptionRu ?? 'Shop B2B checkout',
      orderId: orderRef,
      returnUrl: input.returnUrl,
      env,
    });
    const paymentIntentId = buildPaymentIntentId('stripe', orderRef);
    const stub = liveMode ? false : stripe.stub;
    return {
      ok: stripe.ok,
      provider: 'stripe',
      status: stripe.ok ? 'intent_ready' : 'configured',
      paymentIntentId: stripe.ok ? paymentIntentId : null,
      paymentUrl: stripe.paymentUrl,
      messageRu: stripe.ok
        ? stub
          ? `Stripe: stub intent · ${amountRub.toLocaleString('ru-RU')} ₽ — без списания.`
          : `Stripe: live intent · ${amountRub.toLocaleString('ru-RU')} ₽ — реальное списание.`
        : stripe.instructionEn.includes('not connected')
          ? 'Stripe не подключён — задайте STRIPE_SECRET_KEY в .env, затем повторите.'
          : 'Stripe: не удалось создать ссылку на оплату — проверьте ключи и сумму.',
      stub,
    };
  }

  const yukassa = createWorkshop2YukassaPaymentLink({
    amountRub,
    descriptionRu: input.descriptionRu ?? 'Оплата оптового заказа',
    orderId: orderRef,
    returnUrl: input.returnUrl,
    env,
  });
  const paymentIntentId = buildPaymentIntentId('yukassa', orderRef);
  const stub = liveMode ? false : yukassa.stub;
  return {
    ok: yukassa.ok,
    provider: 'yukassa',
    status: yukassa.ok ? 'intent_ready' : 'not_connected',
    paymentIntentId: yukassa.ok ? paymentIntentId : null,
    paymentUrl: yukassa.paymentUrl,
    messageRu: yukassa.ok
      ? stub
        ? `ЮKassa: stub intent · ${amountRub.toLocaleString('ru-RU')} ₽ — без списания.`
        : `ЮKassa: live intent · ${amountRub.toLocaleString('ru-RU')} ₽ — реальное списание.`
      : yukassa.instructionRu,
    stub,
  };
}

export async function fetchShopCoCheckoutPaymentIntentProbe(): Promise<ShopCoCheckoutPaymentIntentProbe> {
  const res = await fetch('/api/shop/b2b/checkout/payment-intent', {
    headers: buildWorkshop2ApiRequestHeaders({ Accept: 'application/json' }),
  });
  const json = (await res.json()) as ShopCoCheckoutPaymentIntentProbe & { ok?: boolean };
  return {
    provider: json.provider ?? 'yukassa',
    status: json.status ?? 'not_connected',
    messageRu: json.messageRu ?? 'Не удалось проверить платёжный провайдер.',
    market: json.market ?? 'ru',
  };
}

export async function postShopCoCheckoutPaymentIntent(input: {
  amountRub: number;
  orderId?: string;
  returnUrl?: string;
}): Promise<ShopCoCheckoutPaymentIntentResult> {
  const res = await fetch('/api/shop/b2b/checkout/payment-intent', {
    method: 'POST',
    headers: buildWorkshop2ApiRequestHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    body: JSON.stringify(input),
  });
  return (await res.json()) as ShopCoCheckoutPaymentIntentResult;
}
