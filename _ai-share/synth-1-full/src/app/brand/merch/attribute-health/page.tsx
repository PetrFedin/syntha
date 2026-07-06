'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { attributeHealthToCsv, buildAttributeHealthRows } from '@/lib/fashion/attribute-health';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import { BrandAttributeSchemaPanel } from '@/components/brand/merch/BrandAttributeSchemaPanel';
import { BrandSizeChartGradePanel } from '@/components/brand/merch/BrandSizeChartGradePanel';
import {
  BrandAttributeSchemaGoldenPathStrip,
  brandAttributeSchemaGoldenPathStepFromFeature,
} from '@/components/brand/merch/BrandAttributeSchemaGoldenPathStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId, getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { BrandDevMerchCoSpinePeerStrip } from '@/components/platform/BrandDevMerchCoSpinePeerStrip';
import { BrandDevSchemaPassportPeerStrip } from '@/components/platform/BrandDevSchemaPassportPeerStrip';

function AttributeHealthWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const demo = getPlatformCoreDemo(collectionId);
  const rows = useMemo(() => buildAttributeHealthRows(products), []);
  const weak = useMemo(() => rows.filter((r) => r.completeness < 100).length, [rows]);
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-attribute-schema');

  const downloadCsv = () => {
    const csv = attributeHealthToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attribute-health-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-attribute-schema"
      crossLinksTitle="Разработка → release → опт"
      beforeTabs={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.growthHub}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      }
    >
      <div className="mb-4">
        <BrandAttributeSchemaGoldenPathStrip
          collectionId={collectionId}
          activeStep={brandAttributeSchemaGoldenPathStepFromFeature(activeFeatureId)}
        />
      </div>
      {isPlatformCoreMode() ? (
        <div className="mb-4 space-y-2">
          <BrandDevSchemaPassportPeerStrip collectionId={collectionId} activeSide="schema" />
          <BrandDevMerchCoSpinePeerStrip
            variant="attribute-schema"
            collectionId={collectionId}
            orderId={demo.demoOrderId}
          />
        </div>
      ) : null}
      {activeFeatureId === 'health' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button type="button" onClick={downloadCsv}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV по всем SKU
            </Button>
            <Badge variant="secondary">
              SKU с пробелами: {weak} / {rows.length}
            </Badge>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Таблица</CardTitle>
              <CardDescription>
                8 проверок: идентификаторы, медиа, сезон, состав, eco-теги, уход.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[480px] overflow-x-auto overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Пробелы</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.sku}>
                      <TableCell>
                        <Link href={`/products/${r.slug}`} className="font-mono text-xs underline">
                          {r.sku}
                        </Link>
                        <p className="line-clamp-1 max-w-[200px] text-[10px] text-muted-foreground">
                          {r.name}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{r.completeness}</TableCell>
                      <TableCell className="text-xs">
                        {r.gaps.length === 0 ? (
                          <span className="text-emerald-600">ok</span>
                        ) : (
                          <span className="text-muted-foreground">{r.gaps.join(', ')}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}

      {activeFeatureId === 'schemas' ? (
        <BrandAttributeSchemaPanel collectionId={collectionId} />
      ) : null}

      {activeFeatureId === 'size-chart' ? (
        <BrandSizeChartGradePanel collectionId={collectionId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function AttributeHealthPage() {
  return (
    <CabinetPageContent maxWidth="5xl">
      <Suspense fallback={null}>
        <AttributeHealthWorkspaceBody />
      </Suspense>
    </CabinetPageContent>
  );
}
