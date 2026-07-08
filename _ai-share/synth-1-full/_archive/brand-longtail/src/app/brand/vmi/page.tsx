'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Warehouse,
  Factory,
  Box,
  Layers,
  Zap,
  TrendingUp,
  TrendingDown,
  History,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Ruler,
  Palette,
  Thermometer,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { fmtNumber } from '@/lib/format';

const MOCK_MATERIALS = [
  {
    id: 'm1',
    name: 'Cyber-Silk 2.0 (Black)',
    category: 'Fabrics',
    stock: 1200,
    unit: 'm',
    factory: 'SilkRoad Textiles',
    health: 94,
    status: 'Optimal',
  },
  {
    id: 'm2',
    name: 'Nano-Nylon 400D',
    category: 'Fabrics',
    stock: 450,
    unit: 'm',
    factory: 'TechWeave Italia',
    health: 42,
    status: 'Low Stock',
  },
  {
    id: 'm3',
    name: 'Titanium Zippers (15cm)',
    category: 'Trims',
    stock: 5000,
    unit: 'pcs',
    factory: 'Precision Trims Ltd',
    health: 100,
    status: 'Excess',
  },
];

const MOCK_CAPACITY = [
  { factory: 'Цех «Москва Север»', line: 'Outerwear Line A', booked: 85, month: 'March 2026' },
  { factory: 'Цех «Москва Север»', line: 'Accessories B', booked: 40, month: 'March 2026' },
  { factory: 'Istanbul Hub', line: 'Knitwear Line 1', booked: 92, month: 'April 2026' },
];

export default function VMIPortalPage() {
  return (
    <div className="space-y-4 pb-20">
      <SectionInfoCard
        title="VMI (Vendor Managed Inventory)"
        description="Контроль сырья на фабриках и планирование мощностей. Связь с Production (загрузка линий, PO), Warehouse (материалы) и B2B (объёмы заказов)."
        icon={Warehouse}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              Materials
            </Badge>
            <Button variant="outline" size="sm" className="ml-1 h-7 text-[9px]" asChild>
              <Link href="/brand/products">Products</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/materials">Materials</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/production">Production</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/warehouse">Warehouse</Link>
            </Button>
          </>
        }
      />
      <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-600 p-2.5">
              <Warehouse className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-base font-black uppercase tracking-tighter text-slate-900">
              Production VMI Portal
            </h1>
          </div>
          <p className="font-medium italic text-slate-500">
            Vendor Managed Inventory: Контроль сырья на фабриках и планирование мощностей.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-2xl border-slate-200 px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <History className="mr-2 h-4 w-4" /> Лог поставок
          </Button>
          <Button className="h-12 rounded-2xl bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200">
            <Plus className="mr-2 h-4 w-4" /> Забронировать линию
          </Button>
        </div>
      </header>

      {/* VMI Intelligence Grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Materials Inventory */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden rounded-xl border-none bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                  <Layers className="h-4 w-4" /> Raw Materials Stock
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Остатки материалов на складах партнеров
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <Input
                    placeholder="Поиск материалов…"
                    className="h-9 w-48 rounded-xl border-slate-200 pl-9 text-[10px] font-bold"
                    aria-label="Поиск материалов"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl border border-slate-200"
                  aria-label="Фильтр материалов"
                >
                  <Filter className="h-4 w-4 text-slate-400" aria-hidden />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {MOCK_MATERIALS.map((m) => (
                  <div
                    key={m.id}
                    className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm',
                          m.category === 'Fabrics'
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'bg-emerald-50 text-emerald-600'
                        )}
                      >
                        {m.category === 'Fabrics' ? (
                          <Ruler className="h-6 w-6" aria-hidden />
                        ) : (
                          <Palette className="h-6 w-6" aria-hidden />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight text-slate-900">
                          {m.name}
                        </p>
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <Factory className="h-3 w-3" aria-hidden /> {m.factory}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Current Stock
                        </p>
                        <p className="text-sm font-black tabular-nums text-slate-900">
                          {fmtNumber(m.stock)}{' '}
                          <span className="text-xs text-slate-400">{m.unit}</span>
                        </p>
                      </div>
                      <div className="w-32 space-y-2">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase">
                          <span
                            className={cn(
                              m.status === 'Optimal'
                                ? 'text-emerald-600'
                                : m.status === 'Low Stock'
                                  ? 'text-rose-600'
                                  : 'text-amber-600'
                            )}
                          >
                            {m.status}
                          </span>
                          <span className="text-slate-400">{m.health}%</span>
                        </div>
                        <Progress
                          value={m.health}
                          className={cn(
                            'h-1',
                            m.health > 80
                              ? 'bg-emerald-100'
                              : m.health < 50
                                ? 'bg-rose-100'
                                : 'bg-amber-100'
                          )}
                          aria-label={`Здоровье запаса «${m.name}»: ${m.health}%`}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label={`Подробнее: ${m.name}`}
                      >
                        <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[9px] font-bold uppercase italic leading-relaxed tracking-widest text-slate-400">
                *Данные обновлены 12 минут назад через IoT-датчики складов.
              </p>
              <Button
                variant="ghost"
                className="text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-50"
              >
                Заказать поставку сырья <Plus className="ml-2 h-3 w-3" aria-hidden />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Production Capacity & Booking */}
        <aside className="space-y-4">
          <Card className="relative overflow-hidden rounded-xl border-none bg-slate-900 p-4 text-white shadow-xl">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Zap className="h-32 w-32 text-indigo-400" />
            </div>
            <div className="relative z-10 space-y-4">
              <header className="space-y-2">
                <Badge className="border-none bg-indigo-500 px-3 py-1 text-[8px] font-black uppercase text-white">
                  Capacity Live View
                </Badge>
                <h3 className="text-sm font-black uppercase italic leading-none tracking-tight">
                  Factory Booking <br /> Status
                </h3>
              </header>

              <div className="space-y-6">
                {MOCK_CAPACITY.map((c, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                          {c.factory}
                        </p>
                        <p className="text-xs font-bold uppercase">{c.line}</p>
                      </div>
                      <span className="text-xs font-black text-white">{c.booked}% Booked</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          'h-full transition-all duration-1000',
                          c.booked > 90 ? 'bg-rose-500' : 'bg-indigo-500'
                        )}
                        style={{ width: `${c.booked}%` }}
                      />
                    </div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">
                      {c.month}
                    </p>
                  </div>
                ))}
              </div>

              <Button className="h-10 w-full rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-2xl transition-all hover:bg-indigo-400 hover:text-white">
                Планировать квоту <Calendar className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                VMI Health Audit
              </h3>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-[10px] font-bold uppercase leading-tight text-emerald-900">
                Сырьевая безопасность: В норме. Хватит на 4.5 месяца производства.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <p className="text-[10px] font-bold uppercase leading-tight text-rose-900">
                Прогноз: Дефицит Nano-Nylon к Маю 2026. Рекомендуется предзаказ.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
