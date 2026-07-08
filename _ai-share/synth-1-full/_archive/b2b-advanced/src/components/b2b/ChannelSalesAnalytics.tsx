'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Globe,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Share2,
  PieChart,
  LayoutGrid,
  Zap,
  Map,
  Layers,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

export function ChannelSalesAnalytics() {
  const [activeChannel, setActiveChannel] = useState<
    'all' | 'direct' | 'wholesale' | 'marketplace'
  >('all');

  const channels = [
    { id: 'all', label: 'Все каналы', icon: Globe, sales: '84.2M ₽', change: '+12.4%' },
    { id: 'direct', label: 'Прямые (DTC)', icon: ShoppingBag, sales: '32.1M ₽', change: '+18.2%' },
    { id: 'wholesale', label: 'Оптовые', icon: LayoutGrid, sales: '45.5M ₽', change: '+8.4%' },
    { id: 'marketplace', label: 'Маркетплейсы', icon: BarChart3, sales: '6.6M ₽', change: '-2.1%' },
  ];

  return (
    <div className="bg-bg-surface2 min-h-screen space-y-4 p-3 text-left">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary shadow-accent-primary/15 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg">
              <PieChart className="h-5 w-5" />
            </div>
            <Badge
              variant="outline"
              className="border-accent-primary/20 text-accent-primary text-[9px] font-black uppercase tracking-widest"
            >
              SALES_INTEL_v4.0
            </Badge>
          </div>
          <h2 className="text-text-primary text-sm font-black uppercase leading-none tracking-tighter md:text-sm">
            Аналитика
            <br />
            Продаж по Каналам
          </h2>
          <p className="text-text-muted max-w-md text-xs font-medium">
            Консолидированные показатели эффективности в реальном времени: DTC, оптовые партнеры и
            маркетплейсы.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-border-default h-10 gap-2 rounded-2xl bg-white px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <Download className="h-4 w-4" /> Экспорт отчета
          </Button>
          <Button className="bg-text-primary h-10 gap-2 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-xl">
            <Share2 className="h-4 w-4" /> Поделиться
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {channels.map((ch) => (
          <Card
            key={ch.id}
            onClick={() => setActiveChannel(ch.id as any)}
            className={cn(
              'cursor-pointer overflow-hidden rounded-xl border-none shadow-xl transition-all',
              activeChannel === ch.id
                ? 'bg-text-primary text-white'
                : 'hover:bg-bg-surface2 bg-white'
            )}
          >
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    activeChannel === ch.id
                      ? 'bg-white/10 text-white'
                      : 'bg-bg-surface2 text-text-muted'
                  )}
                >
                  <ch.icon className="h-5 w-5" />
                </div>
                <Badge
                  className={cn(
                    'border-none px-2 py-0.5 text-[8px] font-black',
                    ch.change.startsWith('+')
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  )}
                >
                  {ch.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <p
                  className={cn(
                    'text-[9px] font-black uppercase tracking-widest',
                    activeChannel === ch.id ? 'text-white/40' : 'text-text-muted'
                  )}
                >
                  {ch.label}
                </p>
                <p className="text-sm font-black">{ch.sales}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="space-y-4 rounded-xl border-none bg-white p-3 shadow-2xl lg:col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="text-text-primary text-base font-black uppercase tracking-tight">
              Динамика выручки
            </h4>
            <div className="flex gap-2">
              {['7D', '30D', '90D', 'YTD'].map((p) => (
                <button
                  key={p}
                  className={cn(
                    'rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest',
                    p === '30D'
                      ? 'bg-text-primary text-white'
                      : 'text-text-muted hover:bg-bg-surface2'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-80 items-end gap-3 px-4">
            {[30, 45, 35, 60, 55, 80, 75, 90, 85, 100, 95, 110].map((h, i) => (
              <div key={i} className="flex-1 space-y-3">
                <div className="group relative">
                  <div
                    className="bg-accent-primary group-hover:bg-accent-primary w-full rounded-t-lg transition-all duration-1000"
                    style={{ height: `${h * 2}px` }}
                  />
                  <div className="bg-text-primary absolute -top-4 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-[8px] font-black text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {(h * 100).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <span className="text-text-muted block text-center text-[8px] font-black uppercase">
                  W{i + 1}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-text-primary relative space-y-6 overflow-hidden rounded-xl border-none p-4 text-white shadow-xl">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Zap className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <h5 className="text-accent-primary text-sm font-black uppercase tracking-widest">
                AI Лидер продаж
              </h5>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/10">
                  <img
                    src="https://placehold.co/100x100?text=Top"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase">Cyber Tech Parka v2</p>
                  <p className="text-[10px] font-bold text-emerald-400">Sell-through: 92%</p>
                </div>
              </div>
              <p className="text-text-muted text-[10px] font-medium uppercase leading-relaxed tracking-widest">
                Генерирует 24% выручки DTC. Рекомендуем увеличить производство для SS27.
              </p>
            </div>
          </Card>

          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl">
            <h5 className="text-text-primary text-sm font-black uppercase">Географическая карта</h5>
            <div className="space-y-4">
              {[
                { region: 'Москва Хаб', share: '42%', trend: 'up' },
                { region: 'Дубай / ОАЭ', share: '28%', trend: 'up' },
                { region: 'Милан Ритейл', share: '15%', trend: 'down' },
                { region: 'Другие', share: '15%', trend: 'neutral' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent-primary h-2 w-2 rounded-full" />
                    <span className="text-text-secondary text-[10px] font-bold uppercase">
                      {r.region}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary text-[10px] font-black">{r.share}</span>
                    {r.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    ) : r.trend === 'down' ? (
                      <ArrowDownRight className="h-3 w-3 text-rose-500" />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="border-border-subtle text-text-muted hover:text-text-primary h-10 w-full rounded-xl border text-[9px] font-black uppercase tracking-widest"
            >
              Открыть полную карту
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
