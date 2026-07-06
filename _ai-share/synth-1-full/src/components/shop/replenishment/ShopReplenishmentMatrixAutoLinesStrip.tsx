'use client';

import Link from 'next/link';
import {
  formatShopReplenishmentMatrixAutoLinesLinkRu,
  SHOP_REPLENISHMENT_MATRIX_AUTO_LINES_STRIP_RU,
  shopReplenishmentMatrixAutoLinesHref,
} from '@/lib/platform/shop-replenishment-wms-atp-feed';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId?: string;
  orderId?: string;
  lineCount: number;
  atpQtyTotal?: number;
  hintRu?: string | null;
  buyerId?: string;
};

/** Wave WG — replenishment→matrix auto-lines cross-link strip. */
export function ShopReplenishmentMatrixAutoLinesStrip({
  collectionId,
  orderId,
  lineCount,
  atpQtyTotal,
  hintRu,
  buyerId,
}: Props) {
  if (!collectionId?.trim()) return null;

  const matrixHref = shopReplenishmentMatrixAutoLinesHref(collectionId, orderId, {
    lineCount,
    atpQtyTotal,
    buyerId,
  });
  const linkLabel = formatShopReplenishmentMatrixAutoLinesLinkRu(lineCount);

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid="shop-replenishment-matrix-auto-lines-strip"
    >
      <span className="text-text-muted text-[10px]">{SHOP_REPLENISHMENT_MATRIX_AUTO_LINES_STRIP_RU}</span>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={matrixHref}
        className={hubGadget.goldenLink}
        data-testid="shop-replenishment-matrix-auto-lines-link"
      >
        {linkLabel}
        {atpQtyTotal != null && atpQtyTotal > 0 ? ` · ATP ${atpQtyTotal}` : ''}
      </Link>
      {hintRu ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <span
            className="text-text-muted text-[10px]"
            data-testid="shop-replenishment-matrix-lines-hint"
          >
            {hintRu}
          </span>
        </>
      ) : null}
    </div>
  );
}
