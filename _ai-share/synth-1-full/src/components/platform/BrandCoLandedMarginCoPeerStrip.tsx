'use client';

import Link from 'next/link';
import { buildBrandLandedMarginSession } from '@/lib/platform-core-ports/b2b/brand-landed-margin';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = { collectionId: string; orderId?: string };

export function BrandCoLandedMarginCoPeerStrip({ collectionId, orderId }: Props) {
  const s = buildBrandLandedMarginSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-co-landed-margin-co-peer-strip">
      <Link
        href={s.shopMatrixHref}
        data-testid="brand-co-landed-margin-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={s.shopCheckoutHref}
        data-testid="brand-co-landed-margin-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={s.priceListsVersionsHref}
        data-testid="brand-co-landed-margin-pricelist-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={s.shopReplenishmentAtpHref}
        data-testid="brand-co-landed-margin-replenishment-link"
        className={hubGadget.goldenLink}
      >
        ATP
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={s.brandOrderCommsHandoffHref}
        data-testid="brand-co-landed-margin-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача
      </Link>
    </div>
  );
}
