'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FactoryProductionOrdersCorePage } from '@/app/factory/production/orders/factory-production-orders-core';
import { ManufacturerProductionAttachTzStrip } from '@/components/factory/ManufacturerProductionAttachTzStrip';
import { MfrOpProductionOrdersHandoffPeerStrip } from '@/components/factory/MfrOpProductionOrdersHandoffPeerStrip';
import { ManufacturerCalendarGanttBridgeStrip } from '@/components/factory/manufacturer/ManufacturerCalendarGanttBridgeStrip';
import {
  ManufacturerProductionCutTicketPanel,
  ManufacturerProductionWipPanel,
} from '@/components/factory/ManufacturerProductionOpsPanels';
import {
  ManufacturerProductionOpsGoldenPathStrip,
  manufacturerProductionOpsGoldenPathStepFromFeature,
} from '@/components/factory/ManufacturerProductionOpsGoldenPathStrip';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { getPlatformCoreDemo, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

function FactoryProductionOrdersWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const demo = getPlatformCoreDemo(collectionId);
  const factoryId = searchParams.get('factoryId')?.trim() || demo.factoryId;
  const orderId =
    searchParams.get('order')?.trim() || searchParams.get('orderId')?.trim() || demo.demoOrderId;
  const articleId = searchParams.get('article')?.trim() || demo.demoArticleId;
  const ctx = { collectionId, orderId, factoryId, role: 'manufacturer' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('manufacturer-production-ops');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="manufacturer-production-ops"
      ctx={ctx}
      crossLinksTitle="Очередь передачи · техкарта бренда · трекинг магазина"
      beforeTabs={<B2bOrderUrlContextBanner variant="manufacturer" />}
    >
      <div className="mb-4 space-y-3">
        <ManufacturerProductionOpsGoldenPathStrip
          factoryId={factoryId}
          orderId={orderId}
          collectionId={collectionId}
          articleId={articleId}
          activeStep={manufacturerProductionOpsGoldenPathStepFromFeature(activeFeatureId)}
        />
        <MfrOpProductionOrdersHandoffPeerStrip
          factoryId={factoryId}
          collectionId={collectionId}
          articleId={articleId}
          orderId={orderId}
        />
        <ManufacturerCalendarGanttBridgeStrip
          collectionId={collectionId}
          orderId={orderId}
          factoryId={factoryId}
          articleId={articleId}
        />
      </div>
      {activeFeatureId === 'orders' ? (
        <div className="space-y-4">
          <ManufacturerProductionAttachTzStrip
            collectionId={collectionId}
            articleId={articleId}
            orderId={orderId}
          />
          <FactoryProductionOrdersCorePage />
        </div>
      ) : null}
      {activeFeatureId === 'wip' ? (
        <ManufacturerProductionWipPanel
          factoryId={factoryId}
          orderId={orderId}
          collectionId={collectionId}
          articleId={articleId}
        />
      ) : null}
      {activeFeatureId === 'cut-ticket' ? (
        <ManufacturerProductionCutTicketPanel
          factoryId={factoryId}
          orderId={orderId}
          collectionId={collectionId}
          articleId={articleId}
        />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export function FactoryProductionOrdersWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <FactoryProductionOrdersWorkspaceBody />
    </Suspense>
  );
}
