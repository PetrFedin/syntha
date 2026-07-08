'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Target,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  Filter,
  Search,
  MoreVertical,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';

export function SalesRepDashboard() {
  const { b2bActivityLogs } = useB2BState();
  const [activeRep, setActiveRep] = useState<string | null>(null);

  const reps = [
    {
      id: 'rep-1',
      name: 'Алекс Волков',
      role: 'Senior Sales Manager',
      revenue: '4.2M ₽',
      target: '5M ₽',
      accounts: 12,
      growth: '+14%',
    },
    {
      id: 'rep-2',
      name: 'Елена Белова',
      role: 'Regional Lead',
      revenue: '2.8M ₽',
      target: '3M ₽',
      accounts: 8,
      growth: '+8%',
    },
    {
      id: 'rep-3',
      name: 'Марк Штайнер',
      role: 'International Rep',
      revenue: '1.5M ₽',
      target: '4M ₽',
      accounts: 5,
      growth: '-2%',
    },
  ];

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-indigo-100 text-[9px] font-black uppercase tracking-widest text-indigo-600"
            >
              SALES_CORE_v2.1
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Команда
            <br />
            Продаж
          </h2>
          <p className="max-w-md text-left text-xs font-medium text-slate-400">
            Отслеживайте показатели эффективности менеджеров, выполнение квот и управление
            аккаунтами ритейлеров во всех регионах.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-2xl border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <Calendar className="h-4 w-4" /> Период: Февраль 2026
          </Button>
          <Button className="h-10 gap-2 rounded-2xl bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200">
            Сформировать отчет <TrendingUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Rep List */}
        <div className="space-y-6 lg:col-span-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Поиск менеджеров..."
              className="h-10 rounded-2xl border-none bg-white pl-12 shadow-sm"
            />
          </div>

          <div className="space-y-4">
            {reps.map((rep) => (
              <Card
                key={rep.id}
                onClick={() => setActiveRep(rep.id)}
                className={cn(
                  'group cursor-pointer overflow-hidden rounded-xl border-none shadow-xl shadow-slate-200/50 transition-all',
                  activeRep === rep.id ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'
                )}
              >
                <CardContent className="p-4">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-12 w-12 overflow-hidden rounded-2xl border-2 transition-all',
                          activeRep === rep.id ? 'border-indigo-500' : 'border-slate-100'
                        )}
                      >
                        <img
                          src={`https://i.pravatar.cc/100?u=${rep.id}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">{rep.name}</h4>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {rep.role}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        'border-none px-2 py-0.5 text-[8px] font-black',
                        rep.growth.startsWith('+')
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      )}
                    >
                      {rep.growth}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-50">
                        Выручка
                      </p>
                      <p className="text-sm font-black">{rep.revenue}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-50">
                        Квота
                      </p>
                      <p className="text-sm font-black">
                        {Math.round((parseInt(rep.revenue) / parseInt(rep.target)) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rep Details / CRM Activity */}
        <div className="lg:col-span-8">
          {activeRep ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  { label: 'Активные аккаунты', val: '12', icon: Users, color: 'text-indigo-600' },
                  { label: 'Конверсия', val: '24%', icon: Zap, color: 'text-amber-600' },
                  { label: 'Средний заказ', val: '350K ₽', icon: Award, color: 'text-emerald-600' },
                ].map((s, i) => (
                  <Card
                    key={i}
                    className="rounded-xl border-none bg-white p-4 shadow-xl shadow-slate-200/50"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                        <s.icon className={cn('h-5 w-5', s.color)} />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-200" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {s.label}
                    </p>
                    <h3 className="text-sm font-black text-slate-900">{s.val}</h3>
                  </Card>
                ))}
              </div>

              <Card className="space-y-10 rounded-xl border-none bg-white p-3 shadow-2xl shadow-slate-200/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                      Поток CRM взаимодействий
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Последние действия с закрепленными ритейлерами
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border-slate-100 text-[9px] font-black uppercase tracking-widest"
                  >
                    Фильтр по аккаунту
                  </Button>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      type: 'negotiation',
                      account: 'Premium Store Moscow',
                      detail: 'Negotiated 5% bulk discount for FW26',
                      time: '2h ago',
                    },
                    {
                      type: 'linesheet',
                      account: 'Urban Elite',
                      detail: 'Sent customized "Techwear Essential" linesheet',
                      time: 'Yesterday',
                    },
                    {
                      type: 'meeting',
                      account: 'Концепт-стор Москва',
                      detail: 'Virtual showroom tour completed',
                      time: '2 days ago',
                    },
                  ].map((act, i) => (
                    <div
                      key={i}
                      className="group flex items-start gap-3 rounded-3xl border border-transparent bg-slate-50 p-4 transition-all hover:border-slate-200"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                        {act.type === 'negotiation' ? (
                          <MessageSquare className="h-5 w-5 text-indigo-600" />
                        ) : act.type === 'linesheet' ? (
                          <Target className="h-5 w-5 text-amber-600" />
                        ) : (
                          <Activity className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-900">
                            {act.account}
                          </h4>
                          <span className="text-[9px] font-bold uppercase text-slate-400">
                            {act.time}
                          </span>
                        </div>
                        <p className="text-xs font-medium leading-relaxed text-slate-500">
                          {act.detail}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-6 rounded-xl border border-dashed border-slate-200 bg-white p-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                <Target className="h-10 w-10 text-slate-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black uppercase tracking-tight text-slate-400">
                  Выберите менеджера
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Мониторинг персональных квот и логов взаимодействий
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
