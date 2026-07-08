'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FactoryWorkshop2SampleQueuePanel } from '@/components/factory/FactoryWorkshop2SampleQueuePanel';
import { FactoryWorkshop2ProductionHandoffPanel } from '@/components/factory/FactoryWorkshop2ProductionHandoffPanel';
import { ManufacturerHandoffBridgePanel } from '@/components/factory/ManufacturerHandoffBridgePanel';
import { ManufacturerQcGatePanel } from '@/components/factory/ManufacturerQcGatePanel';
import { ManufacturerTechPackAckWorkspacePanel } from '@/components/factory/ManufacturerTechPackAckWorkspacePanel';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { getPlatformCoreDemo, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { usePlatformCoreHashScroll } from '@/hooks/use-platform-core-hash-scroll';
import {
  parseFactorySampleQueueHash,
  WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH,
} from '@/lib/platform/wave-xc-mfr-sample-status-patch';
import {
  ManufacturerHandoffQueueGoldenPathStrip,
  manufacturerHandoffGoldenPathStepFromFeature,
} from '@/components/factory/ManufacturerHandoffQueueGoldenPathStrip';

function pillarForFeature(featureId: string): CoreHubPillarId {
  return featureId === 'sample-queue' ? 'development' : 'order_production';
}

function FactoryProductionWorkspaceBody() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const demo = getPlatformCoreDemo(collectionId);
  const factoryId = searchParams.get('factoryId')?.trim() || demo.factoryId;
  const orderId =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    searchParams.get('wholesaleOrderId')?.trim() ||
    undefined;
  const articleId = searchParams.get('article')?.trim() || demo.demoArticleId;
  const ctx = { collectionId, orderId, factoryId };
  const { activeFeatureId } = usePillarCapabilityWorkspace('manufacturer-handoff-queue');
  const pillarId = useMemo(() => pillarForFeature(activeFeatureId), [activeFeatureId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    if (searchParams.get(PILLAR_CAPABILITY_FEATURE_PARAM)) return;
    const sp = new URLSearchParams(searchParams.toString());
    if (hash === 'handoff-queue') {
      sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'handoff');
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      return;
    }
    const sampleHash = parseFactorySampleQueueHash(hash);
    if (sampleHash?.section === WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH) {
      sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'sample-queue');
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  usePlatformCoreHashScroll(['sample-queue', 'handoff-queue'], {
    itemHashPrefix: WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH,
  });

  return (
    <PlatformCoreListChrome highlightRole="manufacturer" pillarId={pillarId}>
      <div className="p-4" data-testid="factory-production-core">
        <PillarCapabilityWorkspaceChrome
          workspaceId="manufacturer-handoff-queue"
          ctx={ctx}
          crossLinksTitle="Передача → гейт КК → трекинг магазина"
        >
          <div className="mb-4">
            <ManufacturerHandoffQueueGoldenPathStrip
              factoryId={factoryId}
              orderId={orderId}
              collectionId={collectionId}
              articleId={articleId}
              activeStep={manufacturerHandoffGoldenPathStepFromFeature(activeFeatureId)}
            />
          </div>
          {activeFeatureId === 'sample-queue' ? (
            <section id="sample-queue" className="scroll-mt-4">
              <FactoryWorkshop2SampleQueuePanel factoryId={factoryId} />
            </section>
          ) : null}
          {activeFeatureId === 'handoff' ? (
            <section id="handoff-queue" className="scroll-mt-4">
              <FactoryWorkshop2ProductionHandoffPanel
                factoryId={factoryId}
                collectionId={collectionId}
                orderId={orderId}
              />
            </section>
          ) : null}
          {activeFeatureId === 'orders-bridge' ? (
            <ManufacturerHandoffBridgePanel
              factoryId={factoryId}
              orderId={orderId}
              collectionId={collectionId}
            />
          ) : null}
          {activeFeatureId === 'qc-gate' ? (
            <ManufacturerQcGatePanel
              factoryId={factoryId}
              collectionId={collectionId}
              orderId={orderId}
              articleId={articleId}
            />
          ) : null}
          {activeFeatureId === 'techpack-ack' ? (
            <ManufacturerTechPackAckWorkspacePanel
              factoryId={factoryId}
              collectionId={collectionId}
              orderId={orderId}
              articleId={articleId}
            />
          ) : null}
        </PillarCapabilityWorkspaceChrome>
      </div>
    </PlatformCoreListChrome>
  );
}

export function FactoryProductionCorePage() {
  return (
    <Suspense fallback={null}>
      <FactoryProductionWorkspaceBody />
    </Suspense>
  );
}
