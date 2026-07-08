'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bOrderModeLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/order-mode/order-mode-legacy').then(
      (m) => m.ShopB2bOrderModeLegacyPage
    ),
  { ssr: false }
);

export default function B2BOrderModePage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bOrderMode} />;
  }
  return <ShopB2bOrderModeLegacyPage />;
}
