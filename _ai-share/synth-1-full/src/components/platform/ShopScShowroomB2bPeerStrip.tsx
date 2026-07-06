'use client';

import Link from 'next/link';
import { buildPlatformB2bHubSession } from '@/lib/platform-core-ports/b2b/platform-b2b-hub';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import { coercePlatformCoreNativeHref } from '@/lib/platform-core-native-href';
import {
  WAVE_YP_MARKETROOM_RU,
  WAVE_YP_PARTNERS_RU,
  WAVE_YP_PLATFORM_B2B_RU,
  WAVE_YP_SHOP_SC_SHOWROOM_B2B_PEER_STRIP_TESTID,
} from '@/lib/platform-core-ports/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Shop showroom · platform B2B + checkout + registry peers. */
export function ShopScShowroomB2bPeerStrip({ collectionId, orderId }: Props) {
  const platform = buildPlatformB2bHubSession({ collectionId, orderId });
  const session = buildShopShowroomBuySession({ collectionId, orderId });
  const checkoutHref = coercePlatformCoreNativeHref(session.checkoutHref);

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_YP_SHOP_SC_SHOWROOM_B2B_PEER_STRIP_TESTID}>
      <Link href={platform.hubHref} data-testid="shop-sc-showroom-platform-hub-link" className={hubGadget.goldenLink}>
        {WAVE_YP_PLATFORM_B2B_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={checkoutHref} data-testid="shop-sc-showroom-checkout-link" className={hubGadget.goldenLink}>
        Оформление
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={platform.marketroomShowcaseHref} data-testid="shop-sc-showroom-marketroom-link" className={hubGadget.goldenLink}>
        {WAVE_YP_MARKETROOM_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={platform.partnersDirectoryHref} data-testid="shop-sc-showroom-partners-directory-link" className={hubGadget.goldenLink}>
        {WAVE_YP_PARTNERS_RU}
      </Link>
    </div>
  );
}
