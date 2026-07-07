'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { shopB2bOrderHref } from '@/lib/routes';
import { PlatformCoreLegacyTailPage } from '@/components/platform/PlatformCoreLegacyTailPage';

const ShopB2bOrdersOrderDetailLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b-orders/[orderId]/shop-b2b-orders-order-detail-legacy').then(
      (m) => m.ShopB2bOrdersOrderDetailLegacyPage
    ),
  { ssr: false }
);

export default function ShopB2BOrderDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(paramsPromise);

  if (isPlatformCoreMode()) {
    return (
      <PlatformCoreLegacyTailPage
        highlightRole="shop"
        pillarId="collection_order"
        maxWidth="5xl"
        targetHref={shopB2bOrderHref(orderId)}
        testId="platform-core-b2b-order-legacy-redirect"
        message={`Легаси карточка заказа → ${orderId}`}
      />
    );
  }

  return <ShopB2bOrdersOrderDetailLegacyPage orderId={orderId} />;
}
