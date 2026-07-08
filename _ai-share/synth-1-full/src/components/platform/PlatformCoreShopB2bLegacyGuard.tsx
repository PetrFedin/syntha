'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import {
  pillarIdForShopB2bLegacyTarget,
  resolveShopB2bLegacyRedirect,
} from '@/lib/platform-core-shop-b2b-legacy-redirects';
import { PlatformCoreLegacyPathRedirect } from '@/components/platform/PlatformCoreLegacyPathRedirect';

type Props = { children: ReactNode };

function PlatformCoreShopB2bLegacyGuardInner({ children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!isPlatformCoreMode()) return <>{children}</>;

  const redirect = resolveShopB2bLegacyRedirect(pathname ?? '', searchParams.get('collection'));
  if (!redirect) return <>{children}</>;

  const pillarId = pillarIdForShopB2bLegacyTarget(redirect.target);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-4 px-4 py-6">
      <PlatformCoreListChrome highlightRole="shop" pillarId={pillarId}>
        <PlatformCoreLegacyPathRedirect
          targetHref={redirect.href}
          testId={redirect.testId}
          message={redirect.messageRu}
        />
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}

/** Core: mock B2B side-paths → showroom / matrix / orders. */
export function PlatformCoreShopB2bLegacyGuard({ children }: Props) {
  return (
    <Suspense fallback={children}>
      <PlatformCoreShopB2bLegacyGuardInner>{children}</PlatformCoreShopB2bLegacyGuardInner>
    </Suspense>
  );
}
