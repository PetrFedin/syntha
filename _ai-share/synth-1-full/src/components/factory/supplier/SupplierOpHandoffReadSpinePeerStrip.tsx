'use client';

import Link from 'next/link';
import { appendSupplierOpPoContextToHref } from '@/lib/b2b/supplier-op-po-context-hrefs';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  factoryId?: string;
};

/** Handoff read strip · manufacturer queue + forecast + shop downstream. */
export function SupplierOpHandoffReadSpinePeerStrip({
  collectionId,
  articleId,
  orderId,
  factoryId,
}: Props) {
  const session = buildSupplierProcurementSession({ collectionId, articleId, orderId, factoryId });
  const resolvedOrderId = orderId?.trim() || session.orderId;
  const mfrHandoffHref = appendSupplierOpPoContextToHref(
    manufacturerHandoffFeatureHref('handoff', {
      factoryId: factoryId ?? session.factoryId,
      collectionId,
      orderId: resolvedOrderId,
    }),
    { orderId: resolvedOrderId }
  );
  const forecastHref = appendSupplierOpPoContextToHref(session.forecastHref, {
    orderId: resolvedOrderId,
  });
  const shopTrackingHref = appendSupplierOpPoContextToHref(session.shopTrackingHref, {
    orderId: resolvedOrderId,
  });
  const orderTabHref = appendSupplierOpPoContextToHref(session.orderTabHref, {
    orderId: resolvedOrderId,
  });

  return (
    <div className={hubGadget.goldenPath} data-testid="sup-op-handoff-read-spine-peer-strip">
      <Link
        href={mfrHandoffHref}
        data-testid="sup-op-handoff-read-mfr-queue-link"
        className={hubGadget.goldenLink}
      >
        Очередь производства
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={forecastHref}
        data-testid="sup-op-handoff-read-forecast-link"
        className={hubGadget.goldenLink}
      >
        Прогноз
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shopTrackingHref}
        data-testid="sup-op-handoff-read-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={orderTabHref}
        data-testid="sup-op-handoff-read-order-tab-link"
        className={hubGadget.goldenLink}
      >
        Вкладка заказа
      </Link>
    </div>
  );
}
