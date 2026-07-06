'use client';

import Link from 'next/link';
import { buildManufacturerHandoffQueueSession } from '@/lib/platform-core-ports/manufacturer-handoff';
import { ROUTES } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  factoryId: string;
  orderId?: string;
};

/** Manufacturer calendar · handoff + brand/shop spine + Gantt peers. */
export function MfrCmCalendarContextPeerStrip({ collectionId, factoryId, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const session = buildManufacturerHandoffQueueSession({
    factoryId,
    collectionId,
    orderId: resolvedOrderId || undefined,
  });
  const ganttQs = new URLSearchParams();
  if (resolvedOrderId) ganttQs.set('po', resolvedOrderId);
  ganttQs.set('collection', collectionId);
  const ganttHref = `${ROUTES.brand.productionGantt}?${ganttQs.toString()}`;

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="mfr-cm-calendar-context-peer-strip"
    >
      <Link
        href={session.handoffHref}
        data-testid="mfr-cm-calendar-handoff-queue-link"
        className={hubGadget.goldenLink}
      >
        Очередь передачи
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      {resolvedOrderId ? (
        <>
          <Link
            href={session.factoryOrdersHref}
            data-testid="mfr-cm-calendar-prod-orders-link"
            className={hubGadget.goldenLink}
          >
            Заказы на выпуск
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.brandHandoffHref}
            data-testid="mfr-cm-calendar-brand-handoff-link"
            className={hubGadget.goldenLink}
          >
            Передача бренда
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.shopTrackingHref}
            data-testid="mfr-cm-calendar-shop-tracking-link"
            className={hubGadget.goldenLink}
          >
            Трекинг магазина
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.brandQcGateHref}
            data-testid="mfr-cm-calendar-brand-qc-link"
            className={hubGadget.goldenLink}
          >
            КК бренда
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.productionOpsCutTicketHref}
            data-testid="mfr-cm-calendar-cut-ticket-link"
            className={hubGadget.goldenLink}
          >
            Техкарта раскроя
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.techpackAckHref}
            data-testid="mfr-cm-calendar-techpack-ack-link"
            className={hubGadget.goldenLink}
          >
            Подтверждение ТЗ
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.shopOrderCommsHref}
            data-testid="mfr-cm-calendar-shop-comms-link"
            className={hubGadget.goldenLink}
          >
            Чат с магазином
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
        </>
      ) : null}
      <Link
        href={session.sampleQueueHref}
        data-testid="mfr-cm-calendar-sample-queue-link"
        className={hubGadget.goldenLink}
      >
        Очередь образцов
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={ganttHref}
        data-testid="mfr-cm-calendar-gantt-peer-link"
        className={hubGadget.goldenLink}
      >
        Диаграмма Ганта
      </Link>
    </div>
  );
}
