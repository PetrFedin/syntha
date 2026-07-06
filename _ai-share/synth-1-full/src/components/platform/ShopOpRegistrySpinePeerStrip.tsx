'use client';

import Link from 'next/link';
import { buildShopOrderCommsSession } from '@/lib/platform-core-ports/b2b/shop-order-comms';
import { shopB2bTrackingOrderHref } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = { collectionId: string; orderId?: string };

/** Реестр магазина · трекинг, передача бренда, остатки, маржа. */
export function ShopOpRegistrySpinePeerStrip({ collectionId, orderId }: Props) {
  const resolvedOrderId = orderId?.trim() || '';
  const session = buildShopOrderCommsSession({
    collectionId,
    orderId: resolvedOrderId || undefined,
  });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-op-registry-spine-peer-strip">
      <Link href={shopB2bTrackingOrderHref(resolvedOrderId || undefined)} data-testid="shop-op-registry-tracking-link" className={hubGadget.goldenLink}>
        Трекинг
      </Link>
      {resolvedOrderId ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>·</span>
          <Link href={session.brandOrderHandoffHref} data-testid="shop-op-registry-brand-handoff-link" className={hubGadget.goldenLink}>
            Передача бренда
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>·</span>
          <Link href={session.inventoryOverviewHref} data-testid="shop-op-registry-inventory-link" className={hubGadget.goldenLink}>
            Остатки
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>·</span>
          <Link href={session.landedMarginHref} data-testid="shop-op-registry-margin-link" className={hubGadget.goldenLink}>
            Маржа
          </Link>
        </>
      ) : null}
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={session.matrixHref} data-testid="shop-op-registry-matrix-link" className={hubGadget.goldenLink}>
        Матрица
      </Link>
    </div>
  );
}
