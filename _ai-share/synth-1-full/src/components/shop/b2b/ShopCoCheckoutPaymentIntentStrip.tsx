'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  fetchShopCoCheckoutPaymentIntentProbe,
  postShopCoCheckoutPaymentIntent,
  type ShopCoCheckoutPaymentIntentProbe,
  type ShopCoCheckoutPaymentIntentResult,
} from '@/lib/b2b/shop-co-checkout-payment-intent';
import {
  buildShopCheckoutPaymentReturnUrl,
  buildShopCheckoutPostPaymentTrackingHref,
  formatShopCheckoutPaymentBadgeRu,
  formatShopCheckoutPaymentConfiguredBadgeRu,
  formatShopCheckoutPaymentIntentMessageRu,
  formatShopCheckoutPaymentProviderLabelRu,
  formatShopCheckoutPaymentSecondaryBadgeRu,
  formatShopCheckoutPaymentStubAbsentBadgeRu,
  resolveShopCheckoutPaymentBadgeKind,
  shopCheckoutPaymentCtaLabelRu,
  shopCheckoutPostPaymentTrackingLinkLabelRu,
  shouldShowShopCheckoutPaymentIntentCta,
  shouldShowShopCheckoutPaymentStubAbsentBadge,
  shouldShowShopCheckoutPaymentTrackingCrossLink,
  WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS,
  WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID,
  WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID,
  WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID,
} from '@/lib/platform/wave-yq-shop-checkout-payment';

type Props = {
  amountRub: number;
  orderId?: string;
  collectionId?: string;
};

/** Wave VE/YW/YQ — честный RU badge: ключи / stub vs live intent + cross-link на трекинг после оплаты. */
export function ShopCoCheckoutPaymentIntentStrip({ amountRub, orderId, collectionId }: Props) {
  const [probe, setProbe] = useState<ShopCoCheckoutPaymentIntentProbe | null>(null);
  const [intent, setIntent] = useState<ShopCoCheckoutPaymentIntentResult | null>(null);
  const [loading, setLoading] = useState(true);

  const paymentReturnUrl = useMemo(() => {
    if (!orderId?.trim()) return undefined;
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    return buildShopCheckoutPaymentReturnUrl({
      orderId,
      collectionId,
      origin,
    });
  }, [collectionId, orderId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const nextProbe = await fetchShopCoCheckoutPaymentIntentProbe();
      if (cancelled) return;
      setProbe(nextProbe);
      if (nextProbe.status === 'configured' && amountRub > 0) {
        const created = await postShopCoCheckoutPaymentIntent({
          amountRub,
          orderId,
          returnUrl: paymentReturnUrl,
        });
        if (cancelled) return;
        setIntent(created);
      } else {
        setIntent(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [amountRub, orderId, paymentReturnUrl]);

  const badgeKind = resolveShopCheckoutPaymentBadgeKind({ loading, probe, intent, amountRub });
  const providerLabel = formatShopCheckoutPaymentProviderLabelRu(probe?.provider);
  const intentReady = intent?.status === 'intent_ready' && Boolean(intent.paymentIntentId);
  const keysConfigured = probe?.status === 'configured';
  const secondaryBadge = formatShopCheckoutPaymentSecondaryBadgeRu(badgeKind);
  const showPaymentCta = shouldShowShopCheckoutPaymentIntentCta({
    intentReady,
    paymentUrl: intent?.paymentUrl ?? null,
  });
  const showStubAbsentBadge = shouldShowShopCheckoutPaymentStubAbsentBadge({ loading, probe });
  const showTrackingLink = shouldShowShopCheckoutPaymentTrackingCrossLink({
    orderId,
    intentReady,
  });
  const trackingHref = orderId?.trim()
    ? buildShopCheckoutPostPaymentTrackingHref(orderId, collectionId)
    : null;

  return (
    <div
      className="border-border-subtle mt-3 space-y-2 rounded-md border bg-bg-surface2/40 px-3 py-2"
      data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_STRIP_TESTID}
      data-payment-provider={probe?.provider ?? 'yukassa'}
      data-payment-connected={keysConfigured ? '1' : '0'}
      data-payment-live={intentReady && intent && !intent.stub ? '1' : '0'}
      data-payment-stub={intentReady && intent?.stub ? '1' : '0'}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-semibold uppercase">
          Платёж · {providerLabel}
        </span>
        {badgeKind === 'loading' ? (
          <Badge
            variant="outline"
            className="text-[9px]"
            data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.loading}
          >
            {formatShopCheckoutPaymentBadgeRu(badgeKind)}
          </Badge>
        ) : badgeKind === 'intent_ready_stub' || badgeKind === 'intent_ready_live' ? (
          <>
            <Badge
              variant="secondary"
              className="text-[9px]"
              data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.intentReady}
            >
              {formatShopCheckoutPaymentBadgeRu(badgeKind)}
            </Badge>
            {secondaryBadge ? (
              <Badge
                variant="outline"
                className={
                  badgeKind === 'intent_ready_stub'
                    ? 'border-amber-200 bg-amber-50 text-[9px] text-amber-900'
                    : 'border-emerald-200 bg-emerald-50 text-[9px] text-emerald-900'
                }
                data-testid={
                  badgeKind === 'intent_ready_stub'
                    ? WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.stub
                    : WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.live
                }
              >
                {secondaryBadge}
              </Badge>
            ) : null}
          </>
        ) : badgeKind === 'not_connected' ? (
          <>
            <Badge
              variant="outline"
              className="text-[9px]"
              data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.notConnected}
            >
              {formatShopCheckoutPaymentBadgeRu(badgeKind)}
            </Badge>
            {showStubAbsentBadge ? (
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-[9px] text-amber-900"
                data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.stubAbsent}
              >
                {formatShopCheckoutPaymentStubAbsentBadgeRu(probe?.provider)}
              </Badge>
            ) : null}
          </>
        ) : badgeKind === 'configured' ? (
          <Badge
            variant="outline"
            className="text-[9px]"
            data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.configured}
          >
            {formatShopCheckoutPaymentConfiguredBadgeRu(amountRub)}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[9px]"
            data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_BADGE_TESTIDS.notConnected}
          >
            {formatShopCheckoutPaymentBadgeRu('not_connected')}
          </Badge>
        )}
      </div>

      <p
        className="text-text-secondary text-[11px] leading-relaxed"
        data-testid="shop-co-checkout-payment-intent-message"
      >
        {formatShopCheckoutPaymentIntentMessageRu({ probe, intent, loading })}
      </p>

      {showPaymentCta || showTrackingLink ? (
        <div
          className="flex flex-wrap items-center gap-3"
          data-testid="shop-co-checkout-payment-intent-actions"
        >
          {showPaymentCta && intent?.paymentUrl ? (
            <Link
              href={intent.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary text-[11px] font-medium hover:underline"
              data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_INTENT_LINK_TESTID}
            >
              {shopCheckoutPaymentCtaLabelRu(intent.stub)}
            </Link>
          ) : null}
          {showTrackingLink && trackingHref ? (
            <Link
              href={trackingHref}
              className="text-accent-primary text-[11px] font-medium hover:underline"
              data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_PAYMENT_TRACKING_LINK_TESTID}
            >
              {shopCheckoutPostPaymentTrackingLinkLabelRu()}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
