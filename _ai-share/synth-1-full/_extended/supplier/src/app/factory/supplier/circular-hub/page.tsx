'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  ChevronRight,
  ChevronLeft,
  Check,
  Trash2,
  Upload,
  Plus,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Activity,
  Maximize2,
  Package,
  History,
  Info,
  DollarSign,
  User,
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
import { ROUTES } from '@/lib/routes';
import {
  MOCK_MATERIAL_LISTINGS,
  MOCK_CIRCULAR_TRANSACTIONS,
  getConditionLabel,
  getConditionColor,
} from '@/lib/logic/circular-economy-utils';
import Link from 'next/link';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getSupplierShopB2bPlatformLinks } from '@/lib/data/entity-links';

export default function SupplierCircularHubPage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'transactions'>('listings');

  return (
    <CabinetPageContent maxWidth="6xl" className="space-y-4 px-4 pb-20 md:px-0">
      {/* Breadcrumb Navigation */}
      <div className="text-text-muted mb-4 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
        <Link href={ROUTES.factory.supplier} className="transition-colors hover:text-emerald-600">
          Поставщик-офис
        </Link>
        <ChevronRight className="h-2 w-2" />
        <span className="text-text-primary">Circular Hub (Управление стоками)</span>
      </div>

      <RelatedModulesBlock
        links={getSupplierShopB2bPlatformLinks()}
        title="Платформа B2B (ритейл)"
        className="border-border-default bg-bg-surface2 rounded-lg border p-3"
      />

      <p
        className="text-text-muted border-border-default bg-bg-surface2/80 rounded-md border px-3 py-2 text-xs leading-snug"
        data-testid="supplier-circular-demo-disclaimer"
      >
        <span className="text-text-primary font-semibold">Демо.</span> Показатели и сделки на
        мок-данных; не финансовая отчётность и не интеграция с OMS. См. реестр ядра:{' '}
        <code className="text-[10px]">CORE_OPERATING_CHAIN.md</code> §5.
      </p>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl bg-emerald-900 p-4 text-white shadow-2xl md:p-4">
        <div className="absolute right-0 top-0 rotate-12 scale-150 p-4 opacity-[0.05]">
          <Package className="h-64 w-64" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 shadow-2xl">
              <Leaf className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                  Stock Monetization P3
                </p>
                <Badge className="h-5 border-none bg-white/10 text-[8px] font-black uppercase italic tracking-widest text-white/60">
                  Circular Economy
                </Badge>
              </div>
              <h1 className="text-sm font-black uppercase italic leading-none tracking-tighter">
                Реализация остатков
              </h1>
              <p className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
                Общая ценность лотов: <span className="text-emerald-400">750 000 ₽</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                Продано за месяц: <span className="text-emerald-400">120 000 ₽</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="h-10 rounded-2xl bg-white px-8 text-[10px] font-black uppercase tracking-widest text-emerald-900 shadow-xl transition-all hover:scale-105 hover:bg-emerald-50">
              <Plus className="mr-2 h-4 w-4" /> Добавить лот
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Активные лоты',
            value: '12',
            sub: '3 бренда просматривают',
            icon: Activity,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Заказы в работе',
            value: '3',
            sub: 'Ожидают отгрузки',
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Эффект ESG',
            value: '245 кг',
            sub: 'Переработано сырья',
            icon: Leaf,
            color: 'text-accent-primary',
            bg: 'bg-accent-primary/10',
          },
          {
            label: 'Доход',
            value: '482 000 ₽',
            sub: 'Общая выручка хаба',
            icon: DollarSign,
            color: 'text-text-primary',
            bg: 'bg-bg-surface2',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="group overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-all hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-hover:scale-110',
                    stat.bg
                  )}
                >
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <Badge
                  variant="outline"
                  className="border-border-subtle text-[8px] font-black uppercase"
                >
                  Live
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-widest">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-text-primary text-sm font-black tracking-tighter">
                    {stat.value}
                  </h4>
                  <p className="text-text-secondary text-[10px] font-bold uppercase tracking-tight">
                    {stat.sub}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-xl border-none bg-white shadow-sm">
        <CardHeader className="border-border-subtle border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('listings')}
                className={cn(
                  'border-b-2 pb-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all',
                  activeTab === 'listings'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'text-text-muted hover:text-text-primary border-transparent'
                )}
              >
                Мои лоты
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={cn(
                  'border-b-2 pb-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all',
                  activeTab === 'transactions'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'text-text-muted hover:text-text-primary border-transparent'
                )}
              >
                Транзакции
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeTab === 'listings' ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle h-10 hover:bg-transparent">
                  <TableHead className="text-text-muted pl-8 text-[9px] font-black uppercase tracking-widest">
                    Материал
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Тип / Состав
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Остаток
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Состояние
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Цена (Дисконт)
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Статус
                  </TableHead>
                  <TableHead className="pr-8 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_MATERIAL_LISTINGS.filter((l) => l.supplierId === 'org-supplier-001').map(
                  (listing) => (
                    <TableRow
                      key={listing.id}
                      className="border-border-subtle hover:bg-bg-surface2/80 group transition-colors"
                    >
                      <TableCell className="py-6 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-xl shadow-sm">
                            <img src={listing.images[0]} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase italic tracking-tighter">
                              {listing.materialName}
                            </p>
                            <p className="text-text-muted text-[9px] font-bold uppercase italic tracking-widest">
                              {listing.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge className="bg-bg-surface2 text-text-secondary mb-1 border-none px-2 text-[8px] font-black uppercase">
                            {listing.type}
                          </Badge>
                          <p className="text-text-secondary text-[10px] font-medium">
                            {listing.composition}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] font-black uppercase italic tracking-tight">
                          {listing.quantity} {listing.unit === 'meters' ? 'м' : 'кг'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'border-none px-2 py-0.5 text-[9px] font-black uppercase',
                            getConditionColor(listing.condition)
                          )}
                        >
                          {getConditionLabel(listing.condition)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-[11px] font-black italic tracking-tighter">
                            {listing.pricePerUnit.toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="text-[9px] font-bold uppercase text-rose-500 line-through opacity-40">
                            {listing.originalPrice?.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="h-5 border-none bg-emerald-50 px-2 text-[8px] font-black uppercase text-emerald-600">
                          Published
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-muted h-8 w-8 rounded-lg hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border-subtle h-10 hover:bg-transparent">
                  <TableHead className="text-text-muted pl-8 text-[9px] font-black uppercase tracking-widest">
                    ID Сделки
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Покупатель
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Объем
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Сумма
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Дата
                  </TableHead>
                  <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    Статус
                  </TableHead>
                  <TableHead className="pr-8 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_CIRCULAR_TRANSACTIONS.map((tr) => (
                  <TableRow
                    key={tr.id}
                    className="border-border-subtle hover:bg-bg-surface2/80 group transition-colors"
                  >
                    <TableCell className="py-6 pl-8">
                      <span className="text-[11px] font-black uppercase italic tracking-tight">
                        {tr.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-bg-surface2 text-text-muted flex h-6 w-6 items-center justify-center rounded-full">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-tight">
                          {tr.buyerName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-black">{tr.quantity} м</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-black tabular-nums">
                        {tr.totalAmount.toLocaleString('ru-RU')} ₽
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                        {new Date(tr.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className="h-5 border-none bg-emerald-100 px-2 text-[8px] font-black uppercase text-emerald-600">
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <Button
                        variant="outline"
                        className="border-border-default h-8 rounded-lg text-[8px] font-black uppercase"
                      >
                        Документы
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ESG Impact Visualization */}
      <Card className="bg-text-primary group relative overflow-hidden rounded-xl border-none p-3 text-white shadow-xl">
        <div className="absolute right-0 top-0 p-4 opacity-[0.05] transition-transform group-hover:scale-110">
          <Leaf className="h-64 w-64 text-emerald-400" />
        </div>
        <div className="relative z-10 grid items-center gap-3 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-base font-black uppercase italic tracking-tighter">
              ESG Impact Dashboard
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-white/60">
              Продажа неиспользованного сырья не только приносит доход, но и снижает общие
              экологические риски вашей компании. Мы автоматически рассчитываем сэкономленные
              ресурсы для вашего отчета об устойчивом развитии.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-accent-primary mb-1 text-[8px] font-black uppercase">
                  Water Saved
                </p>
                <p className="text-base font-black">
                  1.2M <span className="ml-1 text-[10px] not-italic text-white/40">Liters</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-1 text-[8px] font-black uppercase text-emerald-400">
                  CO2 Reduction
                </p>
                <p className="text-base font-black">
                  4.5 <span className="ml-1 text-[10px] not-italic text-white/40">Tons</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            {/* Simplified graph placeholder */}
            <div className="flex h-32 items-end gap-3">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="group relative w-4 cursor-pointer rounded-t-sm bg-emerald-500/30"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="absolute bottom-0 w-full rounded-t-sm bg-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </CabinetPageContent>
  );
}
