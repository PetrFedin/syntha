'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { PlatformCoreChromeShell } from '@/components/platform/usePlatformCoreChainOverview';
import { PlatformCorePlannerPanel } from '@/components/platform/PlatformCorePlannerPanel';
import { resolvePlatformCoreCollectionId, PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';

export function PlatformPlannerPageClient() {
  const searchParams = useSearchParams();
  const collectionId = resolvePlatformCoreCollectionId(searchParams.get('collection'));
  const hubHref =
    collectionId !== PLATFORM_CORE_DEMO.collectionId
      ? `/platform?collection=${encodeURIComponent(collectionId)}`
      : '/platform';

  return (
    <PlatformCoreChromeShell collectionId={collectionId}>
      <div className="bg-bg-surface pb-safe min-h-[calc(100vh-2.5rem)] w-full min-w-0 px-4 md:px-6 md:pb-6">
        <header className="border-border-subtle sticky top-0 z-10 -mx-4 border-b bg-bg-surface/95 px-4 py-2 backdrop-blur-sm md:-mx-6 md:px-6">
          <nav aria-label="Навигация" className={hubCabinet.contextBar}>
            <Link href={hubHref} data-testid="platform-planner-back-hub" className={hubCabinet.contextBarBack}>
              <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden />
              Hub
            </Link>
            <span className={hubCabinet.contextBarSep} aria-hidden>
              ·
            </span>
            <span className="text-text-primary font-semibold">План</span>
          </nav>
        </header>
        <section
          data-testid="platform-core-planner-page"
          aria-label="План Platform Core"
          className="mt-4 min-w-0 overflow-x-clip"
        >
          <PlatformCorePlannerPanel collectionId={collectionId} />
        </section>
      </div>
    </PlatformCoreChromeShell>
  );
}
