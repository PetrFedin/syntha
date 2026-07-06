'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Button } from '@/components/ui/button';
import {
  BrandCrmSegmentationPricelistPanel,
  BrandCrmSegmentationSegmentsPanel,
  BrandCrmSegmentationShowroomPanel,
} from '@/components/brand/b2b/BrandCrmSegmentationPanels';
import {
  BrandCrmGoldenPathStrip,
  brandCrmGoldenPathStepFromFeature,
} from '@/components/brand/b2b/BrandCrmGoldenPathStrip';
import { BrandCoCrmCoPeerStrip } from '@/components/platform/BrandCoCrmCoPeerStrip';
import { BrandCoCrmLinesheetVisibilityStrip } from '@/components/platform/BrandCoCrmLinesheetVisibilityStrip';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft, Users } from 'lucide-react';

function CustomerGroupsWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const ctx = { collectionId, role: 'brand' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-crm-segmentation');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-crm-segmentation"
      ctx={ctx}
      crossLinksTitle="Price lists · showroom · agent rep"
    >
      <div className="mb-4 space-y-2">
        <BrandCrmGoldenPathStrip
          collectionId={collectionId}
          activeStep={brandCrmGoldenPathStepFromFeature(activeFeatureId)}
        />
        <BrandCoCrmCoPeerStrip collectionId={collectionId} />
        <BrandCoCrmLinesheetVisibilityStrip collectionId={collectionId} />
      </div>
      {activeFeatureId === 'segments' ? (
        <BrandCrmSegmentationSegmentsPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'pricelist' ? (
        <BrandCrmSegmentationPricelistPanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'showroom' ? (
        <BrandCrmSegmentationShowroomPanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function CustomerGroupsPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <PlatformCoreListChrome highlightRole="brand" pillarId="comms">
        <div className="mb-4 flex items-center gap-3">
          <Link href={ROUTES.brand.retailers}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-tight">
              <Users className="h-6 w-6" /> Группы клиентов
            </h1>
            <p className="text-text-secondary mt-0.5 text-sm">
              BP Segmentation: сегменты → прайсы → showroom access.
            </p>
          </div>
        </div>
        <Suspense fallback={null}>
          <CustomerGroupsWorkspaceBody />
        </Suspense>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
