'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft, Database } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { BrandMaterialPassportCertsPanel } from '@/components/brand/merch/BrandMaterialPassportCertsPanel';
import { BrandMaterialPassportReleasePanel } from '@/components/brand/merch/BrandMaterialPassportReleasePanel';
import { BrandMaterialPassportRollupPanel } from '@/components/brand/merch/BrandMaterialPassportRollupPanel';
import {
  BrandMaterialPassportGoldenPathStrip,
  brandMaterialPassportGoldenPathStepFromFeature,
} from '@/components/brand/merch/BrandMaterialPassportGoldenPathStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId, getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { BrandDevMerchCoSpinePeerStrip } from '@/components/platform/BrandDevMerchCoSpinePeerStrip';
import { BrandDevSchemaPassportPeerStrip } from '@/components/platform/BrandDevSchemaPassportPeerStrip';
import { BrandDevPassportReleaseGatePeerStrip } from '@/components/platform/BrandDevPassportReleaseGatePeerStrip';

function FabricPassportWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const demo = getPlatformCoreDemo(collectionId);
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-material-passport');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-material-passport"
      ctx={{ collectionId }}
      crossLinksTitle="Разработка → release → supplier"
      beforeTabs={
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.growthHub}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Database className="text-text-muted h-5 w-5" aria-hidden />
        </div>
      }
    >
      <div className="mb-4">
        <BrandMaterialPassportGoldenPathStrip
          collectionId={collectionId}
          activeStep={brandMaterialPassportGoldenPathStepFromFeature(activeFeatureId)}
        />
      </div>
      {isPlatformCoreMode() ? (
        <div className="mb-4 space-y-2">
          <BrandDevSchemaPassportPeerStrip collectionId={collectionId} activeSide="passport" />
          <BrandDevPassportReleaseGatePeerStrip collectionId={collectionId} />
          <BrandDevMerchCoSpinePeerStrip
            variant="material-passport"
            collectionId={collectionId}
            orderId={demo.demoOrderId}
          />
        </div>
      ) : null}
      {activeFeatureId === 'rollup' ? (
        <BrandMaterialPassportRollupPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'certs' ? (
        <BrandMaterialPassportCertsPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'release' ? (
        <BrandMaterialPassportReleasePanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function BrandFabricPassportPage() {
  return (
    <CabinetPageContent maxWidth="5xl">
      <Suspense fallback={null}>
        <FabricPassportWorkspaceBody />
      </Suspense>
    </CabinetPageContent>
  );
}
