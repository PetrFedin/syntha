'use client';

import Link from 'next/link';
import { buildBrandCrmSegmentationSession } from '@/lib/platform-core-ports/b2b/brand-crm-segmentation';
import { BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_PEER_LINK_TESTID } from '@/lib/platform-core-ports/b2b/brand-co-crm-wave-xb';
import { buildBrandOrderCommsSession } from '@/lib/platform-core-ports/b2b/brand-order-comms';
import { buildShopShowroomBuySession } from '@/lib/platform-core-ports/b2b/shop-showroom-buy';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  orderId?: string;
};

/** Brand CRM workspace · CO registry + shop monetization + order comms peers. */
export function BrandCoCrmCoPeerStrip({ collectionId, orderId }: Props) {
  const crm = buildBrandCrmSegmentationSession({ collectionId });
  const shop = buildShopShowroomBuySession({ collectionId, orderId });
  const comms = buildBrandOrderCommsSession({ collectionId, orderId });

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-co-crm-co-peer-strip">
      <Link href={comms.registryHref} data-testid="brand-co-crm-registry-link" className={hubGadget.goldenLink}>
        Реестр
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={shop.checkoutHref} data-testid="brand-co-crm-shop-checkout-link" className={hubGadget.goldenLink}>
        Оформление магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={shop.matrixHref} data-testid="brand-co-crm-shop-matrix-link" className={hubGadget.goldenLink}>
        Матрица магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={shop.showroomHref}
        data-testid={BRAND_CO_CRM_LINESHEET_VISIBILITY_SHOP_SHOWROOM_PEER_LINK_TESTID}
        className={hubGadget.goldenLink}
      >
        Шоурум магазина
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={crm.collaborativeHref} data-testid="brand-co-crm-collaborative-link" className={hubGadget.goldenLink}>
        Совместный заказ
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={comms.chatHref} data-testid="brand-co-crm-order-comms-link" className={hubGadget.goldenLink}>
        Чат по заказу
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={crm.brandLandedMarginHref} data-testid="brand-co-crm-landed-margin-link" className={hubGadget.goldenLink}>
        Маржа с доставкой
      </Link>
    </div>
  );
}
