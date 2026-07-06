'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { BrandOrderCommsDetailPanel } from '@/components/brand/b2b/BrandOrderCommsDetailPanel';
import {
  BrandOrderCommsChatPanel,
  BrandOrderCommsHandoffPanel,
} from '@/components/brand/b2b/BrandOrderCommsPanels';
import {
  BrandOrderCommsGoldenPathStrip,
  brandOrderCommsGoldenPathStepFromFeature,
} from '@/components/brand/b2b/BrandOrderCommsGoldenPathStrip';
import { PlatformCoreOrderDetailChrome } from '@/components/platform/PlatformCoreOrderDetailChrome';
import { BrandCoRegistryRetailOnboardingStrip } from '@/components/platform/BrandCoRegistryRetailOnboardingStrip';
import { BrandCoCollaborativeMarginApproveStrip } from '@/components/brand/b2b/BrandCoCollaborativeMarginApproveStrip';
import { OrderCommsWorkspaceNotificationBar } from '@/components/platform/OrderCommsWorkspaceNotificationBar';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { useWorkshop2B2bOrderDetail } from '@/hooks/use-workshop2-b2b-order-detail';
import { usePlatformCoreEmbeddedWorkspace } from '@/components/platform/PlatformCoreEmbeddedWorkspaceContext';
import { getPlatformCoreDemoByOrderId, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

type Props = {
  orderId: string;
};

function BrandB2bOrderDetailWorkspaceBody({ orderId }: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
    fallback: getPlatformCoreDemoByOrderId(orderId).collectionId,
  });
  const ctx = { orderId, collectionId, role: 'brand' as const };
  const embeddedWorkspace = usePlatformCoreEmbeddedWorkspace();
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-order-comms');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-order-comms"
      ctx={ctx}
      crossLinksTitle="Shop tracking → collaborative → replenishment"
      showCrossLinks={false}
    >
      {!embeddedWorkspace ? <OrderCommsWorkspaceNotificationBar variant="brand" /> : null}
      <div className="mb-4">
        <BrandOrderCommsGoldenPathStrip
          orderId={orderId}
          collectionId={collectionId}
          activeStep={brandOrderCommsGoldenPathStepFromFeature(activeFeatureId)}
        />
      </div>
      {activeFeatureId === 'detail' ? (
        <>
          {!embeddedWorkspace ? (
            <div className="mb-4">
              <BrandCoRegistryRetailOnboardingStrip collectionId={collectionId} orderId={orderId} />
            </div>
          ) : null}
          {!embeddedWorkspace ? (
          <BrandCoCollaborativeMarginApproveStrip
            orderId={orderId}
            collectionId={collectionId}
            buyerId="shop1"
            activeTab={activeFeatureId === 'detail' ? 'detail' : activeFeatureId === 'chat' ? 'chat' : activeFeatureId === 'handoff' ? 'handoff' : undefined}
          />
          ) : null}
          <BrandOrderCommsDetailPanel orderId={orderId} collectionId={collectionId} />
        </>
      ) : null}
      {activeFeatureId === 'chat' ? (
        <BrandOrderCommsChatPanel orderId={orderId} collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'handoff' ? (
        <BrandOrderCommsHandoffPanel orderId={orderId} collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export function BrandB2bOrderDetailCorePage({ orderId }: Props) {
  useWorkshop2B2bOrderDetail(orderId, true);

  return (
    <CabinetPageContent maxWidth="full" className="w-full pb-safe">
      <PlatformCoreOrderDetailChrome orderId={orderId} variant="brand">
        <Suspense fallback={null}>
          <BrandB2bOrderDetailWorkspaceBody orderId={orderId} />
        </Suspense>
      </PlatformCoreOrderDetailChrome>
    </CabinetPageContent>
  );
}
