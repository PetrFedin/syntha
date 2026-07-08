'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCoreLegacyPathRedirect } from '@/components/platform/PlatformCoreLegacyPathRedirect';
import { resolveBrandSuppliersLegacyRedirect } from '@/lib/platform-core-brand-suppliers-legacy-redirect';

function BrandSuppliersCoreRedirectInner() {
  const searchParams = useSearchParams();
  const redirect = resolveBrandSuppliersLegacyRedirect(searchParams.get('collection'));

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-4 px-4 py-6">
      <PlatformCoreListChrome highlightRole="brand" pillarId="development">
        <PlatformCoreLegacyPathRedirect
          targetHref={redirect.href}
          testId={redirect.testId}
          message={redirect.messageRu}
        />
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}

/** Core: mock suppliers hub → factory materials BOM (PG). */
export function BrandSuppliersCoreRedirect() {
  return (
    <Suspense fallback={<div className="text-text-secondary p-6 text-sm">Загрузка…</div>}>
      <BrandSuppliersCoreRedirectInner />
    </Suspense>
  );
}
