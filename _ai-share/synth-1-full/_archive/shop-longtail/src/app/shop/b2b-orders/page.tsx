'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ROUTES } from '@/lib/routes';
import { PlatformCoreLegacyTailPage } from '@/components/platform/PlatformCoreLegacyTailPage';

const ShopB2bOrdersLegacyListPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b-orders/orders-legacy-list').then(
      (m) => m.ShopB2bOrdersLegacyListPage
    ),
  { ssr: false }
);

export default function B2BOrdersPage() {
  if (isPlatformCoreMode()) {
    return (
      <PlatformCoreLegacyTailPage
        highlightRole="shop"
        pillarId="collection_order"
        maxWidth="5xl"
        targetHref={ROUTES.shop.b2bOrders}
        testId="platform-core-b2b-orders-legacy-redirect"
        message="Легаси /shop/b2b-orders → канонический реестр B2B"
      />
    );
  }

  return <ShopB2bOrdersLegacyListPage />;
}
