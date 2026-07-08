'use client';

import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import {
  PlatformCoreSpinePeerStripShell,
  type PlatformCoreSpinePeerLink,
} from '@/components/platform/shared/PlatformCoreSpinePeerStripShell';

type Props = {
  collectionId: string;
  orderId: string;
};

/** Brand CO cabinet compact · peer links to shop matrix and buyer tracking. */
export function BrandCoCabinetSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildBrandOrderCommsSession({ collectionId, orderId });

  const links: PlatformCoreSpinePeerLink[] = [
    {
      href: session.shopMatrixHref,
      label: 'Матрица магазина',
      testId: 'brand-co-cabinet-shop-matrix-link',
    },
    {
      href: session.shopTrackingHref,
      label: 'Трекинг магазина',
      testId: 'brand-co-cabinet-shop-tracking-link',
    },
  ];

  return (
    <PlatformCoreSpinePeerStripShell testId="brand-co-cabinet-spine-peer-strip" links={links} />
  );
}
