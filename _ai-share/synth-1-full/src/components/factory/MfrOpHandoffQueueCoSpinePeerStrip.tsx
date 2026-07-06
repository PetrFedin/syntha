'use client';

import Link from 'next/link';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  factoryId: string;
  collectionId: string;
  orderId?: string;
};

/** Очередь передачи · бренд, магазин, заказы на выпуск. */
export function MfrOpHandoffQueueCoSpinePeerStrip({ factoryId, collectionId, orderId }: Props) {
  const session = buildManufacturerHandoffQueueSession({ factoryId, collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="mfr-op-handoff-queue-co-spine-peer-strip">
      <Link href={session.brandHandoffHref} data-testid="mfr-op-handoff-queue-brand-handoff-link" className={hubGadget.goldenLink}>
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.shopTrackingHref} data-testid="mfr-op-handoff-queue-shop-tracking-link" className={hubGadget.goldenLink}>
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.factoryOrdersHref} data-testid="mfr-op-handoff-queue-prod-orders-link" className={hubGadget.goldenLink}>
        Заказы на выпуск
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.techpackAckHref} data-testid="mfr-op-handoff-queue-techpack-ack-link" className={hubGadget.goldenLink}>
        Подтверждение ТЗ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.productionOpsCutTicketHref} data-testid="mfr-op-handoff-queue-cut-ticket-link" className={hubGadget.goldenLink}>
        Техкарта раскроя
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.shopOrderCommsHref} data-testid="mfr-op-handoff-queue-shop-comms-link" className={hubGadget.goldenLink}>
        Чат с магазином
      </Link>
    </div>
  );
}
