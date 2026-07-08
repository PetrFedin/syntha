'use client';

import Link from 'next/link';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import { shopMatrixWorkspaceTabHref } from '@/lib/platform-core-ports/b2b/shop-collection-order-hrefs';
import { buildManufacturerHandoffQueueSession } from '@/lib/platform-core-ports/manufacturer-handoff';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  demo: PlatformCoreDemoContext;
  orderId?: string;
};

/** Manufacturer empty CO · brand handoff + shop tracking + matrix spine. */
export function MfrEmptyCoPeerStrip({ demo, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || demo.demoOrderId;
  const session = buildManufacturerHandoffQueueSession({
    factoryId: demo.factoryId,
    collectionId: demo.collectionId,
    orderId: resolvedOrderId,
  });
  const matrixHref = shopMatrixWorkspaceTabHref('matrix', demo.collectionId, resolvedOrderId);

  return (
    <div className={hubGadget.goldenPath} data-testid="mfr-empty-co-peer-strip">
      <Link
        href={session.brandHandoffHref}
        data-testid="mfr-empty-co-brand-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopTrackingHref}
        data-testid="mfr-empty-co-shop-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={matrixHref}
        data-testid="mfr-empty-co-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.handoffHref}
        data-testid="mfr-empty-co-handoff-queue-link"
        className={hubGadget.goldenLink}
      >
        Очередь передачи
      </Link>
    </div>
  );
}
