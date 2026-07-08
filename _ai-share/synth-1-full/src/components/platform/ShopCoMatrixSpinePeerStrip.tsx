'use client';

import Link from 'next/link';
import { buildShopCollaborativeOrderSession } from '@/lib/platform-core-ports/b2b/shop-collaborative-order';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Матрица · совместный заказ + рабочий заказ + правила (без дубля пополнения/трекинга — golden path). */
export function ShopCoMatrixSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopCollaborativeOrderSession({ collectionId, orderId });
  const showroom = buildShopShowroomBuySession({ collectionId, orderId: session.orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-co-matrix-spine-peer-strip">
      <Link
        href={session.sessionHref}
        data-testid="shop-co-matrix-collaborative-link"
        className={hubGadget.goldenLink}
      >
        Совместный заказ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.workingOrderHref}
        data-testid="shop-co-matrix-working-order-link"
        className={hubGadget.goldenLink}
      >
        Рабочий заказ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={showroom.replenishmentRulesHref}
        data-testid="shop-co-matrix-rules-link"
        className={hubGadget.goldenLink}
      >
        Правила
      </Link>
    </div>
  );
}
