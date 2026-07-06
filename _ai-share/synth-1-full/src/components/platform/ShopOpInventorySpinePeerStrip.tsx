'use client';

import Link from 'next/link';
import { buildShopInventoryOpsSession } from '@/lib/platform-core-ports/b2b/shop-inventory-ops';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = { collectionId: string; orderId?: string };

/** Остатки магазина · чат, матрица, пополнение, маржа бренда. */
export function ShopOpInventorySpinePeerStrip({ collectionId, orderId }: Props) {
  const s = buildShopInventoryOpsSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="shop-op-inventory-spine-peer-strip">
      <Link href={s.orderCommsHref} data-testid="shop-op-inventory-order-comms-link" className={hubGadget.goldenLink}>
        Чат по заказу
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={s.matrixHref} data-testid="shop-op-inventory-matrix-link" className={hubGadget.goldenLink}>
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={s.replenishmentAtpHref} data-testid="shop-op-inventory-replenishment-link" className={hubGadget.goldenLink}>
        Пополнение
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={s.landedMarginHref} data-testid="shop-op-inventory-margin-link" className={hubGadget.goldenLink}>
        Маржа
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>·</span>
      <Link href={s.brandInventoryOverviewHref} data-testid="shop-op-inventory-brand-ledger-link" className={hubGadget.goldenLink}>
        Склад бренда
      </Link>
    </div>
  );
}
