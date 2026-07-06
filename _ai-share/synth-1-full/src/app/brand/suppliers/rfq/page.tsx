'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSearch, ArrowLeft, Cloud } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { MaterialsSuppliersBadges } from '@/components/brand/SectionBadgeCta';
import { B2BIntegrationStatusWidget } from '@/components/b2b/B2BIntegrationStatusWidget';
import { ROUTES } from '@/lib/routes';
import { getSupplierLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { listRfq, type SupplierRfq } from '@/lib/supplier-rfq';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  BrandSupplierBomLinesPanel,
  BrandSupplierBomProcurementPanel,
} from '@/components/brand/merch/BrandSupplierBomPanels';
import {
  BrandSupplierBomGoldenPathStrip,
  brandSupplierBomGoldenPathStepFromFeature,
} from '@/components/brand/merch/BrandSupplierBomGoldenPathStrip';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { resolvePageCollectionId, getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';
import { BrandDevMerchCoSpinePeerStrip } from '@/components/platform/BrandDevMerchCoSpinePeerStrip';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

const statusLabels: Record<SupplierRfq['status'], string> = {
  draft: 'Черновик',
  sent: 'Отправлено',
  quotes_received: 'Предложения получены',
  awarded: 'Присуждено',
  cancelled: 'Отменено',
};

function SupplierRfqLegacyBody() {
  const [rfqList, setRfqList] = useState<SupplierRfq[]>([]);
  const [catalogSummary, setCatalogSummary] = useState<{
    productCount: number;
    source: string;
    lastSync?: string;
  } | null>(null);

  useEffect(() => {
    listRfq().then(setRfqList);
  }, []);

  useEffect(() => {
    fetch('/api/b2b/integrations/catalog-summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const d = data as { source?: string; productCount?: number; lastSync?: string } | null;
        if (d && (d.source === 'fashion_cloud' || (d.productCount ?? -1) >= 0)) {
          setCatalogSummary({
            source: d.source ?? 'unknown',
            productCount: d.productCount ?? 0,
            lastSync: d.lastSync,
          });
        }
      })
      .catch(() => {});
  }, []);

  const rfq = rfqList[0];

  return (
    <>
      <SectionInfoCard
        title="Supplier RFQ Engine"
        description="Тендеры на ткань и фурнитуру. Создание запроса из Tech Pack, получение предложений, присуждение. Связь с Materials и поставщиками. РФ: рубли, ЭДО."
        icon={FileSearch}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        badges={<MaterialsSuppliersBadges />}
      />
      <div className="flex items-center gap-3">
        <Link href={ROUTES.brand.suppliers}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold uppercase">Supplier RFQ</h1>
      </div>

      <B2BIntegrationStatusWidget settingsHref={ROUTES.brand.integrations} />
      {catalogSummary && catalogSummary.source === 'fashion_cloud' && (
        <Card className="border-border-default">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Cloud className="h-4 w-4" /> Fashion Cloud
            </CardTitle>
            <CardDescription>
              В каталоге синдикации {catalogSummary.productCount} продуктов. Данные для RFQ можно
              брать из каталога (GTIN, артикулы).
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" /> {rfq?.title ?? 'Supplier RFQ'}
          </CardTitle>
          <CardDescription>
            Позиции и предложения поставщиков. При API — отправка запроса, сбор котировок,
            присуждение.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rfq && (
            <>
              <div>
                <p className="text-text-secondary mb-1 text-[10px] uppercase">Позиции</p>
                <ul className="space-y-1 text-sm">
                  {rfq.items.map((i) => (
                    <li key={i.id}>
                      {i.description} — {i.quantity} {i.unit}
                      {i.techPackRef ? ` (${i.techPackRef})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-text-secondary mb-1 text-[10px] uppercase">Предложения</p>
                <ul className="space-y-2">
                  {rfq.quotes.map((q) => (
                    <li
                      key={q.supplierId}
                      className="bg-bg-surface2 flex items-center justify-between rounded-lg p-2"
                    >
                      <span className="font-medium">{q.supplierName}</span>
                      <span>
                        {q.amountRub != null ? `${q.amountRub.toLocaleString('ru-RU')} ₽` : ''} ·{' '}
                        {q.leadTimeDays} дн.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {statusLabels[rfq.status]}
              </Badge>
            </>
          )}
          <p className="text-text-muted text-xs">
            API: SUPPLIER_RFQ_API — создание, отправка, присуждение.
          </p>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={getSupplierLinks()} />
    </>
  );
}

function SupplierRfqWorkspaceBody() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const articleId = searchParams.get('article')?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const demo = getPlatformCoreDemo(collectionId);
  const ctx = { collectionId, articleId };
  const { activeFeatureId } = usePillarCapabilityWorkspace('brand-supplier-bom');

  return (
    <PillarCapabilityWorkspaceChrome
      workspaceId="brand-supplier-bom"
      ctx={ctx}
      crossLinksTitle="BOM → RFQ → material passport"
      beforeTabs={
        <div className="flex items-center gap-3">
          <Link href={ROUTES.brand.suppliers}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <FileSearch className="text-text-muted h-5 w-5" aria-hidden />
        </div>
      }
    >
      <div className="mb-4">
        <BrandSupplierBomGoldenPathStrip
          collectionId={collectionId}
          articleId={articleId}
          activeStep={brandSupplierBomGoldenPathStepFromFeature(activeFeatureId)}
        />
      </div>
      <div className="mb-4">
        <BrandDevMerchCoSpinePeerStrip
          variant="supplier-bom"
          collectionId={collectionId}
          orderId={demo.demoOrderId}
        />
      </div>
      {activeFeatureId === 'bom' ? (
        <BrandSupplierBomLinesPanel collectionId={collectionId} articleId={articleId} />
      ) : null}
      {activeFeatureId === 'procurement' ? (
        <BrandSupplierBomProcurementPanel collectionId={collectionId} articleId={articleId} />
      ) : null}
    </PillarCapabilityWorkspaceChrome>
  );
}

export default function SupplierRfqPage() {
  const core = isPlatformCoreMode();

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      {core ? (
        <Suspense fallback={null}>
          <SupplierRfqWorkspaceBody />
        </Suspense>
      ) : (
        <SupplierRfqLegacyBody />
      )}
    </CabinetPageContent>
  );
}
