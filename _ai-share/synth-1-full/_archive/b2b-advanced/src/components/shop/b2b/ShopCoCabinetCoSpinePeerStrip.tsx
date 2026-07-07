'use client';

import Link from 'next/link';
import { buildShopCollaborativeOrderSession } from '@/lib/b2b/shop-collaborative-order';
import { buildBrandCrmSegmentationSession } from '@/lib/b2b/brand-crm-segmentation';
import { WAVE_WZ_SHOP_CO_SPINE_PEER_STRIP_TESTID } from '@/lib/platform/wave-wz-ru-noise-dedup-final';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId: string;
};

/** Shop CO cabinet compact · согласования + прайс-лист (без дубля matrix/checkout/replenishment — golden path). */
export function ShopCoCabinetCoSpinePeerStrip({ collectionId, orderId }: Props) {
  const collaborative = buildShopCollaborativeOrderSession({ collectionId, orderId });
  const { shopMarginPricelistHref } = buildBrandCrmSegmentationSession({ collectionId });

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_WZ_SHOP_CO_SPINE_PEER_STRIP_TESTID}>
      <Link href={collaborative.approvalsHref} data-testid="shop-co-cabinet-collaborative-link" className={hubGadget.goldenLink}>
        Согласования
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={shopMarginPricelistHref} data-testid="shop-co-cabinet-brand-pricelist-link" className={hubGadget.goldenLink}>
        Прайс-лист бренда
      </Link>
    </div>
  );
}
