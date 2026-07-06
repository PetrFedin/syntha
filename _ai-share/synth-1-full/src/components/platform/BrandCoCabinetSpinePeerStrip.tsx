'use client';

import Link from 'next/link';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId: string;
};

/** Brand CO cabinet compact · peer links to shop matrix and buyer tracking. */
export function BrandCoCabinetSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildBrandOrderCommsSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-co-cabinet-spine-peer-strip">
      <Link
        href={session.shopMatrixHref}
        data-testid="brand-co-cabinet-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopTrackingHref}
        data-testid="brand-co-cabinet-shop-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг магазина
      </Link>
    </div>
  );
}
