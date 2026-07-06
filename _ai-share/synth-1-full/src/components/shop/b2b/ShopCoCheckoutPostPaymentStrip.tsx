'use client';

import Link from 'next/link';
import {
  buildShopCheckoutPostCreateTrackingHref,
  shopCheckoutPostCreateTrackingLinkLabelRu,
  shouldShowShopCheckoutPostPaymentStrip,
  WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID,
  WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID,
} from '@/lib/platform/wave-yq-shop-checkout-payment';

type Props = {
  orderId: string;
  collectionId?: string;
};

/** Wave YQ — cross-link checkout → tracking after order create. */
export function ShopCoCheckoutPostPaymentStrip({ orderId, collectionId }: Props) {
  if (!shouldShowShopCheckoutPostPaymentStrip({ createdOrderId: orderId })) return null;

  const trackingHref = buildShopCheckoutPostCreateTrackingHref(orderId, collectionId);

  return (
    <div
      className="border-border-subtle mt-3 rounded-md border border-emerald-200/80 bg-emerald-50/50 px-3 py-2"
      data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_STRIP_TESTID}
      role="status"
    >
      <p className="text-text-secondary text-[11px] leading-relaxed">
        Заказ создан — отслеживайте статус в трекинге или оплатите через полоску выше.
      </p>
      <Link
        href={trackingHref}
        className="text-accent-primary mt-1 inline-block text-[11px] font-medium hover:underline"
        data-testid={WAVE_YQ_SHOP_CO_CHECKOUT_POST_PAYMENT_TRACKING_LINK_TESTID}
      >
        {shopCheckoutPostCreateTrackingLinkLabelRu()}
      </Link>
    </div>
  );
}
