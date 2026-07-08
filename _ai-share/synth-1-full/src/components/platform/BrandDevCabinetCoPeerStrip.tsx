'use client';

import Link from 'next/link';
import { brandCrmSegmentationFeatureHref } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import { brandLinesheetsHrefForDemo, getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';
import {
  WAVE_WZ_BRAND_DEV_CO_LINESHEETS_RU,
  WAVE_WZ_BRAND_DEV_CO_PEER_STRIP_TESTID,
  WAVE_WZ_BRAND_DEV_CO_SHOWROOM_RU,
} from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Brand dev cabinet · SC linesheets/showroom + shop CO monetization peers (без dup sample lifecycle / matrix / checkout). */
export function BrandDevCabinetCoPeerStrip({ collectionId, orderId }: Props) {
  const demo = getPlatformCoreDemo(collectionId);
  const shop = buildShopShowroomBuySession({ collectionId, orderId });
  const linesheetsHref = brandLinesheetsHrefForDemo(demo);
  const crmHref = brandCrmSegmentationFeatureHref('segments', collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_WZ_BRAND_DEV_CO_PEER_STRIP_TESTID}>
      <Link
        href={linesheetsHref}
        data-testid="brand-dev-cabinet-linesheets-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_WZ_BRAND_DEV_CO_LINESHEETS_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shop.showroomHref}
        data-testid="brand-dev-cabinet-shop-showroom-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_WZ_BRAND_DEV_CO_SHOWROOM_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={crmHref}
        data-testid="brand-dev-cabinet-crm-segments-link"
        className={hubGadget.goldenLink}
      >
        Сегменты CRM
      </Link>
    </div>
  );
}
