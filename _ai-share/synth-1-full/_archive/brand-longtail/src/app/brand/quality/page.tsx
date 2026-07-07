'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { BrandQualityDeskBody } from '@/components/brand/quality/BrandQualityDeskBody';

export default function BrandQualityPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <BrandQualityDeskBody />
    </CabinetPageContent>
  );
}
