'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { PlatformCoreWorkspaceStripsGate } from '@/components/platform/PlatformCoreWorkspaceStripsGate';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';
import {
  ShopWorkingOrderBulkPanel,
  ShopWorkingOrderHandoffPanel,
  ShopWorkingOrderVersionsPanel,
} from '@/components/shop/b2b/ShopWorkingOrderPanels';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import {
  ShopWorkingOrderGoldenPathStrip,
  shopWorkingOrderGoldenPathStepFromFeature,
} from '@/components/shop/b2b/ShopWorkingOrderGoldenPathStrip';
import { ShopCoGoldenPathStrip } from '@/components/shop/b2b/ShopCoGoldenPathStrip';
import { ShopWorkingOrderNativeOrderHonestStrip } from '@/components/shop/b2b/ShopWorkingOrderNativeOrderHonestStrip';
import { ShopWorkingOrderCoSpinePeerStrip } from '@/components/shop/b2b/ShopWorkingOrderCoSpinePeerStrip';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';

function WorkingOrderWorkspaceBody() {
  const searchParams = useSearchParams();
  const wholesaleOrderId =
    searchParams.get('wholesaleOrderId')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    searchParams.get('order')?.trim() ||
    '';
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const ctx = { orderId: wholesaleOrderId || undefined, collectionId, role: 'shop' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('shop-working-order');

  if (!wholesaleOrderId) {
    return (
      <Card data-testid="shop-working-order-missing-order">
        <CardContent className="space-y-3 py-8 text-center text-sm">
          <p className="text-text-secondary">
            Укажите оптовый заказ — рабочие версии доступны для внешних INT-* заказов после отправки
            в реестр.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.shop.b2bOrders}>Оптовый реестр</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isIntegrationImportedWholesaleOrderId(wholesaleOrderId)) {
    return (
      <Card data-testid="shop-working-order-native-order">
        <CardContent className="space-y-3 py-8 text-center text-sm">
          <p className="text-text-secondary">
            Рабочий заказ с версиями — для импортированных оптовых заказов. Native-заказы — в
            матрице.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.shop.b2bMatrix}>Матрица заказа</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.shop.b2bOrders}>Оптовый реестр</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="shop-working-order"
      ctx={ctx}
      crossLinksTitle="Matrix → replenishment → collaborative"
      beforeTabs={<B2bOrderUrlContextBanner variant="shop" />}
    >
      <PlatformCoreWorkspaceStripsGate>
        <div className="mb-4 space-y-3">
          <ShopCoGoldenPathStrip collectionId={collectionId} orderId={wholesaleOrderId} />
          <ShopWorkingOrderGoldenPathStrip
            wholesaleOrderId={wholesaleOrderId}
            collectionId={collectionId}
            activeStep={shopWorkingOrderGoldenPathStepFromFeature(activeFeatureId)}
          />
        </div>
      </PlatformCoreWorkspaceStripsGate>
      {!isIntegrationImportedWholesaleOrderId(wholesaleOrderId) ? (
        <PlatformCoreWorkspaceStripsGate>
          <ShopWorkingOrderNativeOrderHonestStrip
            wholesaleOrderId={wholesaleOrderId}
            collectionId={collectionId}
          />
        </PlatformCoreWorkspaceStripsGate>
      ) : null}
      <PlatformCoreWorkspaceStripsGate>
        <ShopWorkingOrderCoSpinePeerStrip
          wholesaleOrderId={wholesaleOrderId}
          collectionId={collectionId}
        />
      </PlatformCoreWorkspaceStripsGate>
      {activeFeatureId === 'versions' ? (
        <ShopWorkingOrderVersionsPanel
          wholesaleOrderId={wholesaleOrderId}
          collectionId={collectionId}
        />
      ) : null}
      {activeFeatureId === 'bulk' ? (
        <ShopWorkingOrderBulkPanel
          wholesaleOrderId={wholesaleOrderId}
          collectionId={collectionId}
        />
      ) : null}
      {activeFeatureId === 'handoff' ? (
        <ShopWorkingOrderHandoffPanel
          wholesaleOrderId={wholesaleOrderId}
          collectionId={collectionId}
        />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export function ShopB2bWorkingOrderCorePage() {
  return (
    <PlatformCoreListChrome highlightRole="shop" pillarId="collection_order">
      <div
        className="mx-auto max-w-3xl space-y-4 px-4 py-6"
        data-testid="shop-working-order-core-page"
      >
        <Suspense fallback={null}>
          <WorkingOrderWorkspaceBody />
        </Suspense>
      </div>
    </PlatformCoreListChrome>
  );
}
