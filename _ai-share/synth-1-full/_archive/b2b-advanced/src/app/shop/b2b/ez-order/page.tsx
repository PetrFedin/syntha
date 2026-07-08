'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bEzOrderLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/ez-order/ez-order-legacy').then(
      (m) => m.ShopB2bEzOrderLegacyPage
    ),
  { ssr: false }
);

export default function EzOrderPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bEzOrder} />;
  }
  return <ShopB2bEzOrderLegacyPage />;
}
