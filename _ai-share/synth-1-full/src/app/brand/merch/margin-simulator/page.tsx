'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { BrandLandedMarginBridgePanel } from '@/components/brand/merch/BrandLandedMarginBridgePanel';
import { BrandLandedMarginShopRollupPanel } from '@/components/brand/merch/BrandLandedMarginShopRollupPanel';
import { BrandMarginSimulatorPanel } from '@/components/brand/merch/BrandMarginSimulatorPanel';
import {
  BrandLandedMarginGoldenPathStrip,
  brandLandedMarginGoldenPathStepFromFeature,
} from '@/components/brand/merch/BrandLandedMarginGoldenPathStrip';
import { BrandCoLandedMarginCoPeerStrip } from '@/components/platform/BrandCoLandedMarginCoPeerStrip';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

function BrandLandedMarginWorkspaceContent() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const orderId = searchParams.get('order')?.trim() || undefined;
  const ctx = { collectionId, orderId, role: 'brand' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-landed-margin');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-landed-margin"
      ctx={ctx}
      crossLinksTitle="Pricelist · shop rollup · collaborative"
    >
      <div className="mb-4 space-y-2">
        <BrandLandedMarginGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={brandLandedMarginGoldenPathStepFromFeature(activeFeatureId)}
        />
        <BrandCoLandedMarginCoPeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'simulator' ? (
        <BrandMarginSimulatorPanel collectionId={collectionId} orderId={orderId} />
      ) : null}
      {activeFeatureId === 'pricelist' ? (
        <BrandLandedMarginBridgePanel collectionId={collectionId} orderId={orderId} />
      ) : null}
      {activeFeatureId === 'shop-rollup' ? (
        <BrandLandedMarginShopRollupPanel collectionId={collectionId} orderId={orderId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function MarginSimulatorPage() {
  return (
    <CabinetPageContent maxWidth="6xl">
      <Suspense fallback={null}>
        <BrandLandedMarginWorkspaceContent />
      </Suspense>
    </CabinetPageContent>
  );
}
