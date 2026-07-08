'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Wallet,
  Banknote,
  CreditCard,
  FileText,
  Clock,
  ChevronRight,
  Download,
  Filter,
  RefreshCcw,
  Zap,
  Target,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { cn } from '@/lib/cn';

export function B2BFinancialPerformance() {
  const { activeCurrency } = useUIState();
  const [activeTab, setActiveTab] = useState<'overview' | 'forecasting' | 'cashflow' | 'budgeting'>(
    'overview'
  );

  const stats = [
    { label: 'Общая выручка', value: '42.8M ₽', change: '+14.2%', trend: 'up' },
    { label: 'Валовая маржа', value: '64.2%', change: '+2.1%', trend: 'up' },
    { label: 'Средний чек (B2B)', value: '840K ₽', change: '-3.4%', trend: 'down' },
    {
      label: 'Дебиторская задолженность',
      value: '12.4M ₽',
      change: '85% Текущая',
      trend: 'neutral',
    },
  ];

  const renderOverview = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="space-y-4 rounded-xl border-none bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                {i === 0 && <DollarSign className="h-5 w-5" />}
                {i === 1 && <PieChart className="h-5 w-5" />}
                {i === 2 && <TrendingUp className="h-5 w-5" />}
                {i === 3 && <Wallet className="h-5 w-5" />}
              </div>
              <Badge
                className={cn(
                  'border-none px-2 py-0.5 text-[8px] font-black',
                  s.trend === 'up'
                    ? 'bg-emerald-50 text-emerald-600'
                    : s.trend === 'down'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-slate-50 text-slate-400'
                )}
              >
                {s.change}
              </Badge>
            </div>
            <div className="space-y-1 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {s.label}
              </p>
              <p className="text-sm font-black text-slate-900">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 text-left">
        <Card className="col-span-2 space-y-4 rounded-xl border-none bg-white p-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-base font-black uppercase tracking-tight">
                Эффективность выручки
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Сравнение План vs Факт по месяцам (₽)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-600" />
                <span className="text-[9px] font-black uppercase text-slate-400">Факт</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-200" />
                <span className="text-[9px] font-black uppercase text-slate-400">План</span>
              </div>
            </div>
          </div>
          <div className="flex h-64 items-end gap-3 px-4">
            {[40, 65, 55, 90, 75, 85, 95].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-full w-full flex-col justify-end gap-1">
                  <div
                    className="w-full rounded-t-lg bg-indigo-600 transition-all duration-1000"
                    style={{ height: `${h}%` }}
                  />
                  <div
                    className="w-full rounded-b-lg bg-slate-100"
                    style={{ height: `${h * 0.8}%` }}
                  />
                </div>
                <span className="text-[9px] font-black uppercase text-slate-400">M0{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative space-y-4 overflow-hidden rounded-xl border-none bg-slate-900 p-3 text-white shadow-2xl">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Target className="h-32 w-32" />
          </div>
          <div className="relative z-10 space-y-6">
            <h4 className="text-base font-black uppercase tracking-tight">Рейтинг фин. здоровья</h4>
            <div className="flex items-center justify-center py-4">
              <div className="relative h-48 w-48">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-current text-white/5"
                    strokeWidth="10"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="stroke-current text-indigo-500"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8"
                    strokeLinecap="round"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-sm font-black">84</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Отлично
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Коэффициент ликвидности', value: '2.4' },
                { label: 'Долг к капиталу', value: '0.15' },
                { label: 'Оборачиваемость дебиторки', value: '32 Дня' },
              ].map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[10px] font-black uppercase"
                >
                  <span className="text-white/40">{m.label}</span>
                  <span className="text-white">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderForecasting = () => (
    <div className="space-y-4 text-left animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="space-y-4 rounded-xl border-none bg-white p-3 shadow-2xl">
          <div className="space-y-1">
            <h4 className="text-base font-black uppercase tracking-tight">AI Прогноз продаж</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              На основе исторических данных и настроений рынка (₽)
            </p>
          </div>
          <div className="group relative flex h-64 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-100 bg-slate-50">
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="space-y-4">
                <div className="flex h-32 items-end gap-1">
                  {[30, 45, 40, 60, 55, 80, 70, 90, 100].map((h, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-t-lg transition-all duration-1000',
                        i > 5 ? 'bg-indigo-400/40' : 'bg-indigo-600'
                      )}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase text-slate-400">История</p>
                  <Badge className="border-none bg-indigo-50 text-[8px] font-black text-indigo-600">
                    ПРОГНОЗ Q4 '26
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-[9px] font-black uppercase text-indigo-400">Ожидаемый рост</p>
              <p className="text-sm font-black text-indigo-600">+24.2%</p>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[9px] font-black uppercase text-slate-400">Уровень доверия</p>
              <p className="text-sm font-black text-slate-900">89%</p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 rounded-xl border-none bg-white p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Zap className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-sm font-black uppercase text-slate-900">
                  Конструктор Сценариев
                </h5>
                <p className="text-[9px] font-bold uppercase text-slate-400">
                  Симуляция влияния рынка на P&L
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              {[
                { label: 'Рост логистических затрат (+15%)', effect: '-2.4M ₽ к выручке' },
                { label: 'Выход в новый регион (CIS)', effect: '+18.5M ₽ к выручке' },
                { label: 'Волатильность валют (5%)', effect: '-1.2M ₽ к марже' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="group flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                >
                  <p className="text-[10px] font-black uppercase text-slate-600 transition-colors group-hover:text-slate-900">
                    {s.label}
                  </p>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-all group-hover:text-indigo-600" />
                </div>
              ))}
            </div>
            <Button className="mt-4 h-12 w-full rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white">
              Создать сценарий
            </Button>
          </Card>

          <Card className="space-y-4 rounded-xl border-none bg-slate-50 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-black uppercase text-slate-900">Потоки данных продаж</h5>
              <Badge className="border-none bg-emerald-50 text-[8px] font-black text-emerald-600">
                2 АКТИВНО
              </Badge>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Shopify Store (Direct)', status: 'Подключено' },
                { name: 'POS ЦУМ (EDI)', status: 'Подключено' },
                { name: 'Amazon Brand Registry', status: 'Ожидает' },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase text-slate-500">{f.name}</span>
                  <span
                    className={cn(
                      'text-[8px] font-black uppercase',
                      f.status === 'Подключено' ? 'text-emerald-500' : 'text-amber-500'
                    )}
                  >
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="mt-2 h-10 w-full rounded-xl border border-slate-200 text-[9px] font-black uppercase tracking-widest text-indigo-600"
            >
              Подключить поток
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderCashFlow = () => (
    <div className="space-y-4 text-left animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="col-span-2 space-y-4 rounded-xl border-none bg-white p-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-base font-black uppercase tracking-tight">
                Прогноз Cash Flow (30 дней)
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Притоки vs Оттоки на основе графиков заказов (₽)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-slate-200 text-[9px] font-black uppercase"
              >
                Экспорт книги
              </Button>
              <Button className="h-10 rounded-xl bg-slate-900 px-6 text-[9px] font-black uppercase text-white">
                Добавить расход
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                date: 'Feb 15',
                desc: 'Оплата заказа #FW26-042',
                type: 'in',
                amount: '+4.2M ₽',
                status: 'Pending',
              },
              {
                date: 'Feb 18',
                desc: 'Logistics - Moscow Hub',
                type: 'out',
                amount: '-1.8M ₽',
                status: 'Scheduled',
              },
              {
                date: 'Feb 22',
                desc: 'Предзаказ #SS27-001 — предоплата',
                type: 'in',
                amount: '+12.5M ₽',
                status: 'Confirmed',
              },
              {
                date: 'Feb 28',
                desc: 'Production Milestone - Factory #4',
                type: 'out',
                amount: '-5.4M ₽',
                status: 'Pending',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-indigo-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center">
                    <p className="text-[10px] font-black uppercase text-slate-900">
                      {t.date.split(' ')[0]}
                    </p>
                    <p className="text-sm font-black text-slate-900">{t.date.split(' ')[1]}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-200" />
                  <div>
                    <p className="text-xs font-black uppercase text-slate-900">{t.desc}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-slate-200 text-[8px] font-black text-slate-400"
                      >
                        {t.status}
                      </Badge>
                      {t.type === 'in' ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-rose-500" />
                      )}
                    </div>
                  </div>
                </div>
                <p
                  className={cn(
                    'text-sm font-black',
                    t.type === 'in' ? 'text-emerald-500' : 'text-slate-900'
                  )}
                >
                  {t.amount}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-6 rounded-xl border-none bg-emerald-900 p-3 text-white shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-400">
              <Banknote className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                Доступная ликвидность
              </p>
              <p className="text-sm font-black">28.4M ₽</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                +12% к прошлому месяцу
              </p>
            </div>
            <div className="space-y-4 border-t border-emerald-800 pt-6">
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span className="text-emerald-400/60">Зарезервировано под пр-во</span>
                <span>14.2M ₽</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase">
                <span className="text-emerald-400/60">Кредитные линии</span>
                <span>40.0M ₽</span>
              </div>
            </div>
            <Button className="h-10 w-full rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-emerald-900 shadow-xl shadow-emerald-950/20">
              Управление финансами
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="space-y-4 overflow-auto p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="text-base font-black uppercase tracking-tight text-slate-900">
                Финансовые показатели
              </h2>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Фискальный мониторинг в реальном времени, прогнозирование и ИИ-бюджетирование
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Обзор', icon: BarChart3 },
              { id: 'forecasting', label: 'Прогноз', icon: TrendingUp },
              { id: 'cashflow', label: 'Cash Flow', icon: Banknote },
              { id: 'budgeting', label: 'Бюджет', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all',
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'forecasting' && renderForecasting()}
            {activeTab === 'cashflow' && renderCashFlow()}
            {activeTab === 'budgeting' && (
              <div className="space-y-4 text-left animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-3 gap-3">
                  <Card className="col-span-2 space-y-4 rounded-xl border-none bg-white p-3 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                          Распределение бюджета
                        </h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Текущий сезон: FW26 (Осень/Зима 2026)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl border-slate-200 text-[9px] font-black uppercase"
                        >
                          Перераспределить
                        </Button>
                        <Button className="h-10 rounded-xl bg-slate-900 px-6 text-[9px] font-black uppercase text-white">
                          Новая цель
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          cat: 'Верхняя одежда',
                          budget: 15000000,
                          spent: 12400000,
                          color: 'bg-indigo-600',
                        },
                        {
                          cat: 'Трикотаж',
                          budget: 8000000,
                          spent: 6200000,
                          color: 'bg-emerald-500',
                        },
                        {
                          cat: 'Аксессуары',
                          budget: 4000000,
                          spent: 3800000,
                          color: 'bg-amber-500',
                        },
                        { cat: 'Обувь', budget: 10000000, spent: 2500000, color: 'bg-rose-500' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-black uppercase text-slate-900">
                                {item.cat}
                              </p>
                              <p className="text-[9px] font-bold uppercase text-slate-400">
                                Освоено: {((item.spent / item.budget) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">
                                {item.spent.toLocaleString('ru-RU')} /{' '}
                                {item.budget.toLocaleString('ru-RU')} ₽
                              </p>
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.spent / item.budget) * 100}%` }}
                              className={cn('h-full rounded-full', item.color)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="space-y-6">
                    <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                          <PieChart className="h-6 w-6" />
                        </div>
                        <h5 className="text-sm font-black uppercase text-slate-900">
                          Структура бюджета
                        </h5>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase">
                          <span className="text-slate-400">Производство</span>
                          <span className="text-slate-900">65%</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase">
                          <span className="text-slate-400">Маркетинг</span>
                          <span className="text-slate-900">20%</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase">
                          <span className="text-slate-400">Логистика</span>
                          <span className="text-slate-900">15%</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="h-12 w-full rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest"
                      >
                        Детальный отчет
                      </Button>
                    </Card>

                    <Card className="space-y-4 rounded-xl border-none bg-slate-900 p-4 text-white shadow-xl">
                      <h5 className="text-sm font-black uppercase tracking-tight">
                        AI Инсайт по экономии
                      </h5>
                      <p className="text-[10px] font-medium uppercase leading-relaxed tracking-widest text-slate-400">
                        Консолидация отгрузок FW26 через **РЦ Москва** может снизить логистические
                        расходы на **12% (1,4 млн ₽)**.
                      </p>
                      <Button className="h-10 w-full rounded-xl bg-white text-[9px] font-black uppercase tracking-widest text-slate-900">
                        Оптимизировать
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
