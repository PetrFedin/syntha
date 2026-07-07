'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { StatCard } from '@/components/stat-card';
import { DistributorSalesChart, RecentB2BOrders } from '@/components/distributor';
import {
  TrendingUp,
  MapPin,
  Handshake,
  DollarSign,
  BarChart3,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';

type Period = 'week' | 'month' | 'year';

const periodStats: Record<
  Period,
  { revenue: string; revenueChange: string; avgOrder: string; topRegion: string; retailers: string }
> = {
  week: {
    revenue: '3,500,000 ₽',
    revenueChange: '+7.1% к прошлой неделе',
    avgOrder: '41,176 ₽',
    topRegion: 'Москва — 42%',
    retailers: '28 активных',
  },
  month: {
    revenue: '15,200,000 ₽',
    revenueChange: '+15% к прошлому месяцу',
    avgOrder: '36,893 ₽',
    topRegion: 'Москва — 38%',
    retailers: '128 активных',
  },
  year: {
    revenue: '180,500,000 ₽',
    revenueChange: '+60% к прошлому году',
    avgOrder: '37,216 ₽',
    topRegion: 'ЦФО — 45%',
    retailers: '128 в сети',
  },
};

const topRegions = [
  { name: 'Москва', share: 38, revenue: '5,776,000 ₽', growth: '+12%' },
  { name: 'Санкт-Петербург', share: 22, revenue: '3,344,000 ₽', growth: '+8%' },
  { name: 'Краснодар', share: 11, revenue: '1,672,000 ₽', growth: '+18%' },
  { name: 'Екатеринбург', share: 9, revenue: '1,368,000 ₽', growth: '+5%' },
  { name: 'Казань', share: 6, revenue: '912,000 ₽', growth: '+22%' },
];

const topRetailersByVolume = [
  { name: 'Демо-магазин · Москва 2', volume: '2,400,000 ₽', orders: 14 },
  { name: 'Демо-магазин · Москва 1', volume: '1,850,000 ₽', orders: 22 },
  { name: 'KM20', volume: '1,500,000 ₽', orders: 8 },
  { name: 'Leform', volume: '980,000 ₽', orders: 12 },
  { name: 'Boutique No.7', volume: '720,000 ₽', orders: 9 },
];

export default function DistributorAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const stats = periodStats[period];

  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-6 pb-16">
      <header className="border-border-subtle flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <TrendingUp className="text-accent-primary h-6 w-6" /> Аналитика дистрибуции
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Региональный спрос, топ ритейлеров, динамика заказов и выручки.
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          {/* cabinetSurface v1: переключатель периода — те же токены, что в кабинете бренда */}
          <TabsList className={cabinetSurface.tabsList}>
            <TabsTrigger value="week" className={cn(cabinetSurface.tabsTrigger, 'h-7')}>
              Неделя
            </TabsTrigger>
            <TabsTrigger value="month" className={cn(cabinetSurface.tabsTrigger, 'h-7')}>
              Месяц
            </TabsTrigger>
            <TabsTrigger value="year" className={cn(cabinetSurface.tabsTrigger, 'h-7')}>
              Год
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Выручка (B2B)"
          value={stats.revenue}
          description={stats.revenueChange}
          icon={DollarSign}
        />
        <StatCard
          title="Средний чек заказа"
          value={stats.avgOrder}
          description="по выбранному периоду"
          icon={ShoppingCart}
        />
        <StatCard
          title="Топ регион"
          value={stats.topRegion}
          description="доля от выручки"
          icon={MapPin}
        />
        <StatCard
          title="Активных ритейлеров"
          value={stats.retailers}
          description="с заказами в периоде"
          icon={Handshake}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DistributorSalesChart />
        </div>
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="text-accent-primary h-4 w-4" /> Топ ритейлеров по объёму
            </CardTitle>
            <CardDescription>За выбранный период</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRetailersByVolume.map((r, i) => (
              <div
                key={r.name}
                className="border-border-subtle flex items-center justify-between border-b py-2 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-text-muted w-5 text-[10px] font-bold">{i + 1}</span>
                  <span className="text-sm font-medium">{r.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-text-primary text-sm font-bold">{r.volume}</p>
                  <p className="text-text-secondary text-[10px]">{r.orders} заказов</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="text-text-secondary h-4 w-4" /> Выручка по регионам
            </CardTitle>
            <CardDescription>Доля и рост к прошлому периоду</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topRegions.map((r) => (
                <li key={r.name} className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <div className="bg-bg-surface2 mt-1 h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-accent-primary h-full rounded-full"
                        style={{ width: `${r.share}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums">{r.revenue}</p>
                    <p className="text-[10px] font-medium text-emerald-600">{r.growth}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm">Недавние заказы</CardTitle>
              <CardDescription>Последние B2B-заказы от ритейлеров</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" asChild>
              <Link href={ROUTES.distributor.orders} className="gap-1">
                Все заказы <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentB2BOrders />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.distributor.home}>Обзор</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.distributor.orders}>Заказы</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.distributor.retailers}>Ритейлеры</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.distributor.commissions}>Комиссии</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
