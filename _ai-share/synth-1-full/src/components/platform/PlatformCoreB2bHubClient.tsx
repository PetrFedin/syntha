'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUIState } from '@/providers/ui-state';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  PlatformB2bHubMarketroomBridgePanel,
  PlatformB2bHubOverviewPanel,
  PlatformB2bHubPartnersBridgePanel,
} from '@/components/platform/PlatformB2bHubPanels';
import {
  PlatformB2bHubGoldenPathStrip,
  platformB2bHubGoldenPathStepFromFeature,
} from '@/components/platform/PlatformB2bHubGoldenPathStrip';
import { PlatformB2bHubCoSpinePeerStrip } from '@/components/platform/PlatformB2bHubCoSpinePeerStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform-core-ports/platform/pillar-capability-workspaces';

function PlatformB2bHubWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const orderId =
    searchParams.get('order')?.trim() || searchParams.get('orderId')?.trim() || undefined;
  const ctx = { collectionId, orderId, surface: 'platform' as const, role: 'shop' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('platform-b2b-hub');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="platform-b2b-hub"
      ctx={ctx}
      className="px-4 pt-4"
      crossLinksTitle="Showroom · matrix · buy path"
    >
      <div className="mb-4 px-4">
        <PlatformB2bHubGoldenPathStrip
          collectionId={collectionId}
          activeStep={platformB2bHubGoldenPathStepFromFeature(activeFeatureId)}
        />
        <PlatformB2bHubCoSpinePeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'hub' ? (
        <PlatformB2bHubOverviewPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'marketroom' ? (
        <PlatformB2bHubMarketroomBridgePanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'partners' ? (
        <PlatformB2bHubPartnersBridgePanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

function PlatformCoreB2bHubWorkspaceClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.get(PILLAR_CAPABILITY_FEATURE_PARAM)) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'hub');
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  return (
    <Suspense fallback={null}>
      <PlatformB2bHubWorkspaceBody />
    </Suspense>
  );
}

export function PlatformCoreB2bHubClient() {
  const { setViewRole } = useUIState();

  useEffect(() => {
    setViewRole('b2b');
  }, [setViewRole]);

  return (
    <div data-testid="platform-core-b2b-hub" className="min-h-[calc(100vh-2.5rem)]">
      <Suspense fallback={null}>
        <PlatformCoreB2bHubWorkspaceClient />
      </Suspense>
    </div>
  );
}
