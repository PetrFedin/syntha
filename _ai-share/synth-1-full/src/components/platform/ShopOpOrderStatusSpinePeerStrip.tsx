'use client';

import Link from 'next/link';
import { buildShopOrderCommsSession } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import { shopB2bOrdersProductionRegistryHref } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = { collectionId: string; orderId: string };

/** Статус заказа магазина · реестр выпуска и связь с брендом. */
export function ShopOpOrderStatusSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopOrderCommsSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-op-order-status-spine-peer-strip">
      <Link
        href={shopB2bOrdersProductionRegistryHref(orderId)}
        data-testid="shop-op-order-status-registry-link"
        className={hubGadget.goldenLink}
      >
        Реестр выпуска
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandOrderHandoffHref}
        data-testid="shop-op-order-status-brand-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.trackingHref}
        data-testid="shop-op-order-status-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.inventoryOverviewHref}
        data-testid="shop-op-order-status-inventory-link"
        className={hubGadget.goldenLink}
      >
        Остатки
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandOrderChatHref}
        data-testid="shop-op-order-status-brand-chat-link"
        className={hubGadget.goldenLink}
      >
        Чат с брендом
      </Link>
    </div>
  );
}
