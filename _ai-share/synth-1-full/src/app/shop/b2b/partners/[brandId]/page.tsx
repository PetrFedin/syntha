'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bPartnerBrandDetailCorePage } from '@/app/shop/b2b/partners/[brandId]/partner-brand-detail-core';

const ShopB2bPartnerBrandDetailLegacyPage = dynamic(
  () =>
    import('@/_archive/platform-core-legacy/app/shop/b2b/partners/[brandId]/partner-brand-detail-legacy').then(
      (m) => m.ShopB2bPartnerBrandDetailLegacyPage
    ),
  { ssr: false }
);

export default function PartnerDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = use(paramsPromise);
  if (isPlatformCoreMode()) {
    return <ShopB2bPartnerBrandDetailCorePage brandSlug={brandId} />;
  }
  return <ShopB2bPartnerBrandDetailLegacyPage params={paramsPromise} />;
}
