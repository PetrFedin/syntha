'use client';

import Link from 'next/link';
import { buildPlatformB2bHubSession } from '@/lib/platform-core-ports/b2b/platform-b2b-hub';
import {
  WAVE_YF_MARKETROOM_RU,
  WAVE_YF_PLATFORM_B2B_RU,
  WAVE_YF_SHOP_SC_B2B_PEER_STRIP_TESTID,
} from '@/lib/platform-core-ports/platform/wave-yf-hub-compact-ru';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  /** Wave YF: golden path уже содержит «Оформление» — только hub + marketroom. */
  omitCheckout?: boolean;
};

/** Shop SC cabinet · platform hub + marketroom + checkout. */
export function ShopScCabinetB2bPeerStrip({ collectionId, omitCheckout = false }: Props) {
  const session = buildPlatformB2bHubSession({ collectionId });

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_YF_SHOP_SC_B2B_PEER_STRIP_TESTID}>
      <Link href={session.hubHref} data-testid="shop-sc-cabinet-platform-hub-link" className={hubGadget.goldenLink}>
        {WAVE_YF_PLATFORM_B2B_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={session.marketroomShowcaseHref} data-testid="shop-sc-cabinet-marketroom-link" className={hubGadget.goldenLink}>
        {WAVE_YF_MARKETROOM_RU}
      </Link>
      {!omitCheckout ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden>
            ·
          </span>
          <Link href={session.buyPathHref} data-testid="shop-sc-cabinet-checkout-link" className={hubGadget.goldenLink}>
            Оформление
          </Link>
        </>
      ) : null}
    </div>
  );
}
