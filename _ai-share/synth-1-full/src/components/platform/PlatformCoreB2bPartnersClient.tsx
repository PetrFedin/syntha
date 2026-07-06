'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUIState } from '@/providers/ui-state';
import {
  PlatformB2bPartnersMarketroomPanel,
  PlatformB2bPartnersOnboardingPanel,
  PlatformB2bPartnersShopRosterPanel,
} from '@/components/platform/PlatformB2bPartnersPanels';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  PlatformB2bPartnersGoldenPathStrip,
  platformB2bPartnersGoldenPathStepFromFeature,
} from '@/components/platform/PlatformB2bPartnersGoldenPathStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform-core-ports/platform/pillar-capability-workspaces';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

function PlatformB2bPartnersWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const ctx = { collectionId, role: 'shop' as const, surface: 'platform' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('platform-b2b-partners');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="platform-b2b-partners"
      ctx={ctx}
      className="px-4 pt-4"
      crossLinksTitle="Marketroom · shop roster · matrix"
    >
      <div className="mb-4 px-4">
        <PlatformB2bPartnersGoldenPathStrip
          collectionId={collectionId}
          activeStep={platformB2bPartnersGoldenPathStepFromFeature(activeFeatureId)}
        />
      </div>
      {activeFeatureId === 'directory' ? (
        <PlatformB2bPartnersOnboardingPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'shop-roster' ? (
        <PlatformB2bPartnersShopRosterPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'marketroom' ? (
        <PlatformB2bPartnersMarketroomPanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

function PlatformCoreB2bPartnersWorkspaceClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.get(PILLAR_CAPABILITY_FEATURE_PARAM)) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'directory');
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  return (
    <Suspense fallback={null}>
      <PlatformB2bPartnersWorkspaceBody />
    </Suspense>
  );
}

/** B2B · Партнёры — PG onboarding directory + shop roster + marketroom bridge. */
export function PlatformCoreB2bPartnersClient() {
  const { setViewRole } = useUIState();

  useEffect(() => {
    setViewRole('b2b');
  }, [setViewRole]);

  return (
    <div data-testid="platform-core-b2b-partners" className="min-h-[calc(100vh-2.5rem)]">
      <Suspense fallback={null}>
        <PlatformCoreB2bPartnersWorkspaceClient />
      </Suspense>
    </div>
  );
}
