'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';

/** ASOS: маржа и отчётность по брендам/категориям для ритейла (B2B заказы). */
const MOCK_BY_BRAND = [
  { brand: 'Syntha Lab', revenue: 2450000, cost: 1420000, margin: 42, turnover: 2.8 },
  { brand: 'Nordic Wool', revenue: 1800000, cost: 1080000, margin: 40, turnover: 2.4 },
];
const MOCK_BY_CATEGORY = [
  { category: 'Верхняя одежда', revenue: 2100000, margin: 44 },
  { category: 'Трикотаж', revenue: 1580000, margin: 39 },
  { category: 'Брюки', revenue: 1490000, margin: 41 },
];

export default function MarginReportPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Маржа и оборачиваемость по брендам и категориям для ритейла (ASOS-style)." />
      <ShopAnalyticsSegmentErpStrip />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>По брендам</CardTitle>
          <CardDescription>Выручка, себестоимость, маржа %, оборачиваемость</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_BY_BRAND.map((r) => (
              <li
                key={r.brand}
                className="bg-bg-surface2 flex items-center justify-between rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{r.brand}</p>
                  <p className="text-text-secondary text-xs">
                    {r.revenue.toLocaleString('ru-RU')} ₽ выручка · себестоимость{' '}
                    {r.cost.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">{r.margin}% маржа</p>
                  <p className="text-text-secondary text-xs">{r.turnover} оборота</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>По категориям</CardTitle>
          <CardDescription>Выручка и маржа по категориям</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_BY_CATEGORY.map((c) => (
              <li
                key={c.category}
                className="border-border-subtle flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{c.category}</span>
                <div className="text-right">
                  <span className="font-semibold">{c.revenue.toLocaleString('ru-RU')} ₽</span>
                  <span className="ml-2 text-emerald-600">{c.margin}%</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="border-border-subtle mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
          См. также
        </span>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-margin-report-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link
            href={ROUTES.shop.analyticsFootfall}
            data-testid="shop-b2b-margin-report-footfall-link"
          >
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.b2bOrders}>Заказы</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Заказы, аналитика заказов, fulfillment"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
