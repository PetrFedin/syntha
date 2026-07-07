'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  ShopCollaborativeOrderApprovalsPanel,
  ShopCollaborativeOrderCommsPanel,
  ShopCollaborativeOrderSessionPanel,
} from '@/components/shop/b2b/ShopCollaborativeOrderPanels';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import {
  ShopCollaborativeOrderGoldenPathStrip,
  shopCollaborativeGoldenPathStepFromFeature,
} from '@/components/shop/b2b/ShopCollaborativeOrderGoldenPathStrip';
import { ShopCoGoldenPathStrip } from '@/components/shop/b2b/ShopCoGoldenPathStrip';
import { ShopCollaborativeOrderExtendedPeerStrip } from '@/components/platform/ShopCollaborativeOrderExtendedPeerStrip';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

const ShopB2bCollaborativeOrderLegacyPage = dynamic(
  () =>
    import(
      '@/_archive/platform-core-legacy/app/shop/b2b/collaborative-order/collaborative-order-legacy'
    ).then((m) => m.ShopB2bCollaborativeOrderLegacyPage),
  { ssr: false }
);

function CollaborativeOrderWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection') ?? searchParams.get('collectionId'),
  });
  const orderId =
    searchParams.get('order') ?? searchParams.get('orderId') ?? searchParams.get('wholesaleOrderId') ?? undefined;
  const ctx = { collectionId, orderId, role: 'shop' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('shop-collaborative-order');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="shop-collaborative-order"
      ctx={ctx}
      crossLinksTitle="Матрица → согласование → comms"
      beforeTabs={<B2bOrderUrlContextBanner variant="shop" />}
    >
      <div className="mb-4 space-y-3">
        <ShopCoGoldenPathStrip collectionId={collectionId} orderId={orderId} />
        <ShopCollaborativeOrderGoldenPathStrip
          orderId={orderId}
          collectionId={collectionId}
          activeStep={shopCollaborativeGoldenPathStepFromFeature(activeFeatureId)}
        />
        <ShopCollaborativeOrderExtendedPeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'session' ? <ShopCollaborativeOrderSessionPanel /> : null}
      {activeFeatureId === 'approvals' ? <ShopCollaborativeOrderApprovalsPanel /> : null}
      {activeFeatureId === 'comms' ? <ShopCollaborativeOrderCommsPanel /> : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

function CollaborativeOrderCorePage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6">
      <Suspense fallback={null}>
        <CollaborativeOrderWorkspaceBody />
      </Suspense>
    </CabinetPageContent>
  );
}

export default function B2BCollaborativeOrderPage() {
  if (isPlatformCoreMode()) {
    return <CollaborativeOrderCorePage />;
  }
  return <ShopB2bCollaborativeOrderLegacyPage />;
}
