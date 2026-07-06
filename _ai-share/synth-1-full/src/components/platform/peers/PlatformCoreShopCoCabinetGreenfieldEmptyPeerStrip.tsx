'use client';

import Link from 'next/link';
import {
  shopCoCheckoutCollectionUiHref,
  shopCoLandedMarginTabUiHref,
  shopCoMatrixReorderUiHref,
  shopCoReplenishmentTabUiHref,
} from '@/lib/platform-core-shop-co-peer-hrefs';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  buyerId: string;
  collectionId: string;
};

/** Greenfield empty peer strip — native hrefs. */
export function PlatformCoreShopCoCabinetGreenfieldEmptyPeerStrip({ buyerId, collectionId }: Props) {
  const matrixHref = shopCoMatrixReorderUiHref(collectionId, '', { buyerId });
  const pricelistHref = shopCoLandedMarginTabUiHref('pricelist', collectionId);
  const replenishmentHref = shopCoReplenishmentTabUiHref('stock-atp', collectionId);
  const checkoutHref = shopCoCheckoutCollectionUiHref(collectionId, { buyerId });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-co-cabinet-greenfield-empty-peer-strip">
      <Link href={matrixHref} data-testid="shop-co-cabinet-greenfield-matrix-link" className={hubGadget.goldenLink}>
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={pricelistHref} data-testid="shop-co-cabinet-brand-pricelist-link" className={hubGadget.goldenLink}>
        Прайс-лист бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={replenishmentHref} data-testid="shop-co-cabinet-replenishment-link" className={hubGadget.goldenLink}>
        ATP
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={checkoutHref} data-testid="shop-co-cabinet-checkout-link" className={hubGadget.goldenLink}>
        Оформление
      </Link>
    </div>
  );
}
