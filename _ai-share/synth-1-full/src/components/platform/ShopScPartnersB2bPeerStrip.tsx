'use client';

import Link from 'next/link';
import { buildShopB2bPartnersSession } from '@/lib/platform-core-ports/b2b/shop-b2b-partners-workspace';
import { buildPlatformB2bHubSession } from '@/lib/platform-core-ports/b2b/platform-b2b-hub';
import {
  SHOP_SC_PARTNERS_ELIGIBLE_MATRIX_PEER_LABEL_RU,
  SHOP_SC_PARTNERS_SHOWROOM_ELIGIBLE_LINK_TESTID,
  shopPartnersShowroomEligibleForMatrixHref,
} from '@/lib/platform-core-ports/b2b/shop-partners-wave-xa';
import {
  WAVE_YP_MARKETROOM_RU,
  WAVE_YP_PLATFORM_B2B_RU,
  WAVE_YP_SHOP_SC_PARTNERS_B2B_PEER_STRIP_TESTID,
} from '@/lib/platform-core-ports/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Shop partners workspace · platform B2B + monetization spine. */
export function ShopScPartnersB2bPeerStrip({ collectionId, orderId }: Props) {
  const partners = buildShopB2bPartnersSession({ collectionId, orderId });
  const platform = buildPlatformB2bHubSession({ collectionId, orderId });

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={WAVE_YP_SHOP_SC_PARTNERS_B2B_PEER_STRIP_TESTID}
    >
      <Link
        href={platform.hubHref}
        data-testid="shop-sc-partners-platform-hub-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_PLATFORM_B2B_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={partners.platformMarketroomHref}
        data-testid="shop-sc-partners-marketroom-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_MARKETROOM_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={partners.shopMatrixHref}
        data-testid="shop-sc-partners-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shopPartnersShowroomEligibleForMatrixHref({ collectionId })}
        data-testid={SHOP_SC_PARTNERS_SHOWROOM_ELIGIBLE_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        {SHOP_SC_PARTNERS_ELIGIBLE_MATRIX_PEER_LABEL_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={platform.buyPathHref}
        data-testid="shop-sc-partners-checkout-link"
        className={hubGadget.goldenLink}
      >
        Оформление
      </Link>
    </div>
  );
}
