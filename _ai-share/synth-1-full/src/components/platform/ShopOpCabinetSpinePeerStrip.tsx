'use client';

import Link from 'next/link';
import { buildShopOrderCommsSession } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId: string;
};

/** Кабинет магазина · выпуск: передача бренда, трекинг, маржа, остатки. */
export function ShopOpCabinetSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopOrderCommsSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-op-cabinet-spine-peer-strip">
      <Link
        href={session.brandOrderHandoffHref}
        data-testid="shop-op-cabinet-brand-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.trackingHref}
        data-testid="shop-op-cabinet-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.calendarHref}
        data-testid="shop-op-cabinet-calendar-link"
        className={hubGadget.goldenLink}
      >
        Календарь
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.landedMarginHref}
        data-testid="shop-op-cabinet-landed-margin-link"
        className={hubGadget.goldenLink}
      >
        Маржа с доставкой
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.inventoryOverviewHref}
        data-testid="shop-op-cabinet-inventory-link"
        className={hubGadget.goldenLink}
      >
        Остатки
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.chatHref}
        data-testid="shop-op-cabinet-order-comms-link"
        className={hubGadget.goldenLink}
      >
        Чат по заказу
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.workingOrderHref}
        data-testid="shop-op-cabinet-working-order-link"
        className={hubGadget.goldenLink}
      >
        Рабочий заказ
      </Link>
    </div>
  );
}
