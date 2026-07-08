'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { InventoryPageContent } from '@/components/shop/inventory-page-content';
import { ShopInventoryReconcilePanel } from '@/components/shop/inventory/ShopInventoryReconcilePanel';
import { PlatformCoreInventoryLedgerStrip } from '@/components/platform/PlatformCoreInventoryLedgerStrip';
import {
  ShopInventoryOpsGoldenPathStrip,
  shopInventoryOpsGoldenPathStepFromFeature,
} from '@/components/shop/inventory/ShopInventoryOpsGoldenPathStrip';
import { ShopOpInventorySpinePeerStrip } from '@/components/platform/ShopOpInventorySpinePeerStrip';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { buildShopInventoryOpsSession } from '@/lib/b2b/shop-inventory-ops';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

function ShopInventoryWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const orderId =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    undefined;
  const ctx = { collectionId, orderId, role: 'shop' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('shop-inventory-ops');
  const session = buildShopInventoryOpsSession({ collectionId, orderId });

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="shop-inventory-ops"
      ctx={ctx}
      crossLinksTitle="Replenishment · cycle count · reconcile"
      beforeTabs={<B2bOrderUrlContextBanner variant="shop" />}
    >
      <div className="mb-4">
        <ShopInventoryOpsGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={shopInventoryOpsGoldenPathStepFromFeature(activeFeatureId)}
        />
        <ShopOpInventorySpinePeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'overview' ? (
        <div className="space-y-4">
          <PlatformCoreInventoryLedgerStrip
            collectionId={collectionId}
            reconcileHref={session.reconcileHref}
            variant="shop"
            testId="shop-inventory-ledger-strip"
          />
          <div className="border-border-subtle overflow-hidden rounded-xl border shadow-sm">
            <InventoryPageContent />
          </div>
        </div>
      ) : null}
      {activeFeatureId === 'reconcile' ? (
        <ShopInventoryReconcilePanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function InventoryPage() {
  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-6" data-testid="shop-inventory-page">
      <PlatformCoreListChrome highlightRole="shop" pillarId="order_production">
        <Suspense fallback={null}>
          <div className="mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={buildShopInventoryOpsSession().replenishmentAtpHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Replenishment · ATP
              </Link>
            </Button>
          </div>
          <ShopInventoryWorkspaceBody />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
