'use client';

import Link from 'next/link';
import { buildShopCollaborativeOrderSession } from '@/lib/platform-core-ports/b2b/shop-collaborative-order';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Collaborative workspace · working order + replenishment back-links. */
export function ShopCollaborativeOrderExtendedPeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopCollaborativeOrderSession({ collectionId, orderId });

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid="shop-collaborative-order-extended-peer-strip"
    >
      <Link
        href={session.matrixHref}
        data-testid="shop-collaborative-matrix-peer-link"
        className={hubGadget.goldenLink}
      >
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.workingOrderHref}
        data-testid="shop-collaborative-working-order-link"
        className={hubGadget.goldenLink}
      >
        Версии рабочего заказа
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.replenishmentHref}
        data-testid="shop-collaborative-replenishment-link"
        className={hubGadget.goldenLink}
      >
        ATP
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.landedMarginHref}
        data-testid="shop-collaborative-margin-link"
        className={hubGadget.goldenLink}
      >
        Маржа
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandOrderChatHref}
        data-testid="shop-collaborative-brand-chat-link"
        className={hubGadget.goldenLink}
      >
        Чат бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.checkoutHref}
        data-testid="shop-collaborative-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
    </div>
  );
}
