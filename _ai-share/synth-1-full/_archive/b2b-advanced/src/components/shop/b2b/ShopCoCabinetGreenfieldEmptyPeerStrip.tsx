'use client';

import Link from 'next/link';
import { buildBrandCrmSegmentationSession } from '@/lib/b2b/brand-crm-segmentation';
import { shopReplenishmentTabHref } from '@/lib/b2b/shop-collection-order-hrefs';
import { shopB2bCheckoutCollectionHref, shopB2bMatrixReorderHref } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  buyerId: string;
  collectionId: string;
};

/** Shop CO cabinet · greenfield empty peer strip (matrix + pricelist BY + replenishment). */
export function ShopCoCabinetGreenfieldEmptyPeerStrip({ buyerId, collectionId }: Props) {
  const { shopMarginPricelistHref } = buildBrandCrmSegmentationSession({ collectionId });
  const replenishmentHref = shopReplenishmentTabHref('stock-atp', collectionId);
  const matrixHref = shopB2bMatrixReorderHref(collectionId, '', { buyerId });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-co-cabinet-greenfield-empty-peer-strip">
      <Link href={matrixHref} data-testid="shop-co-cabinet-greenfield-matrix-link" className={hubGadget.goldenLink}>
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shopMarginPricelistHref}
        data-testid="shop-co-cabinet-brand-pricelist-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={replenishmentHref}
        data-testid="shop-co-cabinet-replenishment-link"
        className={hubGadget.goldenLink}
      >
        ATP
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shopB2bCheckoutCollectionHref(collectionId, { buyerId })}
        data-testid="shop-co-cabinet-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
    </div>
  );
}
