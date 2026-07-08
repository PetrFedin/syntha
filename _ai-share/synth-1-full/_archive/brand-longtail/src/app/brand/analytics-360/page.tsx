'use client';

import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { SkuAnalytics } from '@/components/brand/sku-analytics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Globe,
  Target,
  ArrowRight,
  Users,
  ShieldCheck,
  ArrowUpRight,
  PieChart,
  BrainCircuit,
  Layers,
  Zap,
  BarChart3,
  Activity,
  Landmark,
  ChevronRight,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  Map,
  Monitor,
  Timer,
  Clock,
  Waves,
  Calendar,
  Rocket,
  Factory,
  DollarSign,
  Download,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUIState } from '@/providers/ui-state';
import { WidgetDetailSheet, WidgetType } from '@/components/brand/widget-detail-sheet';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger as UITooltipTrigger,
} from '@/components/ui/tooltip';

const AnalyticsBiContent = dynamic(
  () => import('@/app/brand/analytics-bi/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400">Загрузка...</div> }
);
const ExternalSalesContent = dynamic(
  () => import('@/app/brand/analytics/external-sales/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400">Загрузка...</div> }
);
const UnifiedAnalyticsContent = dynamic(
  () => import('@/app/brand/analytics/unified/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400">Загрузка...</div> }
);

export default function Analytics360Page() {
  const router = useRouter();
  const {
    dashboardPeriod,
    filterChannel,
    setFilterChannel,
    filterRegion,
    setFilterRegion,
    filterCollection,
    setFilterCollection,
  } = useUIState();
  const period = dashboardPeriod;

  const [allBrandProducts, setAllBrandProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWidget, setSelectedWidget] = useState<WidgetType | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [tab, setTab] = useState('analytics-360');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/data/products.json');
        if (response.ok) {
          const allProducts = (await response.json()) as Product[];
          const filtered = allProducts.filter((p) => p.brand?.toLowerCase().includes('syntha'));
          setAllBrandProducts(filtered.length > 0 ? filtered : allProducts.slice(0, 10));
        } else {
          const { default: fallback } = await import('@/lib/products');
          const arr = fallback as Product[];
          const filtered = arr.filter((p) => p.brand?.toLowerCase().includes('syntha'));
          setAllBrandProducts(filtered.length > 0 ? filtered : arr.slice(0, 10));
        }
      } catch {
        try {
          const { default: fallback } = await import('@/lib/products');
          const arr = fallback as Product[];
          setAllBrandProducts(arr.slice(0, 10));
        } catch (_) {}
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <header>
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="mt-2 h-5 w-2/3" />
        </header>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-6 duration-700 animate-in fade-in">
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className={cn(cabinetSurface.tabsList, 'h-9 px-1 shadow-inner')}>
          <TabsTrigger
            value="analytics-360"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BrainCircuit className="h-3 w-3 shrink-0" /> Аналитика 360
          </TabsTrigger>
          <TabsTrigger
            value="bi"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-3 w-3 shrink-0" /> Расширенная
          </TabsTrigger>
          <TabsTrigger
            value="external-sales"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <TrendingUp className="h-3 w-3 shrink-0" /> Внешние продажи
          </TabsTrigger>
          <TabsTrigger
            value="unified"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Layers className="h-3 w-3 shrink-0" /> Сводная
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics-360" className="mt-0 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <Link href="/brand" className="transition-colors hover:text-indigo-600">
              Организация
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900">Центр управления</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600">Аналитика 360</span>
          </div>

          {/* Control Panel: Strategic Hub */}
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <Badge className="h-6 border-none bg-slate-900 px-3 text-[10px] font-bold uppercase text-white shadow-md">
                <BrainCircuit className="mr-2 h-3.5 w-3.5 fill-indigo-400 text-indigo-400" />{' '}
                Executive Strategic Intelligence
              </Badge>
              <div className="mx-1 h-4 w-px bg-slate-200" />
              <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" /> Сквозная
                Аналитика
              </p>
            </div>

            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value as any)}
                  className="h-8 cursor-pointer rounded-lg border-none bg-white px-2 text-[10px] font-bold uppercase text-slate-600 shadow-sm outline-none"
                >
                  <option value="all">Все каналы</option>
                  <option value="b2b">B2B Опт</option>
                  <option value="b2c">B2C Омни</option>
                  <option value="marketplace">Marketroom</option>
                </select>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value as any)}
                  className="h-8 cursor-pointer rounded-lg border-none bg-white px-2 text-[10px] font-bold uppercase text-slate-600 shadow-sm outline-none"
                >
                  <option value="all">Все регионы</option>
                  <option value="ru">Россия</option>
                  <option value="kz">Казахстан</option>
                  <option value="by">Беларусь</option>
                </select>
                <select
                  value={filterCollection}
                  onChange={(e) => setFilterCollection(e.target.value as any)}
                  className="h-8 cursor-pointer rounded-lg border-none bg-white px-2 text-[10px] font-bold uppercase text-slate-600 shadow-sm outline-none"
                >
                  <option value="all">Все коллекции</option>
                  <optgroup label="FW26">
                    <option value="fw26-pre">FW26 Pre</option>
                    <option value="fw26-main">FW26 Main</option>
                  </optgroup>
                  <option value="outlet">Outlet</option>
                </select>
              </div>

              <div className="ml-auto flex items-center gap-1.5 md:ml-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200 bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm hover:bg-slate-50"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> Экспорт
                </Button>
              </div>
            </div>
          </div>

          {/* SECTION 1: Стратегические KPI */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1 w-6 rounded-full bg-indigo-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Стратегические показатели
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <TooltipProvider>
                {[
                  {
                    type: 'market_demand' as WidgetType,
                    label: 'Доля рынка',
                    value: '8.4%',
                    change: '+1.2%',
                    icon: Globe,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    section: 'Рынок',
                    href: '/brand/showroom',
                    desc: 'Процент присутствия бренда в Middle-Luxury.',
                  },
                  {
                    type: 'finance_roi' as WidgetType,
                    label: 'Окупаемость (ROI)',
                    value: '320%',
                    change: 'Optimal',
                    icon: Landmark,
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50',
                    section: 'Финансы',
                    href: '/brand/finance',
                    desc: 'Return on Investment.',
                  },
                  {
                    type: 'trend_prediction' as WidgetType,
                    label: 'Индекс инноваций',
                    value: '72%',
                    change: '+8%',
                    icon: Zap,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                    section: 'R&D',
                    href: '/brand/ai-tools',
                    desc: 'Уровень внедрения технологических решений.',
                  },
                  {
                    type: 'fill_rate' as WidgetType,
                    label: 'Оборачиваемость',
                    value: '4.2x',
                    change: '+0.5',
                    icon: Activity,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    section: 'Сток',
                    href: '/brand/inventory',
                    desc: 'Inventory Turnover: Скорость реализации запасов за период.',
                  },
                ].map((stat, i) => (
                  <UITooltip key={i}>
                    <UITooltipTrigger asChild>
                      <Card
                        className="group cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-md"
                        onClick={() => setSelectedWidget(stat.type)}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex flex-col gap-1.5">
                            <Badge
                              variant="outline"
                              className="h-4 w-fit border-slate-100 bg-slate-50 px-1.5 text-[8px] font-bold uppercase text-slate-500 group-hover:bg-white group-hover:text-indigo-600"
                            >
                              {stat.section}
                            </Badge>
                            <div
                              className={cn(
                                'w-fit rounded-lg p-2 shadow-sm transition-colors',
                                stat.bg,
                                'group-hover:bg-white'
                              )}
                            >
                              <stat.icon className={cn('h-4 w-4', stat.color)} />
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              className={cn(
                                'h-4.5 border-none bg-slate-50 px-1.5 text-[9px] font-bold uppercase text-slate-600',
                                stat.change.includes('+') ? 'bg-emerald-50 text-emerald-600' : ''
                              )}
                            >
                              {stat.change}
                            </Badge>
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 opacity-0 shadow-sm transition-all hover:bg-slate-900 hover:text-white group-hover:opacity-100"
                            >
                              <Link href={stat.href}>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {stat.label}
                          </p>
                          <p className="text-base font-bold tracking-tight text-slate-900">
                            {stat.value}
                          </p>
                        </div>
                      </Card>
                    </UITooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="rounded-lg border-none bg-slate-900 p-2 text-[10px] text-white shadow-xl"
                    >
                      <p>{stat.desc}</p>
                    </TooltipContent>
                  </UITooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* SECTION 2: Финансовая и рыночная аналитика */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1 w-6 rounded-full bg-emerald-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Финансовая и рыночная аналитика
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {/* Ликвидность & P&L */}
              <Card className="group relative overflow-hidden rounded-xl border border-indigo-100 bg-indigo-600 p-4 text-white shadow-md">
                <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                  <Landmark className="h-20 w-24" />
                </div>
                <div className="mb-6 flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="h-4.5 border-white/30 px-2 text-[8px] font-bold uppercase text-white"
                  >
                    Финансы
                  </Badge>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-white/60 transition-all hover:bg-white/10 hover:text-white"
                  >
                    <Link href="/brand/finance">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                      Ликвидность
                    </p>
                    <p className="text-base font-bold tracking-tight text-white">2.4 Ratio</p>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-[11px] font-medium leading-tight text-indigo-100">
                      Запас кэша: 18 дней. Требуются поступления от B2B.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Конкурентный Срез */}
              <Card className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 text-white shadow-lg">
                <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                  <Target className="h-20 w-24" />
                </div>
                <div className="mb-6 flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="h-4.5 border-white/30 px-2 text-[8px] font-bold uppercase text-indigo-400"
                  >
                    Рынок
                  </Badge>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-white/60 transition-all hover:bg-white/10 hover:text-white"
                  >
                    <Link href="/brand/showroom">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Syntha', val: 24, color: 'bg-indigo-500' },
                    { label: 'Конкуренты', val: 42, color: 'bg-slate-600' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>{item.label}</span>
                        <span className="text-white/60">{item.val}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-1000',
                            item.color
                          )}
                          style={{ width: `${item.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Радар трендов */}
              <Card className="group overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-purple-100">
                <div className="mb-6 flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="h-4.5 border-purple-100 bg-purple-50 px-2 text-[8px] font-bold uppercase text-purple-600"
                  >
                    Тренды
                  </Badge>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 shadow-sm transition-all hover:bg-slate-900 hover:text-white"
                  >
                    <Link href="/brand/ai-tools">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-2.5">
                  {[
                    {
                      cat: 'Верхняя одежда',
                      trend: '+22%',
                      icon: TrendingUp,
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-50',
                    },
                    {
                      cat: 'Аксессуары',
                      trend: '+18%',
                      icon: TrendingUp,
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-50',
                    },
                    {
                      cat: 'Базовые вещи',
                      trend: '-8%',
                      icon: TrendingDown,
                      color: 'text-rose-600',
                      bg: 'bg-rose-50',
                    },
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="flex cursor-default items-center justify-between rounded-lg bg-slate-50 p-2.5 transition-colors hover:bg-slate-100"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-tight text-slate-700">
                        {t.cat}
                      </p>
                      <div
                        className={cn('flex items-center gap-1.5 rounded-full px-2 py-0.5', t.bg)}
                      >
                        <t.icon className={cn('h-3 w-3', t.color)} />
                        <span className={cn('text-[10px] font-bold', t.color)}>{t.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* SECTION 3: Операционная и ассортиментная аналитика */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1 w-6 rounded-full bg-blue-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Операционная и ассортиментная аналитика
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {/* География Спроса */}
              <Card className="group overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-blue-100">
                <div className="mb-4 flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="h-4.5 border-slate-100 bg-slate-50 px-2 text-[8px] font-bold uppercase text-slate-500"
                  >
                    Регионы
                  </Badge>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 shadow-sm transition-all hover:bg-slate-900 hover:text-white"
                  >
                    <Link href="/brand/showroom">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-base font-bold tracking-tight text-slate-900">45%</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Москва / РФ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold tracking-tight text-slate-900">22%</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        СНГ
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Лидерборд продаж */}
              <Card className="group overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-indigo-100">
                <div className="mb-4 flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="h-4.5 border-slate-100 bg-slate-50 px-2 text-[8px] font-bold uppercase text-slate-500"
                  >
                    Эффективность
                  </Badge>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 shadow-sm transition-all hover:bg-slate-900 hover:text-white"
                  >
                    <Link href="/brand/dashboard">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: 'Анна Б.', sales: '110M', target: 92 },
                    { name: 'Марк В.', sales: '78M', target: 78 },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-slate-50/50 p-2 transition-colors hover:bg-slate-50"
                    >
                      <span className="text-[10px] font-bold uppercase text-slate-600">
                        {m.name}
                      </span>
                      <span className="text-[11px] font-bold text-slate-900">{m.sales} ₽</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* B2C Омни Импульс */}
              <Card className="group overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-rose-100">
                <div className="mb-4 flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="h-4.5 border-rose-100 bg-rose-50 px-2 text-[8px] font-bold uppercase text-rose-600"
                  >
                    Омни-канал
                  </Badge>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 shadow-sm transition-all hover:bg-slate-900 hover:text-white"
                  >
                    <Link href="/brand/customer-intelligence">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Розничный спрос (Всего)
                  </p>
                  <p className="text-base font-bold tracking-tight text-slate-900">84.2M ₽</p>
                  <Badge className="h-4.5 mt-2 border-none bg-emerald-50 px-2 text-[8px] font-bold uppercase text-emerald-600">
                    Omni Active
                  </Badge>
                </div>
              </Card>

              {/* ESG Рейтинг */}
              <Card className="group overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-sm transition-all hover:bg-white">
                <div className="mb-4 flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="h-4.5 border-emerald-100 bg-emerald-50 px-2 text-[8px] font-bold uppercase text-emerald-600"
                  >
                    Устойчивость
                  </Badge>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-900 hover:text-white"
                  >
                    <Link href="/brand/esg">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-white shadow-sm">
                    <span className="text-sm font-bold tracking-tight text-emerald-600">A+</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase text-slate-900">Лидер</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                      Топ 5%
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Matrix View at bottom */}
          <div className="space-y-4 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1 w-6 rounded-full bg-slate-900" />
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Срез Эффективности Ассортимента
              </h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <SkuAnalytics brandProducts={allBrandProducts} />
            </div>
          </div>

          <WidgetDetailSheet
            isOpen={!!selectedWidget}
            onOpenChange={(open) => !open && setSelectedWidget(null)}
            widgetType={selectedWidget}
            period={period}
          />
        </TabsContent>

        <TabsContent value="bi" className="mt-0">
          {tab === 'bi' && <AnalyticsBiContent />}
        </TabsContent>

        <TabsContent value="external-sales" className="mt-0">
          {tab === 'external-sales' && <ExternalSalesContent />}
        </TabsContent>

        <TabsContent value="unified" className="mt-0">
          {tab === 'unified' && <UnifiedAnalyticsContent />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
