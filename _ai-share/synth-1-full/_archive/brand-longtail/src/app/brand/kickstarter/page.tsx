'use client';

import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MoreHorizontal,
  PlusCircle,
  Rocket,
  Edit,
  BarChart2,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  ArrowUpRight,
  Bot,
  Sparkles,
  Filter,
  Search,
  ChevronRight,
  Activity,
  Zap,
  Package,
  Megaphone,
} from 'lucide-react';
import { kickstarterProjects } from '@/lib/kickstarter';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getMarketingLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { fmtNumber, fmtMoney } from '@/lib/format';
const PromotionsContent = dynamic(() => import('@/app/brand/promotions/page'), { ssr: false });
const TrendSentimentContent = dynamic(
  () => import('@/app/brand/marketing/trend-sentiment/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400">Загрузка...</div> }
);
const HeritageTimelineContent = dynamic(
  () => import('@/app/brand/marketing/heritage-timeline/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400">Загрузка...</div> }
);
const StyleMeContent = dynamic(
  () => import('@/app/brand/marketing/style-me-upsell/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400">Загрузка...</div> }
);
const LocalInventoryAdsContent = dynamic(
  () => import('@/app/brand/marketing/local-inventory-ads/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400">Загрузка...</div> }
);

const statusConfig: { [key: string]: { label: string; color: string; bg: string } } = {
  live: { label: 'LIVE CAMPAIGN', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  successful: { label: 'GOAL REACHED', color: 'text-blue-700', bg: 'bg-blue-50' },
  production: { label: 'IN PRODUCTION', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  draft: { label: 'DRAFT MODE', color: 'text-slate-500', bg: 'bg-slate-50' },
};

export default function BrandKickstarterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('campaigns');

  const brandCampaigns = useMemo(() => {
    return kickstarterProjects
      .map((p) => ({
        ...p,
        profitMargin:
          p.productionCost && p.preorderPrice > p.productionCost
            ? ((p.preorderPrice - p.productionCost) / p.preorderPrice) * 100
            : 0,
        daysLeft: Math.max(
          0,
          Math.ceil((new Date(p.endAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        ),
      }))
      .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 pb-24 duration-700 animate-in fade-in">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className={cn(cabinetSurface.tabsList, 'h-9 px-1 shadow-inner')}>
          <TabsTrigger
            value="campaigns"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Rocket className="h-3.5 w-3.5" />
            AI Кампании
          </TabsTrigger>
          <TabsTrigger
            value="promo"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Megaphone className="h-3.5 w-3.5" />
            Промо и акции
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Радар трендов
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Timeline
          </TabsTrigger>
          <TabsTrigger
            value="style-me"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Style-Me
          </TabsTrigger>
          <TabsTrigger
            value="local-ads"
            className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Яндекс Карты
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4">
          {/* Control Panel: Executive Style */}
          <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-end">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <Link href="/brand" className="transition-colors hover:text-indigo-600">
                  Organization
                </Link>
                <ChevronRight className="h-2 w-2" />
                <span className="text-slate-300">Crowdfunding Matrix</span>
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-headline text-base font-bold uppercase leading-none tracking-tighter text-slate-900">
                  Pre-Order Hub 2.0
                </h1>
                <Badge
                  variant="outline"
                  className="h-4 gap-1 border-emerald-100 bg-emerald-50 px-1.5 text-[7px] font-bold tracking-widest text-emerald-600 shadow-sm transition-all"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> SUCCESS
                  RATE: 100%
                </Badge>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
                <Button
                  variant="ghost"
                  className="h-7 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:text-indigo-600"
                >
                  <Activity className="mr-1.5 h-3 w-3" /> Market Interest
                </Button>
                <Button
                  asChild
                  className="h-7 gap-1.5 rounded-lg border border-slate-900 bg-slate-900 px-4 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-indigo-600"
                >
                  <Link href="/brand/kickstarter/new">
                    <PlusCircle className="h-3.5 w-3.5" /> New Campaign
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* --- ANALYTICAL GRID --- */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: 'TOTAL PRE-ORDER VAL',
                  val: '4.2M ₽',
                  sub: '+24.5%',
                  trend: 'up',
                  icon: Rocket,
                  bg: 'bg-indigo-50/50',
                },
                {
                  label: 'BACKER COUNT',
                  val: '842',
                  sub: 'Global',
                  trend: 'up',
                  icon: TrendingUp,
                  bg: 'bg-blue-50/50',
                },
                {
                  label: 'AVG PROFIT MARGIN',
                  val: '42.8%',
                  sub: 'Stable',
                  trend: 'up',
                  icon: DollarSign,
                  bg: 'bg-emerald-50/50',
                },
                {
                  label: 'GOAL ATTAINMENT',
                  val: '88.4%',
                  sub: 'Live',
                  trend: 'up',
                  icon: Target,
                  bg: 'bg-amber-50/50',
                },
              ].map((m, i) => (
                <Card
                  key={i}
                  className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-100"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase leading-none tracking-[0.15em] text-slate-400">
                      {m.label}
                    </span>
                    <div
                      className={cn(
                        'rounded-lg border border-slate-200/50 p-1.5 shadow-inner',
                        m.bg
                      )}
                    >
                      <m.icon className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold uppercase tabular-nums leading-none tracking-tighter text-slate-900">
                      {m.val}
                    </span>
                    <span
                      className={cn(
                        'flex h-3.5 items-center rounded px-1 text-[8px] font-bold uppercase tracking-widest',
                        m.trend === 'up'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      )}
                    >
                      {m.sub}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
              <div className="space-y-3 xl:col-span-9">
                {/* --- TOOLBAR --- */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                      <button className="h-6.5 rounded-md bg-slate-900 px-3 text-[9px] font-bold uppercase text-white shadow-sm transition-all">
                        Current
                      </button>
                      <button className="h-6.5 rounded-md px-3 text-[9px] font-bold uppercase text-slate-400 transition-all hover:bg-slate-50">
                        Completed
                      </button>
                    </div>
                    <div className="mx-0.5 h-4 w-[1px] bg-slate-200" />
                    <Badge
                      variant="outline"
                      className="h-6.5 flex items-center rounded-md border-slate-200 bg-white px-2 text-[8px] font-bold uppercase tracking-widest text-amber-600 shadow-sm"
                    >
                      CROWDFUNDING HUB
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Поиск кампаний…"
                        className="h-7 w-32 rounded-lg border-slate-200 bg-white pl-8 text-[10px] font-bold uppercase tracking-tight shadow-sm focus:ring-1 focus:ring-indigo-500 md:w-44"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50"
                    >
                      <Filter className="h-3 w-3 text-slate-400" />
                    </Button>
                  </div>
                </div>

                {/* --- CAMPAIGNS TABLE --- */}
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:border-indigo-100/50">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="h-9 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Campaign Project
                        </th>
                        <th className="h-9 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Target Progress
                        </th>
                        <th className="h-9 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Backers
                        </th>
                        <th className="h-9 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Profit Forecast
                        </th>
                        <th className="h-9 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Status
                        </th>
                        <th className="h-9 w-12 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {brandCampaigns.map((campaign) => {
                        const progress = (campaign.currentQuantity / campaign.targetQuantity) * 100;
                        const statusInfo = statusConfig[campaign.status];
                        return (
                          <tr
                            key={campaign.id}
                            className="group h-12 transition-all hover:bg-slate-50/50"
                          >
                            <td className="px-4 py-2">
                              <Link
                                href={`/kickstarter/${campaign.id}`}
                                className="text-[11px] font-bold uppercase tracking-tighter text-slate-900 underline decoration-slate-200 underline-offset-4 transition-colors hover:text-indigo-600"
                              >
                                {campaign.title}
                              </Link>
                              <p className="mt-0.5 text-[8px] font-bold uppercase italic tabular-nums leading-none tracking-widest text-slate-400 opacity-60">
                                {campaign.daysLeft} DAYS LEFT
                              </p>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex w-32 flex-col gap-1">
                                <div className="h-1 w-full overflow-hidden rounded-full border border-slate-50 bg-slate-100 shadow-inner">
                                  <div
                                    className="h-full bg-indigo-500 transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-[8px] font-bold uppercase tabular-nums tracking-widest text-slate-400">
                                  {progress.toFixed(0)}% ATTAINED
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <span className="text-[11px] font-bold tabular-nums tracking-tighter text-slate-900">
                                {campaign.currentQuantity}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="text-[11px] font-bold tabular-nums tracking-tighter text-emerald-600">
                                +{campaign.profitMargin.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'h-3.5 rounded border px-1.5 text-[7px] font-bold uppercase tracking-widest shadow-sm transition-all',
                                  statusInfo.bg,
                                  statusInfo.color,
                                  'border-slate-100'
                                )}
                              >
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 opacity-0 transition-all hover:bg-slate-900 hover:text-white group-hover:opacity-100">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 opacity-60">
                      Displaying {brandCampaigns.length} campaigns
                    </span>
                    <div className="flex gap-1">
                      <button
                        className="h-6 rounded-md border border-slate-200 bg-white px-2.5 text-[8px] font-bold uppercase tracking-widest text-slate-400 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
                        disabled
                      >
                        PREV
                      </button>
                      <button className="h-6 rounded-md border border-slate-200 bg-white px-2.5 text-[8px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50">
                        NEXT
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 xl:col-span-3">
                {/* --- SENTIMENT AI --- */}
                <Card className="group relative space-y-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 text-white shadow-lg">
                  <div className="relative z-10">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500 bg-amber-600 text-white shadow-lg transition-transform group-hover:scale-105">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold uppercase leading-none tracking-[0.2em] text-amber-300">
                          Intelligence AI
                        </span>
                        <p className="text-[11px] font-bold uppercase tracking-tight">
                          Market Sentiment
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors group-hover:bg-white/10">
                        <p className="mb-1 text-[8px] font-bold uppercase leading-none tracking-widest text-amber-400">
                          Motivation Index
                        </p>
                        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight text-slate-300">
                          "Sentiment 92% positive. High focus on 'Eco-materials'. Over-funding
                          probability: 84%."
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                          <p className="mb-0.5 text-[7px] font-bold uppercase tracking-widest text-slate-500">
                            Viral Score
                          </p>
                          <span className="text-[11px] font-bold tabular-nums tracking-tighter text-amber-400">
                            4.2x Index
                          </span>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                          <p className="mb-0.5 text-[7px] font-bold uppercase tracking-widest text-slate-500">
                            Retention
                          </p>
                          <span className="text-[11px] font-bold uppercase tracking-tighter text-blue-400">
                            High Tier
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button className="mt-4 h-8 w-full rounded-lg bg-white text-[9px] font-bold uppercase tracking-widest text-slate-900 shadow-xl transition-all hover:bg-amber-50 hover:text-amber-600">
                      Boost Marketing
                    </Button>
                  </div>
                  <Sparkles className="absolute -right-6 -top-4 h-24 w-24 text-amber-600 opacity-10 transition-all duration-700 group-hover:scale-110 group-hover:opacity-20" />
                </Card>

                {/* --- PRODUCTION READINESS --- */}
                <Card className="group space-y-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
                  <div className="flex items-center justify-between border-b border-slate-50 px-1 pb-2.5">
                    <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-700">
                      <Package className="h-3.5 w-3.5 text-blue-600" /> Manufacturing Hub
                    </h3>
                    <Badge
                      variant="outline"
                      className="h-3.5 rounded border-slate-100 bg-slate-50 px-1.5 text-[7px] font-bold uppercase tracking-widest text-slate-400 shadow-sm"
                    >
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { component: 'Main Fabric', status: 'Sourced', prog: 100 },
                      { component: 'Trim & Zippers', status: 'Pending', prog: 45 },
                      { component: 'Eco-Packaging', status: 'Research', prog: 20 },
                    ].map((item, i) => (
                      <div key={i} className="group/item space-y-1.5">
                        <div className="flex items-center justify-between px-0.5">
                          <span className="text-[9px] font-bold uppercase leading-none tracking-tight text-slate-900 transition-colors group-hover/item:text-indigo-600">
                            {item.component}
                          </span>
                          <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">
                            {item.status}
                          </span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full border border-slate-50 bg-slate-50 shadow-inner">
                          <div
                            className={cn(
                              'h-full transition-all duration-1000',
                              item.prog === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                            )}
                            style={{ width: `${item.prog}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[9px] font-bold uppercase tracking-widest text-slate-400 shadow-sm transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                  >
                    Supply Chain <ChevronRight className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="promo" className="mt-4">
          {tab === 'promo' && <PromotionsContent />}
        </TabsContent>
        <TabsContent value="trends" className="mt-4">
          {tab === 'trends' && <TrendSentimentContent />}
        </TabsContent>
        <TabsContent value="timeline" className="mt-4">
          {tab === 'timeline' && <HeritageTimelineContent />}
        </TabsContent>
        <TabsContent value="style-me" className="mt-4">
          {tab === 'style-me' && <StyleMeContent />}
        </TabsContent>
        <TabsContent value="local-ads" className="mt-4">
          {tab === 'local-ads' && <LocalInventoryAdsContent />}
        </TabsContent>
      </Tabs>

      <RelatedModulesBlock links={getMarketingLinks()} className="mt-6" />
    </div>
  );
}
