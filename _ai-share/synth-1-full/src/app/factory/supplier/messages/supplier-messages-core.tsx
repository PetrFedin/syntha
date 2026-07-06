'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MessagesPage from '@/components/user/messages/MessagesPage';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PlatformCoreCommsWorkspaceExtras } from '@/components/platform/PlatformCoreCommsWorkspaceExtras';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  SupplierProcurementBomPanel,
  SupplierProcurementForecastPanel,
  SupplierProcurementInboxHintPanel,
  SupplierProcurementRfqPanel,
} from '@/components/factory/supplier/SupplierProcurementWorkspacePanels';
import { SupplierMrpSupplyPanel } from '@/components/factory/supplier/SupplierMrpSupplyPanel';
import { SupplierOrderCommsPanel } from '@/components/factory/supplier/SupplierOrderCommsPanel';
import { FactoryCommsEntityThreadsPanel } from '@/components/factory/FactoryCommsEntityThreadsPanel';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { PLATFORM_CORE_DEMO, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import {
  SupplierProcurementGoldenPathStrip,
  supplierProcurementGoldenPathStepFromFeature,
} from '@/components/factory/supplier/SupplierProcurementGoldenPathStrip';
import { SupOpProcurementCoPeerStrip } from '@/components/factory/supplier/SupOpProcurementCoPeerStrip';
import { PlatformCoreCommsUniversalInboxStrip } from '@/components/platform/PlatformCoreCommsUniversalInboxStrip';

function SupplierMessagesWorkspaceContent() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const articleId = searchParams.get('article')?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const orderId = searchParams.get('order')?.trim() || undefined;
  const factoryId = PLATFORM_CORE_DEMO.factoryId;
  const ctx = { collectionId, articleId, orderId, factoryId };
  const { activeFeatureId } = usePillarCapabilityWorkspace('supplier-procurement');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="supplier-procurement"
      ctx={ctx}
      crossLinksTitle="BOM → RFQ → brand comms"
    >
      <div className="mb-4 space-y-2">
        <SupplierProcurementGoldenPathStrip
          collectionId={collectionId}
          articleId={articleId}
          orderId={orderId}
          factoryId={factoryId}
          activeStep={supplierProcurementGoldenPathStepFromFeature(activeFeatureId)}
        />
        <SupOpProcurementCoPeerStrip
          collectionId={collectionId}
          articleId={articleId}
          orderId={orderId}
          factoryId={factoryId}
        />
      </div>
      {activeFeatureId === 'bom' ? (
        <SupplierProcurementBomPanel collectionId={collectionId} articleId={articleId} />
      ) : null}
      {activeFeatureId === 'rfq' ? (
        <SupplierProcurementRfqPanel collectionId={collectionId} articleId={articleId} />
      ) : null}
      {activeFeatureId === 'supply' ? (
        <SupplierMrpSupplyPanel
          collectionId={collectionId}
          articleId={articleId}
          orderId={orderId}
        />
      ) : null}
      {activeFeatureId === 'order' ? (
        <SupplierOrderCommsPanel
          collectionId={collectionId}
          articleId={articleId}
          orderId={orderId}
        />
      ) : null}
      {activeFeatureId === 'inbox' ? (
        <>
          <SupplierProcurementInboxHintPanel />
          <MessagesPage initialRole="supplier" slimCore />
        </>
      ) : null}
      {activeFeatureId === 'forecast' ? (
        <SupplierProcurementForecastPanel collectionId={collectionId} orderId={orderId} />
      ) : null}
      {activeFeatureId === 'entities' ? (
        <FactoryCommsEntityThreadsPanel variant="supplier" />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export function FactorySupplierMessagesCorePage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <PlatformCoreListChrome highlightRole="supplier" pillarId="comms">
        <PlatformCoreCommsWorkspaceExtras variant="supplier" />
        <Suspense fallback={null}>
          <PlatformCoreCommsUniversalInboxStrip variant="supplier" />
        </Suspense>
        <Suspense fallback={null}>
          <SupplierMessagesWorkspaceContent />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
