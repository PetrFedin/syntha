'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { ShopCoLandedMarginSpinePeerStrip } from '@/components/platform/ShopCoLandedMarginSpinePeerStrip';
import {
  ShopLandedMarginGoldenPathStrip,
  shopLandedMarginGoldenPathStepFromFeature,
} from '@/components/shop/b2b/ShopLandedMarginGoldenPathStrip';
import {
  ShopLandedMarginHubPanel,
  ShopLandedMarginPricelistPanel,
  ShopLandedMarginRollupPanel,
} from '@/components/shop/b2b/ShopLandedMarginPanels';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

const ShopB2bMarginReportLegacyPage = dynamic(
  () => import('@/app/shop/b2b/margin-report/page').then((m) => m.default),
  { ssr: false }
);

function MarginAnalysisWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection') ?? searchParams.get('collectionId'),
  });
  const orderId =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    searchParams.get('wholesaleOrderId')?.trim() ||
    undefined;
  const ctx = { collectionId, orderId, role: 'shop' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('shop-landed-margin');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="shop-landed-margin"
      ctx={ctx}
      crossLinksTitle="Hub → rollup → pricelist → matrix"
      beforeTabs={<B2bOrderUrlContextBanner variant="shop" />}
    >
      <div className="mb-4 space-y-2">
        <ShopLandedMarginGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={shopLandedMarginGoldenPathStepFromFeature(activeFeatureId)}
        />
        <ShopCoLandedMarginSpinePeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'hub' ? <ShopLandedMarginHubPanel /> : null}
      {activeFeatureId === 'rollup' ? <ShopLandedMarginRollupPanel /> : null}
      {activeFeatureId === 'pricelist' ? <ShopLandedMarginPricelistPanel /> : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

function MarginAnalysisCorePage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 pb-safe">
      <PlatformCoreListChrome highlightRole="shop" pillarId="collection_order">
        <Suspense fallback={null}>
          <MarginAnalysisWorkspaceBody />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}

export default function ShopB2bMarginAnalysisPage() {
  if (!isPlatformCoreMode()) {
    return <ShopB2bMarginReportLegacyPage />;
  }
  return <MarginAnalysisCorePage />;
}
