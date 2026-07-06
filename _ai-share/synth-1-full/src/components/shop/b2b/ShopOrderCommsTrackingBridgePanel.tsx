'use client';

import Link from 'next/link';
import { CommsContextualThreadLink } from '@/components/platform/CommsContextualThreadLink';
import { useMemo } from 'react';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import { buildShopOrderCommsSession } from '@/lib/b2b/shop-order-comms';
import {
  WAVE_YN_BRAND_CHAT_RU,
  WAVE_YN_SHOP_CHAT_RU,
} from '@/lib/platform/wave-yn-comms-contextual-thread';

type Props = {
  orderId?: string;
  collectionId?: string;
};

/** Связка бренд ↔ магазин над списком трекинга. */
export function ShopOrderCommsTrackingBridgePanel({ orderId, collectionId }: Props) {
  const shop = useMemo(
    () => (orderId?.trim() ? buildShopOrderCommsSession({ orderId, collectionId }) : null),
    [orderId, collectionId]
  );
  const brand = useMemo(
    () => (orderId?.trim() ? buildBrandOrderCommsSession({ orderId, collectionId }) : null),
    [orderId, collectionId]
  );

  if (!shop || !brand) {
    return null;
  }

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid="shop-order-comms-tracking-bridge-strip"
    >
      <span className="text-text-muted shrink-0">Бренд ↔ магазин</span>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={brand.detailHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-brand-detail-link"
      >
        Заказ бренда
      </Link>
      <span className={hubGadget.goldenSep}>·</span>
      <CommsContextualThreadLink
        href={brand.chatHref}
        orderId={orderId}
        collectionId={collectionId}
        contextualSource="tracking"
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-brand-chat-link"
      >
        {WAVE_YN_BRAND_CHAT_RU}
      </CommsContextualThreadLink>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={brand.handoffHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-brand-handoff-link"
      >
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={brand.brandLandedMarginHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-brand-margin-link"
      >
        Маржа бренда
      </Link>
      <span className={hubGadget.goldenSep}>·</span>
      <CommsContextualThreadLink
        href={shop.chatHref}
        orderId={orderId}
        collectionId={collectionId}
        contextualSource="tracking"
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-shop-chat-link"
      >
        {WAVE_YN_SHOP_CHAT_RU}
      </CommsContextualThreadLink>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={shop.replenishmentAtpHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-replenishment-link"
      >
        Пополнение
      </Link>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={shop.collaborativeApprovalsHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-collaborative-link"
      >
        Согласования
      </Link>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={shop.landedMarginHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-shop-margin-link"
      >
        Маржа магазина
      </Link>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={shop.matrixHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-matrix-link"
      >
        Матрица
      </Link>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={shop.inventoryOverviewHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-inventory-link"
      >
        Остатки
      </Link>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={shop.platformMarketroomHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-platform-marketroom-link"
      >
        Маркетрум
      </Link>
      <span className={hubGadget.goldenSep}>·</span>
      <Link
        href={shop.workingOrderHref}
        className={hubGadget.goldenLink}
        data-testid="shop-tracking-bridge-working-order-link"
      >
        Рабочий заказ
      </Link>
    </div>
  );
}
