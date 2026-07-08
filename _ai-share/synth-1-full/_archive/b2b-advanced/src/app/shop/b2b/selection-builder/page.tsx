'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bSelectionBuilderLegacyPage = dynamic(
  () =>
    import(
      '@/_archive/platform-core-legacy/app/shop/b2b/selection-builder/selection-builder-legacy'
    ).then((m) => m.ShopB2bSelectionBuilderLegacyPage),
  { ssr: false }
);

export default function SelectionBuilderPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bSelectionBuilder} />;
  }
  return <ShopB2bSelectionBuilderLegacyPage />;
}
