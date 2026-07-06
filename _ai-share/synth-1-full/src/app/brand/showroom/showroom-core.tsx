'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PlatformCorePublishedShowroom } from '@/components/platform/PlatformCorePublishedShowroom';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  BrandShowroomPublishPanel,
  BrandShowroomShopBuyPanel,
} from '@/components/brand/showroom/BrandShowroomBuyPanels';
import {
  BrandShowroomBuyGoldenPathStrip,
  brandShowroomBuyGoldenPathStepFromFeature,
} from '@/components/brand/showroom/BrandShowroomBuyGoldenPathStrip';
import { BrandScShowroomRetailPeerStrip } from '@/components/platform/BrandScShowroomRetailPeerStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { useWorkshop2PublishedArticleCount } from '@/hooks/use-workshop2-published-article-count';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

function BrandShowroomWorkspaceBody({ collectionId }: { collectionId: string }) {
  const ctx = { collectionId, role: 'brand' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-showroom-buy');
  const { count: publishedCount } = useWorkshop2PublishedArticleCount(collectionId);

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-showroom-buy"
      ctx={ctx}
      crossLinksTitle="Release → shop buy → matrix"
    >
      <div className="mb-4 space-y-2">
        <BrandShowroomBuyGoldenPathStrip
          collectionId={collectionId}
          activeStep={brandShowroomBuyGoldenPathStepFromFeature(activeFeatureId)}
        />
        <BrandScShowroomRetailPeerStrip
          collectionId={collectionId}
          omitMatrixPrefillCta={publishedCount > 0}
        />
      </div>
      {activeFeatureId === 'preview' ? (
        <PlatformCorePublishedShowroom variant="brand" collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'publish' ? (
        <BrandShowroomPublishPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'shop-buy' ? (
        <BrandShowroomShopBuyPanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

function BrandShowroomCoreInner() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });

  return (
    <PlatformCoreListChrome
      highlightRole="brand"
      pillarId="sample_collection"
      pageCollectionId={collectionId}
    >
      <BrandShowroomWorkspaceBody collectionId={collectionId} />
    </PlatformCoreListChrome>
  );
}

export function BrandShowroomCorePage() {
  return (
    <CabinetPageContent
      maxWidth="5xl"
      className="pb-safe space-y-6 px-4 py-6 duration-700 animate-in fade-in sm:px-6"
    >
      <Suspense fallback={null}>
        <BrandShowroomCoreInner />
      </Suspense>
    </CabinetPageContent>
  );
}
