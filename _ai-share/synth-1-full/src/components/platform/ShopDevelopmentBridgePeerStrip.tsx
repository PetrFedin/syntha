'use client';

import Link from 'next/link';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import { buildShopReplenishmentSession } from '@/lib/platform-core-ports/b2b/shop-replenishment-workspace';
import { ROUTES, brandDevelopmentCabinetHref } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  readyForBuyers?: boolean | null;
};

/** Shop empty dev pillar · compact peer strip (read-only insight, не ТЗ). */
export function ShopDevelopmentBridgePeerStrip({ collectionId, readyForBuyers }: Props) {
  const shop = buildShopShowroomBuySession({ collectionId });
  const replenishment = buildShopReplenishmentSession({ collectionId });
  const brandW2Href = brandDevelopmentCabinetHref(collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-dev-bridge-peer-strip">
      <Link href={brandW2Href} data-testid="shop-dev-bridge-peer-w2-link" className={hubGadget.goldenLink}>
        Техпак бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={shop.showroomHref} data-testid="shop-dev-bridge-peer-showroom-link" className={hubGadget.goldenLink}>
        Витрина
      </Link>
      {readyForBuyers ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link href={shop.matrixHref} data-testid="shop-dev-bridge-peer-matrix-link" className={hubGadget.goldenLink}>
            Матрица
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link
            href={shop.checkoutHref}
            data-testid="shop-dev-bridge-peer-checkout-link"
            className={hubGadget.goldenLink}
          >
            Оформление
          </Link>
        </>
      ) : null}
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={replenishment.stockAtpHref}
        data-testid="shop-dev-bridge-peer-replenishment-link"
        className={hubGadget.goldenLink}
      >
        ATP · пополнение
      </Link>
    </div>
  );
}
