'use client';

import Link from 'next/link';
import { WAVE_WZ_SHOP_CO_SPINE_PEER_STRIP_TESTID } from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import {
  shopCoCollaborativeTabUiHref,
  shopCoLandedMarginTabUiHref,
} from '@/lib/platform-core-shop-co-peer-hrefs';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId: string;
};

/** Shop CO cabinet · согласования + прайс (native href, без components/shop/b2b). */
export function PlatformCoreShopCoCabinetCoSpinePeerStrip({ collectionId, orderId }: Props) {
  const approvalsHref = shopCoCollaborativeTabUiHref('approvals', orderId, collectionId);
  const pricelistHref = shopCoLandedMarginTabUiHref('pricelist', collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_WZ_SHOP_CO_SPINE_PEER_STRIP_TESTID}>
      <Link
        href={approvalsHref}
        data-testid="shop-co-cabinet-collaborative-link"
        className={hubGadget.goldenLink}
      >
        Согласования
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={pricelistHref}
        data-testid="shop-co-cabinet-brand-pricelist-link"
        className={hubGadget.goldenLink}
      >
        Прайс-лист бренда
      </Link>
    </div>
  );
}
