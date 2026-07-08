'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Lock,
  Building2,
  FileCheck,
  Zap,
  TrendingUp,
  Landmark,
  Scale,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { cn } from '@/lib/cn';

export function B2BFinancing() {
  const { activeCurrency } = useUIState();
  const [activePlan, setActivePlan] = useState<string | null>(null);

  const financingPlans = [
    {
      id: 'net-30',
      title: 'Отсрочка 30 дней (B2B)',
      desc: 'Стандартные оптовые условия. Оплата в течение 30 календарных дней после отгрузки.',
      interest: '0%',
      fee: '0 ₽',
      maxLimit: '5.0M ₽',
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      id: 'bnpl-90',
      title: 'Growth Flex 90',
      desc: 'Расширенное окно в 90 дней. Идеально для сезонных закупок большого объема.',
      interest: '2.4%',
      fee: '120K ₽',
      maxLimit: '15.0M ₽',
      icon: TrendingUp,
      color: 'bg-indigo-600',
    },
    {
      id: 'revenue-share',
      title: 'Performance Pay',
      desc: 'Оплата по мере продаж. Автоматическое списание на основе данных POS.',
      interest: '4.5%',
      fee: 'Динамическая',
      maxLimit: 'Без лимита',
      icon: Zap,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-3 text-left">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Landmark className="h-5 w-5" />
            </div>
            <Badge
              variant="outline"
              className="border-indigo-100 text-[9px] font-black uppercase tracking-widest text-indigo-600"
            >
              FINANCE_BNPL_v1.0
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            B2B Кредитование
            <br />и Финансирование
          </h2>
          <p className="max-w-md text-xs font-medium text-slate-400">
            Разблокируйте ликвидность для ваших оптовых операций. Подайте заявку на отсрочку платежа
            или финансирование на основе выручки мгновенно.
          </p>
        </div>

        <Card className="flex items-center gap-3 rounded-xl border-none bg-slate-900 p-4 text-white shadow-2xl">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              Доступный лимит
            </p>
            <p className="text-base font-black">12.4M ₽</p>
          </div>
          <div className="h-12 w-[1px] bg-white/10" />
          <Button className="h-12 rounded-xl bg-indigo-600 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-700">
            Увеличить лимит
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {financingPlans.map((plan) => (
              <Card
                key={plan.id}
                onClick={() => setActivePlan(plan.id)}
                className={cn(
                  'group cursor-pointer rounded-xl border-none p-4 shadow-xl transition-all',
                  activePlan === plan.id ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'
                )}
              >
                <div className="mb-8 flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg',
                      plan.color
                    )}
                  >
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-3 py-1 text-[10px] font-black uppercase tracking-widest',
                      activePlan === plan.id
                        ? 'border-white/20 text-white'
                        : 'border-slate-100 text-slate-400'
                    )}
                  >
                    {plan.interest} APR
                  </Badge>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase leading-none tracking-tight">
                    {plan.title}
                  </h4>
                  <p
                    className={cn(
                      'text-xs font-medium leading-relaxed',
                      activePlan === plan.id ? 'text-white/60' : 'text-slate-400'
                    )}
                  >
                    {plan.desc}
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase opacity-50">Лимит до</p>
                      <p className="text-sm font-black">{plan.maxLimit}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 opacity-20 transition-all group-hover:opacity-100" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="space-y-4 rounded-xl border-none bg-white p-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                Текущие обязательства
              </h4>
              <Button
                variant="ghost"
                className="gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600"
              >
                Смотреть книгу <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {[
                {
                  id: 'TX-8821',
                  brand: 'Syntha Lab',
                  amount: '1.2M ₽',
                  due: 'Feb 28',
                  status: 'Pending',
                },
                {
                  id: 'TX-8714',
                  brand: 'Ритейл Москва',
                  amount: '450K ₽',
                  due: 'Mar 15',
                  status: 'Active',
                },
              ].map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Продавец</p>
                      <p className="text-sm font-black text-slate-900">{tx.brand}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">К оплате</p>
                    <p className="text-sm font-black text-slate-900">{tx.amount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Дата</p>
                    <p className="text-sm font-black text-slate-900">{tx.due}</p>
                  </div>
                  <Badge className="border-none bg-emerald-50 px-3 py-1 text-[8px] font-black uppercase text-emerald-600">
                    {tx.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-6 rounded-xl border-none bg-indigo-900 p-4 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-6 w-6 text-indigo-400" />
              </div>
              <h5 className="text-sm font-black uppercase tracking-widest">Рейтинг доверия</h5>
            </div>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <p className="text-sm font-black">A+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Премиум уровень
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '92%' }}
                  className="h-full bg-indigo-400"
                />
              </div>
              <p className="text-[10px] font-medium uppercase leading-relaxed tracking-widest text-indigo-200/60">
                На основе 14 месяцев 100% своевременных расчетов.
              </p>
            </div>
          </Card>

          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl">
            <h5 className="text-sm font-black uppercase text-slate-900">Статус заявки</h5>
            <div className="space-y-6">
              {[
                { step: 'Верификация личности', status: 'completed' },
                { step: 'Синхронизация с банком', status: 'completed' },
                { step: 'Кредитный скоринг', status: 'active' },
                { step: 'Подписание контракта', status: 'pending' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black',
                      s.status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : s.status === 'active'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {s.status === 'completed' ? <FileCheck className="h-3 w-3" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-black uppercase tracking-widest',
                      s.status === 'pending' ? 'text-slate-300' : 'text-slate-900'
                    )}
                  >
                    {s.step}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="relative space-y-4 overflow-hidden rounded-xl border-none bg-slate-900 p-4 text-white shadow-xl">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Scale className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <h5 className="text-sm font-black uppercase tracking-widest text-indigo-400">
                Юридический комплаенс
              </h5>
              <p className="text-[10px] font-medium uppercase leading-relaxed tracking-widest text-slate-400">
                Все финансирование осуществляется в соответствии с местным законодательством и
                протоколами ПОД/ФТ.
              </p>
              <Button
                variant="ghost"
                className="border-none p-0 text-[10px] font-black uppercase tracking-widest text-white hover:text-indigo-400"
              >
                Обзор структуры
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
