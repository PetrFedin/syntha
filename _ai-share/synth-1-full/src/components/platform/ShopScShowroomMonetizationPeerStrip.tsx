'use client';

import Link from 'next/link';
import { buildShopB2bPartnersSession } from '@/lib/platform-core-ports/b2b/shop-b2b-partners-workspace';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import {
  WAVE_YP_LINESHEET_RU,
  WAVE_YP_PARTNERS_RU,
  WAVE_YP_SHOP_SC_SHOWROOM_MONETIZATION_PEER_STRIP_TESTID,
} from '@/lib/platform-core-ports/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Showroom · partners + linesheet + replenishment monetization peers. */
export function ShopScShowroomMonetizationPeerStrip({ collectionId, orderId }: Props) {
  const session = buildShopShowroomBuySession({ collectionId, orderId });
  const partners = buildShopB2bPartnersSession({ collectionId, orderId });

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={WAVE_YP_SHOP_SC_SHOWROOM_MONETIZATION_PEER_STRIP_TESTID}
    >
      <Link
        href={session.linesheetHref}
        data-testid="shop-sc-showroom-linesheet-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_LINESHEET_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={partners.discoverPageHref}
        data-testid="shop-sc-showroom-partners-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_PARTNERS_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.collaborativeApprovalsHref}
        data-testid="shop-sc-showroom-collaborative-link"
        className={hubGadget.goldenLink}
      >
        Согласования
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.replenishmentAlertsHref}
        data-testid="shop-sc-showroom-replenishment-link"
        className={hubGadget.goldenLink}
      >
        Пополнение
      </Link>
    </div>
  );
}
