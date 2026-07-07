'use client';

import { useState } from 'react';
import {
  Scissors,
  Ruler,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  User,
  Scan,
  Activity,
  AlertTriangle,
  Layers,
  Search,
  Maximize2,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { cn } from '@/lib/utils';
import {
  MOCK_CUSTOM_ORDERS,
  getStatusLabel,
  getStatusColor,
} from '@/lib/logic/customization-utils';
import Link from 'next/link';

export default function FactoryCustomizationPage() {
  const [selectedOrder, setSelectedOrder] = useState(MOCK_CUSTOM_ORDERS[0]);

  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-4 px-4 pb-20 md:px-0">
      {/* Breadcrumb Navigation */}
      <div className="mb-4 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
        <Link href="/factory" className="transition-colors hover:text-indigo-600">
          Производство
        </Link>
        <ChevronRight className="h-2 w-2" />
        <span className="text-slate-900">Индивидуальные заказы (MTM)</span>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 shadow-2xl">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Made-to-Measure Production
              </p>
              <Badge className="h-5 border-none bg-emerald-50 text-[8px] font-black uppercase tracking-widest text-emerald-600">
                Active Line
              </Badge>
            </div>
            <h1 className="text-base font-black uppercase italic leading-none tracking-tighter">
              Цех Спецпошива
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right xl:block">
            <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
              Загрузка линии
            </p>
            <p className="text-base font-black italic leading-none text-slate-900">84%</p>
          </div>
          <div className="mx-4 hidden h-10 w-px bg-slate-100 xl:block" />
          <Button className="h-12 rounded-2xl bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-slate-800">
            Сводка по материалам
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Orders Queue */}
        <div className="space-y-4 lg:col-span-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск заказа..."
              className="h-12 w-full rounded-2xl border border-slate-100 bg-white pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>

          <div className="max-h-[800px] space-y-3 overflow-y-auto pr-2">
            {MOCK_CUSTOM_ORDERS.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  'group cursor-pointer overflow-hidden rounded-2xl border-none shadow-sm transition-all',
                  selectedOrder.id === order.id
                    ? 'z-10 scale-105 bg-indigo-600 text-white shadow-xl'
                    : 'bg-white hover:bg-slate-50'
                )}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-3">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p
                        className={cn(
                          'mb-1 text-[9px] font-black uppercase tracking-widest',
                          selectedOrder.id === order.id ? 'text-indigo-200' : 'text-slate-400'
                        )}
                      >
                        {order.id}
                      </p>
                      <h4 className="text-sm font-black uppercase italic tracking-tight">
                        {order.productName}
                      </h4>
                    </div>
                    <Badge
                      className={cn(
                        'border-none text-[8px] font-black uppercase',
                        selectedOrder.id === order.id
                          ? 'bg-white/20 text-white'
                          : getStatusColor(order.status)
                      )}
                    >
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User
                        className={cn(
                          'h-3 w-3',
                          selectedOrder.id === order.id ? 'text-indigo-200' : 'text-slate-400'
                        )}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {order.clientName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock
                        className={cn(
                          'h-3 w-3',
                          selectedOrder.id === order.id ? 'text-indigo-200' : 'text-slate-400'
                        )}
                      />
                      <span className="text-[10px] font-black tabular-nums">
                        {order.estimatedDelivery}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Production Specs */}
        <div className="space-y-6 lg:col-span-8">
          <Card className="overflow-hidden rounded-xl border-none bg-white shadow-sm">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-3">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 overflow-hidden rounded-xl shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1591047139829-d91aec16adcd?q=80&w=200&auto=format&fit=crop"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      Production Details
                    </p>
                    <h2 className="text-base font-black uppercase italic tracking-tighter">
                      {selectedOrder.productName}
                    </h2>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className="h-6 border-none bg-indigo-600 px-2 text-[9px] font-black uppercase tracking-widest text-white">
                          MTM Order
                        </Badge>
                        <span className="text-[11px] font-black italic">{selectedOrder.id}</span>
                      </div>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        Client: {selectedOrder.clientName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-2xl border-slate-200"
                  >
                    <Printer className="h-5 w-5 text-slate-400" />
                  </Button>
                  <Button className="h-12 rounded-2xl bg-emerald-600 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-200/50 hover:bg-emerald-500">
                    Подтвердить крой
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* Measurements Section */}
                <div>
                  <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Ruler className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase italic tracking-tight">
                      3D-Обмеры (Анатомические)
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {[
                      {
                        label: 'Рост (Height)',
                        value: selectedOrder.measurements.height,
                        unit: 'cm',
                      },
                      {
                        label: 'Грудь (Chest)',
                        value: selectedOrder.measurements.chest,
                        unit: 'cm',
                      },
                      {
                        label: 'Талия (Waist)',
                        value: selectedOrder.measurements.waist,
                        unit: 'cm',
                      },
                      { label: 'Бедра (Hips)', value: selectedOrder.measurements.hips, unit: 'cm' },
                      {
                        label: 'Плечи (Shoulders)',
                        value: selectedOrder.measurements.shoulderWidth,
                        unit: 'cm',
                      },
                      {
                        label: 'Рукав (Arm)',
                        value: selectedOrder.measurements.armLength,
                        unit: 'cm',
                      },
                      {
                        label: 'Внутр. шов (Inseam)',
                        value: selectedOrder.measurements.inseam,
                        unit: 'cm',
                      },
                      { label: 'Шея (Neck)', value: selectedOrder.measurements.neck, unit: 'cm' },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className="flex items-baseline justify-between border-b border-slate-50 pb-2"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {m.label}
                        </span>
                        <span className="text-sm font-black italic tracking-tighter">
                          {m.value}
                          <span className="ml-1 text-[10px] not-italic text-slate-400">
                            {m.unit}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <p className="text-[11px] font-medium leading-relaxed text-amber-800">
                      Внимание: Плечевой пояс клиента асимметричен (правое +0.4 см). AI-генератор
                      лекал внес корректировки в паттерн для баланса.
                    </p>
                  </div>
                </div>

                {/* Configuration & Materials */}
                <div>
                  <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Layers className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase italic tracking-tight">
                      Спецификация и Материалы
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {selectedOrder.selectedOptions.map((opt, i) => (
                      <div
                        key={i}
                        className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            {opt.type === 'fabric' ? (
                              <div
                                className="h-6 w-6 rounded-full border border-slate-100 shadow-inner"
                                style={{ backgroundColor: opt.value }}
                              />
                            ) : (
                              <Scissors className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="mb-1 text-[9px] font-black uppercase leading-none tracking-[0.2em] text-slate-400">
                              {opt.type}
                            </p>
                            <p className="text-[11px] font-black uppercase tracking-widest">
                              {opt.name}
                            </p>
                          </div>
                        </div>
                        <Badge className="h-5 border-slate-100 bg-white text-[8px] font-black uppercase text-slate-600">
                          In Stock
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-xl bg-slate-900 p-4 text-white">
                    <div className="mb-4 flex items-center gap-3">
                      <Scan className="h-4 w-4 text-indigo-400" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest">
                        Digital Pattern (DXF)
                      </h4>
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-tight text-white/40">
                        Статус генерации лекал:
                      </p>
                      <Badge className="h-5 border-none bg-emerald-500 px-2 text-[8px] font-black uppercase text-white">
                        Ready
                      </Badge>
                    </div>
                    <Button className="h-11 w-full rounded-xl border border-white/10 bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/20">
                      Отправить в раскройный комплекс
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CabinetPageContent>
  );
}
