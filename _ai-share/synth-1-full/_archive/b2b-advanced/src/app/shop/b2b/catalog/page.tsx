'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bCatalogLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/catalog/catalog-legacy').then(
      (m) => m.ShopB2bCatalogLegacyPage
    ),
  { ssr: false }
);

export default function B2BCatalogPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bCatalog} />;
  }
  return <ShopB2bCatalogLegacyPage />;
}
