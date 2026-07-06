'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  BrandPackRulesCurvePanel,
  BrandPackRulesShopPrepackPanel,
  BrandPackRulesTablePanel,
} from '@/components/brand/merch/BrandPackRulesWorkspacePanels';
import {
  BrandPackRulesGoldenPathStrip,
  brandPackRulesGoldenPathStepFromFeature,
} from '@/components/brand/merch/BrandPackRulesGoldenPathStrip';
import { BrandCoPackRulesCoPeerStrip } from '@/components/platform/BrandCoPackRulesCoPeerStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft, Package } from 'lucide-react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { products } from '@/lib/products';
import { buildPackRuleRow, packRulesToCsv } from '@/lib/fashion/pack-rules-rollup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function PackRulesLegacyPage() {
  const rows = useMemo(() => products.map(buildPackRuleRow), []);
  const downloadCsv = () => {
    const csv = packRulesToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pack-rules-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CabinetPageContent maxWidth="5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.brand.growthHub}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Package className="h-6 w-6" />
            MOQ и короба
          </h1>
        </div>
      </div>
      <Button type="button" onClick={downloadCsv}>
        CSV по всем SKU
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Таблица</CardTitle>
          <CardDescription>Legacy view без workspace tabs.</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[520px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>MOQ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 30).map((r) => (
                <TableRow key={r.sku}>
                  <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                  <TableCell className="font-mono text-xs">{r.moq ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}

function PackRulesWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const ctx = { collectionId, role: 'brand' as const };
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-pack-rules');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-pack-rules"
      ctx={ctx}
      crossLinksTitle="Curve → shop pre-pack → matrix"
      beforeTabs={
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.growthHub}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Package className="text-text-muted h-5 w-5" aria-hidden />
        </div>
      }
    >
      <div className="mb-4 space-y-2">
        <BrandPackRulesGoldenPathStrip
          collectionId={collectionId}
          activeStep={brandPackRulesGoldenPathStepFromFeature(activeFeatureId)}
        />
        <BrandCoPackRulesCoPeerStrip collectionId={collectionId} />
      </div>
      {activeFeatureId === 'rules' ? (
        <BrandPackRulesTablePanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'curve' ? (
        <BrandPackRulesCurvePanel collectionId={collectionId} />
      ) : null}
      {activeFeatureId === 'shop-prepack' ? (
        <BrandPackRulesShopPrepackPanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function PackRulesPage() {
  if (!isPlatformCoreMode()) {
    return <PackRulesLegacyPage />;
  }

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6">
      <Suspense fallback={null}>
        <PackRulesWorkspaceBody />
      </Suspense>
    </CabinetPageContent>
  );
}
