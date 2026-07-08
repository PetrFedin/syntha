'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import {
  pillarIdForBrandB2bLegacyTarget,
  resolveBrandB2bLegacyRedirect,
} from '@/lib/platform-core-brand-b2b-legacy-redirects';
import { PlatformCoreLegacyPathRedirect } from '@/components/platform/PlatformCoreLegacyPathRedirect';

type Props = { children: ReactNode };

function PlatformCoreBrandB2bLegacyGuardInner({ children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!isPlatformCoreMode()) return <>{children}</>;

  const redirect = resolveBrandB2bLegacyRedirect(pathname ?? '', searchParams.get('collection'));
  if (!redirect) return <>{children}</>;

  const pillarId = pillarIdForBrandB2bLegacyTarget(redirect.target);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-4 px-4 py-6">
      <PlatformCoreListChrome highlightRole="brand" pillarId={pillarId}>
        <PlatformCoreLegacyPathRedirect
          targetHref={redirect.href}
          testId={redirect.testId}
          message={redirect.messageRu}
        />
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}

/** Core: mock brand B2B side-paths → orders / linesheets / retailers. */
export function PlatformCoreBrandB2bLegacyGuard({ children }: Props) {
  return (
    <Suspense fallback={children}>
      <PlatformCoreBrandB2bLegacyGuardInner>{children}</PlatformCoreBrandB2bLegacyGuardInner>
    </Suspense>
  );
}
