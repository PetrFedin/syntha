'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  BrandWssiCapacityPanel,
  BrandWssiMixPanel,
  BrandWssiOtbPanel,
} from '@/components/brand/merch/BrandWssiPlanWorkspacePanels';
import {
  BrandWssiGoldenPathStrip,
  brandWssiGoldenPathStepFromFeature,
} from '@/components/brand/merch/BrandWssiGoldenPathStrip';
import { BrandCoWssiCoPeerStrip } from '@/components/platform/BrandCoWssiCoPeerStrip';
import { BrandCoOtbReplenishmentSyncStrip } from '@/components/platform/BrandCoOtbReplenishmentSyncStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { products } from '@/lib/products';
import { calculateAssortmentMix } from '@/lib/fashion/assortment-mix-logic';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function AssortmentMixPlannerLegacyPage() {
  const mix = useMemo(() => calculateAssortmentMix(products), []);

  return (
    <CabinetPageContent maxWidth="6xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.brand.growthHub}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <LayoutGrid className="h-6 w-6" />
            Assortment Mix Planner (OTB)
          </h1>
        </div>
      </div>
      <div className="grid gap-4">
        {mix.map((item) => (
          <Card key={item.category}>
            <CardContent className="space-y-3 pt-4">
              <p className="font-bold">{item.category}</p>
              <Progress value={item.currentPct} className="h-2" />
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                {Math.abs(item.gap) > 10 ? (
                  <AlertCircle className="h-3 w-3" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                <span>
                  Target {item.targetPct}% · Current {item.currentPct}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CabinetPageContent>
  );
}

function WssiPlanWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const articleId = searchParams.get('article')?.trim() || undefined;
  const ctx = { collectionId, articleId };
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-wssi-plan');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-wssi-plan"
      ctx={ctx}
      crossLinksTitle="OTB → capacity → shop buy"
      beforeTabs={
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.growthHub}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <LayoutGrid className="text-text-muted h-5 w-5" aria-hidden />
        </div>
      }
    >
      <div className="mb-4 space-y-2">
        <BrandWssiGoldenPathStrip
          collectionId={collectionId}
          activeStep={brandWssiGoldenPathStepFromFeature(activeFeatureId)}
        />
        <BrandCoWssiCoPeerStrip collectionId={collectionId} />
        {activeFeatureId === 'otb' ? (
          <BrandCoOtbReplenishmentSyncStrip collectionId={collectionId} orderId={articleId} />
        ) : null}
      </div>
      {activeFeatureId === 'otb' ? <BrandWssiOtbPanel collectionId={collectionId} /> : null}
      {activeFeatureId === 'mix' ? <BrandWssiMixPanel /> : null}
      {activeFeatureId === 'capacity' ? (
        <BrandWssiCapacityPanel collectionId={collectionId} articleId={articleId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function AssortmentMixPlannerPage() {
  if (!isPlatformCoreMode()) {
    return <AssortmentMixPlannerLegacyPage />;
  }

  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-6">
      <Suspense fallback={null}>
        <WssiPlanWorkspaceBody />
      </Suspense>
    </CabinetPageContent>
  );
}
