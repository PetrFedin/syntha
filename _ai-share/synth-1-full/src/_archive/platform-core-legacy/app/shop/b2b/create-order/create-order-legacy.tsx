'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, FileSpreadsheet } from 'lucide-react';
import {
  ROUTES,
  shopB2bMatrixOrderContextHref,
  shopB2bWorkingOrderOrderContextHref,
} from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { getAgentBrands } from '@/lib/b2b/agent-context';
import { joorGetDeliveryWindows } from '@/lib/b2b/integrations';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { B2BIntegrationStatusWidget } from '@/components/b2b/B2BIntegrationStatusWidget';
import {
  dedupeEntityLinksByHref,
  finalizeRelatedModuleLinks,
  getShopB2BHubLinks,
  getSynthaThreeCoresQuickLinksForBuyer,
} from '@/lib/data/entity-links';
import { ShopB2bNuOrderScope } from '@/components/shop/ShopB2bNuOrderScope';
import { tid } from '@/lib/ui/test-ids';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { ShopB2bPlatformExportCard } from '@/components/shop/ShopB2bPlatformExportCard';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';
import { B2bOrderFormationSynthaEdgeCard } from '@/components/b2b/B2bOrderFormationSynthaEdgeCard';
import { B2bPriorityWorkflowPanel } from '@/components/b2b/B2bPriorityWorkflowPanel';
import { getSynthaThreeCoresFullMatrixGroups } from '@/lib/syntha-priority-cores';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';

const SEASONS = ['FW26', 'SS26', 'FW25'] as const;

export function ShopB2bCreateOrderLegacyPage() {
  const searchParams = useSearchParams();
  const dropId = searchParams.get('drop') ?? '';
  const orderContextId =
    searchParams.get('orderId')?.trim() || searchParams.get('order')?.trim() || '';
  const brands = getAgentBrands();
  const windows = joorGetDeliveryWindows();

  const matrixBrandSeasonHref = (brandName: string, season: string) => {
    const u = new URLSearchParams();
    u.set('brand', brandName);
    u.set('season', season);
    if (orderContextId) {
      u.set('order', orderContextId);
      u.set('orderId', orderContextId);
    }
    return `${ROUTES.shop.b2bMatrix}?${u.toString()}`;
  };

  return (
    <ShopB2bNuOrderScope className="space-y-6" data-testid={tid.page('shop-b2b-create-order')}>
      <ShopB2bContentHeader lead="JOOR: выбор бренда, сезона и коллекции — затем матрица заказа или Working Order." />
      <B2bOrderUrlContextBanner variant="shop" className="rounded-xl" />
      <B2bOrderFormationSynthaEdgeCard />
      <B2bPriorityWorkflowPanel
        title="Полная матрица направлений"
        lead="Те же группы, что на реестре B2B: ядро ТЗ→цех, оптовый контур, надстройка коммуникаций, горизонталь ролей."
        groups={getSynthaThreeCoresFullMatrixGroups()}
      />
      <ShopAnalyticsSegmentErpStrip />

      <ShopB2bPlatformExportCard />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase">Способ создания</CardTitle>
          <CardDescription>
            Матрица по артикулам или загрузка Excel (NuOrder Working Order).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="default"
            className="rounded-xl text-[10px] font-black uppercase tracking-widest"
            size="lg"
          >
            <Link
              href={
                orderContextId
                  ? shopB2bMatrixOrderContextHref(orderContextId)
                  : ROUTES.shop.b2bMatrix
              }
            >
              <LayoutGrid className="mr-2 h-4 w-4" /> Матрица заказа
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl text-[10px] font-black uppercase tracking-widest"
            size="lg"
          >
            <Link
              href={
                orderContextId
                  ? shopB2bWorkingOrderOrderContextHref(orderContextId)
                  : ROUTES.shop.b2bWorkingOrder
              }
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Working Order (Excel)
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase">Бренд и сезон</CardTitle>
          <CardDescription>Быстрый переход к заказу по бренду.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {brands.map((b) =>
            SEASONS.map((season) => (
              <Button
                key={`${b.id}-${season}`}
                variant="outline"
                size="sm"
                className="rounded-lg text-[10px] font-black uppercase"
                asChild
              >
                <Link href={matrixBrandSeasonHref(b.name, season)}>
                  {b.name} {season}
                </Link>
              </Button>
            ))
          )}
        </CardContent>
      </Card>

      {windows.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase">Окно доставки</CardTitle>
            <CardDescription>Текущий выбранный дроп: {dropId || 'не выбран'}.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href={LEGACY_ROUTES.shop.b2bDeliveryCalendar}>Выбрать в календаре поставок</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-create-order-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link
            href={ROUTES.shop.analyticsFootfall}
            data-testid="shop-b2b-create-order-footfall-link"
          >
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>

      <B2BIntegrationStatusWidget settingsHref={ROUTES.shop.b2bSettings} />
      <RelatedModulesBlock
        title="Связанные разделы и быстрые ядра"
        links={finalizeRelatedModuleLinks(
          dedupeEntityLinksByHref([
            ...getShopB2BHubLinks(),
            ...getSynthaThreeCoresQuickLinksForBuyer(),
          ])
        )}
      />
    </ShopB2bNuOrderScope>
  );
}
