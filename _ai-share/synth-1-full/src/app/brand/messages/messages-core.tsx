'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import MessagesPage from '@/components/user/messages-os';
import { PlatformCoreCommsWorkspaceExtras } from '@/components/platform/PlatformCoreCommsWorkspaceExtras';
import { BrandCommsEntityThreadsPanel } from '@/components/brand/merch/BrandCommsEntityThreadsPanel';
import { PlatformCoreCommsUniversalInboxStrip } from '@/components/platform/PlatformCoreCommsUniversalInboxStrip';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { PlatformCoreWorkspaceStripsGate } from '@/components/platform/PlatformCoreWorkspaceStripsGate';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { BrandMessagesRuWorkspaceBannerWhenNoUrl } from '@/components/brand/messages/BrandMessagesRuWorkspaceBanner';
import {
  BrandCommsWorkspaceGoldenPathStrip,
  brandCommsGoldenPathStepFromFeature,
} from '@/components/brand/messages/BrandCommsWorkspaceGoldenPathStrip';
import { BrandCmOrderContextPeerStrip } from '@/components/platform/BrandCmOrderContextPeerStrip';
import { BrandCmSectionGroupsSpinePeerStrip } from '@/components/platform/BrandCmSectionGroupsSpinePeerStrip';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { ROUTES } from '@/lib/routes';
import { PLATFORM_CORE_MESSAGES_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

type ThreadsSource = 'postgres' | 'memory' | 'empty' | 'unavailable' | 'loading';

function useBrandMessagesThreadsSource(): ThreadsSource {
  const [source, setSource] = useState<ThreadsSource>('loading');

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/brand/messages/threads', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return { source: 'unavailable' as const };
        return (await res.json()) as { source?: ThreadsSource };
      })
      .then((json) => {
        if (!cancelled) setSource(json.source ?? 'empty');
      })
      .catch(() => {
        if (!cancelled) setSource('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return source;
}

function BrandMessagesCoreContent() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
  });
  const orderId =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    searchParams.get('wholesaleOrderId')?.trim() ||
    '';
  const source = useBrandMessagesThreadsSource();
  const coreMode = isPlatformCoreMode();
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-comms-workspace');
  const workspaceCtx = { collectionId, orderId: orderId || undefined };

  if (source === 'loading') {
    return <div className="text-text-secondary mx-4 p-6 text-sm">Загрузка сообщений…</div>;
  }

  if (source === 'memory') {
    return (
      <div
        className="mx-4 rounded-lg border border-amber-200 bg-amber-50/90 p-6 text-sm text-amber-950"
        data-testid="brand-messages-core-fail-closed"
        role="alert"
      >
        <p className="font-semibold">Сообщения недоступны</p>
        <p className="text-text-secondary mt-1">
          {PLATFORM_CORE_MESSAGES_UNAVAILABLE_RU}
        </p>
        <p className="mt-3">
          <Link href={ROUTES.brand.productionWorkshop2} className="text-accent-primary underline">
            Перейти в разработку коллекции →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-comms-workspace"
      ctx={workspaceCtx}
      crossLinksTitle="Связь · столп 5"
    >
      {!coreMode ? (
        <PlatformCoreWorkspaceStripsGate>
          <div className="mb-4">
            <BrandCommsWorkspaceGoldenPathStrip
              collectionId={collectionId}
              orderId={orderId || undefined}
              activeStep={brandCommsGoldenPathStepFromFeature(activeFeatureId)}
            />
          </div>
        </PlatformCoreWorkspaceStripsGate>
      ) : null}
      {!coreMode ? (
        <PlatformCoreWorkspaceStripsGate>
          <PlatformCoreCommsUniversalInboxStrip variant="brand" />
        </PlatformCoreWorkspaceStripsGate>
      ) : null}
      {orderId && !coreMode ? (
        <PlatformCoreWorkspaceStripsGate>
          <div className="mb-4 space-y-2">
            <BrandCmSectionGroupsSpinePeerStrip collectionId={collectionId} orderId={orderId} />
            <BrandCmOrderContextPeerStrip collectionId={collectionId} orderId={orderId} />
          </div>
        </PlatformCoreWorkspaceStripsGate>
      ) : null}
      {activeFeatureId === 'inbox' ? (
        <>
          <BrandMessagesRuWorkspaceBannerWhenNoUrl />
          <MessagesPage key={`brand-messages-${collectionId}`} initialRole="brand" slimCore />
        </>
      ) : null}
      {activeFeatureId === 'entities' ? <BrandCommsEntityThreadsPanel /> : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export function BrandMessagesCorePage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <PlatformCoreListChrome highlightRole="brand" pillarId="comms">
        <PlatformCoreCommsWorkspaceExtras variant="brand" />
        <Suspense fallback={null}>
          <BrandMessagesCoreContent />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
