'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bLookbooksLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/lookbooks/lookbooks-legacy').then(
      (m) => m.ShopB2bLookbooksLegacyPage
    ),
  { ssr: false }
);

export default function ShopLookbooksPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bLookbooks} />;
  }
  return <ShopB2bLookbooksLegacyPage />;
}
