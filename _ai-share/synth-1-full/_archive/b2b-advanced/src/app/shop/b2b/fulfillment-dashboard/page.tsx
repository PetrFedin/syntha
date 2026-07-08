'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, BarChart2, RefreshCcw } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { withShopB2bCoreLegacyGuard } from '@/app/shop/b2b/shop-b2b-core-legacy-guard';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getFulfillmentDashboardCrossRoleLinks } from '@/lib/data/entity-links';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';

/** Zalando ZEOS: единый фулфилмент по каналам, Replenishment Engine, портал аналитики (zDirect-style). */
const MOCK_CHANNELS = [
  { id: 'zeos', name: 'ZEOS', orders: 1240, units: 18200, share: 62 },
  { id: 'own', name: 'Свой склад', orders: 580, units: 7200, share: 28 },
  { id: 'marketplace', name: 'Маркетплейс', orders: 190, units: 2100, share: 10 },
];
const MOCK_REPLENISH = [
  {
    sku: 'CTP-26-001',
    name: 'Graphene Parka',
    suggestQty: 80,
    window: 'Drop 2',
    reason: 'Продажи +45%',
  },
  {
    sku: 'CTP-26-002',
    name: 'Merino Sweater',
    suggestQty: 120,
    window: 'Drop 2',
    reason: 'Низкий остаток',
  },
];

function FulfillmentDashboardPageContent() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Каналы исполнения и пополнение (ZEOS / zDirect). Ниже — связки с заказами бренда, производством и трекингом." />
      <ShopAnalyticsSegmentErpStrip />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Каналы исполнения</CardTitle>
          <CardDescription>Объёмы по fulfillmentChannel (zeos / own / marketplace)</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_CHANNELS.map((c) => (
              <li
                key={c.id}
                className="bg-bg-surface2 flex items-center justify-between rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <Package className="text-text-muted h-5 w-5" />
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-text-secondary text-xs">
                      {c.orders} заказов · {c.units.toLocaleString('ru-RU')} ед.
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{c.share}%</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" /> Replenishment Engine (AI)
          </CardTitle>
          <CardDescription>
            Рекомендации: что докупить, в каком объёме, по каким окнам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_REPLENISH.map((r) => (
              <li
                key={r.sku}
                className="border-border-subtle flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-text-secondary text-xs">
                    {r.reason} · Окно: {r.window}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-accent-primary font-semibold">+{r.suggestQty} ед.</p>
                  <Button variant="outline" size="sm" className="mt-1">
                    В заказ
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" /> Портал аналитики (zDirect-style)
          </CardTitle>
          <CardDescription>Конверсия, возвраты, бенчмарки по сегменту</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div className="bg-bg-surface2 rounded-lg p-3">
              <p className="text-2xl font-bold">94%</p>
              <p className="text-text-secondary text-xs">Конверсия заказов</p>
            </div>
            <div className="bg-bg-surface2 rounded-lg p-3">
              <p className="text-2xl font-bold">4.2%</p>
              <p className="text-text-secondary text-xs">Возвраты</p>
            </div>
            <div className="bg-bg-surface2 rounded-lg p-3">
              <p className="text-2xl font-bold">1.8 дн.</p>
              <p className="text-text-secondary text-xs">Среднее время доставки</p>
            </div>
            <div className="bg-bg-surface2 rounded-lg p-3">
              <p className="text-2xl font-bold">Top 15%</p>
              <p className="text-text-secondary text-xs">Бенчмарк сегмента</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-border-subtle flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link
            href={ROUTES.shop.analytics}
            data-testid="shop-b2b-fulfillment-dashboard-retail-link"
          >
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link
            href={ROUTES.shop.analyticsFootfall}
            data-testid="shop-b2b-fulfillment-dashboard-footfall-link"
          >
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bReplenishment}>Автопополнение</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bOrders}>Заказы B2B</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bTracking}>Трекинг</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.b2bOrders}>Исполнение (бренд)</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getFulfillmentDashboardCrossRoleLinks()}
        title="Бренд, factory и ритейл"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}

export default withShopB2bCoreLegacyGuard(
  ROUTES.shop.b2bFulfillmentDashboard,
  FulfillmentDashboardPageContent
);
