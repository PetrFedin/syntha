'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import { ShopB2bOrderDetailCorePage } from '@/app/shop/b2b/orders/[orderId]/shop-order-detail-core';
import { PlatformCoreLegacyB2bOrderRedirect } from '@/components/platform/PlatformCoreLegacyB2bOrderRedirect';

const ShopB2bOrderDetailLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/orders/[orderId]/shop-order-detail-legacy').then(
      (m) => m.ShopB2bOrderDetailLegacyPage
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
    if (isPlatformCorePgB2bOrder(orderId)) {
      return <ShopB2bOrderDetailCorePage orderId={orderId} />;
    }
    return <PlatformCoreLegacyB2bOrderRedirect roleId="shop" orderId={orderId} />;
  }

  return <ShopB2bOrderDetailLegacyPage orderId={orderId} />;
}
