'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bWhiteboardLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/whiteboard/whiteboard-legacy').then(
      (m) => m.ShopB2bWhiteboardLegacyPage
    ),
  { ssr: false }
);

export default function WhiteboardPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bWhiteboard} />;
  }
  return <ShopB2bWhiteboardLegacyPage />;
}
