'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUIState } from '@/providers/ui-state';
import { PlatformCorePublishedShowroom } from '@/components/platform/PlatformCorePublishedShowroom';
import {
  PlatformB2bMarketroomBuyPathPanel,
  PlatformB2bMarketroomDiscoverPanel,
} from '@/components/platform/PlatformB2bMarketroomPanels';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  PlatformB2bMarketroomGoldenPathStrip,
  platformB2bMarketroomGoldenPathStepFromFeature,
} from '@/components/platform/PlatformB2bMarketroomGoldenPathStrip';
import { PlatformB2bMarketroomCoSpinePeerStrip } from '@/components/platform/PlatformB2bMarketroomCoSpinePeerStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform-core-ports/platform/pillar-capability-workspaces';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

function PlatformB2bMarketroomWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const orderId = searchParams.get('order')?.trim() || undefined;
  const ctx = { collectionId, orderId, role: 'shop' as const, surface: 'platform' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('platform-b2b-marketroom');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="platform-b2b-marketroom"
      ctx={ctx}
      className="px-4 pt-4"
      crossLinksTitle="Showroom · matrix · tracking"
    >
      <div className="mb-4 px-4">
        <PlatformB2bMarketroomGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={platformB2bMarketroomGoldenPathStepFromFeature(activeFeatureId)}
        />
        <PlatformB2bMarketroomCoSpinePeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'showcase' ? (
        <div data-testid="platform-core-b2b-published-catalog">
          <PlatformCorePublishedShowroom variant="shop" collectionId={collectionId} />
        </div>
      ) : null}
      {activeFeatureId === 'discover' ? (
        <PlatformB2bMarketroomDiscoverPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'buy-path' ? (
        <PlatformB2bMarketroomBuyPathPanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

function PlatformCoreB2bMarketroomWorkspaceClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.get(PILLAR_CAPABILITY_FEATURE_PARAM)) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'showcase');
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  return (
    <Suspense fallback={null}>
      <PlatformB2bMarketroomWorkspaceBody />
    </Suspense>
  );
}

/** B2B · опубликованные артикулы брендов (PG published-articles), не home Showroom. */
export function PlatformCoreB2bMarketroomClient() {
  const { setViewRole } = useUIState();

  useEffect(() => {
    setViewRole('b2b');
  }, [setViewRole]);

  return (
    <div data-testid="platform-core-b2b-marketroom" className="min-h-[calc(100vh-2.5rem)]">
      <Suspense fallback={null}>
        <PlatformCoreB2bMarketroomWorkspaceClient />
      </Suspense>
    </div>
  );
}
