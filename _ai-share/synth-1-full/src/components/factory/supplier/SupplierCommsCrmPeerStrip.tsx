'use client';

import Link from 'next/link';
import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import { shopB2bPartnersFeatureHref } from '@/lib/b2b/shop-b2b-partners-workspace';
import { ROUTES } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Supplier comms — CRM peer to brand segmentation + shop buyer profile. */
export function SupplierCommsCrmPeerStrip({ collectionId, orderId }: Props) {
  const shopPartnersHref = shopB2bPartnersFeatureHref('discover', collectionId);
  const retailersQuery = orderId ? `?order=${encodeURIComponent(orderId)}` : '';

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-violet-50/40 px-3 py-2 text-xs"
      data-testid="sup-cm-crm-peer-strip"
    >
      <span className="text-text-secondary">CRM · peer:</span>
      <Link
        href={brandCrmSegmentationFeatureHref('segments', collectionId)}
        data-testid="sup-cm-crm-brand-segments-link"
        className={hubGadget.goldenLink}
      >
        Сегменты бренда
      </Link>
      <Link
        href={brandCrmSegmentationFeatureHref('pricelist', collectionId)}
        data-testid="sup-cm-crm-brand-pricelist-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист
      </Link>
      <Link
        href={`${ROUTES.brand.retailers}${retailersQuery}`}
        data-testid="sup-cm-crm-brand-retailers-link"
        className={hubGadget.goldenLink}
      >
        Ритейлеры
      </Link>
      <Link
        href={shopPartnersHref}
        data-testid="sup-cm-crm-shop-partners-link"
        className={hubGadget.goldenLink}
      >
        Партнёры магазина
      </Link>
    </div>
  );
}
