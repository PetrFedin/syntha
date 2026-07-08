'use client';

import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bPartnersDiscoverCorePage } from '@/app/shop/b2b/partners/discover/partners-discover-core';

const ShopB2bPartnersDiscoverLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/partners/discover/partners-discover-legacy').then(
      (m) => m.ShopB2bPartnersDiscoverLegacyPage
    ),
  { ssr: false }
);

export default function DiscoveryRadarPage() {
  if (isPlatformCoreMode()) return <ShopB2bPartnersDiscoverCorePage />;
  return <ShopB2bPartnersDiscoverLegacyPage />;
}
