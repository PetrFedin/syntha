'use client';

import Link from 'next/link';
import { buildSupplierProcurementSession } from '@/lib/fashion/supplier-procurement-workspace';
import {
  buildSupOpCommsTailHref,
  buildSupOpTrackingTailHref,
} from '@/lib/platform/wave-yj-sup-op-procurement-chain';
import { appendSupplierOpPoContextToHref } from '@/lib/b2b/supplier-op-po-context-hrefs';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  productionOrderId?: string;
};

/** sup-op-chain workspace · brand chat + tracking + forecast (PO context on tail hrefs, wave YJ). */
export function SupOpChainWorkspacePeerStrip({
  collectionId,
  articleId,
  orderId,
  productionOrderId,
}: Props) {
  const session = buildSupplierProcurementSession({
    collectionId,
    articleId,
    orderId,
    productionOrderId,
  });
  const poCtx = orderId?.trim()
    ? { orderId: orderId.trim(), productionOrderId }
    : undefined;
  const brandChatHref = poCtx
    ? buildSupOpCommsTailHref({
        orderId: poCtx.orderId,
        collectionId,
        sectionId: 'sup-op-chain',
        productionOrderId: poCtx.productionOrderId,
      })
    : session.entitiesHref;
  const trackingHref = poCtx
    ? buildSupOpTrackingTailHref(poCtx)
    : session.shopTrackingHref;
  const forecastHref = poCtx
    ? appendSupplierOpPoContextToHref(session.forecastHref, poCtx)
    : session.forecastHref;
  const supplyHref = poCtx
    ? appendSupplierOpPoContextToHref(session.supplyHref, poCtx)
    : session.supplyHref;

  return (
    <div className={hubGadget.goldenPath} data-testid="sup-op-chain-workspace-peer-strip">
      <Link
        href={brandChatHref}
        data-testid="sup-op-chain-peer-brand-chat-link"
        data-comms-tail-po={productionOrderId?.trim() || undefined}
        className={hubGadget.goldenLink}
      >
        Чат с брендом
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={trackingHref}
        data-testid="sup-op-chain-peer-tracking-link"
        data-comms-tail-po={productionOrderId?.trim() || undefined}
        className={hubGadget.goldenLink}
      >
        Трекинг
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={forecastHref}
        data-testid="sup-op-chain-peer-forecast-link"
        data-comms-tail-po={productionOrderId?.trim() || undefined}
        className={hubGadget.goldenLink}
      >
        Прогноз
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={supplyHref}
        data-testid="sup-op-chain-peer-supply-link"
        data-comms-tail-po={productionOrderId?.trim() || undefined}
        className={hubGadget.goldenLink}
      >
        Поставка
      </Link>
    </div>
  );
}
