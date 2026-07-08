'use client';

import Link from 'next/link';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildShopOrderCommsSession } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import {
  shopB2bCheckoutCollectionHref,
  shopB2bOrdersCollectionRegistryHref,
} from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Shop comms cabinet · registry + matrix + brand peers. */
export function ShopCmCabinetSpinePeerStrip({ collectionId, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const session = buildShopOrderCommsSession({
    collectionId,
    orderId: resolvedOrderId || undefined,
  });
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);
  const checkoutHref = shopB2bCheckoutCollectionHref(collectionId);

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="shop-cm-cabinet-spine-peer-strip"
    >
      {resolvedOrderId ? (
        <>
          <Link
            href={shopB2bOrdersCollectionRegistryHref(resolvedOrderId)}
            data-testid="shop-cm-cabinet-registry-link"
            className={hubGadget.goldenLink}
          >
            Реестр
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.trackingHref}
            data-testid="shop-cm-cabinet-tracking-link"
            className={hubGadget.goldenLink}
          >
            Трекинг
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
        </>
      ) : null}
      <Link
        href={session.matrixHref}
        data-testid="shop-cm-cabinet-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={checkoutHref}
        data-testid="shop-cm-cabinet-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={pricelistHref}
        data-testid="shop-cm-cabinet-brand-pricelist-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.replenishmentAtpHref}
        data-testid="shop-cm-cabinet-replenishment-link"
        className={hubGadget.goldenLink}
      >
        ATP
      </Link>
      {resolvedOrderId ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={session.brandOrderChatHref}
            data-testid="shop-cm-cabinet-brand-chat-link"
            className={hubGadget.goldenLink}
          >
            Чат бренда
          </Link>
        </>
      ) : null}
    </div>
  );
}
