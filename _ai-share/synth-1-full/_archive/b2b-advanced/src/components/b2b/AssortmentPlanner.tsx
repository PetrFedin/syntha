'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutGrid,
  Trash2,
  TrendingUp,
  BarChart3,
  DollarSign,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Plus,
  Layers,
  ArrowUpRight,
  Brain,
  ShoppingBag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';

export function VisualAssortmentPlanner({ onClose }: { onClose: () => void }) {
  const { viewRole } = useUIState();
  const { assortmentPlan, removeFromAssortmentPlan, clearAssortmentPlan } = useB2BState();
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'budget' | 'categories' | 'ai'>(
    'budget'
  );

  // Business Logic Calculations
  const wholesaleTotal = useMemo(
    () => assortmentPlan.reduce((acc, p) => acc + p.price * 0.6, 0),
    [assortmentPlan]
  );
  const rrpTotal = useMemo(
    () => assortmentPlan.reduce((acc, p) => acc + p.price, 0),
    [assortmentPlan]
  );
  const marginPercent = wholesaleTotal > 0 ? ((rrpTotal - wholesaleTotal) / rrpTotal) * 100 : 0;

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    assortmentPlan.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percent: (count / assortmentPlan.length) * 100,
    }));
  }, [assortmentPlan]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-text-primary/90 fixed inset-0 z-[100] flex flex-col gap-3 overflow-hidden p-4 backdrop-blur-xl md:flex-row md:p-4"
    >
      {/* Top Header Layer (Mobile friendly) */}
      <div className="pointer-events-none absolute left-8 right-8 top-4 z-[110] flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xl">
            <Layers className="text-text-primary h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-white"
            >
              PLANNER_v3.0_PRO
            </Badge>
            <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-white">
              Визуальный Ассортимент
            </h2>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onClose}
          className="hover:text-text-primary pointer-events-auto h-12 w-12 rounded-2xl border-white/20 bg-white/10 text-white transition-all hover:bg-white"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Rail (Virtual Showroom) */}
      <div className="relative mt-20 flex flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
          {assortmentPlan.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {assortmentPlan.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/5 bg-white shadow-2xl"
                  >
                    <img
                      src={product.images?.[0]?.url || (product as any).image}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={product.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="absolute right-4 top-4 flex flex-col gap-2">
                      <button
                        onClick={() => removeFromAssortmentPlan(product.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-rose-500 shadow-lg backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/60">
                        {product.brand}
                      </p>
                      <h4 className="mb-2 text-sm font-black uppercase leading-none tracking-tight text-white">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <p className="font-black tabular-nums text-white">
                          {(product.price * 0.6).toLocaleString('ru-RU')} ₽{' '}
                          <span className="ml-1 text-[8px] opacity-50">ОПТ</span>
                        </p>
                        <Badge className="border-none bg-emerald-500 text-[8px] font-black uppercase text-white">
                          В наличии
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <ShoppingBag className="h-10 w-10 text-white/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black uppercase tracking-tight text-white">
                  Ваш рейл пуст
                </h3>
                <p className="max-w-xs text-xs font-medium text-white/40">
                  Перетащите товары из шоурума сюда, чтобы начать планирование ассортимента.
                </p>
              </div>
              <Button
                onClick={onClose}
                className="bg-accent-primary hover:bg-accent-primary h-12 gap-2 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-white"
              >
                Просмотреть коллекцию <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Quick Toolbar */}
        {assortmentPlan.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/10 bg-black/40 p-4 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div>
                <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
                  Выбрано товаров
                </p>
                <p className="text-sm font-black tabular-nums text-white">
                  {assortmentPlan.length}
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
                  Черновой бюджет
                </p>
                <p className="text-sm font-black tabular-nums text-emerald-400">
                  {wholesaleTotal.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={clearAssortmentPlan}
                variant="outline"
                className="h-12 rounded-2xl border-white/10 bg-white/5 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:border-rose-500/50 hover:bg-rose-500/20"
              >
                Сбросить черновик
              </Button>
              <Button className="text-text-primary hover:bg-accent-primary/10 h-12 gap-2 rounded-2xl bg-white px-8 text-[10px] font-black uppercase tracking-widest shadow-2xl">
                Оформить заказ <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Side Intelligence Panel */}
      <div className="mt-20 flex w-full flex-col gap-3 md:mt-0 md:w-[400px]">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-xl border-none bg-white shadow-2xl">
          <CardHeader className="p-4 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <CardTitle className="text-base font-black uppercase tracking-tight">
                Лаборатория Аналитики
              </CardTitle>
              <Badge className="bg-accent-primary/15 text-accent-primary border-none px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                Live
              </Badge>
            </div>
            <div className="bg-bg-surface2 border-border-subtle flex gap-1 rounded-2xl border p-1">
              {[
                { id: 'budget', label: 'Финансы', icon: DollarSign },
                { id: 'categories', label: 'Баланс', icon: BarChart3 },
                { id: 'ai', label: 'AI Советник', icon: Brain },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAnalysisTab(tab.id as any)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-[9px] font-black uppercase tracking-widest transition-all',
                    activeAnalysisTab === tab.id
                      ? 'text-text-primary border-border-subtle border bg-white shadow-md'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col p-4 pt-4">
            <AnimatePresence mode="wait">
              {activeAnalysisTab === 'budget' && (
                <motion.div
                  key="budget"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="bg-bg-surface2 border-border-subtle group relative rounded-xl border p-4">
                      <div className="absolute right-6 top-4 opacity-10 transition-transform group-hover:rotate-12">
                        <TrendingUp className="text-accent-primary h-12 w-12" />
                      </div>
                      <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-widest">
                        Прогноз маржи
                      </p>
                      <h3 className="text-text-primary text-sm font-black tracking-tighter">
                        {marginPercent.toFixed(1)}%
                      </h3>
                      <p className="mt-2 text-[9px] font-bold uppercase text-emerald-600">
                        Выше среднего по отрасли (+4.2%)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-bg-surface2 border-border-subtle rounded-3xl border p-4">
                        <p className="text-text-muted mb-1 text-[8px] font-black uppercase tracking-widest">
                          Оптовая стоимость
                        </p>
                        <p className="text-text-primary text-sm font-black tabular-nums">
                          {wholesaleTotal.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                      <div className="bg-bg-surface2 border-border-subtle rounded-3xl border p-4">
                        <p className="text-text-muted mb-1 text-[8px] font-black uppercase tracking-widest">
                          Ожид. выручка
                        </p>
                        <p className="text-text-primary text-sm font-black tabular-nums">
                          {rrpTotal.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-text-primary border-border-subtle border-b pb-2 text-[10px] font-black uppercase tracking-widest">
                      Инсайты оптимизации
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          label: 'Потенциал оптовой скидки',
                          val: '5%',
                          color: 'text-accent-primary',
                        },
                        { label: 'Эффективность доставки', val: '94%', color: 'text-emerald-600' },
                        { label: 'Риск затоваривания', val: 'Низкий', color: 'text-emerald-600' },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[10px] font-bold"
                        >
                          <span className="text-text-muted uppercase">{item.label}</span>
                          <span className={item.color}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeAnalysisTab === 'categories' && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {categories.length > 0 ? (
                      categories.map((cat, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-end justify-between">
                            <span className="text-text-primary text-[10px] font-black uppercase tracking-widest">
                              {cat.name}
                            </span>
                            <span className="text-text-muted text-[10px] font-bold">
                              {cat.count} шт / {cat.percent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="bg-bg-surface2 h-2 w-full overflow-hidden rounded-full">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.percent}%` }}
                              className="bg-accent-primary h-full rounded-full"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-text-muted py-10 text-center">
                        <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          Нет данных по категориям
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeAnalysisTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-text-primary group relative overflow-hidden rounded-xl p-4 text-white">
                    <div className="bg-accent-primary/20 group-hover:bg-accent-primary/40 absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl transition-all" />
                    <div className="mb-4 flex items-center gap-3">
                      <div className="bg-accent-primary flex h-8 w-8 items-center justify-center rounded-xl">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        AI Стратегический Совет
                      </p>
                    </div>
                    <p className="text-text-muted text-sm font-medium italic leading-relaxed">
                      "На основе текущих трендов TikTok, ваша коллекция недостаточно представлена в
                      стиле 'Cyber-Minimalism'. Рассмотрите возможность добавления 3-4 товаров из
                      капсулы Syntha Lab FW26 для увеличения вовлеченности на 18%."
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-text-primary text-[10px] font-black uppercase tracking-widest">
                      Рекомендуемые дополнения
                    </h4>
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="bg-bg-surface2 border-border-subtle hover:border-accent-primary/30 group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all"
                        >
                          <div className="bg-border-subtle h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                            <img
                              src={`https://placehold.co/100x100/f8fafc/64748b?text=SKU_${i}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-accent-primary text-[9px] font-black uppercase">
                              Высокий виральный потенциал
                            </p>
                            <p className="text-text-primary text-xs font-black uppercase">
                              Neural Knit Jacket
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="hover:bg-accent-primary h-8 w-8 rounded-lg bg-white shadow-sm transition-all hover:text-white"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-border-subtle mt-auto flex flex-col gap-3 border-t pt-8">
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck className="text-accent-primary h-3.5 w-3.5" />
                  Гарантия опта
                </span>
                <span className="text-text-primary text-[10px] font-bold uppercase">
                  Платформа защищена
                </span>
              </div>
              <Button className="bg-text-primary button-glimmer h-10 w-full rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] text-white shadow-xl hover:bg-black">
                Завершить план ассортимента
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Global Network Node (For Admin/Distributor visibility) */}
        <Card className="bg-text-primary group relative overflow-hidden rounded-xl border-none p-4 text-white shadow-2xl">
          <div className="from-accent-primary/20 absolute inset-0 bg-gradient-to-br to-transparent" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">Админ-надзор</p>
            </div>
            <p className="text-text-muted text-[10px] font-medium uppercase leading-relaxed tracking-tight">
              Этот черновой план виден <span className="text-white">Администратору платформы</span>{' '}
              и <span className="text-white">Региональному дистрибьютору</span> для синхронизации
              цепочки поставок.
            </p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
