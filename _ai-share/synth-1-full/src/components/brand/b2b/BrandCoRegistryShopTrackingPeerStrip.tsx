'use client';

import Link from 'next/link';
import { buildBrandOrderCommsSession } from '@/lib/b2b/brand-order-comms';
import {
  BRAND_CO_REGISTRY_SHOP_TRACKING_LINK_TESTID,
  BRAND_CO_REGISTRY_SHOP_TRACKING_PEER_STRIP_TESTID,
} from '@/lib/b2b/brand-co-registry-amend-wl';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Brand CO registry · peer links to shop tracking/matrix (symmetry shop-op-tracking-spine-peer-strip). */
export function BrandCoRegistryShopTrackingPeerStrip({ collectionId, orderId }: Props) {
  const oid = orderId?.trim() ?? '';
  if (!oid) return null;

  const session = buildBrandOrderCommsSession({ collectionId, orderId: oid });

  return (
    <div className={hubGadget.goldenPath} data-testid={BRAND_CO_REGISTRY_SHOP_TRACKING_PEER_STRIP_TESTID}>
      <Link
        href={session.shopTrackingHref}
        data-testid={BRAND_CO_REGISTRY_SHOP_TRACKING_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        Трекинг магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopMatrixHref}
        data-testid="brand-co-registry-shop-matrix-link"
        className={hubGadget.goldenLink}
      >
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={session.shopChatHref}
        data-testid="brand-co-registry-shop-chat-link"
        className={hubGadget.goldenLink}
      >
        Чат с магазином
      </Link>
    </div>
  );
}
