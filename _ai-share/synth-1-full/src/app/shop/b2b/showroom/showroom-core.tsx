'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCorePublishedShowroom } from '@/components/platform/PlatformCorePublishedShowroom';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  ShopShowroomBuyPathPanel,
  ShopShowroomLinesheetPanel,
} from '@/components/shop/b2b/ShopShowroomBuyPanels';
import { B2b3dStreamPanel } from '@/components/shop/b2b/B2b3dStreamPanel';
import {
  ShopShowroomBuyGoldenPathStrip,
  shopShowroomBuyGoldenPathStepFromFeature,
} from '@/components/shop/b2b/ShopShowroomBuyGoldenPathStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { ShopScShowroomMonetizationPeerStrip } from '@/components/platform/ShopScShowroomMonetizationPeerStrip';
import { ShopScShowroomB2bPeerStrip } from '@/components/platform/ShopScShowroomB2bPeerStrip';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

function ShopShowroomWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const eligibleOnlyFromUrl = searchParams.get('eligibleOnly') === '1';
  const orderId =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    searchParams.get('wholesaleOrderId')?.trim() ||
    undefined;
  const ctx = { collectionId, orderId, role: 'shop' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('shop-showroom-buy');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="shop-showroom-buy"
      ctx={ctx}
      crossLinksTitle="Showroom → matrix → checkout"
    >
      <div className="mb-4 space-y-2">
        <ShopShowroomBuyGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={shopShowroomBuyGoldenPathStepFromFeature(activeFeatureId)}
        />
        <ShopScShowroomMonetizationPeerStrip collectionId={collectionId} orderId={orderId} />
        <ShopScShowroomB2bPeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'showroom' ? (
        <PlatformCorePublishedShowroom
          variant="shop"
          collectionId={collectionId}
          initialEligibleFilterActive={eligibleOnlyFromUrl}
        />
      ) : null}
      {activeFeatureId === 'linesheet' ? (
        <ShopShowroomLinesheetPanel collectionId={collectionId} orderId={orderId} />
      ) : null}
      {activeFeatureId === 'buy' ? (
        <ShopShowroomBuyPathPanel collectionId={collectionId} orderId={orderId} />
      ) : null}
      {activeFeatureId === '3d-stream' ? (
        <B2b3dStreamPanel
          collectionId={collectionId}
          articleId={searchParams.get('article')?.trim() || 'demo-ss27-01'}
        />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export function ShopB2bShowroomCorePage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="pb-safe space-y-6">
      <PlatformCoreListChrome highlightRole="shop" pillarId="sample_collection">
        <Suspense fallback={null}>
          <ShopShowroomWorkspaceBody />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
