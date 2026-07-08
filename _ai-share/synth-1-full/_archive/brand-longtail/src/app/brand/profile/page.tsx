'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { BrandProfileCorePage } from '@/app/brand/profile/brand-profile-core';

const BrandProfileLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/brand/profile/brand-profile-legacy').then(
      (m) => m.BrandProfileLegacyPage
    ),
  { ssr: false }
);

export default function BrandProfilePage() {
  if (isPlatformCoreMode()) {
    return (
      <Suspense fallback={null}>
        <BrandProfileCorePage />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={null}>
      <BrandProfileLegacyPage />
    </Suspense>
  );
}
