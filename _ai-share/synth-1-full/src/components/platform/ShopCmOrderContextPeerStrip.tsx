'use client';

import Link from 'next/link';
import { buildShopOrderCommsSession } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import {
  shopB2bCheckoutCollectionHref,
  shopB2bOrdersCollectionRegistryHref,
} from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId: string;
};

/** Чат по заказу магазина · реестр, матрица, оформление, трекинг. */
export function ShopCmOrderContextPeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopOrderCommsSession({ collectionId, orderId });
  const checkoutHref = shopB2bCheckoutCollectionHref(collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-cm-order-context-strip">
      <Link
        href={shopB2bOrdersCollectionRegistryHref(orderId)}
        data-testid="shop-cm-order-registry-link"
        className={hubGadget.goldenLink}
      >
        Реестр
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.matrixHref}
        data-testid="shop-cm-order-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={checkoutHref}
        data-testid="shop-cm-order-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandOrderHandoffHref}
        data-testid="shop-cm-order-brand-handoff-link"
        className={hubGadget.goldenLink}
      >
        Передача бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.trackingHref}
        data-testid="shop-cm-order-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.collaborativeHref}
        data-testid="shop-cm-order-collaborative-link"
        className={hubGadget.goldenLink}
      >
        Согласования
      </Link>
    </div>
  );
}
