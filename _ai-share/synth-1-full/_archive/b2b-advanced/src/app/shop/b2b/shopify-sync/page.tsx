'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bShopifySyncLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/shopify-sync/shopify-sync-legacy').then(
      (m) => m.ShopB2bShopifySyncLegacyPage
    ),
  { ssr: false }
);

export default function ShopifySyncPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bShopifySync} />;
  }
  return <ShopB2bShopifySyncLegacyPage />;
}
