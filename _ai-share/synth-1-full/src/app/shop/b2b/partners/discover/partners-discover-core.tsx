'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { ShopB2bPartnersDiscoverGrid } from '@/components/shop/b2b/ShopB2bPartnersDiscoverGrid';
import {
  ShopB2bPartnersDiscoverBridgePanel,
  ShopB2bPartnersRepConnectPanel,
} from '@/components/shop/b2b/ShopB2bPartnersWorkspacePanels';
import {
  ShopB2bPartnersGoldenPathStrip,
  shopB2bPartnersGoldenPathStepFromFeature,
} from '@/components/shop/b2b/ShopB2bPartnersGoldenPathStrip';
import { ShopScPartnersB2bPeerStrip } from '@/components/platform/ShopScPartnersB2bPeerStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

function ShopB2bPartnersDiscoverWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const orderId =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    undefined;
  const ctx = { collectionId, orderId, role: 'shop' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('shop-b2b-partners');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="shop-b2b-partners"
      ctx={ctx}
      crossLinksTitle="Roster · rep · showroom spine"
    >
      <div className="mb-4 space-y-2">
        <ShopB2bPartnersGoldenPathStrip
          collectionId={collectionId}
          orderId={orderId}
          activeStep={shopB2bPartnersGoldenPathStepFromFeature(activeFeatureId)}
        />
        <ShopScPartnersB2bPeerStrip collectionId={collectionId} orderId={orderId} />
      </div>
      {activeFeatureId === 'discover' ? (
        <ShopB2bPartnersDiscoverGrid collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'roster' ? (
        <ShopB2bPartnersDiscoverBridgePanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'rep' ? <ShopB2bPartnersRepConnectPanel collectionId={collectionId} /> : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

function ShopB2bPartnersDiscoverPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.get(PILLAR_CAPABILITY_FEATURE_PARAM)) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'discover');
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  return (
    <Suspense fallback={null}>
      <ShopB2bPartnersDiscoverWorkspaceBody />
    </Suspense>
  );
}

export function ShopB2bPartnersDiscoverCorePage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <PlatformCoreListChrome highlightRole="shop" pillarId="sample_collection">
        <ShopB2bPartnersDiscoverPageInner />
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
