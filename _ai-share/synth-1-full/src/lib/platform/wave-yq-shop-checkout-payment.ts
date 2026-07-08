/**
 * Wave YQ — shop CO checkout 2.2: env-gated YuKassa/Stripe intent polish (extends wave VE/YW).
 * Honest RU stub badge when keys absent, checkout → tracking after create, deduped payment CTAs.
 */
import type {
  ShopCoCheckoutPaymentIntentProbe,
  ShopCoCheckoutPaymentProvider,
} from '@/lib/b2b/shop-co-checkout-payment-intent';
import {
  buildShopCheckoutPostPaymentTrackingHref,
  formatShopCheckoutPaymentIntentMessageRu as formatShopCheckoutPaymentIntentMessageRuYw,
  shouldShowShopCheckoutLegacyPaymentCta,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID,
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID,
  WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID,
  WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID,
} from '@/lib/platform/wave-yw-shop-checkout-payment';

export const WAVE_YQ_CORE_CHECKOUT_E2E_SPEC = 'core-232-wave-yq-checkout.spec.ts' as const;

export function waveYqCheckoutE2eSpecGlob(): string {
  return `**/${WAVE_YQ_CORE_CHECKOUT_E2E_SPEC}`;
}

/** Re-export wave YW anchors — single SoT for checkout payment DOM testids. */
export {
  buildShopCheckoutPaymentReturnUrl,
  buildShopCheckoutPostPaymentTrackingHref,
  formatShopCheckoutPaymentBadgeRu,
  formatShopCheckoutPaymentConfiguredBadgeRu,
  formatShopCheckoutPaymentProviderLabelRu,
  formatShopCheckoutPaymentSecondaryBadgeRu,
  isShopCheckoutPaymentLiveMode,
  resolveShopCheckoutPaymentBadgeKind,
  shopCheckoutPaymentCtaLabelRu,
  shopCheckoutPostPaymentTrackingLinkLabelRu,
  shouldShowShopCheckoutLegacyPaymentCta,
  shouldShowShopCheckoutPaymentIntentCta,
  shouldShowShopCheckoutPaymentTrackingCrossLink,
} from '@/lib/platform/wave-yw-shop-checkout-payment';

export const WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API =
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API;
export const WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID =
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID;
export const WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID =
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID;
export const WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID =
  WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID;
export const WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID =
  WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID;
export const WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID =
  WAVE_YW_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID;

export const WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS = {
  ...WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS,
  /** Honest stub badge when provider keys absent (wave YQ). */
  stubAbsent: 'shop-co-checkout-payment-intent-badge-stub-absent',
} as const;

export function formatShopCheckoutPaymentStubAbsentBadgeRu(
  provider: ShopCoCheckoutPaymentProvider | undefined
): string {
  return provider === 'stripe' ? 'Заглушка · ключи Stripe не заданы' : 'Заглушка · ключи не заданы';
}

export function formatShopCheckoutPaymentNotConnectedDetailRu(
  probe: ShopCoCheckoutPaymentIntentProbe | null
): string {
  if (!probe) {
    return 'Платёжный провайдер не настроен — оплата на checkout недоступна (честная заглушка).';
  }
  if (probe.status === 'not_connected') {
    return probe.messageRu;
  }
  return probe.messageRu;
}

/** Message row — wave YQ extends YW with honest not_connected copy (no EN leakage). */
export function formatShopCheckoutPaymentIntentMessageRu(input: {
  probe: ShopCoCheckoutPaymentIntentProbe | null;
  intent:
    | import('@/lib/b2b/shop-co-checkout-payment-intent').ShopCoCheckoutPaymentIntentResult
    | null;
  loading: boolean;
}): string {
  if (input.loading) return 'Проверка платёжного провайдера…';
  if (input.intent?.messageRu) return input.intent.messageRu;
  if (input.probe?.status === 'not_connected') {
    return formatShopCheckoutPaymentNotConnectedDetailRu(input.probe);
  }
  return formatShopCheckoutPaymentIntentMessageRuYw(input);
}

export function shouldShowShopCheckoutPaymentStubAbsentBadge(input: {
  probe: ShopCoCheckoutPaymentIntentProbe | null;
  loading: boolean;
}): boolean {
  return !input.loading && input.probe?.status === 'not_connected';
}

export function shouldShowShopCheckoutPostPaymentStrip(input: {
  createdOrderId?: string | null;
}): boolean {
  return Boolean(input.createdOrderId?.trim());
}

export function shopCheckoutPostCreateTrackingLinkLabelRu(): string {
  return 'Перейти к трекингу заказа →';
}

export function buildShopCheckoutPostCreateTrackingHref(
  orderId: string,
  collectionId?: string
): string {
  return buildShopCheckoutPostPaymentTrackingHref(orderId, collectionId);
}

/** After checkout confirm — default navigation targets tracking (CO 2.2 cross-link). */
export function resolveShopCheckoutPostCreateNavigationHref(input: {
  orderId: string;
  collectionId: string;
}): string {
  return buildShopCheckoutPostCreateTrackingHref(input.orderId, input.collectionId);
}

/** Single payment CTA surface on checkout — legacy finance pay buttons suppressed. */
export function dedupeShopCheckoutPaymentCtaSurfaces(): {
  intentStrip: boolean;
  legacyCheckoutPay: boolean;
} {
  return {
    intentStrip: true,
    legacyCheckoutPay: shouldShowShopCheckoutLegacyPaymentCta('checkout'),
  };
}
