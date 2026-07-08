'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { products } from '@/lib/products';
import { assessLaunchReadiness, launchReadinessToCsv } from '@/lib/fashion/launch-readiness';
import { buildBrandTechPackReleaseGateRows } from '@/lib/fashion/brand-techpack-release-gate-rows';
import { getWorkshop2Phase1Dossier } from '@/lib/production/workshop2-phase1-dossier-storage';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ArrowLeft, FileSpreadsheet, Rocket } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { BrandReleaseSyndicationPanel } from '@/components/brand/merch/BrandReleaseSyndicationPanel';
import { BrandReleaseShowroomPublishPanel } from '@/components/brand/merch/BrandReleaseShowroomPublishPanel';
import { BrandReleaseTechPackGatePanel } from '@/components/brand/merch/BrandReleaseTechPackGatePanel';
import { BrandReleaseChecklistAutoBlockersStrip } from '@/components/brand/merch/BrandReleaseChecklistAutoBlockersStrip';
import { BrandScReleaseGateBlockStrip } from '@/components/brand/sample/BrandScReleaseGateBlockStrip';
import { BrandScReleaseGateSchemaPassportPeerStrip } from '@/components/platform/BrandScReleaseGateSchemaPassportPeerStrip';
import {
  BrandReleaseGoldenPathStrip,
  brandReleaseGoldenPathStepFromFeature,
} from '@/components/brand/merch/BrandReleaseGoldenPathStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';

function LaunchReadinessWorkspaceBody() {
  const collectionId = PLATFORM_CORE_DEMO.collectionId;
  const rows = useMemo(() => {
    return products.map((p) => {
      const r = assessLaunchReadiness(p);
      const failed = r.checks.filter((c) => !c.ok).map((c) => c.id);
      return { product: p, ...r, failedStr: failed.join('|') };
    });
  }, []);
  const techPackBySku = useMemo(() => {
    const gateRows = buildBrandTechPackReleaseGateRows({
      products,
      collectionId,
      resolveDossier: (articleId) => getWorkshop2Phase1Dossier(collectionId, articleId),
    });
    return new Map(gateRows.map((r) => [r.sku, r]));
  }, [collectionId]);
  const notReady = rows.filter((r) => r.percent < 100).length;
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-release-gate');

  const downloadCsv = () => {
    const payload = rows.map((r) => ({
      sku: r.product.sku,
      slug: r.product.slug,
      percent: r.percent,
      failed: r.failedStr,
    }));
    const csv = launchReadinessToCsv(payload);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `launch-readiness-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-release-gate"
      crossLinksTitle="Столпы: разработка → коллекция → опт"
      beforeTabs={
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.growthHub}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Rocket className="text-text-muted h-5 w-5" aria-hidden />
        </div>
      }
    >
      <div className="mb-4 space-y-3">
        <BrandReleaseGoldenPathStrip
          collectionId={collectionId}
          activeStep={brandReleaseGoldenPathStepFromFeature(activeFeatureId)}
        />
        <BrandScReleaseGateSchemaPassportPeerStrip collectionId={collectionId} />
        <BrandScReleaseGateBlockStrip collectionId={collectionId} />
      </div>
      {activeFeatureId === 'checklist' ? (
        <>
          <BrandReleaseChecklistAutoBlockersStrip collectionId={collectionId} />
          <div className="mb-4 flex flex-wrap gap-2">
            <Button type="button" onClick={downloadCsv}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Badge variant="secondary">
              &lt; 100%: {notReady} / {rows.length}
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=syndication`}
              >
                Syndication feed
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`${ROUTES.brand.launchReadiness}?${PILLAR_CAPABILITY_FEATURE_PARAM}=techpack-gate`}
              >
                Factory pack gate
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.brand.attributeHealth}>Здоровье атрибутов</Link>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SKU</CardTitle>
              <CardDescription>Go-live чек-лист на карточку.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[520px] overflow-x-auto overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Pack</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const pack = techPackBySku.get(r.product.sku);
                    return (
                      <TableRow key={r.product.sku}>
                        <TableCell>
                          <Link
                            href={`/products/${r.product.slug}`}
                            className="font-mono text-xs underline"
                          >
                            {r.product.sku}
                          </Link>
                          <p className="line-clamp-1 max-w-[220px] text-[10px] text-muted-foreground">
                            {r.product.name}
                          </p>
                        </TableCell>
                        <TableCell className="font-mono">{r.percent}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {pack ? (
                            <Link href={pack.factoryPackHref} className="underline">
                              {pack.sheetsReady}/{pack.sheetsTotal}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {r.percent === 100 ? (
                            <span className="text-emerald-600">ready</span>
                          ) : (
                            <span className="text-muted-foreground">
                              {r.failedStr.replace(/\|/g, ', ')}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}

      {activeFeatureId === 'syndication' ? (
        <BrandReleaseSyndicationPanel products={products} />
      ) : null}

      {activeFeatureId === 'showroom-publish' ? (
        <BrandReleaseShowroomPublishPanel collectionId={collectionId} />
      ) : null}

      {activeFeatureId === 'techpack-gate' ? (
        <BrandReleaseTechPackGatePanel products={products} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function LaunchReadinessPage() {
  return (
    <CabinetPageContent maxWidth="5xl">
      <Suspense fallback={null}>
        <LaunchReadinessWorkspaceBody />
      </Suspense>
    </CabinetPageContent>
  );
}
