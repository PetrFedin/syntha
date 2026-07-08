'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import Link from 'next/link';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import {
  factoryMaterialsProcurementHrefForDemo,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  factoryId: string;
  collectionId: string;
  orderId: string;
};

/** Mfr OP dossier · handoff queue + brand/shop CO spine + procurement/sample peers. */
export function MfrOpDossierCoSpinePeerStrip({ factoryId, collectionId, orderId }: Props) {
  const session = buildManufacturerHandoffQueueSession({ factoryId, collectionId, orderId });
  const demo = {
    ...PLATFORM_CORE_DEMO,
    factoryId,
    collectionId,
    demoOrderId: orderId,
  };
  const procurementHref = factoryMaterialsProcurementHrefForDemo(demo, { role: 'manufacturer' });
  const sampleQueueHref = `${EXTENDED_ROUTES.factory.production}#sample-queue`;

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="mfr-op-dossier-co-spine-peer-strip"
    >
      <Link
        href={session.handoffHref}
        data-testid="mfr-op-dossier-handoff-link"
        className={hubGadget.goldenLink}
      >
        Очередь
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.factoryOrdersHref}
        data-testid="mfr-op-dossier-prod-orders-link"
        className={hubGadget.goldenLink}
      >
        Заказы
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={procurementHref}
        data-testid="mfr-op-dossier-procurement-link"
        className={hubGadget.goldenLink}
      >
        Закупка
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandHandoffHref}
        data-testid="mfr-op-dossier-brand-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopTrackingHref}
        data-testid="mfr-op-dossier-shop-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.techpackAckHref}
        data-testid="mfr-op-dossier-techpack-ack-link"
        className={hubGadget.goldenLink}
      >
        Подтверждение ТЗ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.productionOpsCutTicketHref}
        data-testid="mfr-op-dossier-cut-ticket-link"
        className={hubGadget.goldenLink}
      >
        Техкарта раскроя
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopOrderCommsHref}
        data-testid="mfr-op-dossier-shop-comms-link"
        className={hubGadget.goldenLink}
      >
        Чат с магазином
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={sampleQueueHref}
        data-testid="mfr-op-dossier-sample-queue-link"
        className={hubGadget.goldenLink}
      >
        Образцы
      </Link>
    </div>
  );
}
