'use client';

import Link from 'next/link';
import { CommsContextualThreadLink } from '@/components/platform/CommsContextualThreadLink';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { shopReplenishmentTabHref } from '@/lib/platform-core-ports/b2b/shop-collection-order-hrefs';
import { shopOrderCommsFeatureHref } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import {
  ROUTES,
  shopB2bCheckoutCollectionHref,
  shopB2bTrackingOrderHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { WAVE_YN_ORDER_CHAT_RU } from '@/lib/platform-core-ports/platform/wave-yn-comms-contextual-thread';
import {
  platformCoreCmCalendarNotificationDetailLinkTestId,
  platformCoreCommsNotificationDetailHref,
  WAVE_YX_NOTIFICATION_DETAIL_RU,
} from '@/lib/platform-core-ports/platform/wave-yt-notification-center-final';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Shop calendar · order comms + tracking + replenishment peers. */
export function ShopCmCalendarContextPeerStrip({ collectionId, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const trackingHref = resolvedOrderId
    ? shopB2bTrackingOrderHref(resolvedOrderId)
    : shopB2bTrackingOrderHref('');
  const chatHref = resolvedOrderId
    ? shopMessagesB2bOrderContextHref(resolvedOrderId)
    : `${ROUTES.shop.messages}?collection=${encodeURIComponent(collectionId)}`;
  const orderCommsHref = resolvedOrderId
    ? shopOrderCommsFeatureHref(resolvedOrderId, 'chat', collectionId)
    : shopB2bCheckoutCollectionHref(collectionId);
  const replenishmentHref = shopReplenishmentTabHref(
    'stock-atp',
    collectionId,
    resolvedOrderId || undefined
  );

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="shop-cm-calendar-context-peer-strip"
    >
      {resolvedOrderId ? (
        <>
          <Link
            href={trackingHref}
            data-testid="shop-cm-calendar-tracking-link"
            data-audit-deep-link="shop-cm-calendar-tracking-deep-link"
            className={hubGadget.goldenLink}
          >
            Трекинг
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={platformCoreCommsNotificationDetailHref('shop', collectionId, resolvedOrderId)}
            data-testid={platformCoreCmCalendarNotificationDetailLinkTestId('shop')}
            className={hubGadget.goldenLink}
          >
            {WAVE_YX_NOTIFICATION_DETAIL_RU}
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <CommsContextualThreadLink
            href={chatHref}
            orderId={resolvedOrderId}
            collectionId={collectionId}
            contextualSource="calendar"
            data-testid="shop-cm-calendar-order-chat-link"
            className={hubGadget.goldenLink}
          >
            {WAVE_YN_ORDER_CHAT_RU}
          </CommsContextualThreadLink>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
        </>
      ) : null}
      <Link href={orderCommsHref} data-testid="shop-cm-calendar-order-comms-link" className={hubGadget.goldenLink}>
        Связь по заказу
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={replenishmentHref} data-testid="shop-cm-calendar-replenishment-link" className={hubGadget.goldenLink}>
        Пополнение
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shopB2bCheckoutCollectionHref(collectionId)}
        data-testid="shop-cm-calendar-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandCrmSegmentationFeatureHref('segments', collectionId)}
        data-testid="shop-cm-calendar-brand-crm-link"
        className={hubGadget.goldenLink}
      >
        CRM бренда
      </Link>
    </div>
  );
}
