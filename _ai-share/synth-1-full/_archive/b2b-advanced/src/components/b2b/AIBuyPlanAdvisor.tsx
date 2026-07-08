'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  BarChart3,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  History,
  ShoppingCart,
  Maximize2,
  Filter,
  Search,
  Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';

export function AIBuyPlanAdvisor() {
  const { viewRole } = useUIState();
  const { assortmentPlan } = useB2BState();
  const [activeAnalysis, setActiveAnalysis] = useState<'trends' | 'stock' | 'risk'>('trends');

  const recommendations = [
    {
      id: 'rec-1',
      style: 'Cyber Tech Parka',
      sku: 'CTP-26-001',
      action: 'Увеличить заказ',
      confidence: 94,
      reason:
        'Прогнозируемый высокий спрос в Московском регионе на основе климатических изменений и объема поисковых запросов.',
      impact: '+12% Маржа',
    },
    {
      id: 'rec-2',
      style: 'Neural Cargo Pants',
      sku: 'NCP-26-042',
      action: 'Диверсифицировать размеры',
      confidence: 82,
      reason:
        'Стандартный размер M перенасыщен. Рекомендуется увеличить аллокацию размеров L и XL.',
      impact: 'Снижение рисков',
    },
  ];

  return (
    <div className="min-h-screen space-y-4 bg-white p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary flex h-8 w-8 items-center justify-center rounded-xl">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-accent-primary/20 text-accent-primary text-[9px] font-black uppercase tracking-widest"
            >
              AI_Strategic_Advisor_v4.0
            </Badge>
          </div>
          <h2 className="text-text-primary text-sm font-black uppercase leading-none tracking-tighter md:text-sm">
            Оптимизатор
            <br />
            Закупок (Buy-Plan)
          </h2>
          <p className="text-text-muted max-w-md text-left text-xs font-medium">
            Движок предиктивной аналитики, оптимизирующий ваши оптовые закупки на основе рыночных
            трендов, исторических данных и регионального спроса.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-bg-surface2 border-border-subtle flex items-center gap-1.5 rounded-2xl border p-1">
            {[
              { id: 'trends', label: 'Тренды рынка', icon: TrendingUp },
              { id: 'stock', label: 'Здоровье стока', icon: BarChart3 },
              { id: 'risk', label: 'Анализ рисков', icon: AlertCircle },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveAnalysis(tab.id as any)}
                className={cn(
                  'h-10 gap-2 rounded-xl px-5 text-[9px] font-black uppercase tracking-widest transition-all',
                  activeAnalysis === tab.id
                    ? 'text-text-primary bg-white shadow-sm'
                    : 'text-text-muted hover:text-text-secondary bg-transparent'
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Main Recommendations */}
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-text-muted text-sm font-black uppercase tracking-widest">
              Стратегические рекомендации
            </h3>
            <Button
              variant="ghost"
              className="text-accent-primary gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              Обновить анализ <Zap className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {recommendations.map((rec) => (
              <Card
                key={rec.id}
                className="bg-bg-surface2/80 group overflow-hidden rounded-xl border-none shadow-md shadow-xl transition-all hover:scale-[1.01]"
              >
                <CardContent className="p-4">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="border-border-subtle flex h-12 w-12 items-center justify-center rounded-2xl border bg-white shadow-sm">
                        <Package className="text-text-muted h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-text-primary text-base font-black uppercase tracking-tight">
                            {rec.style}
                          </h4>
                          <Badge className="border-none bg-emerald-100 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-600">
                            Точность прогноза: {rec.confidence}%
                          </Badge>
                        </div>
                        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                          {rec.sku}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-accent-primary border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white">
                      {rec.action}
                    </Badge>
                  </div>

                  <div className="border-border-subtle mb-6 rounded-2xl border bg-white p-4">
                    <p className="text-text-secondary text-sm font-medium italic leading-relaxed">
                      "{rec.reason}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {rec.impact}
                        </span>
                      </div>
                      <div className="bg-border-subtle h-1 w-1 rounded-full" />
                      <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                        Применено к 12 активным заказам
                      </span>
                    </div>
                    <Button className="bg-text-primary group-hover:bg-accent-primary h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                      Принять оптимизацию <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Global Market Stats Sidebar */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="bg-text-primary space-y-4 rounded-xl border-none p-4 text-white shadow-2xl shadow-md">
            <div className="space-y-2">
              <h3 className="text-base font-black uppercase tracking-tight">Рыночный резонанс</h3>
              <p className="text-[10px] font-medium uppercase text-white/40">
                Глобальные кластеры спроса в текущем окне
              </p>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Кибер-минимализм', val: 88, color: 'bg-accent-primary' },
                { label: 'Техвир Элита', val: 64, color: 'bg-emerald-500' },
                { label: 'Цифровой кочевник', val: 42, color: 'bg-amber-500' },
              ].map((cluster, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-end justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {cluster.label}
                    </span>
                    <span className="text-[10px] font-bold text-white/60">{cluster.val}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cluster.val}%` }}
                      className={cn('h-full', cluster.color)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button className="text-text-primary hover:bg-bg-surface2 h-10 w-full gap-2 rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-white/5">
              Сформировать глубокий прогноз <Zap className="h-4 w-4" />
            </Button>
          </Card>

          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-2xl shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-bg-surface2 flex h-10 w-10 items-center justify-center rounded-xl">
                <History className="text-text-muted h-5 w-5" />
              </div>
              <h4 className="text-text-primary text-sm font-black uppercase tracking-tight">
                Журнал оптимизаций
              </h4>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Обновление аллокации SKU', time: '2ч назад', status: 'Применено' },
                { title: 'Корректировка ценового уровня', time: 'Вчера', status: 'Ожидает' },
              ].map((log, i) => (
                <div
                  key={i}
                  className="bg-bg-surface2 flex items-center justify-between rounded-xl p-4"
                >
                  <div className="space-y-1">
                    <p className="text-text-primary text-[10px] font-black uppercase leading-none">
                      {log.title}
                    </p>
                    <p className="text-text-muted text-[8px] font-bold uppercase">{log.time}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-border-default text-[7px] font-bold uppercase"
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
