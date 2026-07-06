'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Suspense } from 'react';
import SmartReplenishment from '@/components/shop/replenishment/SmartReplenishment';
import { ShopReplenishmentFeaturePanel } from '@/components/shop/replenishment/ShopReplenishmentFeaturePanel';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';
import {
  ShopReplenishmentGoldenPathStrip,
  shopReplenishmentGoldenPathStepFromFeature,
} from '@/components/shop/b2b/ShopReplenishmentGoldenPathStrip';
import { ShopCoGoldenPathStrip } from '@/components/shop/b2b/ShopCoGoldenPathStrip';
import { ShopReplenishmentCoSpinePeerStrip } from '@/components/shop/b2b/ShopReplenishmentCoSpinePeerStrip';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { useSearchParams } from 'next/navigation';

function ReplenishmentWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection') ?? searchParams.get('collectionId'),
  });
  const orderId =
    searchParams.get('order') ?? searchParams.get('orderId') ?? searchParams.get('wholesaleOrderId') ?? undefined;
  const ctx = { collectionId, orderId, role: 'shop' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('shop-replenishment');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="shop-replenishment"
      ctx={ctx}
      crossLinksTitle="Цепочка столпа «Оптовый заказ»"
      beforeTabs={<B2bOrderUrlContextBanner variant="shop" />}
    >
      <div className="mb-4 space-y-3">
        <ShopCoGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep="replenishment"
        />
        <ShopReplenishmentGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={shopReplenishmentGoldenPathStepFromFeature(activeFeatureId)}
        />
        <ShopReplenishmentCoSpinePeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'alerts' ? (
        <SmartReplenishment collectionId={collectionId} orderId={orderId} />
      ) : null}
      {activeFeatureId === 'stock-atp' ? (
        <ShopReplenishmentFeaturePanel
          featureId="stock-atp"
          collectionId={collectionId}
          orderId={orderId}
        />
      ) : null}
      {activeFeatureId === 'rules' ? (
        <ShopReplenishmentFeaturePanel
          featureId="rules"
          collectionId={collectionId}
          orderId={orderId}
        />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function SmartReplenishmentPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6">
      <Suspense fallback={null}>
        <ReplenishmentWorkspaceBody />
      </Suspense>
    </CabinetPageContent>
  );
}
