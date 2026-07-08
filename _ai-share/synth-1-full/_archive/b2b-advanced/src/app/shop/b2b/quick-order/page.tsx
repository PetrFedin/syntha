'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bQuickOrderLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/quick-order/quick-order-legacy').then(
      (m) => m.ShopB2bQuickOrderLegacyPage
    ),
  { ssr: false }
);

export default function QuickOrderPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bQuickOrder} />;
  }
  return <ShopB2bQuickOrderLegacyPage />;
}
