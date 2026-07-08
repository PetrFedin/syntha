'use client';

import Link from 'next/link';
import { buildShopOrderCommsSession } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId: string;
};

/** Трекинг магазина · передача бренда, чат, остатки, маркетрум. */
export function ShopOpTrackingSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopOrderCommsSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-op-tracking-spine-peer-strip">
      <Link
        href={session.brandOrderHandoffHref}
        data-testid="shop-op-tracking-brand-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandOrderChatHref}
        data-testid="shop-op-tracking-brand-chat-link"
        className={hubGadget.goldenLink}
      >
        Чат с брендом
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.inventoryOverviewHref}
        data-testid="shop-op-tracking-inventory-link"
        className={hubGadget.goldenLink}
      >
        Остатки
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.platformMarketroomHref}
        data-testid="shop-op-tracking-platform-marketroom-link"
        className={hubGadget.goldenLink}
      >
        Маркетрум
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.platformHubHref}
        data-testid="shop-op-tracking-platform-hub-link"
        className={hubGadget.goldenLink}
      >
        Хаб платформы
      </Link>
    </div>
  );
}
