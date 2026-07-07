'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Package, Store, Globe, ArrowLeft, Layers } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAnalyticsLinks } from '@/lib/data/entity-links';
import { buildBIDashboard } from '@/lib/analytics/bi-service';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { RegistryPageHeader } from '@/components/design-system';

/** Сводная аналитика: все каналы (B2B, Маркетрум, Аутлет, внешние продажи) на одной платформе для полного анализа. */
const MOCK_UNIFIED = {
  byChannel: [
    { id: 'b2b', label: 'B2B опт', value: '2.4M ₽', share: 48, color: 'bg-accent-primary' },
    { id: 'marketroom', label: 'Маркетрум', value: '380K ₽', share: 8, color: 'bg-emerald-500' },
    { id: 'outlet', label: 'Аутлет', value: '120K ₽', share: 2, color: 'bg-amber-500' },
    {
      id: 'external',
      label: 'Внешние (партнёры)',
      value: '4.83M ₽',
      share: 42,
      color: 'bg-accent-primary/100',
    },
  ],
  byCollection: [
    {
      name: 'FW26 Основная',
      b2b: '1.2M ₽',
      marketroom: '180K ₽',
      outlet: '0',
      external: '4.23M ₽',
      total: '5.61M ₽',
    },
    {
      name: 'FW26 Techwear',
      b2b: '0.4M ₽',
      marketroom: '120K ₽',
      outlet: '0',
      external: '420K ₽',
      total: '940K ₽',
    },
    {
      name: 'SS25 Остатки',
      b2b: '0',
      marketroom: '80K ₽',
      outlet: '120K ₽',
      external: '180K ₽',
      total: '380K ₽',
    },
  ],
  totalRevenue: '4.93M ₽',
};

export default function UnifiedAnalyticsPage() {
  const [data] = useState(() => buildBIDashboard());

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Сводная аналитика"
        leadPlain="Полный анализ: B2B, Маркетрум, Аутлет и продажи закупленных коллекций на других площадках — все данные сведены на платформе."
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.analyticsBi} aria-label="Назад к BI">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <Card className="border-accent-primary/20 from-accent-primary/10 bg-gradient-to-br to-white">
        <CardHeader>
          <CardTitle className="text-sm">Общая выручка (все каналы)</CardTitle>
          <CardDescription>Сумма по всем источникам за отчётный период</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-accent-primary text-3xl font-black">{MOCK_UNIFIED.totalRevenue}</p>
          <p className="text-text-secondary mt-1 text-xs">
            B2B + платформа (Маркетрум, Аутлет) + внешние продажи партнёров
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="channels" className="space-y-4">
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'w-fit flex-wrap')}>
          <TabsTrigger value="channels" className={cn(cabinetSurface.tabsTrigger, 'h-8')}>
            По каналам
          </TabsTrigger>
          <TabsTrigger value="collections" className={cn(cabinetSurface.tabsTrigger, 'h-8')}>
            По коллекциям
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Распределение по каналам</CardTitle>
              <CardDescription>
                Доля выручки: B2B опт, Маркетрум платформы, Аутлет, продажи партнёров на
                WB/Ozon/свой сайт
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_UNIFIED.byChannel.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-4">
                    <div className="flex w-32 items-center gap-2">
                      <div className={cn('h-3 w-3 rounded-full', ch.color)} />
                      <span className="text-sm font-medium">{ch.label}</span>
                    </div>
                    <div className="bg-bg-surface2 h-8 flex-1 overflow-hidden rounded-lg">
                      <div
                        className={cn('h-full rounded-lg', ch.color)}
                        style={{ width: `${ch.share}%` }}
                      />
                    </div>
                    <span className="w-24 text-right text-sm font-semibold">{ch.value}</span>
                    <span className="text-text-secondary w-10 text-xs">{ch.share}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4" /> Выручка по коллекциям (все каналы)
              </CardTitle>
              <CardDescription>
                Одна коллекция может продаваться в B2B, в Маркетруме, в Аутлете и у партнёров на
                других площадках — здесь сводка по каждому источнику
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-border-default border-b">
                      <th className="py-3 text-left font-medium">Коллекция</th>
                      <th className="py-3 text-right font-medium">B2B</th>
                      <th className="py-3 text-right font-medium">Маркетрум</th>
                      <th className="py-3 text-right font-medium">Аутлет</th>
                      <th className="py-3 text-right font-medium">Внешние</th>
                      <th className="py-3 text-right font-semibold">Итого</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_UNIFIED.byCollection.map((row, i) => (
                      <tr key={i} className="border-border-subtle border-b">
                        <td className="py-3 font-medium">{row.name}</td>
                        <td className="text-text-secondary py-3 text-right">{row.b2b}</td>
                        <td className="text-text-secondary py-3 text-right">{row.marketroom}</td>
                        <td className="text-text-secondary py-3 text-right">{row.outlet}</td>
                        <td className="text-text-secondary py-3 text-right">{row.external}</td>
                        <td className="py-3 text-right font-semibold">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.b2bOrders}>
            <Package className="mr-2 h-4 w-4" /> Заказы
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.analyticsPlatformSales}>
            <Store className="mr-2 h-4 w-4" /> Маркетрум и Аутлет
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.analyticsExternalSales}>
            <Globe className="mr-2 h-4 w-4" /> Внешние продажи
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.analyticsBi}>
            <BarChart3 className="mr-2 h-4 w-4" /> BI Hub
          </Link>
        </Button>
      </div>
      <RelatedModulesBlock links={getAnalyticsLinks()} title="BI, 360°, платформа" />
    </CabinetPageContent>
  );
}
