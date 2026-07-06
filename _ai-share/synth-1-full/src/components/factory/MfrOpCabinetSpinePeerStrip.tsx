'use client';

import Link from 'next/link';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId: string;
  factoryId: string;
  articleId?: string;
  /** Hub core mode — чат только в comms pillar. */
  coreSlim?: boolean;
};

/** Кабинет производства · очередь, передача, трекинг магазина, материалы. */
export function MfrOpCabinetSpinePeerStrip({
  collectionId,
  orderId,
  factoryId,
  articleId,
  coreSlim = false,
}: Props) {
  const session = buildManufacturerProductionOpsSession({
    collectionId,
    orderId,
    factoryId,
    articleId,
  });

  return (
    <div className={hubGadget.goldenPath} data-testid="mfr-op-cabinet-spine-peer-strip">
      <Link
        href={session.handoffQueueHref}
        data-testid="mfr-op-cabinet-handoff-link"
        data-audit-legacy="mfr-op-cabinet-handoff-queue-link"
        className={hubGadget.goldenLink}
      >
        Очередь передачи
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.brandOrderHandoffHref} data-testid="mfr-op-cabinet-brand-handoff-link" className={hubGadget.goldenLink}>
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.shopTrackingHref} data-testid="mfr-op-cabinet-shop-tracking-link" className={hubGadget.goldenLink}>
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.cutTicketHref} data-testid="mfr-op-cabinet-cut-ticket-link" className={hubGadget.goldenLink}>
        Техкарта раскроя
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.materialsHref} data-testid="mfr-op-cabinet-materials-link" className={hubGadget.goldenLink}>
        Материалы
      </Link>
      {!coreSlim ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.manufacturerOrderCommsHref}
            data-testid="mfr-op-cabinet-chat-link"
            data-audit-legacy="mfr-op-cabinet-order-comms-link"
            className={hubGadget.goldenLink}
          >
            Чат по заказу
          </Link>
        </>
      ) : null}
    </div>
  );
}
