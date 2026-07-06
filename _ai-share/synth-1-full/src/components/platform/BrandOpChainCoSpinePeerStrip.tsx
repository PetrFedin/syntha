'use client';

import Link from 'next/link';
import { buildBrandProductionHandoffSession } from '@/lib/platform-core-ports/brand-production-handoff';
import { ROUTES, shopB2bTrackingOrderHref } from '@/lib/platform-core-routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  collectionId: string;
};

/** Brand OP chain card · shop monetization + handoff + factory peers. */
export function BrandOpChainCoSpinePeerStrip({ orderId, collectionId }: Props) {
  const session = buildBrandProductionHandoffSession({ orderId, collectionId });
  const matrixHref = platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}&order=${encodeURIComponent(orderId)}`);
  const checkoutHref = platformCoreUiHref(`${ROUTES.shop.b2bCheckout}?collection=${encodeURIComponent(collectionId)}&order=${encodeURIComponent(orderId)}`);

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="brand-op-chain-co-spine-peer-strip"
    >
      <Link href={session.handoffTabHref} data-testid="brand-op-chain-handoff-link" className={hubGadget.goldenLink}>
        Передача
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={matrixHref} data-testid="brand-op-chain-shop-matrix-link" className={hubGadget.goldenLink}>
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={checkoutHref} data-testid="brand-op-chain-shop-checkout-link" className={hubGadget.goldenLink}>
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={shopB2bTrackingOrderHref(orderId)} data-testid="brand-op-chain-shop-tracking-link" className={hubGadget.goldenLink}>
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.manufacturerOrderCommsHref} data-testid="brand-op-chain-mfr-comms-link" className={hubGadget.goldenLink}>
        Связь с цехом
      </Link>
    </div>
  );
}
