'use client';

import Link from 'next/link';
import { buildManufacturerOrderCommsSession } from '@/lib/b2b/manufacturer-order-comms';
import { buildManufacturerProductionOpsSession } from '@/lib/production/manufacturer-production-ops';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  orderId?: string;
  factoryId?: string;
  articleId?: string;
};

/** Mfr comms cabinet · handoff + shop + production ops + procurement peers. */
export function MfrCmCabinetSpinePeerStrip({ collectionId, orderId, factoryId, articleId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const comms = buildManufacturerOrderCommsSession({
    collectionId,
    orderId: resolvedOrderId || undefined,
    factoryId,
  });
  const ops = buildManufacturerProductionOpsSession({
    collectionId,
    orderId: resolvedOrderId || undefined,
    factoryId: comms.factoryId,
    articleId,
  });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="mfr-cm-cabinet-spine-peer-strip"
    >
      {resolvedOrderId ? (
        <>
          <Link href={comms.handoffHref} data-testid="mfr-cm-cabinet-handoff-link" className={hubGadget.goldenLink}>
            Передача
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link href={comms.shopTrackingHref} data-testid="mfr-cm-cabinet-shop-tracking-link" className={hubGadget.goldenLink}>
            Трекинг магазина
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link href={comms.brandOrderChatHref} data-testid="mfr-cm-cabinet-brand-chat-link" className={hubGadget.goldenLink}>
            Чат бренда
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
        </>
      ) : null}
      <Link href={ops.materialsHref} data-testid="mfr-cm-cabinet-materials-link" className={hubGadget.goldenLink}>
        Материалы
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={ops.cutTicketHref} data-testid="mfr-cm-cabinet-cut-ticket-link" className={hubGadget.goldenLink}>
        Техкарта раскроя
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={comms.entitiesHref} data-testid="mfr-cm-cabinet-entities-link" className={hubGadget.goldenLink}>
        Треды сущностей
      </Link>
    </div>
  );
}
