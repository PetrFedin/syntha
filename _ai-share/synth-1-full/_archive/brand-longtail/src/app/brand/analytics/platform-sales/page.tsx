'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store, Tag, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAnalyticsLinks } from '@/lib/data/entity-links';
import { cn } from '@/lib/utils';
import { RegistryPageHeader } from '@/components/design-system';
import {
  PLATFORM_SALES_DEMO_MARKETROOM,
  PLATFORM_SALES_DEMO_OUTLET,
} from '@/lib/brand/analytics/platform-sales-demo-fixtures';

export default function PlatformSalesPage() {
  const [period, setPeriod] = useState('30d');

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Статистика: Маркетрум и Аутлет"
        leadPlain="Полная статистика продаж на платформе — выручка, заказы, единицы, топ товаров по каналу."
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.analyticsBi} aria-label="Назад к BI">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">За 7 дней</SelectItem>
              <SelectItem value="30d">За 30 дней</SelectItem>
              <SelectItem value="90d">За 90 дней</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-accent-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Store className="text-accent-primary h-5 w-5" /> Маркетрум
                </CardTitle>
                <CardDescription>
                  Продажи в маркетруме платформы (полная цена, новые коллекции)
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.marketroom}>Открыть Маркетрум</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-text-secondary text-xs">Выручка</p>
                <p className="text-accent-primary text-xl font-black">
                  {PLATFORM_SALES_DEMO_MARKETROOM.revenue}
                </p>
                <p
                  className={cn(
                    'text-xs font-medium',
                    PLATFORM_SALES_DEMO_MARKETROOM.revenueChange >= 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  )}
                >
                  {PLATFORM_SALES_DEMO_MARKETROOM.revenueChange >= 0 ? '+' : ''}
                  {PLATFORM_SALES_DEMO_MARKETROOM.revenueChange}% к пред. периоду
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs">Заказы</p>
                <p className="text-xl font-black">{PLATFORM_SALES_DEMO_MARKETROOM.orders}</p>
                <p className="text-text-secondary text-xs">
                  +{PLATFORM_SALES_DEMO_MARKETROOM.ordersChange} заказов
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs">Единиц</p>
                <p className="text-xl font-black">{PLATFORM_SALES_DEMO_MARKETROOM.units}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs">Средний чек</p>
                <p className="text-xl font-black">{PLATFORM_SALES_DEMO_MARKETROOM.avgCheck}</p>
              </div>
            </div>
            <div>
              <p className="text-text-secondary mb-2 text-xs font-medium">
                Топ товаров (Маркетрум)
              </p>
              <ul className="space-y-2">
                {PLATFORM_SALES_DEMO_MARKETROOM.topProducts.map((p, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="truncate pr-2">{p.name}</span>
                    <span className="shrink-0 font-semibold">
                      {p.revenue} · {p.units} шт
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-5 w-5 text-amber-600" /> Аутлет
            </CardTitle>
            <CardDescription>Уценённые позиции, ликвидация остатков на платформе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-text-secondary text-xs">Выручка</p>
                <p className="text-xl font-black text-amber-700">
                  {PLATFORM_SALES_DEMO_OUTLET.revenue}
                </p>
                <p
                  className={cn(
                    'text-xs font-medium',
                    PLATFORM_SALES_DEMO_OUTLET.revenueChange >= 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  )}
                >
                  {PLATFORM_SALES_DEMO_OUTLET.revenueChange >= 0 ? '+' : ''}
                  {PLATFORM_SALES_DEMO_OUTLET.revenueChange}% к пред. периоду
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs">Заказы</p>
                <p className="text-xl font-black">{PLATFORM_SALES_DEMO_OUTLET.orders}</p>
                <p className="text-text-secondary text-xs">
                  +{PLATFORM_SALES_DEMO_OUTLET.ordersChange} заказов
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs">Единиц</p>
                <p className="text-xl font-black">{PLATFORM_SALES_DEMO_OUTLET.units}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs">Средний чек</p>
                <p className="text-xl font-black">{PLATFORM_SALES_DEMO_OUTLET.avgCheck}</p>
              </div>
            </div>
            <div>
              <p className="text-text-secondary mb-2 text-xs font-medium">Топ товаров (Аутлет)</p>
              <ul className="space-y-2">
                {PLATFORM_SALES_DEMO_OUTLET.topProducts.map((p, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="truncate pr-2">{p.name}</span>
                    <span className="shrink-0 font-semibold">
                      {p.revenue} · {p.units} шт
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Сводка по платформе</CardTitle>
          <CardDescription>Общая выручка Маркетрум + Аутлет за выбранный период</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent-primary/15 flex h-12 w-12 items-center justify-center rounded-xl">
                <Store className="text-accent-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-text-secondary text-xs">Маркетрум</p>
                <p className="text-lg font-black">{PLATFORM_SALES_DEMO_MARKETROOM.revenue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Tag className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-text-secondary text-xs">Аутлет</p>
                <p className="text-lg font-black">{PLATFORM_SALES_DEMO_OUTLET.revenue}</p>
              </div>
            </div>
            <div className="border-border-default flex items-center gap-3 border-l pl-4">
              <p className="text-text-secondary text-xs">Итого платформа</p>
              <p className="text-accent-primary text-xl font-black">500 000 ₽</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.marketroom}>Маркетрум (каталог)</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.analyticsUnified}>Сводная аналитика</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.analyticsExternalSales}>Внешние продажи</Link>
        </Button>
      </div>
      <RelatedModulesBlock links={getAnalyticsLinks()} title="BI, 360°, внешние продажи" />
    </CabinetPageContent>
  );
}
