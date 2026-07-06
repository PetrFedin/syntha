'use client';

import Link from 'next/link';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Brand dev dossier · shop CO monetization peers (matrix/checkout/CRM). */
export function BrandDevDossierCoPeerStrip({ collectionId, orderId }: Props) {
  const shop = buildShopShowroomBuySession({ collectionId, orderId });
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-dev-dossier-co-peer-strip">
      <Link
        href={shop.showroomHref}
        data-testid="brand-dev-dossier-shop-showroom-link"
        className={hubGadget.goldenLink}
      >
        Shop showroom
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shop.matrixHref}
        data-testid="brand-dev-dossier-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shop.checkoutHref}
        data-testid="brand-dev-dossier-shop-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={crmHref}
        data-testid="brand-dev-dossier-crm-segments-link"
        className={hubGadget.goldenLink}
      >
        Сегменты CRM
      </Link>
    </div>
  );
}
