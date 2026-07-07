'use client';

import Link from 'next/link';
import { buildShopWorkingOrderSession } from '@/lib/b2b/shop-working-order-session';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  wholesaleOrderId: string;
  collectionId?: string;
};

/** Native wholesale orders — honest matrix redirect + tracking/checkout peers. */
export function ShopWorkingOrderNativeOrderHonestStrip({
  wholesaleOrderId,
  collectionId,
}: Props) {
  const session = buildShopWorkingOrderSession({ wholesaleOrderId, collectionId });

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-bg-surface2/50 px-3 py-2 text-xs"
      data-testid="shop-working-order-native-order-honest-strip"
    >
      <span className="text-text-secondary">
        Native-заказ — правки через матрицу; версии и пакетные операции здесь, оформление отдельно.
      </span>
      <Link
        href={session.matrixHref}
        data-testid="shop-working-order-native-matrix-link"
        className="text-accent-primary font-medium hover:underline"
      >
        Матрица
      </Link>
      <Link
        href={session.trackingHref}
        data-testid="shop-working-order-native-tracking-link"
        className="text-accent-primary font-medium hover:underline"
      >
        Трекинг
      </Link>
      <Link
        href={session.checkoutHref}
        data-testid="shop-working-order-native-checkout-link"
        className="text-accent-primary font-medium hover:underline"
      >
        Оформление
      </Link>
    </div>
  );
}
