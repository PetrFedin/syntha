'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Settings2,
  Users,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';

export function SmartAllocationEngine() {
  const { inventoryATS, retailerProfiles } = useB2BState();
  const [allocationStrategy, setAllocationStrategy] = useState<'fifo' | 'vip' | 'balanced'>('vip');

  const strategies = [
    {
      id: 'fifo',
      name: 'Первым пришел — первым ушел',
      desc: 'Заказы выполняются строго по дате создания.',
      icon: Clock,
    },
    {
      id: 'vip',
      name: 'VIP Приоритет',
      desc: 'Золотые и VIP клиенты получают приоритетный доступ к дефициту.',
      icon: Star,
    },
    {
      id: 'balanced',
      name: 'Сбалансированное деление',
      desc: 'Сток делится пропорционально между всеми активными заказами.',
      icon: Layers,
    },
  ];

  return (
    <div className="bg-bg-surface2 min-h-screen space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary flex h-8 w-8 items-center justify-center rounded-xl">
              <Warehouse className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-accent-primary/20 text-accent-primary text-[9px] font-black uppercase tracking-widest"
            >
              ALLOCATION_CORE_v3.4
            </Badge>
          </div>
          <h2 className="text-text-primary text-sm font-black uppercase leading-none tracking-tighter md:text-sm">
            Умное Распределение
            <br />
            Запасов
          </h2>
          <p className="text-text-muted max-w-md text-left text-xs font-medium">
            Определение правил распределения ограниченного стока (ATS) при превышении спроса.
            Автоматическое резервирование на основе уровня ритейлера и его показателей.
          </p>
        </div>

        <Button className="bg-text-primary h-10 gap-2 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-md">
          Выполнить глобальное перераспределение <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Strategy Selection */}
        {strategies.map((s) => (
          <Card
            key={s.id}
            onClick={() => setAllocationStrategy(s.id as any)}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-xl border-none p-4 shadow-md shadow-xl transition-all',
              allocationStrategy === s.id
                ? 'bg-text-primary text-white'
                : 'hover:bg-bg-surface2 bg-white'
            )}
          >
            {allocationStrategy === s.id && (
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <s.icon className="h-24 w-24" />
              </div>
            )}
            <div className="relative z-10 space-y-6">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-2xl transition-colors',
                  allocationStrategy === s.id ? 'bg-white/10' : 'bg-bg-surface2'
                )}
              >
                <s.icon
                  className={cn(
                    'h-6 w-6',
                    allocationStrategy === s.id ? 'text-white' : 'text-text-muted'
                  )}
                />
              </div>
              <div>
                <h4 className="mb-2 text-base font-black uppercase tracking-tight">{s.name}</h4>
                <p
                  className={cn(
                    'text-[10px] font-medium uppercase leading-relaxed tracking-widest',
                    allocationStrategy === s.id ? 'text-text-muted' : 'text-text-muted'
                  )}
                >
                  {s.desc}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {allocationStrategy === s.id ? (
                  <Badge className="border-none bg-emerald-500 px-2 py-0.5 text-[8px] font-black uppercase text-white">
                    Active Strategy
                  </Badge>
                ) : (
                  <span className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Select to activate
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Inventory Queue */}
        <div className="space-y-6 lg:col-span-8">
          <Card className="overflow-hidden rounded-xl border-none bg-white shadow-2xl shadow-md">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base font-black uppercase tracking-tight">
                  Ожидаемые распределения
                </CardTitle>
                <CardDescription className="text-text-muted text-[10px] font-bold uppercase">
                  Товары, требующие ручного распределения или правил
                </CardDescription>
              </div>
              <Badge className="border-none bg-amber-50 text-[9px] font-black text-amber-600">
                14 КОНФЛИКТОВ
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                {inventoryATS.map((item, i) => (
                  <div
                    key={i}
                    className="bg-bg-surface2 hover:bg-bg-surface2 hover:border-border-default group flex items-center justify-between rounded-3xl border border-transparent p-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <img
                          src={`https://placehold.co/100x100/f1f5f9/94a3b8?text=${item.sku.split('-')[0]}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-text-muted text-xs font-black uppercase tracking-widest">
                          {item.sku}
                        </p>
                        <h4 className="text-text-primary text-sm font-black uppercase tracking-tight">
                          {item.productName}
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className="text-text-muted text-[10px] font-bold uppercase">
                            Сток: {item.available}
                          </span>
                          <span className="bg-border-subtle h-1 w-1 rounded-full" />
                          <span className="text-[10px] font-bold uppercase text-rose-600">
                            Спрос: {item.reserved + 450}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-text-muted mb-1 text-[8px] font-black uppercase tracking-widest">
                          Уровень конфликта
                        </p>
                        <Badge className="border-none bg-rose-100 px-2 py-0.5 text-[8px] font-black text-rose-600">
                          КРИТИЧЕСКИЙ
                        </Badge>
                      </div>
                      <Button className="bg-text-primary h-12 gap-2 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-white">
                        Решить конфликт <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Dashboard */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="bg-accent-primary relative space-y-6 overflow-hidden rounded-xl border-none p-4 text-white shadow-2xl shadow-md">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Star className="h-32 w-32" />
            </div>
            <h3 className="relative z-10 text-base font-black uppercase tracking-tight">
              Выполнение по уровням
            </h3>
            <div className="relative z-10 space-y-6">
              {[
                { tier: 'VIP/Gold', progress: 100, color: 'bg-emerald-400' },
                { tier: 'Silver', progress: 85, color: 'bg-accent-primary/40' },
                { tier: 'Standard', progress: 42, color: 'bg-white/20' },
              ].map((t) => (
                <div key={t.tier} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span>{t.tier}</span>
                    <span>{t.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.progress}%` }}
                      className={cn('h-full', t.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-2xl shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-bg-surface2 flex h-10 w-10 items-center justify-center rounded-xl">
                <ShieldCheck className="text-text-muted h-5 w-5" />
              </div>
              <h4 className="text-text-primary text-sm font-black uppercase tracking-tight">
                Здоровье распределения
              </h4>
            </div>
            <div className="space-y-4">
              <div className="bg-bg-surface2 border-border-subtle flex items-start gap-3 rounded-2xl border p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-text-secondary text-[9px] font-medium leading-relaxed">
                  92% предзаказов VIP успешно распределены. Текущая оптимизация стока на пике
                  эффективности.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-[9px] font-medium leading-relaxed text-amber-900">
                  Заказы уровня Standard на 'Cyber Tech Parka' задержаны из-за низкого ATS в хабе
                  Москва.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
