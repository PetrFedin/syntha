'use client';

import Link from 'next/link';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import {
  brandWssiCheckoutHref,
  brandWssiFeatureHref,
  brandWssiShopMatrixHref,
  brandWssiShowroomHref,
} from '@/lib/platform-core-ports/fashion/brand-wssi-plan';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Brand WSSI · CRM segments + CO registry + shop buy peers (RU cross-links). */
export function BrandCoWssiCoPeerStrip({ collectionId, orderId: _orderId }: Props) {
  const comms = buildBrandOrderCommsSession({ collectionId, orderId });
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);
  const otbHref = brandWssiFeatureHref('otb', collectionId);
  const matrixHref = brandWssiShopMatrixHref(collectionId, orderId);
  const showroomHref = brandWssiShowroomHref(collectionId);
  const checkoutHref = brandWssiCheckoutHref(collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-co-wssi-co-peer-strip">
      <Link href={otbHref} data-testid="brand-co-wssi-otb-link" className={hubGadget.goldenLink}>
        План OTB
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={crmHref} data-testid="brand-co-wssi-crm-segments-link" className={hubGadget.goldenLink}>
        Сегменты CRM
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={comms.registryHref} data-testid="brand-co-wssi-registry-link" className={hubGadget.goldenLink}>
        Реестр заказов
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={matrixHref} data-testid="brand-co-wssi-shop-matrix-link" className={hubGadget.goldenLink}>
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={showroomHref} data-testid="brand-co-wssi-shop-showroom-link" className={hubGadget.goldenLink}>
        Шоурум магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={checkoutHref} data-testid="brand-co-wssi-checkout-link" className={hubGadget.goldenLink}>
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={comms.handoffHref} data-testid="brand-co-wssi-handoff-link" className={hubGadget.goldenLink}>
        Передача в цех
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={comms.shopTrackingHref} data-testid="brand-co-wssi-shop-tracking-link" className={hubGadget.goldenLink}>
        Трекинг магазина
      </Link>
    </div>
  );
}
