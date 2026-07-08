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
import { ROUTES } from '@/lib/routes';

export default function FactoryCustomizationPage() {
  const [selectedOrder, setSelectedOrder] = useState(MOCK_CUSTOM_ORDERS[0]);

  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-4 px-4 pb-20 md:px-0">
      {/* Breadcrumb Navigation */}
      <div className="text-text-muted mb-4 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
        <Link
          href={ROUTES.factory.production}
          className="hover:text-accent-primary transition-colors"
        >
          Производство
        </Link>
        <ChevronRight className="h-2 w-2" />
        <span className="text-text-primary">Индивидуальные заказы (MTM)</span>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-text-primary flex h-12 w-12 items-center justify-center rounded-3xl shadow-2xl">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em]">
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
            <p className="text-text-muted mb-1 text-[9px] font-black uppercase tracking-widest">
              Загрузка линии
            </p>
            <p className="text-text-primary text-base font-black italic leading-none">84%</p>
          </div>
          <div className="bg-bg-surface2 mx-4 hidden h-10 w-px xl:block" />
          <Button className="bg-text-primary hover:bg-text-primary/90 h-12 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all">
            Сводка по материалам
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Orders Queue */}
        <div className="space-y-4 lg:col-span-4">
          <div className="relative mb-6">
            <Search className="text-text-muted absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск заказа..."
              className="border-border-subtle focus:ring-accent-primary/20 h-12 w-full rounded-2xl border bg-white pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest shadow-sm focus:outline-none focus:ring-2"
            />
          </div>

          <div className="max-h-[800px] space-y-3 overflow-y-auto pr-2">
            {MOCK_CUSTOM_ORDERS.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  'group cursor-pointer overflow-hidden rounded-2xl border-none shadow-sm transition-all',
                  selectedOrder.id === order.id
                    ? 'bg-accent-primary z-10 scale-105 text-white shadow-xl'
                    : 'hover:bg-bg-surface2 bg-white'
                )}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-3">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p
                        className={cn(
                          'mb-1 text-[9px] font-black uppercase tracking-widest',
                          selectedOrder.id === order.id
                            ? 'text-accent-primary/40'
                            : 'text-text-muted'
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
                          selectedOrder.id === order.id
                            ? 'text-accent-primary/40'
                            : 'text-text-muted'
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
                          selectedOrder.id === order.id
                            ? 'text-accent-primary/40'
                            : 'text-text-muted'
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
            <CardHeader className="border-border-subtle bg-bg-surface2/30 border-b p-3">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 overflow-hidden rounded-xl shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1591047139829-d91aec16adcd?q=80&w=200&auto=format&fit=crop"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-accent-primary mb-1 text-[10px] font-black uppercase tracking-widest">
                      Production Details
                    </p>
                    <h2 className="text-base font-black uppercase italic tracking-tighter">
                      {selectedOrder.productName}
                    </h2>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-accent-primary h-6 border-none px-2 text-[9px] font-black uppercase tracking-widest text-white">
                          MTM Order
                        </Badge>
                        <span className="text-[11px] font-black italic">{selectedOrder.id}</span>
                      </div>
                      <div className="bg-border-subtle h-1 w-1 rounded-full" />
                      <span className="text-text-muted text-[11px] font-black uppercase tracking-widest">
                        Client: {selectedOrder.clientName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-border-default h-12 w-12 rounded-2xl"
                  >
                    <Printer className="text-text-muted h-5 w-5" />
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
                    <div className="bg-accent-primary/10 text-accent-primary flex h-8 w-8 items-center justify-center rounded-xl">
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
                        className="border-border-subtle flex items-baseline justify-between border-b pb-2"
                      >
                        <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                          {m.label}
                        </span>
                        <span className="text-sm font-black italic tracking-tighter">
                          {m.value}
                          <span className="text-text-muted ml-1 text-[10px] not-italic">
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
                    <div className="bg-bg-surface2 text-text-secondary flex h-8 w-8 items-center justify-center rounded-xl">
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
                        className="bg-bg-surface2 border-border-subtle group flex items-center justify-between rounded-2xl border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            {opt.type === 'fabric' ? (
                              <div
                                className="border-border-subtle h-6 w-6 rounded-full border shadow-inner"
                                style={{ backgroundColor: opt.value }}
                              />
                            ) : (
                              <Scissors className="text-text-muted h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-text-muted mb-1 text-[9px] font-black uppercase leading-none tracking-[0.2em]">
                              {opt.type}
                            </p>
                            <p className="text-[11px] font-black uppercase tracking-widest">
                              {opt.name}
                            </p>
                          </div>
                        </div>
                        <Badge className="text-text-secondary border-border-subtle h-5 bg-white text-[8px] font-black uppercase">
                          In Stock
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="bg-text-primary mt-8 rounded-xl p-4 text-white">
                    <div className="mb-4 flex items-center gap-3">
                      <Scan className="text-accent-primary h-4 w-4" />
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
