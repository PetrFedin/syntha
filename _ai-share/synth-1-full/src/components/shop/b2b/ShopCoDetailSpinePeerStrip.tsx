'use client';

import Link from 'next/link';
import { buildShopCollaborativeOrderSession } from '@/lib/b2b/shop-collaborative-order';
import { shopOrderCommsFeatureHref } from '@/lib/b2b/shop-order-comms';
import { ShopCoGoldenPathStrip } from '@/components/shop/b2b/ShopCoGoldenPathStrip';
import { SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE } from '@/lib/platform/wave-yk-shop-co-golden-path';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  orderId: string;
  collectionId: string;
};

/** Карточка заказа · golden path + peers (совместный заказ, чат). */
export function ShopCoDetailSpinePeerStrip({ orderId, collectionId }: Props) {
  const collaborative = buildShopCollaborativeOrderSession({ collectionId, orderId });
  const chatHref = shopOrderCommsFeatureHref(orderId, 'chat', collectionId);

  return (
    <div className="space-y-2">
      <ShopCoGoldenPathStrip
        collectionId={collectionId}
        orderId={orderId}
        stripTestId={SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.detail.strip}
        legacyLinkTestIds={{
          matrix: SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.detail.matrix,
          checkout: SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.detail.checkout,
          replenishment: SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.detail.replenishment,
          tracking: SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.detail.tracking,
        }}
      />
      <div className={hubGadget.goldenPath} data-testid="shop-co-detail-peer-strip">
        <Link
          href={collaborative.sessionHref}
          data-testid="shop-co-detail-collaborative-link"
          className={hubGadget.goldenLink}
        >
          Совместный заказ
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link href={chatHref} data-testid="shop-co-detail-order-chat-link" className={hubGadget.goldenLink}>
          Чат заказа
        </Link>
      </div>
    </div>
  );
}
