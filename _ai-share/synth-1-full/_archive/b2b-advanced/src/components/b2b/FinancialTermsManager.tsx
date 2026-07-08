'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Search,
  Settings2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { NET_TERMS_LABELS, type NetTerms } from '@/lib/types/b2b';
import { cn } from '@/lib/cn';

export function FinancialTermsManager() {
  const { retailerProfiles, updateRetailerProfile } = useB2BState();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProfile = selectedId ? retailerProfiles[selectedId] : null;

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-900"
            >
              FINANCE_CORE_v1.0
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Финансовые Условия
            <br />и Кредитные Линии
          </h2>
          <p className="max-w-md text-left text-xs font-medium text-slate-400">
            Управление лимитами оптового кредитования, отсрочкой оплаты (30/60/90 календарных дней)
            и бюджетами OTB для всех партнеров-ритейлеров.
          </p>
        </div>

        <Button className="h-10 gap-2 rounded-2xl bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200">
          <UserPlus className="h-4 w-4" /> Выдать новую кредитную линию
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Retailer List */}
        <div className="space-y-6 lg:col-span-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Поиск партнеров..."
              className="h-10 rounded-[1.25rem] border-none bg-white pl-12 shadow-sm"
            />
          </div>

          <div className="space-y-4">
            {Object.values(retailerProfiles).map((profile) => (
              <Card
                key={profile.id}
                onClick={() => setSelectedId(profile.id)}
                className={cn(
                  'group cursor-pointer overflow-hidden rounded-xl border-none shadow-xl shadow-slate-200/50 transition-all',
                  selectedId === profile.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white hover:bg-slate-50'
                )}
              >
                <CardContent className="p-4">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-2xl transition-colors',
                          selectedId === profile.id ? 'bg-white/10' : 'bg-slate-50'
                        )}
                      >
                        <CreditCard
                          className={cn(
                            'h-6 w-6',
                            selectedId === profile.id ? 'text-white' : 'text-slate-400'
                          )}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">
                          {profile.name}
                        </h4>
                        <p
                          className={cn(
                            'text-[9px] font-black uppercase tracking-widest',
                            selectedId === profile.id ? 'text-slate-400' : 'text-slate-400'
                          )}
                        >
                          {profile.tier === 'VIP' ? 'Премиум' : profile.tier} партнер
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        'border-none px-2 py-0.5 text-[8px] font-black',
                        selectedId === profile.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-600'
                      )}
                    >
                      АКТИВЕН
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-50">
                        Доступный кредит
                      </p>
                      <p className="text-sm font-black tracking-tight">
                        {profile.availableCredit.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-50">
                        Условия оплаты
                      </p>
                      <p className="text-sm font-black tracking-tight">
                        {NET_TERMS_LABELS[profile.netTerms]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Profile Editor */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedProfile ? (
              <motion.div
                key={selectedProfile.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Card className="rounded-xl border-none bg-white p-3 shadow-2xl shadow-slate-200/50">
                  <div className="mb-10 flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                        Управление кредитным узлом
                      </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        ID Ритейлера: {selectedProfile.id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-xl border-slate-100"
                      >
                        <Settings2 className="h-5 w-5 text-slate-400" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Общий кредитный лимит
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                            ₽
                          </span>
                          <Input
                            type="number"
                            defaultValue={selectedProfile.creditLimit}
                            onBlur={(e) =>
                              updateRetailerProfile(selectedProfile.id, {
                                creditLimit: parseInt(e.target.value) || 0,
                              })
                            }
                            className="h-10 rounded-2xl border-none bg-slate-50 pl-12 text-sm font-black"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Срок оплаты
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(NET_TERMS_LABELS) as NetTerms[]).map((term) => (
                            <Button
                              key={term}
                              variant={selectedProfile.netTerms === term ? 'default' : 'outline'}
                              onClick={() =>
                                updateRetailerProfile(selectedProfile.id, { netTerms: term })
                              }
                              className={cn(
                                'h-12 rounded-xl text-[9px] font-black uppercase tracking-widest',
                                selectedProfile.netTerms === term
                                  ? 'bg-slate-900'
                                  : 'border-slate-100'
                              )}
                            >
                              {NET_TERMS_LABELS[term]}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl bg-slate-50 p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
                            Использование OTB
                          </h4>
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span>Бюджет {selectedProfile.otbBudget.season} потрачен</span>
                            <span className="text-indigo-600">
                              {Math.round(
                                (selectedProfile.otbBudget.spent /
                                  selectedProfile.otbBudget.total) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(selectedProfile.otbBudget.spent / selectedProfile.otbBudget.total) * 100}%`,
                              }}
                              className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            />
                          </div>
                          <p className="text-right text-[10px] font-bold uppercase text-slate-400">
                            {selectedProfile.otbBudget.spent.toLocaleString('ru-RU')} /{' '}
                            {selectedProfile.otbBudget.total.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          <p className="text-[9px] font-medium leading-relaxed text-slate-600">
                            Увеличение кредитного лимита свыше 5 млн ₽ требует дополнительного
                            одобрения финансового отдела.
                          </p>
                        </div>
                        <Button className="h-12 w-full gap-2 rounded-2xl bg-emerald-600 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-100 hover:bg-emerald-700">
                          <CheckCircle2 className="h-4 w-4" /> Сохранить условия
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Credit Score Activity */}
                <Card className="rounded-xl border-none bg-white p-4 shadow-xl shadow-slate-200/50">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                      Журнал финансовой дисциплины
                    </h3>
                    <Badge variant="outline" className="border-slate-100 text-[8px] font-black">
                      РЕЙТИНГ: 98/100
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {[
                      {
                        action: 'Кредитная линия увеличена на 1 млн ₽',
                        actor: 'Админ',
                        date: '2 дня назад',
                      },
                      {
                        action: 'Инвойс #8812 оплачен вовремя',
                        actor: 'Система',
                        date: '1 неделю назад',
                      },
                      {
                        action: 'Новый предзаказ #8821 подтвержден',
                        actor: 'Premium Store',
                        date: 'Сегодня',
                      },
                    ].map((log, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-slate-50 p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-black uppercase text-slate-900">
                            {log.action}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {log.actor}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {log.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-6 rounded-xl border border-dashed border-slate-200 bg-white p-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                  <CreditCard className="h-10 w-10 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black uppercase tracking-tight text-slate-400">
                    Выберите партнера
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Выберите ритейлера из списка для управления финансовыми условиями
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
