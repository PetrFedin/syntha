'use client';

import Link from 'next/link';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
  orderId: string;
  factoryId?: string;
};

/** Supplier order chat · procurement + brand/shop/mfr spine peers. */
export function SupCmOrderContextPeerStrip({ collectionId, articleId, orderId, factoryId }: Props) {
  const session = buildSupplierOrderCommsSession({ collectionId, articleId, orderId });
  const procurement = buildSupplierProcurementSession({
    collectionId,
    articleId,
    orderId,
    factoryId,
  });

  return (
    <div className={hubGadget.goldenPath} data-testid="sup-cm-order-context-strip">
      <Link
        href={procurement.bomHref}
        data-testid="sup-cm-order-bom-link"
        className={hubGadget.goldenLink}
      >
        BOM
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={procurement.forecastHref}
        data-testid="sup-cm-order-forecast-link"
        className={hubGadget.goldenLink}
      >
        Прогноз
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandOrderHandoffHref}
        data-testid="sup-cm-order-brand-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopMatrixHref}
        data-testid="sup-cm-order-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopTrackingHref}
        data-testid="sup-cm-order-shop-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.manufacturerOrderHref}
        data-testid="sup-cm-order-mfr-comms-link"
        className={hubGadget.goldenLink}
      >
        Чат с производством
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.replenishmentAtpHref}
        data-testid="sup-cm-order-replenishment-link"
        className={hubGadget.goldenLink}
      >
        Пополнение
      </Link>
    </div>
  );
}
