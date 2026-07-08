'use client';

import Link from 'next/link';
import { buildPlatformB2bHubSession } from '@/lib/platform-core-ports/b2b/platform-b2b-hub';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId?: string;
  orderId?: string;
};

/** Platform B2B hub · full monetization spine beyond golden path. */
export function PlatformB2bHubCoSpinePeerStrip({ collectionId, orderId }: Props) {
  const session = buildPlatformB2bHubSession({ collectionId, orderId });
  const crmHref = brandCrmSegmentationFeatureHref('pricelist', session.collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="platform-b2b-hub-co-spine-peer-strip">
      <Link
        href={session.buyPathHref}
        data-testid="platform-b2b-hub-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopMatrixHref}
        data-testid="platform-b2b-hub-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.collaborativeHref}
        data-testid="platform-b2b-hub-collaborative-link"
        className={hubGadget.goldenLink}
      >
        Совместный заказ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.replenishmentAtpHref}
        data-testid="platform-b2b-hub-replenishment-link"
        className={hubGadget.goldenLink}
      >
        ATP
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={crmHref}
        data-testid="platform-b2b-hub-brand-pricelist-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист бренда
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopRegistryGreenfieldHref}
        data-testid="platform-b2b-hub-greenfield-registry-link"
        className={hubGadget.goldenLink}
      >
        Shop2 registry
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.brandCrmBuyerAssignHref}
        data-testid="platform-b2b-hub-greenfield-crm-link"
        className={hubGadget.goldenLink}
      >
        CRM assign
      </Link>
    </div>
  );
}
