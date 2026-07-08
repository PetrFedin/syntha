'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Target,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Plus,
  Zap,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { PlannedSKU, SKUDemandForecast } from '@/lib/types/analytics';
import { skuSimulationClient } from '@/lib/ai-client/api';
import { cn } from '@/lib/utils';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';

/**
 * Smart Range Planner UI
 * Инструмент планирования ассортиментной матрицы с AI-симуляцией спроса.
 */

export default function SmartPlanningPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [plannedItems, setPlannedItems] = useState<PlannedSKU[]>([
    {
      id: '1',
      name: 'Oversized Wool Coat',
      category: 'Outerwear',
      type: 'trend',
      plannedQty: 200,
      estimatedCost: 85,
      targetRetailPrice: 350,
      estimatedMargin: 75,
      aiRiskScore: 0.2,
    },
    {
      id: '2',
      name: 'Essential White Shirt',
      category: 'Tops',
      type: 'core',
      plannedQty: 1000,
      estimatedCost: 15,
      targetRetailPrice: 65,
      estimatedMargin: 76,
      aiRiskScore: 0.1,
    },
    {
      id: '3',
      name: 'Vegan Leather Pants',
      category: 'Bottoms',
      type: 'novelty',
      plannedQty: 150,
      estimatedCost: 45,
      targetRetailPrice: 180,
      estimatedMargin: 75,
      aiRiskScore: 0.4,
    },
  ]);
  const [forecasts, setForecasts] = useState<SKUDemandForecast[] | null>(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const results = await skuSimulationClient({
        brandId: 'brand-123',
        plannedItems,
      });
      setForecasts(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 pb-24 duration-700 animate-in fade-in">
      <SectionInfoCard
        title="Smart Range Matrix"
        description="Планирование ассортимента с AI-симуляцией спроса. Связи: Products (PIM), Production, Analytics, Finance — Landed Cost и P&L."
        icon={Target}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              AI Planner
            </Badge>
            <Button variant="outline" size="sm" className="ml-1 h-7 text-[9px]" asChild>
              <Link href="/brand/products">
                <Calculator className="mr-1 h-3 w-3" /> Products
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/production">Production</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/analytics">
                <BarChart3 className="mr-1 h-3 w-3" /> Analytics
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/finance">Finance</Link>
            </Button>
          </>
        }
      />
      <header className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-end">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <Target className="h-3 w-3 text-indigo-500" />
            <span className="cursor-pointer transition-colors hover:text-indigo-600">
              Range Planner
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-base font-bold uppercase leading-none tracking-tighter text-slate-900">
              Smart Range Matrix 2.0
            </h1>
            <Badge
              variant="outline"
              className="h-4 gap-1 border-indigo-100 bg-indigo-50 px-1.5 text-[7px] font-bold tracking-widest text-indigo-600 shadow-sm transition-all"
            >
              <BrainCircuit className="h-2.5 w-2.5" /> AI ENABLED
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
          <Button
            variant="ghost"
            className="h-7 gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            <Plus className="h-3 w-3 text-slate-400" /> Новый SKU
          </Button>
          <Button
            onClick={runSimulation}
            disabled={isSimulating}
            className="h-7 gap-1.5 rounded-lg bg-slate-900 px-4 text-[9px] font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-indigo-600"
          >
            {isSimulating ? (
              <Zap className="h-3 w-3 animate-spin" />
            ) : (
              <Zap className="h-3 w-3 text-indigo-400" />
            )}
            {isSimulating ? 'Simulating...' : 'Run Analysis'}
          </Button>
        </div>
      </header>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: 'TARGET BUDGET',
            value: '$145,000',
            icon: Calculator,
            color: 'text-slate-900',
            bg: 'bg-slate-50/50',
            border: 'border-slate-100',
          },
          {
            label: 'TARGET MARGIN',
            value: '74.5%',
            icon: BarChart3,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/50',
            border: 'border-emerald-100/50',
          },
          {
            label: 'SELL-THROUGH',
            value: forecasts ? '78%' : '--',
            icon: TrendingUp,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50/50',
            border: 'border-indigo-100/50',
          },
          {
            label: 'RISK LEVEL',
            value: forecasts ? 'Low' : '--',
            icon: AlertTriangle,
            color: forecasts ? 'text-emerald-600' : 'text-slate-300',
            bg: 'bg-slate-50/50',
            border: 'border-slate-100',
          },
        ].map((kpi, i) => (
          <Card
            key={i}
            className={cn(
              'group flex items-center gap-3.5 rounded-xl border bg-white p-3 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md',
              kpi.border
            )}
          >
            <div
              className={cn(
                'shrink-0 rounded-lg border p-1.5 shadow-inner transition-transform group-hover:scale-105',
                kpi.bg,
                kpi.color,
                kpi.border
              )}
            >
              <kpi.icon className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold uppercase leading-none tracking-[0.15em] text-slate-400">
                {kpi.label}
              </p>
              <p
                className={cn(
                  'mt-1 text-sm font-bold uppercase leading-none tracking-tight',
                  kpi.color
                )}
              >
                {kpi.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden rounded-xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100/50">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 p-3.5">
              <div className="space-y-0.5">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
                  Ассортиментная матрица
                </CardTitle>
                <CardDescription className="text-[9px] font-bold uppercase tracking-tight text-slate-400">
                  Планируемые артикулы и объемы пошива.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                className="h-7 rounded-lg border-slate-200 bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50"
              >
                Экспорт
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="h-9 border-none">
                    <TableHead className="h-9 pl-4 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Наименование
                    </TableHead>
                    <TableHead className="h-9 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Тип
                    </TableHead>
                    <TableHead className="h-9 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      План
                    </TableHead>
                    <TableHead className="h-9 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Cost/Retail
                    </TableHead>
                    <TableHead className="h-9 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Маржа
                    </TableHead>
                    <TableHead className="h-9 pr-4 text-right text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      AI Прогноз
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plannedItems.map((item) => {
                    const forecast = forecasts?.find((f) => f.productId === item.id);
                    return (
                      <TableRow
                        key={item.id}
                        className="group h-11 border-slate-50 transition-colors hover:bg-indigo-50/20"
                      >
                        <TableCell className="py-2 pl-4">
                          <p className="text-[11px] font-bold uppercase leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                            {item.category}
                          </p>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'h-3.5 border px-1.5 text-[7px] font-bold uppercase tracking-widest shadow-sm transition-all',
                              item.type === 'core'
                                ? 'border-slate-200 bg-slate-50 text-slate-500'
                                : item.type === 'trend'
                                  ? 'border-indigo-100 bg-indigo-50 text-indigo-600'
                                  : 'border-amber-100 bg-amber-50 text-amber-600'
                            )}
                          >
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-center font-mono text-[11px] font-bold text-slate-700">
                          {item.plannedQty}
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                            <span className="text-slate-400">${item.estimatedCost}</span>
                            <span className="text-slate-200">/</span>
                            <span className="text-slate-900">${item.targetRetailPrice}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-center text-[11px] font-bold uppercase tracking-tighter text-emerald-600">
                          {item.estimatedMargin}%
                        </TableCell>
                        <TableCell className="py-2 pr-4 text-right">
                          {forecast ? (
                            <div className="space-y-0.5">
                              <p className="text-[11px] font-bold uppercase leading-none tracking-tighter text-indigo-600">
                                {Math.round(forecast.predictedDemand)} ед.
                              </p>
                              <div className="mt-1 flex items-center justify-end gap-1">
                                <div
                                  className={cn(
                                    'h-1 w-1 rounded-full shadow-sm',
                                    forecast.confidence > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'
                                  )}
                                />
                                <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400 opacity-70">
                                  Conf. {Math.round(forecast.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 opacity-50">
                              Pending...
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="group relative overflow-hidden rounded-xl border border-indigo-500 bg-slate-900 p-4 text-white shadow-xl shadow-indigo-100/30 transition-colors hover:bg-slate-800">
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-indigo-500/10 blur-2xl transition-transform duration-700 group-hover:scale-110"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 shadow-inner transition-colors group-hover:bg-indigo-500">
                  <BrainCircuit className="h-4 w-4 text-indigo-400 group-hover:text-white" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-[11px] font-bold uppercase leading-none tracking-widest">
                    AI Strategic Insights
                  </h3>
                  <p className="mt-1 text-[8px] font-bold uppercase leading-none tracking-[0.2em] text-indigo-300 opacity-70">
                    Predictive Analysis
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {forecasts ? (
                  <>
                    <div className="space-y-1.5 rounded-xl border border-white/10 bg-white/5 p-3 shadow-inner transition-colors hover:bg-white/10">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <p className="text-[8px] font-bold uppercase tracking-widest">
                          Optimized Matrix
                        </p>
                      </div>
                      <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight text-white/80">
                        Ваша коллекция сбалансирована. "Essential Shirt" имеет потенциал.
                      </p>
                    </div>
                    <div className="space-y-1.5 rounded-xl border border-white/10 bg-white/5 p-3 shadow-inner transition-colors hover:bg-white/10">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        <p className="text-[8px] font-bold uppercase tracking-widest">
                          Risk Warning
                        </p>
                      </div>
                      <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight text-white/80">
                        "Leather Pants" показывают риск оверстока. Тренд падает.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 rounded-2xl border border-dashed border-white/10 bg-white/5 py-4 text-center">
                    <Zap className="mx-auto h-8 w-8 animate-pulse text-indigo-500/30" />
                    <p className="px-4 text-[8px] font-bold uppercase leading-tight tracking-[0.2em] text-white/40">
                      Запустите симуляцию для инсайтов
                    </p>
                  </div>
                )}
              </div>
              <Button className="h-8 w-full rounded-lg border-none bg-white text-[9px] font-bold uppercase tracking-widest text-slate-900 shadow-xl shadow-indigo-900/40 transition-all hover:bg-indigo-50">
                Открыть отчет
              </Button>
            </div>
          </Card>

          <Card className="group space-y-4 rounded-xl border border-slate-100 p-4 shadow-sm transition-all hover:border-emerald-100">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-1.5 text-emerald-600 shadow-inner transition-transform group-hover:scale-105">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-[10px] font-bold uppercase leading-none tracking-widest text-slate-900">
                  Market Trends
                </h3>
              </div>
              <Badge
                variant="outline"
                className="h-3.5 border-slate-100 bg-slate-50 px-1.5 text-[7px] font-bold uppercase tracking-widest text-slate-400 shadow-sm"
              >
                LIVE
              </Badge>
            </div>
            <div className="space-y-1.5">
              {[
                {
                  label: 'Metallic Textures',
                  trend: '+22%',
                  direction: 'up',
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50/50',
                  border: 'border-emerald-100/50',
                },
                {
                  label: 'Ethical Linen',
                  trend: '+15%',
                  direction: 'up',
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50/50',
                  border: 'border-emerald-100/50',
                },
                {
                  label: 'Oversized silhouettes',
                  trend: 'Stable',
                  direction: 'stable',
                  color: 'text-slate-400',
                  bg: 'bg-slate-50/50',
                  border: 'border-slate-100/50',
                },
              ].map((trend, i) => (
                <div
                  key={i}
                  className="group/item flex cursor-default items-center justify-between rounded-xl border border-transparent bg-slate-50/30 p-2.5 shadow-inner transition-all hover:border-emerald-100 hover:bg-white"
                >
                  <span className="text-[9px] font-bold uppercase tracking-tight text-slate-600 transition-colors group-hover/item:text-slate-900">
                    {trend.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        'h-4 border px-1.5 text-[8px] font-bold tracking-widest shadow-sm',
                        trend.color,
                        trend.bg,
                        trend.border
                      )}
                    >
                      {trend.trend}
                    </Badge>
                    {trend.direction === 'up' && (
                      <ChevronRight className="h-3 w-3 -rotate-90 text-emerald-500 transition-transform group-hover/item:translate-y-[-1px]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="h-7 w-full rounded-lg text-[9px] font-bold uppercase tracking-widest text-indigo-600 transition-all hover:bg-indigo-50"
            >
              Trend Intelligence
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
