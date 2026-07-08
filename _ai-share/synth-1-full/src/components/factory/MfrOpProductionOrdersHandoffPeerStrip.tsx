'use client';

import Link from 'next/link';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  factoryId: string;
  collectionId: string;
  articleId: string;
  orderId: string;
};

/** Production orders · handoff + sample queue + QC + brand cut ticket peers. */
export function MfrOpProductionOrdersHandoffPeerStrip({
  factoryId,
  collectionId,
  articleId,
  orderId,
}: Props) {
  const session = buildManufacturerProductionOpsSession({
    factoryId,
    orderId,
    collectionId,
    articleId,
  });
  const sampleQueueHref = manufacturerHandoffFeatureHref('sample-queue', {
    factoryId,
    collectionId,
    orderId,
  });
  const qcHref = manufacturerHandoffFeatureHref('qc-gate', { factoryId, collectionId, orderId });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="mfr-op-production-orders-handoff-peer-strip"
    >
      <Link
        href={session.handoffQueueHref}
        data-testid="mfr-op-production-handoff-queue-link"
        className={hubGadget.goldenLink}
      >
        Очередь передачи
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={sampleQueueHref}
        data-testid="mfr-op-production-sample-queue-link"
        className={hubGadget.goldenLink}
      >
        Очередь образцов
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={qcHref}
        data-testid="mfr-op-production-qc-gate-link"
        className={hubGadget.goldenLink}
      >
        Гейт КК
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandCutTicketHref}
        data-testid="mfr-op-production-brand-cut-ticket-link"
        className={hubGadget.goldenLink}
      >
        Техкарта бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopTrackingHref}
        data-testid="mfr-op-production-shop-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг магазина
      </Link>
    </div>
  );
}
