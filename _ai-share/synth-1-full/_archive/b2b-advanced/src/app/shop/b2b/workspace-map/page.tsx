'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';

const ShopB2bWorkspaceMapLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/workspace-map/workspace-map-legacy').then(
      (m) => m.ShopB2bWorkspaceMapLegacyPage
    ),
  { ssr: false }
);

export default function ShopB2BWorkspaceMapPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bWorkspaceMap} />;
  }
  return <ShopB2bWorkspaceMapLegacyPage />;
}
