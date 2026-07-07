'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import {
  Download,
  Package,
  DollarSign,
  Factory,
  Warehouse,
  Store,
  TrendingUp,
  Upload,
  FileSpreadsheet,
  Database,
  Zap,
  Users,
  Layers,
  ChevronRight,
  ArrowUpRight,
  PieChart,
  Truck,
  Megaphone,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Globe,
  MapPin,
  Target,
  BarChart2,
} from 'lucide-react';
import { buildBIDashboard, exportBIDataToCSV } from '@/lib/analytics/bi-service';
import { useRbac } from '@/hooks/useRbac';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { getAnalyticsLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { B2B_ORDERS_REGISTRY_LABEL } from '@/lib/ui/b2b-registry-label';

export default function BIAnalyticsPage() {
  const { can } = useRbac();
  const { toast } = useToast();
  const [data] = useState(() => buildBIDashboard());
  const [importSource, setImportSource] = useState<'1c' | 'excel' | 'moi_sklad' | null>(null);

  const canExport = can('analytics', 'export');

  const handleExport = () => {
    const csv = exportBIDataToCSV(data);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bi-dashboard-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Экспорт', description: 'BI дашборд экспортирован' });
  };

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <Card className="border-border-default bg-bg-surface2/80 rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Дашборды аналитики</CardTitle>
          <CardDescription>
            План vs Факт, закупки, Маркетрум/Аутлет, сводная аналитика, Sell-Through BI, Markdown,
            Geo-Demand
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.budgetActual}>План vs Факт</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.analyticsPhase2}>Phase 2 Закупки</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.analyticsPlatformSales}>Маркетрум и Аутлет</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.analyticsUnified}>Сводная аналитика</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.analyticsExternalSales}>Внешние продажи</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.analyticsSellThrough}>Sell-Through BI</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.pricingMarkdown}>Markdown Optimizer</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.analyticsGeoDemand}>Geo-Demand Heatmap</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase">B2B Analytics Hub</h1>
          <p className="text-text-secondary text-sm">
            Продажи, производство, остатки, платформа, коллекции, дистрибуторы
          </p>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.controlCenter}>Центр управления</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-h-9 w-full shadow-inner')}>
          <TabsTrigger
            value="overview"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7'
            )}
          >
            Сводка
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7'
            )}
          >
            Продажи
          </TabsTrigger>
          <TabsTrigger
            value="production"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7'
            )}
          >
            Production
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7'
            )}
          >
            Остатки
          </TabsTrigger>
          <TabsTrigger
            value="network"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7'
            )}
          >
            Network Sell-Through
          </TabsTrigger>
          <TabsTrigger
            value="geo"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7'
            )}
          >
            Geo-Demand
          </TabsTrigger>
          <TabsTrigger
            value="sentiment"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7'
            )}
          >
            Trend Sentiment
          </TabsTrigger>
          <TabsTrigger
            value="budget"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7'
            )}
          >
            Budget vs Actual
          </TabsTrigger>
          <TabsTrigger
            value="import"
            className={cn(
              cabinetSurface.tabsTrigger,
              'data-[state=active]:text-accent-primary h-7'
            )}
          >
            Импорт данных
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className={cabinetSurface.cabinetProfileTabPanel}>
          {/* KPI карточки */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            <Link href={ROUTES.brand.production}>
              <Card className="hover:border-accent-primary/30 h-full cursor-pointer transition-colors">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-xs">
                    <Factory className="text-accent-primary h-4 w-4" /> Production
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-black">{data.production.poCount} PO</p>
                  <p className="text-text-secondary text-[10px]">
                    {data.production.shippedCount} отгружено · {data.production.collectionsCount}{' '}
                    колл.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href={ROUTES.brand.b2bOrders}>
              <Card className="hover:border-accent-primary/30 h-full cursor-pointer transition-colors">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-xs">
                    <Package className="text-accent-primary h-4 w-4" /> {B2B_ORDERS_REGISTRY_LABEL}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-black">{data.b2b.revenue}</p>
                  <p className="text-text-secondary text-[10px]">
                    {data.b2b.ordersCount} заказов · {data.b2b.retailersCount} ритейлеров
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href={ROUTES.brand.finance}>
              <Card className="hover:border-accent-primary/30 h-full cursor-pointer transition-colors">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-xs">
                    <DollarSign className="h-4 w-4 text-emerald-600" /> Finance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-black">{data.finance.revenueMonth}</p>
                  <p className="text-[10px] font-bold text-emerald-600">{data.finance.pnl} P&L</p>
                </CardContent>
              </Card>
            </Link>
            <Link href={ROUTES.brand.warehouse}>
              <Card className="hover:border-accent-primary/30 h-full cursor-pointer transition-colors">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-xs">
                    <Warehouse className="h-4 w-4 text-amber-600" /> Склад
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-black">{data.warehouse.totalUnits} ед.</p>
                  <p className="text-text-secondary text-[10px]">
                    {data.warehouse.skuCount} SKU · оборачиваемость {data.warehouse.turnoverRate}
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href={ROUTES.brand.showroom}>
              <Card className="hover:border-accent-primary/30 h-full cursor-pointer transition-colors">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-xs">
                    <Store className="h-4 w-4 text-blue-600" /> Marketroom
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-black">{data.platform.marketroomRevenue}</p>
                  <p className="text-text-secondary text-[10px]">
                    Outlet: {data.platform.outletRevenue}
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href={ROUTES.brand.customers}>
              <Card className="hover:border-accent-primary/30 h-full cursor-pointer transition-colors">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-xs">
                    <Users className="h-4 w-4 text-rose-600" /> Клиенты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-black">{data.platform.customerBase}</p>
                  <p className="text-text-secondary text-[10px]">
                    {data.platform.preOrders} предзаказов
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* По каналам */}
          <Card className="border-border-subtle rounded-xl border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <PieChart className="h-4 w-4" /> Выручка по каналам
              </CardTitle>
              <CardDescription>Распределение продаж</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.entries(data.byChannel).map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-bg-surface2 flex items-center justify-between rounded-lg p-3"
                  >
                    <span className="text-text-secondary text-[11px] font-bold uppercase">
                      {k === 'b2b'
                        ? 'B2B Опт'
                        : k === 'b2c'
                          ? 'B2C'
                          : k === 'marketroom'
                            ? 'Marketroom'
                            : 'Outlet'}
                    </span>
                    <span className="text-text-primary font-black">{v}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Топ ритейлеры + по коллекциям */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border-subtle rounded-xl border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Топ ритейлеры</CardTitle>
                <Button variant="ghost" size="sm" className="text-[10px]" asChild>
                  <Link href={ROUTES.brand.retailers}>
                    Все <ChevronRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.topRetailers.map((r, i) => (
                    <div
                      key={i}
                      className="hover:bg-bg-surface2 flex items-center justify-between rounded-lg p-2"
                    >
                      <span className="text-sm font-medium">{r.name}</span>
                      <span className="font-bold tabular-nums">{r.revenue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border-subtle rounded-xl border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">По коллекциям / дропам</CardTitle>
                <Button variant="ghost" size="sm" className="text-[10px]" asChild>
                  <Link href={ROUTES.brand.planning}>
                    Планирование <ChevronRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.byCollection.map((c, i) => (
                    <div
                      key={i}
                      className="hover:bg-bg-surface2 flex items-center justify-between rounded-lg p-2"
                    >
                      <span className="text-sm font-medium">{c.name}</span>
                      <div className="text-right">
                        <span className="block font-bold tabular-nums">{c.revenue}</span>
                        <span className="text-text-secondary text-[10px]">
                          Sell-through {c.sellThrough}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="border-accent-primary/20 bg-accent-primary/10 rounded-xl border">
            <CardHeader>
              <CardTitle>B2B и дистрибуторы</CardTitle>
              <CardDescription>Продажи магазинам, дистрибуторам (как у Zara, H&M)</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-4">
                <p className="text-text-secondary text-[10px] font-bold uppercase">Выручка B2B</p>
                <p className="text-xl font-black">{data.b2b.revenue}</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <p className="text-text-secondary text-[10px] font-bold uppercase">Дистрибуторы</p>
                <p className="text-xl font-black">{data.b2b.distributorsRevenue}</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <p className="text-text-secondary text-[10px] font-bold uppercase">
                  Дропов коллекций
                </p>
                <p className="text-xl font-black">{data.b2b.collectionDrops}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-accent-primary/30 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                Платформа: Marketroom, Outlet, Pre-orders
                <Link
                  href={ROUTES.brand.analyticsPlatformSales}
                  className="text-accent-primary text-xs font-normal hover:underline"
                >
                  Полная статистика →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-text-secondary text-[10px]">Marketroom</p>
                <p className="font-black">{data.platform.marketroomRevenue}</p>
              </div>
              <div>
                <p className="text-text-secondary text-[10px]">Outlet</p>
                <p className="font-black">{data.platform.outletRevenue}</p>
              </div>
              <div>
                <p className="text-text-secondary text-[10px]">Предзаказы</p>
                <p className="font-black">{data.platform.preOrders}</p>
              </div>
              <div>
                <p className="text-text-secondary text-[10px]">База клиентов</p>
                <p className="font-black">{data.platform.customerBase}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className={cabinetSurface.cabinetProfileTabPanel}>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-text-secondary text-[10px]">PO в работе</p>
                <p className="text-xl font-black">{data.production.poCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-text-secondary text-[10px]">Отгружено</p>
                <p className="text-xl font-black">{data.production.shippedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-text-secondary text-[10px]">Lead time (дн.)</p>
                <p className="text-xl font-black">{data.production.avgLeadTime}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-text-secondary text-[10px]">Узких мест</p>
                <p className="text-xl font-black text-amber-600">
                  {data.production.bottleneckOrders}
                </p>
              </CardContent>
            </Card>
          </div>
          <Button variant="outline" asChild>
            <Link href={ROUTES.brand.production}>Production →</Link>
          </Button>
        </TabsContent>

        <TabsContent value="inventory" className={cabinetSurface.cabinetProfileTabPanel}>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-text-secondary text-[10px]">SKU</p>
                <p className="text-xl font-black">{data.warehouse.skuCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-text-secondary text-[10px]">Всего ед.</p>
                <p className="text-xl font-black">{data.warehouse.totalUnits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-text-secondary text-[10px]">Оборачиваемость</p>
                <p className="text-xl font-black">{data.warehouse.turnoverRate}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-text-secondary text-[10px]">Мёртвый сток</p>
                <p className="text-xl font-black text-rose-600">{data.warehouse.deadStock}</p>
              </CardContent>
            </Card>
          </div>
          <Button variant="outline" asChild>
            <Link href={ROUTES.brand.warehouse}>Склад →</Link>
          </Button>
        </TabsContent>

        <TabsContent value="network" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="border-accent-primary/20 bg-accent-primary/10 rounded-xl border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Network Sell-Through BI
              </CardTitle>
              <CardDescription>
                Анонимизированное сравнение своих продаж со средними показателями индустрии.
                Benchmark по категориям, регионам, сезонам.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-text-secondary text-[10px] font-bold uppercase">
                    Ваш Sell-Through
                  </p>
                  <p className="text-2xl font-black">72%</p>
                  <p className="mt-1 text-[10px] text-emerald-600">+5% vs индустрия</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-text-secondary text-[10px] font-bold uppercase">
                    Среднее по индустрии
                  </p>
                  <p className="text-2xl font-black">67%</p>
                  <p className="text-text-secondary mt-1 text-[10px]">Fashion, premium</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-text-secondary text-[10px] font-bold uppercase">
                    Топ-25% брендов
                  </p>
                  <p className="text-2xl font-black">78%</p>
                  <p className="text-text-secondary mt-1 text-[10px]">Ваш потенциал</p>
                </div>
              </div>
              <p className="text-text-muted mt-4 text-[10px]">
                Данные агрегируются анонимно. Подключите импорт из 1С/Мой Склад для актуализации.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="border-accent-primary/20 bg-accent-primary/10 rounded-xl border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Geo-Demand Heatmap
              </CardTitle>
              <CardDescription>
                Карта реального спроса для планирования открытий новых точек и распределения стока
                по регионам.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-bg-surface2 border-border-default flex h-64 items-center justify-center rounded-xl border">
                <div className="text-text-secondary text-center">
                  <MapPin className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p className="text-sm font-bold">Интерактивная карта спроса</p>
                  <p className="text-[11px]">Москва, СПб, регионы — тепловая карта заказов</p>
                  <p className="text-text-muted mt-2 text-[10px]">
                    Скоро: подключение к данным продаж
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {['Москва', 'СПб', 'Регионы', 'Онлайн'].map((r, i) => (
                  <div key={i} className="rounded-lg border bg-white p-3 text-center">
                    <p className="text-text-secondary text-[10px]">{r}</p>
                    <p className="font-black">{[42, 18, 28, 12][i]}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="border-accent-primary/20 bg-accent-primary/10 rounded-xl border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" /> Trend Sentiment Radar
              </CardTitle>
              <CardDescription>
                Анализ соцсетей (TikTok, Instagram) для корректировки дизайна в текущем цикле.
                Тональность и тренды по хэштегам.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-text-secondary mb-2 text-[10px] font-bold uppercase">
                    TikTok · #streetwear #fashion
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="bg-bg-surface2 h-3 flex-1 overflow-hidden rounded-full">
                      <div className="h-full w-[72%] rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-sm font-black text-emerald-600">72% позитив</span>
                  </div>
                  <p className="text-text-secondary mt-2 text-[11px]">
                    Рост упоминаний oversized, cargo
                  </p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-text-secondary mb-2 text-[10px] font-bold uppercase">
                    Instagram · бренд и конкуренты
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="bg-bg-surface2 h-3 flex-1 overflow-hidden rounded-full">
                      <div className="bg-accent-primary h-full w-[65%] rounded-full" />
                    </div>
                    <span className="text-accent-primary text-sm font-black">65% позитив</span>
                  </div>
                  <p className="text-text-secondary mt-2 text-[11px]">
                    Запрос на экологичные материалы
                  </p>
                </div>
              </div>
              <div className="bg-bg-surface2 border-border-default text-text-secondary mt-4 rounded-lg border p-3 text-[11px]">
                <strong>Радар трендов:</strong> Подключите API TikTok/Instagram или загружайте
                отчёты для актуализации. Рекомендации по дизайну и ассортименту в текущем дропе.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="border-accent-primary/20 bg-accent-primary/10 rounded-xl border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" /> Budget vs Actual
              </CardTitle>
              <CardDescription>
                Сравнение плановых и фактических затрат по коллекциям. Контроль бюджета на каждом
                этапе.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'SS26 Main',
                    planned: '2.4M ₽',
                    actual: '2.1M ₽',
                    diff: '-12%',
                    ok: true,
                  },
                  {
                    name: 'SS26 Drop 2',
                    planned: '1.8M ₽',
                    actual: '2.0M ₽',
                    diff: '+11%',
                    ok: false,
                  },
                  { name: 'AW26', planned: '3.2M ₽', actual: '—', diff: 'В работе', ok: null },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border bg-white p-3"
                  >
                    <span className="font-medium">{row.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-text-secondary text-sm">План: {row.planned}</span>
                      <span className="text-sm font-bold">Факт: {row.actual}</span>
                      <span
                        className={cn(
                          'text-[11px] font-bold',
                          row.ok === true && 'text-emerald-600',
                          row.ok === false && 'text-amber-600',
                          row.ok === null && 'text-text-muted'
                        )}
                      >
                        {row.diff}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="default" size="sm" asChild>
                  <Link href={ROUTES.brand.budgetActual}>Полный отчёт План vs Факт →</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.brand.production}>Production → Бюджет коллекций</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="border-accent-primary/30 bg-accent-primary/10 rounded-xl border-2 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" /> Загрузка и интеграция данных
              </CardTitle>
              <CardDescription>
                Импорт результатов продаж из других магазинов и платформ: 1С, Excel, Мой Склад.
                Данные объединяются с аналитикой платформы.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => setImportSource('1c')}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all',
                    importSource === '1c'
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-border-default hover:border-accent-primary/30 bg-white'
                  )}
                >
                  <Database className="text-accent-primary mb-2 h-8 w-8" />
                  <p className="text-sm font-bold">1С:Предприятие</p>
                  <p className="text-text-secondary mt-1 text-[11px]">
                    Интеграция через API или выгрузку
                  </p>
                </button>
                <button
                  onClick={() => setImportSource('excel')}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all',
                    importSource === 'excel'
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-border-default hover:border-accent-primary/30 bg-white'
                  )}
                >
                  <FileSpreadsheet className="mb-2 h-8 w-8 text-emerald-600" />
                  <p className="text-sm font-bold">Excel / CSV</p>
                  <p className="text-text-secondary mt-1 text-[11px]">Загрузка файла выгрузки</p>
                </button>
                <button
                  onClick={() => setImportSource('moi_sklad')}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all',
                    importSource === 'moi_sklad'
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-border-default hover:border-accent-primary/30 bg-white'
                  )}
                >
                  <Truck className="mb-2 h-8 w-8 text-amber-600" />
                  <p className="text-sm font-bold">Мой Склад</p>
                  <p className="text-text-secondary mt-1 text-[11px]">
                    Синхронизация остатков и продаж
                  </p>
                </button>
              </div>
              {importSource && (
                <div className="mt-4 rounded-xl border bg-white p-4">
                  <p className="mb-2 text-sm font-bold">
                    {importSource === '1c' && 'Подключение 1С'}
                    {importSource === 'excel' && 'Загрузка Excel'}
                    {importSource === 'moi_sklad' && 'Подключение Мой Склад'}
                  </p>
                  <p className="text-text-secondary mb-3 text-[11px]">
                    {importSource === '1c' &&
                      'Настройте API-интеграцию в разделе Интеграции или загрузите выгрузку.'}
                    {importSource === 'excel' &&
                      'Перетащите файл или нажмите для выбора. Форматы: .xlsx, .csv'}
                    {importSource === 'moi_sklad' &&
                      'Подключите аккаунт Мой Склад в настройках интеграций.'}
                  </p>
                  <Button size="sm" variant="outline">
                    {importSource === 'excel' ? 'Выбрать файл' : 'Настроить'}
                  </Button>
                </div>
              )}
              <p className="text-text-muted mt-4 text-[10px]">
                Интеграции настраиваются в{' '}
                <Link href={ROUTES.brand.integrations} className="text-accent-primary underline">
                  Интеграции
                </Link>{' '}
                и{' '}
                <Link href={ROUTES.brand.settings} className="text-accent-primary underline">
                  Настройки
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RelatedModulesBlock links={getAnalyticsLinks()} />
    </CabinetPageContent>
  );
}
