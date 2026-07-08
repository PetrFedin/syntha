'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { ShopAnalyticsSegmentErpStrip } from '@/components/shop/ShopAnalyticsSegmentErpStrip';
import { B2bMarginAnalysisHubButton } from '@/components/shop/B2bMarginAnalysisHubButton';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

/** NuOrder: аналитика по заказам — топ стилей, тренды по категориям, сравнение с прошлым сезоном. */
const MOCK_TOP_STYLES = [
  {
    sku: 'CTP-26-001',
    name: 'Graphene Parka',
    category: 'Верхняя одежда',
    brand: 'Syntha Lab',
    units: 420,
    change: '+18%',
  },
  {
    sku: 'CTP-26-002',
    name: 'Merino Sweater',
    category: 'Трикотаж',
    brand: 'Syntha Lab',
    units: 380,
    change: '+5%',
  },
  {
    sku: 'CTP-26-003',
    name: 'Tech Trousers',
    category: 'Брюки',
    brand: 'Syntha Lab',
    units: 290,
    change: '-2%',
  },
  {
    sku: 'NW-K001-BLK',
    name: 'Кашемировый лонгслив',
    category: 'Трикотаж',
    brand: 'Nordic Wool',
    units: 310,
    change: '+12%',
  },
  {
    sku: 'NW-SCF-02',
    name: 'Шерстяной платок',
    category: 'Аксессуары',
    brand: 'Nordic Wool',
    units: 180,
    change: '-5%',
  },
];
const MOCK_TRENDS = [
  { category: 'Верхняя одежда', thisSeason: 1200, lastSeason: 980, change: '+22%' },
  { category: 'Трикотаж', thisSeason: 890, lastSeason: 910, change: '-2%' },
  { category: 'Брюки', thisSeason: 650, lastSeason: 520, change: '+25%' },
];
/** Заказы по месяцам (NuOrder-style дашборд) */
const MOCK_ORDERS_BY_MONTH = [
  { month: 'Сен 25', orders: 8, amount: 2.1 },
  { month: 'Окт 25', orders: 12, amount: 3.4 },
  { month: 'Ноя 25', orders: 10, amount: 2.8 },
  { month: 'Дек 25', orders: 15, amount: 4.2 },
  { month: 'Янв 26', orders: 11, amount: 3.1 },
  { month: 'Фев 26', orders: 14, amount: 3.9 },
  { month: 'Мар 26', orders: 9, amount: 2.5 },
];
const BRANDS = ['Все бренды', 'Syntha Lab', 'Nordic Wool'];

export default function OrderAnalyticsPage() {
  const [brandFilter, setBrandFilter] = useState('Все бренды');
  const maxOrders = Math.max(...MOCK_ORDERS_BY_MONTH.map((m) => m.orders));
  const filteredStyles =
    brandFilter === 'Все бренды'
      ? MOCK_TOP_STYLES
      : MOCK_TOP_STYLES.filter((s) => s.brand === brandFilter);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader
        lead="Топ стилей, тренды по категориям и заказы по месяцам."
        trailing={
          <div>
            <label className="text-text-secondary mb-1 block text-xs">Бренд</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="border-border-default rounded-lg border px-3 py-2 text-sm"
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <ShopAnalyticsSegmentErpStrip />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Заказы по месяцам</CardTitle>
          <CardDescription>
            Количество заказов и сумма (млн ₽) — тренд для планирования
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-end gap-2">
            {MOCK_ORDERS_BY_MONTH.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="flex h-24 w-full flex-col justify-end"
                  title={`${m.orders} заказов, ${m.amount} млн ₽`}
                >
                  <div
                    className="bg-accent-primary rounded-t text-center text-[10px] text-white"
                    style={{
                      height: `${(m.orders / maxOrders) * 100}%`,
                      minHeight: m.orders ? '8px' : 0,
                    }}
                  >
                    {m.orders}
                  </div>
                </div>
                <span className="text-text-secondary text-[10px] font-medium">{m.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Топ стилей (текущий сезон)</CardTitle>
          <CardDescription>
            По объёму заказов {brandFilter !== 'Все бренды' ? `· ${brandFilter}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {filteredStyles.map((s, i) => (
              <li
                key={s.sku}
                className="bg-bg-surface2 flex items-center justify-between rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-text-muted w-6 font-mono">{i + 1}</span>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-text-secondary text-xs">
                      {s.sku} · {s.category} · {s.brand}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{s.units} ед.</p>
                  <p
                    className={`text-xs ${s.change.startsWith('+') ? 'text-emerald-600' : 'text-text-secondary'}`}
                  >
                    {s.change} к прошлому сезону
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Тренды по категориям</CardTitle>
          <CardDescription>Сравнение с прошлым сезоном</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_TRENDS.map((t) => (
              <li
                key={t.category}
                className="border-border-subtle flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{t.category}</span>
                <div className="flex items-center gap-4">
                  <span className="text-text-secondary text-sm">
                    {t.lastSeason} → {t.thisSeason} ед.
                  </span>
                  <span
                    className={
                      t.change.startsWith('+')
                        ? 'font-medium text-emerald-600'
                        : 'text-text-secondary'
                    }
                  >
                    {t.change}
                  </span>
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
          <Link href={ROUTES.shop.analytics} data-testid="shop-b2b-order-analytics-retail-link">
            Розничная аналитика
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link
            href={ROUTES.shop.analyticsFootfall}
            data-testid="shop-b2b-order-analytics-footfall-link"
          >
            Трафик по зонам
          </Link>
        </Button>
        <B2bMarginAnalysisHubButton />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.b2bOrders}>Мои заказы</Link>
        </Button>
        <Button variant="outline" size="sm" className="text-xs font-black uppercase" asChild>
          <Link href={ROUTES.shop.b2bAnalytics}>Аналитика закупок (B2B)</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Заказы, матрица, маржа, fulfillment"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
