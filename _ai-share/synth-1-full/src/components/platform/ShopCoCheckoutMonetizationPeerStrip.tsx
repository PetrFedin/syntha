'use client';

import Link from 'next/link';
import { buildShopCollaborativeOrderSession } from '@/lib/platform-core-ports/b2b/shop-collaborative-order';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { shopOrderCommsFeatureHref } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Оформление · CRM бренда + согласования + чат заказа (без дубля реестра/трекинга — golden path). */
export function ShopCoCheckoutMonetizationPeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopCollaborativeOrderSession({ collectionId, orderId });
  const crmSegmentsHref = brandCrmSegmentationFeatureHref('segments', collectionId);
  const pricelistHref = brandCrmSegmentationFeatureHref('pricelist', collectionId);
  const orderCommsHref = shopOrderCommsFeatureHref(session.orderId, 'chat', collectionId);

  return (
    <div
      className={cn(
        hubGadget.goldenPath,
        'mb-3',
        hubCabinet.workspaceTableScroll,
        'max-md:flex-nowrap'
      )}
      data-testid="shop-co-checkout-monetization-peer-strip"
    >
      <Link
        href={crmSegmentsHref}
        data-testid="shop-co-checkout-brand-crm-link"
        className={hubGadget.goldenLink}
      >
        CRM бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={pricelistHref}
        data-testid="shop-co-checkout-brand-pricelist-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.approvalsHref}
        data-testid="shop-co-checkout-collaborative-link"
        className={hubGadget.goldenLink}
      >
        Согласования
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={orderCommsHref}
        data-testid="shop-co-checkout-order-comms-link"
        className={hubGadget.goldenLink}
      >
        Чат по заказу
      </Link>
    </div>
  );
}
