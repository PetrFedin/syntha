'use client';

import Link from 'next/link';
import { buildBrandPricelistSession } from '@/lib/platform-core-ports/b2b/brand-pricelist-workspace';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = { collectionId: string; orderId?: string };

export function BrandCoPricelistCoPeerStrip({ collectionId, orderId }: Props) {
  const s = buildBrandPricelistSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-co-pricelist-co-peer-strip">
      <Link href={s.shopMatrixHref} data-testid="brand-co-pricelist-shop-matrix-link" className={hubGadget.goldenLink}>
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={s.shopCheckoutHref} data-testid="brand-co-pricelist-shop-checkout-link" className={hubGadget.goldenLink}>
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={s.brandCrmSegmentsHref} data-testid="brand-co-pricelist-crm-link" className={hubGadget.goldenLink}>
        CRM
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={s.shopOrderCommsHref} data-testid="brand-co-pricelist-shop-comms-link" className={hubGadget.goldenLink}>
        Shop comms
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={s.brandLandedMarginHref} data-testid="brand-co-pricelist-margin-link" className={hubGadget.goldenLink}>
        Landed margin
      </Link>
    </div>
  );
}
