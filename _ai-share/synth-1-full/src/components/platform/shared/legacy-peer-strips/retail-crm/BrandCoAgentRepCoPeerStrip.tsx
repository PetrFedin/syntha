'use client';

import Link from 'next/link';
import { buildBrandPricelistSession } from '@/lib/platform-core-ports/b2b/brand-pricelist-workspace';
import {
  brandAgentRepShopCommissionHref,
  brandAgentRepShopPortalHref,
  brandAgentRepShopPortalReadOnlyHref,
} from '@/lib/platform-core-ports/fashion/brand-agent-rep-oversight';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = { collectionId?: string; orderId?: string };

export function BrandCoAgentRepCoPeerStrip({ collectionId, orderId }: Props) {
  const pricelist = buildBrandPricelistSession({ collectionId, orderId });
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-co-agent-rep-co-peer-strip">
      <Link
        href={brandAgentRepShopPortalReadOnlyHref()}
        data-testid="brand-co-agent-rep-shop-portal-readonly-link"
        className={hubGadget.goldenLink}
      >
        Портал магазина · только просмотр
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandAgentRepShopPortalHref()}
        data-testid="brand-co-agent-rep-shop-portal-link"
        className={hubGadget.goldenLink}
      >
        Портал представителя
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={brandAgentRepShopCommissionHref()}
        data-testid="brand-co-agent-rep-shop-commission-link"
        className={hubGadget.goldenLink}
      >
        Комиссия
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={pricelist.shopMatrixHref}
        data-testid="brand-co-agent-rep-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={pricelist.shopCheckoutHref}
        data-testid="brand-co-agent-rep-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={crmHref}
        data-testid="brand-co-agent-rep-crm-link"
        className={hubGadget.goldenLink}
      >
        CRM
      </Link>
    </div>
  );
}
