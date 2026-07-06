'use client';

import Link from 'next/link';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import { factoryMaterialsProcurementHrefForDemo } from '@/lib/platform-core-hub-matrix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { SUP_CM_CABINET_RFQ_INBOX_PEER_LINK_TESTID } from '@/lib/fashion/supplier-logistics-wave-vo';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  factoryId?: string;
};

/** Supplier comms cabinet · procurement + push + shop/mfr peers. */
export function SupCmCabinetSpinePeerStrip({ collectionId, articleId, orderId, factoryId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const session = buildSupplierOrderCommsSession({
    collectionId,
    articleId,
    orderId: resolvedOrderId || undefined,
  });
  const procurement = buildSupplierProcurementSession({
    collectionId,
    articleId,
    orderId: resolvedOrderId || undefined,
    factoryId,
  });
  const procurementHref = factoryMaterialsProcurementHrefForDemo(
    {
      collectionId,
      demoArticleId: articleId,
      factoryId: factoryId ?? 'fact-1',
      demoOrderId: resolvedOrderId,
    },
    { role: 'supplier' }
  );

  return (
    <div className={hubGadget.goldenPath} data-testid="sup-cm-cabinet-spine-peer-strip">
      <Link href={procurementHref} data-testid="sup-cm-cabinet-procurement-link" className={hubGadget.goldenLink}>
        Закупки
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={procurement.forecastHref} data-testid="sup-cm-cabinet-forecast-link" className={hubGadget.goldenLink}>
        Прогноз
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={procurement.rfqHref} data-testid={SUP_CM_CABINET_RFQ_INBOX_PEER_LINK_TESTID} className={hubGadget.goldenLink}>
        Входящие RFQ
      </Link>
      {resolvedOrderId ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link href={session.brandOrderChatHref} data-testid="sup-cm-cabinet-brand-chat-link" className={hubGadget.goldenLink}>
            Чат с брендом
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link href={session.shopTrackingHref} data-testid="sup-cm-cabinet-shop-tracking-link" className={hubGadget.goldenLink}>
            Трекинг магазина
          </Link>
        </>
      ) : null}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.entitiesHref} data-testid="sup-cm-cabinet-entities-link" className={hubGadget.goldenLink}>
        Треды сущностей
      </Link>
    </div>
  );
}
