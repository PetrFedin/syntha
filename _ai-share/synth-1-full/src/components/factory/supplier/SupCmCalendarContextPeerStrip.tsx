'use client';

import Link from 'next/link';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { factoryMaterialsProcurementHrefForDemo } from '@/lib/platform-core-hub-matrix';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { shopB2bTrackingOrderHref } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  articleId: string;
  factoryId: string;
  orderId?: string;
};

/** Supplier calendar · procurement + forecast + mfr handoff spine. */
export function SupCmCalendarContextPeerStrip({ collectionId, articleId, factoryId, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const session = buildSupplierProcurementSession({
    collectionId,
    articleId,
    orderId: resolvedOrderId || undefined,
    factoryId,
  });
  const procurementHref = factoryMaterialsProcurementHrefForDemo(
    { collectionId, demoArticleId: articleId, factoryId, demoOrderId: resolvedOrderId },
    { role: 'supplier' }
  );
  const mfrHandoffHref = manufacturerHandoffFeatureHref('handoff', {
    factoryId,
    collectionId,
    orderId: resolvedOrderId || undefined,
  });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="sup-cm-calendar-context-peer-strip"
    >
      <Link href={procurementHref} data-testid="sup-cm-calendar-procurement-link" className={hubGadget.goldenLink}>
        Закупки
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.forecastHref} data-testid="sup-cm-calendar-forecast-link" className={hubGadget.goldenLink}>
        Прогноз
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={mfrHandoffHref} data-testid="sup-cm-calendar-mfr-handoff-link" className={hubGadget.goldenLink}>
        Передача производству
      </Link>
      {resolvedOrderId ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={shopB2bTrackingOrderHref(resolvedOrderId)}
            data-testid="sup-cm-calendar-tracking-link"
            className={hubGadget.goldenLink}
          >
            Трекинг
          </Link>
        </>
      ) : null}
    </div>
  );
}
