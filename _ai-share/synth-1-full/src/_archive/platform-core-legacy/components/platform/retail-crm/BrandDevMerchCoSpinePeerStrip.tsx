'use client';

import Link from 'next/link';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import {
  brandLinesheetsHrefForDemo,
  getPlatformCoreDemo,
} from '@/lib/platform-core-hub-matrix';
import {
  WAVE_YP_LINESHEETS_RU,
  WAVE_YP_SHOP_SHOWROOM_RU,
} from '@/lib/platform-core-ports/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

export type BrandDevMerchCoSpineVariant =
  | 'attribute-schema'
  | 'material-passport'
  | 'supplier-bom'
  | 'rfq-supplier';

const STRIP_TEST_ID: Record<BrandDevMerchCoSpineVariant, string> = {
  'attribute-schema': 'brand-attribute-schema-co-spine-peer-strip',
  'material-passport': 'brand-material-passport-co-spine-peer-strip',
  'supplier-bom': 'brand-supplier-bom-co-spine-peer-strip',
  'rfq-supplier': 'brand-rfq-supplier-co-spine-peer-strip',
};

type Props = {
  collectionId: string;
  orderId?: string;
  variant: BrandDevMerchCoSpineVariant;
};

/** Brand dev merch workspaces · SC linesheets + shop CO monetization spine. */
export function BrandDevMerchCoSpinePeerStrip({ collectionId, orderId, variant }: Props) {
  const demo = getPlatformCoreDemo(collectionId);
  const shop = buildShopShowroomBuySession({ collectionId, orderId });
  const linesheetsHref = brandLinesheetsHrefForDemo(demo);
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid={STRIP_TEST_ID[variant]}>
      <Link
        href={linesheetsHref}
        data-testid={`brand-${variant}-linesheets-link`}
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_LINESHEETS_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shop.showroomHref}
        data-testid={`brand-${variant}-shop-showroom-link`}
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_SHOP_SHOWROOM_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shop.matrixHref}
        data-testid={`brand-${variant}-shop-matrix-link`}
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shop.checkoutHref}
        data-testid={`brand-${variant}-shop-checkout-link`}
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={crmHref}
        data-testid={`brand-${variant}-crm-segments-link`}
        className={hubGadget.goldenLink}
      >
        Сегменты CRM
      </Link>
    </div>
  );
}
