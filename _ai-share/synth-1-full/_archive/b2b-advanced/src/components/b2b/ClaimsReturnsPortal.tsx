'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ShieldAlert,
  Archive,
  ArrowRight,
  CreditCard,
  RefreshCcw,
  Camera,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useB2BState } from '@/providers/b2b-state';
import { useUIState } from '@/providers/ui-state';
import { cn } from '@/lib/cn';

export function ClaimsReturnsPortal() {
  const { viewRole } = useUIState();
  const { orderClaims } = useB2BState();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen space-y-4 bg-white p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600">
              <ShieldAlert className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-rose-100 text-[9px] font-black uppercase tracking-widest text-rose-600"
            >
              Assurance_Portal_v3.1
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Портал Претензий
            <br />и Возвратов
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Поиск претензий..."
              className="h-12 rounded-2xl border-slate-100 bg-slate-50 pl-10 focus-visible:ring-rose-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="h-12 gap-2 rounded-2xl bg-slate-900 px-6 text-[10px] font-black uppercase tracking-widest text-white"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4" /> Новая претензия
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        {/* Status Filter Sidebar */}
        <div className="space-y-6">
          <Card className="space-y-6 rounded-xl border-none bg-slate-900 p-4 text-white shadow-2xl shadow-slate-200/50">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Движок процессов
              </p>
              <h4 className="text-base font-black uppercase tracking-tight">Обзор этапов</h4>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Ожидает проверки', count: 4, icon: Clock, color: 'amber' },
                { label: 'На рассмотрении', count: 2, icon: AlertCircle, color: 'blue' },
                { label: 'Решено (30д)', count: 28, icon: CheckCircle2, color: 'emerald' },
                { label: 'Отклонено', count: 3, icon: Archive, color: 'slate' },
              ].map((stage, i) => (
                <button
                  key={i}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <stage.icon
                      className={cn(
                        'h-4 w-4',
                        stage.color === 'amber'
                          ? 'text-amber-400'
                          : stage.color === 'blue'
                            ? 'text-blue-400'
                            : stage.color === 'emerald'
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                      )}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-tight text-white/80">
                      {stage.label}
                    </span>
                  </div>
                  <Badge className="border-none bg-white/10 text-[8px] font-black text-white">
                    {stage.count}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-2xl shadow-slate-200/50">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Скорость решения
              </p>
              <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                Уровень сервиса
              </h4>
            </div>
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900">4.2ч</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Ср. время ответа
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500 opacity-20" />
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[85%] bg-emerald-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Claims Table/List */}
        <div className="space-y-6 lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50">
            <div className="flex items-center justify-between border-b border-slate-50 p-4">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                Последние претензии
              </h3>
              <Button
                variant="outline"
                className="h-10 rounded-xl border-slate-100 px-6 text-[9px] font-black uppercase tracking-widest"
              >
                Экспорт CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Референс / ID
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Тип проблемы
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Статус
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Ритейлер
                    </th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Решение
                    </th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orderClaims.map((claim) => (
                    <tr key={claim.id} className="group transition-all hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-slate-900">
                            {claim.orderId}
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-tight text-slate-400">
                            {claim.id}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className="border-slate-200 text-[8px] font-black uppercase text-slate-600"
                        >
                          {claim.type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'h-1.5 w-1.5 animate-pulse rounded-full',
                              claim.status === 'investigating'
                                ? 'bg-blue-500'
                                : claim.status === 'approved'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-400'
                            )}
                          />
                          <span className="text-[10px] font-black uppercase tracking-tight text-slate-900">
                            {claim.status === 'investigating'
                              ? 'Изучение'
                              : claim.status === 'approved'
                                ? 'Одобрено'
                                : claim.status === 'pending'
                                  ? 'Ожидает'
                                  : claim.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-600">
                          ID Ритейлера: {claim.retailerId}
                        </span>
                      </td>
                      <td className="p-4">
                        {claim.resolution ? (
                          <Badge className="border-none bg-indigo-50 text-[8px] font-black uppercase text-indigo-600">
                            {claim.resolution === 'credit_note'
                              ? 'Кредит-нота'
                              : claim.resolution === 'replacement'
                                ? 'Замена'
                                : claim.resolution === 'refund'
                                  ? 'Возврат'
                                  : String(claim.resolution).replace(/_/g, ' ')}
                          </Badge>
                        ) : (
                          <span className="text-[10px] font-black uppercase italic text-slate-300">
                            В процессе
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          className="h-10 w-10 rounded-xl border border-transparent p-0 hover:border-slate-100 hover:bg-white"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resolution Tools (Admin/Brand view) */}
          {viewRole === 'brand' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { label: 'Выставить кредит-ноту', icon: CreditCard, desc: 'Корректировка баланса' },
                { label: 'Одобрить замену', icon: RefreshCcw, desc: 'Бесплатная переотправка' },
                { label: 'Архивировать запись', icon: Archive, desc: 'Завершить и закрыть' },
              ].map((tool, i) => (
                <Card
                  key={i}
                  className="group cursor-pointer rounded-xl border border-none bg-white shadow-xl shadow-slate-200/50 transition-all hover:border-indigo-200"
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 shadow-lg transition-all group-hover:bg-indigo-600 group-hover:text-white">
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                        {tool.label}
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {tool.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Claim Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl"
            >
              <div className="space-y-4 p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Badge className="border-none bg-rose-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">
                      Официальный_запрос
                    </Badge>
                    <h2 className="text-base font-black uppercase tracking-tighter text-slate-900">
                      Открыть претензию
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setIsFormOpen(false)}
                    className="h-12 w-12 rounded-2xl p-0 hover:bg-slate-50"
                  >
                    <Plus className="h-6 w-6 rotate-45" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Номер заказа
                    </p>
                    <Input
                      placeholder="ORD-…"
                      className="h-10 rounded-2xl border-slate-100 bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Тип претензии
                    </p>
                    <select className="h-10 w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold">
                      <option>Повреждение при доставке</option>
                      <option>Недостача товара</option>
                      <option>Дефект качества</option>
                      <option>Некорректный SKU</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Описание проблемы
                  </p>
                  <textarea
                    className="h-32 w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    placeholder="Пожалуйста, предоставьте подробную информацию о дефекте..."
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Загрузка доказательств
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    <button className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-100 text-slate-300 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600">
                      <Camera className="h-6 w-6" />
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        Добавить фото
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setIsFormOpen(false)}
                    className="h-10 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Отмена
                  </Button>
                  <Button className="h-10 flex-[2] rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200">
                    Отправить претензию
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
