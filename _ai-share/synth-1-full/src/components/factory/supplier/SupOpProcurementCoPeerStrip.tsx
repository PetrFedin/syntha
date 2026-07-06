'use client';

import Link from 'next/link';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  factoryId?: string;
};

export function SupOpProcurementCoPeerStrip({
  collectionId,
  articleId,
  orderId,
  factoryId,
}: Props) {
  const session = buildSupplierProcurementSession({ collectionId, articleId, orderId, factoryId });
  const mfrHandoffHref = manufacturerHandoffFeatureHref('handoff', {
    factoryId: factoryId ?? session.factoryId,
    collectionId,
    orderId,
  });

  return (
    <div className={hubGadget.goldenPath} data-testid="sup-op-procurement-co-peer-strip">
      <Link
        href={mfrHandoffHref}
        data-testid="sup-op-procurement-mfr-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача производству
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.forecastHref}
        data-testid="sup-op-procurement-forecast-link"
        className={hubGadget.goldenLink}
      >
        Прогноз
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopTrackingHref}
        data-testid="sup-op-procurement-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.supplyHref}
        data-testid="sup-op-procurement-supply-link"
        className={hubGadget.goldenLink}
      >
        Поставка разработки
      </Link>
    </div>
  );
}
