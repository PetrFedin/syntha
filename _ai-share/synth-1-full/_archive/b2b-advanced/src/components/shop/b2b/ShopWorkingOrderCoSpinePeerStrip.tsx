'use client';

import Link from 'next/link';
import { buildShopReplenishmentSession } from '@/lib/b2b/shop-replenishment-workspace';
import { buildShopCollaborativeOrderSession } from '@/lib/b2b/shop-collaborative-order';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  wholesaleOrderId: string;
  collectionId?: string;
};

/** Working order · replenishment + collaborative + brand chat peers. */
export function ShopWorkingOrderCoSpinePeerStrip({ wholesaleOrderId, collectionId }: Props) {
  const replenishment = buildShopReplenishmentSession({ collectionId, orderId: wholesaleOrderId });
  const collaborative = buildShopCollaborativeOrderSession({ collectionId, orderId: wholesaleOrderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-working-order-co-spine-peer-strip">
      <Link href={replenishment.stockAtpHref} data-testid="shop-working-order-replenishment-link" className={hubGadget.goldenLink}>
        ATP
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={collaborative.sessionHref} data-testid="shop-working-order-collaborative-link" className={hubGadget.goldenLink}>
        Совместный заказ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={collaborative.brandOrderChatHref} data-testid="shop-working-order-brand-chat-link" className={hubGadget.goldenLink}>
        Чат бренда
      </Link>
    </div>
  );
}
