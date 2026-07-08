'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bCreateOrderLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/create-order/create-order-legacy').then(
      (m) => m.ShopB2bCreateOrderLegacyPage
    ),
  { ssr: false }
);

export default function B2BCreateOrderPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bCreateOrder} />;
  }
  return <ShopB2bCreateOrderLegacyPage />;
}
