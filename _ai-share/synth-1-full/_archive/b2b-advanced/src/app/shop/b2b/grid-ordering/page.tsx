'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bGridOrderingLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/grid-ordering/grid-ordering-legacy').then(
      (m) => m.ShopB2bGridOrderingLegacyPage
    ),
  { ssr: false }
);

export default function GridOrderingPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bGridOrdering} />;
  }
  return <ShopB2bGridOrderingLegacyPage />;
}
