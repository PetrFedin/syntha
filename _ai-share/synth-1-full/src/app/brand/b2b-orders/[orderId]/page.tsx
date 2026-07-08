'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import { BrandB2bOrderDetailCorePage } from '@/app/brand/b2b-orders/[orderId]/brand-order-detail-core';
import { PlatformCoreLegacyB2bOrderRedirect } from '@/components/platform/PlatformCoreLegacyB2bOrderRedirect';

const BrandB2bOrderDetailLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/brand/b2b-orders/[orderId]/brand-order-detail-legacy').then(
      (m) => m.BrandB2bOrderDetailLegacyPage
    ),
  { ssr: false }
);

export default function B2BOrderDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(paramsPromise);

  if (isPlatformCoreMode()) {
    if (isPlatformCorePgB2bOrder(orderId)) {
      return <BrandB2bOrderDetailCorePage orderId={orderId} />;
    }
    return <PlatformCoreLegacyB2bOrderRedirect roleId="brand" orderId={orderId} />;
  }

  return <BrandB2bOrderDetailLegacyPage orderId={orderId} />;
}
