'use client';

import Link from 'next/link';
import { buildManufacturerHandoffQueueSession } from '@/lib/production/manufacturer-handoff-queue';
import { factoryProductionDossierContextHref } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  factoryId: string;
  collectionId: string;
  orderId: string;
  articleId?: string;
};

/** Mfr materials procurement · prod orders + CO spine (brand handoff, cut ticket, techpack). */
export function MfrOpMaterialsCoSpinePeerStrip({
  factoryId,
  collectionId,
  orderId,
  articleId,
}: Props) {
  const session = buildManufacturerHandoffQueueSession({ factoryId, collectionId, orderId });
  const dossierHref = articleId
    ? factoryProductionDossierContextHref(articleId, { collectionId, orderId })
    : null;

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="mfr-op-materials-co-spine-peer-strip"
    >
      <Link
        href={session.factoryOrdersHref}
        data-testid="mfr-op-materials-prod-orders-link"
        className={hubGadget.goldenLink}
      >
        Заказы
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.handoffHref}
        data-testid="mfr-op-materials-handoff-link"
        className={hubGadget.goldenLink}
      >
        Очередь
      </Link>
      {dossierHref ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={dossierHref}
            data-testid="mfr-op-materials-dossier-link"
            className={hubGadget.goldenLink}
          >
            Досье
          </Link>
        </>
      ) : null}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopTrackingHref}
        data-testid="mfr-op-materials-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandHandoffHref}
        data-testid="mfr-op-materials-brand-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.techpackAckHref}
        data-testid="mfr-op-materials-techpack-ack-link"
        className={hubGadget.goldenLink}
      >
        Подтверждение ТЗ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.productionOpsCutTicketHref}
        data-testid="mfr-op-materials-cut-ticket-link"
        className={hubGadget.goldenLink}
      >
        Техкарта раскроя
      </Link>
    </div>
  );
}
