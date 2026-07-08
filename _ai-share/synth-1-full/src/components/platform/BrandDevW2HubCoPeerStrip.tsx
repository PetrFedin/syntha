'use client';

import Link from 'next/link';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = { collectionId: string; orderId?: string };

/** W2 hub · shop monetization + CRM onboarding peers. */
export function BrandDevW2HubCoPeerStrip({ collectionId, orderId }: Props) {
  const shop = buildShopShowroomBuySession({ collectionId, orderId });
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-dev-w2-hub-co-peer-strip">
      <Link
        href={shop.matrixHref}
        data-testid="brand-dev-w2-hub-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shop.checkoutHref}
        data-testid="brand-dev-w2-hub-shop-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={crmHref} data-testid="brand-dev-w2-hub-crm-link" className={hubGadget.goldenLink}>
        Сегменты CRM
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shop.trackingHref}
        data-testid="brand-dev-w2-hub-shop-tracking-link"
        className={hubGadget.goldenLink}
      >
        Трекинг магазина
      </Link>
    </div>
  );
}
