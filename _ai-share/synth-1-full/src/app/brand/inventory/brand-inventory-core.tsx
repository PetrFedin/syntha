'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Button } from '@/components/ui/button';
import {
  BrandInventoryBalanceBridgePanel,
  BrandInventoryNetworkBridgePanel,
  BrandInventoryPhysicalCountPanel,
} from '@/components/brand/inventory/BrandInventoryPanels';
import { PlatformCoreInventoryLedgerStrip } from '@/components/platform/PlatformCoreInventoryLedgerStrip';
import { BrandOpInventoryLedgerStrip } from '@/components/platform/BrandOpInventoryLedgerStrip';
import {
  BrandInventoryOpsGoldenPathStrip,
  brandInventoryOpsGoldenPathStepFromFeature,
} from '@/components/brand/inventory/BrandInventoryOpsGoldenPathStrip';
import { BrandOpInventoryCoPeerStrip } from '@/components/platform/BrandOpInventoryCoPeerStrip';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { buildBrandInventoryOpsSession } from '@/lib/b2b/brand-inventory-ops';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { Layers, Package } from 'lucide-react';

function BrandInventoryWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const orderId =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    undefined;
  const ctx = { collectionId, orderId, role: 'brand' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-inventory-ops');
  const session = buildBrandInventoryOpsSession({ collectionId, orderId });

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-inventory-ops"
      ctx={ctx}
      crossLinksTitle="Shop ATP · replenishment · physical count"
    >
      <div className="mb-4">
        <BrandInventoryOpsGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={brandInventoryOpsGoldenPathStepFromFeature(activeFeatureId)}
        />
        <BrandOpInventoryCoPeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'overview' ? (
        <div className="space-y-4">
          <BrandOpInventoryLedgerStrip
            collectionId={collectionId}
            orderId={orderId}
            reconcileHref={session.shopInventoryReconcileHref}
          />
          <div className="border-border-subtle flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-text-primary text-sm font-semibold">SKU matrix hub</p>
              <p className="text-text-secondary text-xs">
                Полная матрица остатков · каналы · production pipeline.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={session.productsMatrixHref}>
                  <Layers className="mr-1 h-3 w-3" />
                  Products matrix
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={session.legacyMatrixHref} data-testid="brand-inventory-legacy-matrix-link">
                  <Package className="mr-1 h-3 w-3" />
                  Full inventory UI
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {activeFeatureId === 'balance' ? (
        <BrandInventoryBalanceBridgePanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'count' ? (
        <BrandInventoryPhysicalCountPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'network' ? (
        <div className="space-y-4">
          <PlatformCoreInventoryLedgerStrip
            collectionId={collectionId}
            reconcileHref={session.shopInventoryReconcileHref}
            variant="brand"
            testId="brand-inventory-network-ledger-strip"
          />
          <BrandInventoryNetworkBridgePanel collectionId={collectionId} />
        </div>
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export function BrandInventoryCorePage() {
  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-6" data-testid="brand-inventory-core-page">
      <PlatformCoreListChrome highlightRole="brand" pillarId="order_production">
        <Suspense fallback={null}>
          <BrandInventoryWorkspaceBody />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
