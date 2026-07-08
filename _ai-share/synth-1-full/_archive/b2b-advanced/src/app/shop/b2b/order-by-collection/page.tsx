'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bOrderByCollectionLegacyPage = dynamic(
  () =>
    import(
      '@/_archive/platform-core-legacy/app/shop/b2b/order-by-collection/order-by-collection-legacy'
    ).then((m) => m.ShopB2bOrderByCollectionLegacyPage),
  { ssr: false }
);

export default function B2BOrderByCollectionPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bOrderByCollection} />;
  }
  return <ShopB2bOrderByCollectionLegacyPage />;
}
