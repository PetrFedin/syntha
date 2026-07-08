'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bDiscoverCorePage } from '@/app/shop/b2b/discover/discover-core';

const DiscoverLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/discover/discover-legacy').then(
      (m) => m.ShopB2bDiscoverLegacyPage
    ),
  { ssr: false }
);

function DiscoverPageInner() {
  if (isPlatformCoreMode()) return <ShopB2bDiscoverCorePage />;
  return <DiscoverLegacyPage />;
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverPageInner />
    </Suspense>
  );
}
