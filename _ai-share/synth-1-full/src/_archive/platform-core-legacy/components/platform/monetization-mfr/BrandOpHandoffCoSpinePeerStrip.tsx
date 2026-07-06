'use client';

import Link from 'next/link';
import { buildBrandProductionHandoffSession } from '@/lib/platform-core-ports/brand-production-handoff';
import { ROUTES } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  collectionId: string;
  factoryId?: string;
};

/** Передача бренда tab · shop monetization + factory comms peers. */
export function BrandOpHandoffCoSpinePeerStrip({ orderId, collectionId, factoryId }: Props) {
  const session = buildBrandProductionHandoffSession({ orderId, collectionId, factoryId });
  const matrixHref = platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}&order=${encodeURIComponent(orderId)}`);
  const checkoutHref = platformCoreUiHref(`${ROUTES.shop.b2bCheckout}?collection=${encodeURIComponent(collectionId)}&order=${encodeURIComponent(orderId)}`);

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="brand-op-handoff-co-spine-peer-strip"
    >
      <Link href={matrixHref} data-testid="brand-op-handoff-shop-matrix-link" className={hubGadget.goldenLink}>
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={checkoutHref} data-testid="brand-op-handoff-shop-checkout-link" className={hubGadget.goldenLink}>
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.shopTrackingHref} data-testid="brand-op-handoff-shop-tracking-link" className={hubGadget.goldenLink}>
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.manufacturerOrderCommsHref} data-testid="brand-op-handoff-mfr-comms-link" className={hubGadget.goldenLink}>
        Связь с цехом
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.shopReplenishmentAtpHref} data-testid="brand-op-handoff-replenishment-link" className={hubGadget.goldenLink}>
        ATP
      </Link>
    </div>
  );
}
