'use client';

import Link from 'next/link';
import { buildShopLandedMarginSession } from '@/lib/platform-core-ports/b2b/shop-landed-margin';
import { shopB2bCheckoutCollectionHref } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Shop landed margin · matrix + checkout + replenishment + comms peers. */
export function ShopCoLandedMarginSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopLandedMarginSession({ collectionId, orderId });
  const checkoutHref = shopB2bCheckoutCollectionHref(collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-co-landed-margin-spine-peer-strip">
      <Link href={session.matrixHref} data-testid="shop-co-landed-margin-matrix-link" className={hubGadget.goldenLink}>
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={checkoutHref} data-testid="shop-co-landed-margin-checkout-link" className={hubGadget.goldenLink}>
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.replenishmentAtpHref} data-testid="shop-co-landed-margin-replenishment-link" className={hubGadget.goldenLink}>
        ATP
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.orderCommsHref} data-testid="shop-co-landed-margin-order-comms-link" className={hubGadget.goldenLink}>
        Чат по заказу
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.brandPricelistHref} data-testid="shop-co-landed-margin-brand-pricelist-link" className={hubGadget.goldenLink}>
        Прайс-лист бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.collaborativeApprovalsHref} data-testid="shop-co-landed-margin-collaborative-link" className={hubGadget.goldenLink}>
        Согласования
      </Link>
    </div>
  );
}
