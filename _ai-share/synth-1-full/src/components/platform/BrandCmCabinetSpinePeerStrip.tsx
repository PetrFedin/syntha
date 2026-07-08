'use client';

import Link from 'next/link';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Brand comms cabinet · CO registry + shop monetization + CRM peers. */
export function BrandCmCabinetSpinePeerStrip({ collectionId, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const session = buildBrandOrderCommsSession({
    collectionId,
    orderId: resolvedOrderId || undefined,
  });
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="brand-cm-cabinet-spine-peer-strip"
    >
      {resolvedOrderId ? (
        <>
          <Link
            href={session.registryHref}
            data-testid="brand-cm-cabinet-registry-link"
            className={hubGadget.goldenLink}
          >
            Реестр
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.handoffHref}
            data-testid="brand-cm-cabinet-handoff-link"
            className={hubGadget.goldenLink}
          >
            Передача
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
        </>
      ) : null}
      <Link
        href={session.shopMatrixHref}
        data-testid="brand-cm-cabinet-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopCheckoutHref}
        data-testid="brand-cm-cabinet-shop-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={crmHref}
        data-testid="brand-cm-cabinet-crm-segments-link"
        className={hubGadget.goldenLink}
      >
        Сегменты CRM
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={pricelistHref}
        data-testid="brand-cm-cabinet-crm-pricelist-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист
      </Link>
      {resolvedOrderId ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.replenishmentAtpHref}
            data-testid="brand-cm-cabinet-replenishment-link"
            className={hubGadget.goldenLink}
          >
            Пополнение
          </Link>
        </>
      ) : null}
    </div>
  );
}
