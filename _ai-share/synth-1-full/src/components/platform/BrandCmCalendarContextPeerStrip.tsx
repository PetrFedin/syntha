'use client';

import Link from 'next/link';
import { CommsContextualThreadLink } from '@/components/platform/CommsContextualThreadLink';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import { brandMessagesB2bOrderContextHref, ROUTES } from '@/lib/platform-core-routes';
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

/** Brand calendar · order spine + CRM + shop downstream peers. */
export function BrandCmCalendarContextPeerStrip({ collectionId, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const session = buildBrandOrderCommsSession({
    collectionId,
    orderId: resolvedOrderId || undefined,
  });
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);
  const messagesHref = resolvedOrderId
    ? brandMessagesB2bOrderContextHref(resolvedOrderId)
    : `${ROUTES.brand.messages}?collection=${encodeURIComponent(collectionId)}`;

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="brand-cm-calendar-context-peer-strip"
    >
      {resolvedOrderId ? (
        <>
          <Link href={session.handoffHref} data-testid="brand-cm-calendar-handoff-link" className={hubGadget.goldenLink}>
            Передача
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link href={session.registryHref} data-testid="brand-cm-calendar-registry-link" className={hubGadget.goldenLink}>
            Реестр
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link href={session.shopTrackingHref} data-testid="brand-cm-calendar-shop-tracking-link" className={hubGadget.goldenLink}>
            Трекинг магазина
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <CommsContextualThreadLink
            href={messagesHref}
            orderId={resolvedOrderId}
            collectionId={collectionId}
            contextualSource="calendar"
            data-testid="brand-cm-calendar-order-chat-link"
            className={hubGadget.goldenLink}
          >
            {WAVE_YN_ORDER_CHAT_RU}
          </CommsContextualThreadLink>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={platformCoreCommsNotificationDetailHref('brand', collectionId, resolvedOrderId)}
            data-testid={platformCoreCmCalendarNotificationDetailLinkTestId('brand')}
            className={hubGadget.goldenLink}
          >
            {WAVE_YX_NOTIFICATION_DETAIL_RU}
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
        </>
      ) : null}
      <Link href={crmHref} data-testid="brand-cm-calendar-crm-segments-link" className={hubGadget.goldenLink}>
        Сегменты CRM
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={pricelistHref} data-testid="brand-cm-calendar-crm-pricelist-link" className={hubGadget.goldenLink}>
        Прайс-лист
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.factoryQueueHref} data-testid="brand-cm-calendar-factory-queue-link" className={hubGadget.goldenLink}>
        Очередь цеха
      </Link>
    </div>
  );
}
