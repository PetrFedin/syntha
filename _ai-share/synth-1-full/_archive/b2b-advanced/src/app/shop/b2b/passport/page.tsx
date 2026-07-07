'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bPassportLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/passport/passport-legacy').then(
      (m) => m.ShopB2bPassportLegacyPage
    ),
  { ssr: false }
);

export default function ShopB2BPassportPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bPassport} />;
  }
  return <ShopB2bPassportLegacyPage />;
}
