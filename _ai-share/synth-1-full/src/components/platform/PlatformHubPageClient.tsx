'use client';

import { PlatformCoreHubAlertsChips } from '@/components/platform/PlatformCoreHubAlertsChips';
import { PlatformCoreChromeShell } from '@/components/platform/usePlatformCoreChainOverview';
import { PlatformCoreHubRolesAuditPanel } from '@/components/platform/PlatformCoreHubRolesAuditPanel';
import { PlatformCoreSynthaStyleBanner } from '@/components/platform/PlatformCoreSynthaStyleBanner';
import { usePlatformCoreHubViews } from '@/hooks/use-platform-core-hub-views';
import { useStripDefaultCollectionFromUrl } from '@/hooks/use-strip-default-collection-url';
import { resolvePlatformCoreCollectionId } from '@/lib/platform-core-hub-matrix';
import { useSearchParams } from 'next/navigation';

export function PlatformHubPageClient() {
  const searchParams = useSearchParams();
  const hubCollectionId = resolvePlatformCoreCollectionId(searchParams.get('collection'));
  const { hubViews } = usePlatformCoreHubViews();

  useStripDefaultCollectionFromUrl('/platform');

  const showRoles = hubViews.business || hubViews.audit;
  const showAudit = hubViews.audit;

  return (
    <PlatformCoreChromeShell collectionId={hubCollectionId}>
      <div className="bg-bg-surface overflow-x-clip pb-safe min-h-[calc(100vh-2.5rem)] w-full min-w-0 px-4 md:px-6 md:pb-6">
        <div data-testid="platform-core-hub-main-column" className="space-y-2 md:space-y-4">
          <PlatformCoreSynthaStyleBanner />

          <PlatformCoreHubRolesAuditPanel
            collectionId={hubCollectionId}
            showRoles={showRoles}
            showAudit={showAudit}
          />

          <PlatformCoreHubAlertsChips collectionId={hubCollectionId} />
        </div>
      </div>
    </PlatformCoreChromeShell>
  );
}
