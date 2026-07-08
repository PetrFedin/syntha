'use client';

import Link from 'next/link';
import { buildManufacturerOrderCommsSession } from '@/lib/b2b/manufacturer-order-comms';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  orderId: string;
  factoryId?: string;
};

/** Mfr order chat · handoff + brand/shop + production ops peers. */
export function MfrCmOrderContextPeerStrip({ collectionId, orderId, factoryId }: Props) {
  const session = buildManufacturerOrderCommsSession({ collectionId, orderId, factoryId });
  const qcHref = manufacturerHandoffFeatureHref('qc-gate', {
    factoryId: session.factoryId,
    collectionId,
    orderId,
  });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="mfr-cm-order-context-strip"
    >
      <Link
        href={session.handoffHref}
        data-testid="mfr-cm-order-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={qcHref} data-testid="mfr-cm-order-qc-gate-link" className={hubGadget.goldenLink}>
        Гейт КК
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandOrderChatHref}
        data-testid="mfr-cm-order-brand-chat-link"
        className={hubGadget.goldenLink}
      >
        Чат бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopTrackingHref}
        data-testid="mfr-cm-order-shop-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.productionOpsCutTicketHref}
        data-testid="mfr-cm-order-cut-ticket-link"
        className={hubGadget.goldenLink}
      >
        Техкарта раскроя
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.entitiesHref}
        data-testid="mfr-cm-order-entities-link"
        className={hubGadget.goldenLink}
      >
        Сущности
      </Link>
    </div>
  );
}
