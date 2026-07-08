'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Package,
  FileText,
  CheckCircle2,
  Clock,
  Box,
  ChevronRight,
  Download,
  AlertCircle,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Zap,
  Printer,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';

const ORDER_STATUSES = [
  { id: 'confirmed', label: 'Заказ подтвержден', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'production', label: 'В производстве', icon: Box, color: 'text-accent-primary' },
  { id: 'qc', label: 'Контроль качества', icon: ShieldCheck, color: 'text-amber-500' },
  { id: 'shipped', label: 'Отправлено', icon: Truck, color: 'text-blue-500' },
  { id: 'delivered', label: 'Доставлено', icon: Package, color: 'text-emerald-600' },
];

export function OrderLogisticsTracker() {
  const { viewRole } = useUIState();
  const { b2bNegotiations } = useB2BState();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const mockOrders = [
    {
      id: 'WH-8241',
      retailer: 'Premium Store HQ',
      brand: 'Syntha Lab',
      status: 'production',
      totalAmount: 1250000,
      units: 120,
      trackingNo: 'SY-7729-XQ',
      createdAt: '2026-02-01',
      eta: '2026-03-15',
      isSplit: true,
      shipments: [
        { id: 'S1', type: 'Available', units: 80, status: 'shipped', eta: '2026-02-20' },
        { id: 'S2', type: 'Backorder', units: 40, status: 'production', eta: '2026-04-10' },
      ],
    },
    {
      id: 'WH-9012',
      retailer: 'Urban Elite',
      brand: 'Syntha Lab',
      status: 'shipped',
      totalAmount: 480000,
      units: 42,
      trackingNo: 'DHL-9921-ZZ',
      createdAt: '2026-01-28',
      eta: '2026-02-14',
      isSplit: false,
    },
  ];

  return (
    <div className="bg-bg-surface2 min-h-screen space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-blue-100 text-[9px] font-black uppercase tracking-widest text-blue-600"
            >
              Logistics_Control_v1.0
            </Badge>
          </div>
          <h2 className="text-text-primary text-sm font-black uppercase leading-none tracking-tighter md:text-sm">
            Жизненный Цикл Заказа
          </h2>
          <p className="text-text-muted max-w-md text-xs font-medium">
            Отслеживайте оптовые заказы от производства до двери. Мгновенно формируйте коммерческие
            счета и упаковочные листы.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-border-default h-12 gap-2 rounded-xl bg-white px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <Printer className="h-4 w-4" /> Пакет документов
          </Button>
          <Button className="bg-text-primary h-12 gap-2 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-xl">
            Экспорт логистического манифеста
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Order List */}
        <div className="space-y-4 lg:col-span-4">
          <h3 className="text-text-muted px-2 text-[10px] font-black uppercase tracking-widest">
            Активные поставки
          </h3>
          {mockOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={cn(
                'w-full rounded-xl border p-4 text-left transition-all duration-300',
                selectedOrder?.id === order.id
                  ? 'border-accent-primary/30 shadow-accent-primary/10 scale-[1.02] bg-white shadow-xl'
                  : 'border-border-subtle hover:border-border-default bg-white/50 hover:bg-white'
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge className="bg-text-primary border-none text-[9px] font-black uppercase tracking-widest text-white">
                  #{order.id}
                </Badge>
                <Badge
                  className={cn(
                    'text-[8px] font-black uppercase tracking-widest',
                    order.status === 'production'
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'bg-blue-50 text-blue-600'
                  )}
                >
                  {order.status === 'production'
                    ? 'В производстве'
                    : order.status === 'shipped'
                      ? 'Отправлено'
                      : order.status === 'delivered'
                        ? 'Доставлено'
                        : order.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <h4 className="text-text-primary text-sm font-black uppercase">{order.retailer}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted text-[10px] font-bold uppercase">
                    {order.units} ед.
                  </span>
                  <span className="bg-border-subtle h-1 w-1 rounded-full" />
                  <span className="text-text-primary text-[10px] font-black">
                    {order.totalAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
              <div className="border-border-subtle mt-4 flex items-center justify-between border-t pt-4">
                <div className="text-text-muted flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase">Ожид. дата: {order.eta}</span>
                </div>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-all',
                    selectedOrder?.id === order.id
                      ? 'text-accent-primary translate-x-1'
                      : 'text-text-muted'
                  )}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Status Timeline */}
                {selectedOrder.isSplit && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {selectedOrder.shipments.map((s: any) => (
                      <Card
                        key={s.id}
                        className="border-accent-primary rounded-3xl border-l-4 border-none bg-white p-4 shadow-lg"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Badge className="bg-text-primary px-1.5 py-0 text-[7px] font-black uppercase text-white">
                            Поставка {s.id}
                          </Badge>
                          <Badge variant="outline" className="text-[7px] font-black uppercase">
                            {s.type === 'Available' ? 'В наличии' : 'Дозаказ'}
                          </Badge>
                        </div>
                        <h4 className="text-text-primary text-xs font-black uppercase">
                          {s.units} ед.
                        </h4>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                s.status === 'shipped' ? 'bg-emerald-500' : 'bg-accent-primary'
                              )}
                            />
                            <span className="text-text-muted text-[9px] font-bold uppercase">
                              {s.status === 'shipped' ? 'Отправлено' : 'В производстве'}
                            </span>
                          </div>
                          <span className="text-text-primary text-[9px] font-black uppercase">
                            Ожид. дата: {s.eta}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <Card className="relative overflow-hidden rounded-xl border-none bg-white p-3 shadow-2xl shadow-md">
                  <div className="absolute right-0 top-0 p-4 opacity-5">
                    <Truck className="h-32 w-32" />
                  </div>

                  <div className="mb-12 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                        История отслеживания
                      </p>
                      <h3 className="text-text-primary text-sm font-black uppercase tracking-tight">
                        Этапы поставки
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <p className="text-text-muted text-[9px] font-black uppercase">
                          Номер отслеживания
                        </p>
                        <p className="text-accent-primary text-sm font-black uppercase tracking-widest">
                          {selectedOrder.trackingNo}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-bg-surface2 h-10 w-10 rounded-xl"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative mx-auto flex max-w-4xl items-start justify-between">
                    {/* Line behind */}
                    <div className="bg-bg-surface2 absolute left-0 right-0 top-4 h-[2px]" />
                    <div
                      className="bg-accent-primary absolute left-0 top-4 h-[2px] transition-all duration-1000"
                      style={{
                        width: `${(ORDER_STATUSES.findIndex((s) => s.id === selectedOrder.status) / (ORDER_STATUSES.length - 1)) * 100}%`,
                      }}
                    />

                    {ORDER_STATUSES.map((status, i) => {
                      const Icon = status.icon;
                      const isActive =
                        ORDER_STATUSES.findIndex((s) => s.id === selectedOrder.status) >= i;
                      const isCurrent = selectedOrder.status === status.id;

                      return (
                        <div
                          key={status.id}
                          className="relative z-10 flex flex-col items-center gap-3"
                        >
                          <div
                            className={cn(
                              'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500',
                              isActive
                                ? 'bg-text-primary text-white shadow-md shadow-xl'
                                : 'text-text-muted border-border-subtle border-2 bg-white',
                              isCurrent && 'ring-accent-primary/10 ring-4'
                            )}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="space-y-1 text-center">
                            <p
                              className={cn(
                                'whitespace-nowrap text-[10px] font-black uppercase tracking-tight',
                                isActive ? 'text-text-primary' : 'text-text-muted'
                              )}
                            >
                              {status.label}
                            </p>
                            {isCurrent && (
                              <Badge className="bg-accent-primary/15 text-accent-primary border-none text-[8px] font-black uppercase">
                                Активно
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Documents & Details */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-2xl shadow-md">
                    <h4 className="text-text-primary text-sm font-black uppercase tracking-widest">
                      Документы комплаенса
                    </h4>
                    <div className="space-y-3">
                      <button className="bg-bg-surface2 hover:bg-bg-surface2 group flex w-full items-center justify-between rounded-2xl p-4 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            <FileText className="text-accent-primary h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-text-primary text-[10px] font-black uppercase leading-none">
                              Коммерческий инвойс
                            </p>
                            <p className="text-text-muted mt-1 text-[8px] font-bold uppercase">
                              Сформирован 2 дня назад
                            </p>
                          </div>
                        </div>
                        <Download className="text-text-muted group-hover:text-text-primary h-4 w-4" />
                      </button>

                      <button className="bg-bg-surface2 hover:bg-bg-surface2 group flex w-full items-center justify-between rounded-2xl p-4 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            <Package className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-text-primary text-[10px] font-black uppercase leading-none">
                              Детальный упаковочный лист
                            </p>
                            <p className="text-text-muted mt-1 text-[8px] font-bold uppercase">
                              Готов к печати
                            </p>
                          </div>
                        </div>
                        <Download className="text-text-muted group-hover:text-text-primary h-4 w-4" />
                      </button>

                      <button className="bg-bg-surface2 hover:bg-bg-surface2 group flex w-full items-center justify-between rounded-2xl p-4 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-text-primary text-[10px] font-black uppercase leading-none">
                              Таможенный манифест
                            </p>
                            <p className="text-text-muted mt-1 text-[8px] font-bold uppercase">
                              Цифровая подача v2
                            </p>
                          </div>
                        </div>
                        <Download className="text-text-muted group-hover:text-text-primary h-4 w-4" />
                      </button>
                    </div>
                  </Card>

                  <Card className="bg-accent-primary space-y-6 rounded-xl border-none p-4 text-white shadow-2xl shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        <Zap className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight">
                        Логистический советник
                      </h4>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed text-white/80">
                      "На основе текущей загруженности портов в Дубае, мы рекомендуем перенаправить
                      эту партию через наш основной хаб в Москве, чтобы сэкономить 48 часов в пути."
                    </p>
                    <div className="pt-2">
                      <Button className="text-accent-primary hover:bg-accent-primary/10 h-12 w-full rounded-xl bg-white text-[10px] font-black uppercase tracking-widest">
                        Применить стратегию перенаправления
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40">
                      <AlertCircle className="h-3 w-3" />
                      Стратегия валидна в течение 12 часов
                    </div>
                  </Card>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-4 opacity-30">
                <Truck className="text-text-muted h-20 w-20" />
                <p className="text-text-muted text-[11px] font-black uppercase tracking-widest">
                  Выберите заказ для просмотра деталей отслеживания
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
