/**
 * Wave YW — shop CO checkout 2.2: env-gated YuKassa/Stripe payment intent polish (extends wave VE).
 * Extended by wave YQ (stub-absent badge, post-create tracking cross-link).
 */
import type {
  ShopCoCheckoutPaymentIntentProbe,
  ShopCoCheckoutPaymentIntentResult,
  ShopCoCheckoutPaymentProvider,
} from '@/lib/b2b/shop-co-checkout-payment-intent';
import type { Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';
import { shopB2bTrackingOrderHref } from '@/lib/routes';

export const WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API = '/api/shop/b2b/checkout/payment-intent';

export const WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID =
  'shop-co-checkout-payment-intent-strip';
export const WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID =
  'shop-co-checkout-payment-intent-link';
export const WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID =
  'shop-co-checkout-payment-tracking-link';
export const WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID =
  'shop-co-checkout-post-payment-strip';
export const WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID =
  'shop-co-checkout-post-payment-tracking-link';

export const WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS = {
  loading: 'shop-co-checkout-payment-intent-badge-loading',
  notConnected: 'shop-co-checkout-payment-intent-badge-not-connected',
  configured: 'shop-co-checkout-payment-intent-badge-configured',
  intentReady: 'shop-co-checkout-payment-intent-badge-intent-ready',
  stub: 'shop-co-checkout-payment-intent-badge-stub',
  live: 'shop-co-checkout-payment-intent-badge-live',
} as const;

export type ShopCheckoutPaymentBadgeKind =
  | 'loading'
  | 'not_connected'
  | 'configured'
  | 'intent_ready_stub'
  | 'intent_ready_live';

function envFlagTruthy(env: Workshop2ProcessEnvLike, ...keys: string[]): boolean {
  for (const key of keys) {
    const raw = env[key];
    if (raw == null) continue;
    const normalized = String(raw).trim().toLowerCase();
    if (normalized === '1' || normalized === 'true' || normalized === 'yes') return true;
  }
  return false;
}

/** Live charge only when keys configured AND explicit live API env (no silent stub-as-live). */
export function isShopCheckoutPaymentLiveMode(
  provider: ShopCoCheckoutPaymentProvider,
  env: Workshop2ProcessEnvLike = process.env
): boolean {
  if (provider === 'stripe') {
    return envFlagTruthy(env, 'STRIPE_LIVE_API', 'WORKSHOP2_STRIPE_LIVE');
  }
  return envFlagTruthy(env, 'YUKASSA_LIVE_API', 'WORKSHOP2_YUKASSA_LIVE');
}

export function resolveShopCheckoutPaymentBadgeKind(input: {
  loading: boolean;
  probe: ShopCoCheckoutPaymentIntentProbe | null;
  intent: ShopCoCheckoutPaymentIntentResult | null;
  amountRub: number;
}): ShopCheckoutPaymentBadgeKind {
  if (input.loading) return 'loading';
  const intentReady =
    input.intent?.status === 'intent_ready' && Boolean(input.intent.paymentIntentId);
  if (intentReady && input.intent) {
    return input.intent.stub ? 'intent_ready_stub' : 'intent_ready_live';
  }
  if (input.probe?.status === 'not_connected') return 'not_connected';
  if (input.probe?.status === 'configured') return 'configured';
  return 'not_connected';
}

export function formatShopCheckoutPaymentProviderLabelRu(
  provider: ShopCoCheckoutPaymentProvider | undefined
): string {
  return provider === 'stripe' ? 'Stripe' : 'ЮKassa';
}

export function formatShopCheckoutPaymentBadgeRu(kind: ShopCheckoutPaymentBadgeKind): string {
  if (kind === 'loading') return 'Проверка…';
  if (kind === 'intent_ready_stub') return 'Оплата готова';
  if (kind === 'intent_ready_live') return 'Оплата готова';
  if (kind === 'not_connected') return 'Не подключено';
  return 'Ключи заданы';
}

export function formatShopCheckoutPaymentSecondaryBadgeRu(
  kind: ShopCheckoutPaymentBadgeKind
): string | null {
  if (kind === 'intent_ready_stub') return 'Заглушка · без списания';
  if (kind === 'intent_ready_live') return 'Live · реальное списание';
  return null;
}

export function formatShopCheckoutPaymentConfiguredBadgeRu(amountRub: number): string {
  return amountRub > 0 ? 'Ключи заданы · ссылка не создана' : 'Ключи заданы';
}

export function shopCheckoutPaymentCtaLabelRu(stub: boolean): string {
  return stub ? 'Открыть заглушку оплаты' : 'Перейти к оплате';
}

export function shopCheckoutPostPaymentTrackingLinkLabelRu(): string {
  return 'Трекинг заказа после оплаты →';
}

export function buildShopCheckoutPostPaymentTrackingHref(
  orderId: string,
  collectionId?: string
): string {
  const id = orderId.trim();
  const base = shopB2bTrackingOrderHref(id);
  if (!collectionId?.trim()) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}collection=${encodeURIComponent(collectionId.trim())}`;
}

/** Return URL for YuKassa/Stripe redirect — lands on shop tracking (wave YW). */
export function buildShopCheckoutPaymentReturnUrl(input: {
  orderId: string;
  collectionId?: string;
  origin?: string;
}): string {
  const orderId = input.orderId.trim();
  const trackingPath = buildShopCheckoutPostPaymentTrackingHref(orderId, input.collectionId);
  const origin = (input.origin ?? 'http://localhost:3001').replace(/\/$/, '');
  return `${origin}${trackingPath.startsWith('/') ? trackingPath : `/${trackingPath}`}`;
}

/** Single canonical payment CTA — dedupe legacy finance / duplicate pay buttons on checkout. */
export function shouldShowShopCheckoutPaymentIntentCta(input: {
  intentReady: boolean;
  paymentUrl: string | null;
}): boolean {
  return input.intentReady && Boolean(input.paymentUrl?.trim());
}

export function shouldShowShopCheckoutPaymentTrackingCrossLink(input: {
  orderId?: string;
  intentReady: boolean;
}): boolean {
  return Boolean(input.orderId?.trim()) && input.intentReady;
}

export function shouldShowShopCheckoutLegacyPaymentCta(_surface: 'checkout'): boolean {
  return false;
}

export function formatShopCheckoutPaymentIntentMessageRu(input: {
  probe: ShopCoCheckoutPaymentIntentProbe | null;
  intent: ShopCoCheckoutPaymentIntentResult | null;
  loading: boolean;
}): string {
  if (input.loading) return 'Проверка платёжного провайдера…';
  if (input.intent?.messageRu) return input.intent.messageRu;
  if (input.probe?.messageRu) return input.probe.messageRu;
  return 'Проверка платёжного провайдера…';
}
