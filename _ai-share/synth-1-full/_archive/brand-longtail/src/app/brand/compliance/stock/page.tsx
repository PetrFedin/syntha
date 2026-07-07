'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  QrCode,
  Package,
  RefreshCcw,
  Search,
  ArrowLeft,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Barcode,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';

export default function KizStockAccountingPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock Data for KIZ stock
  const stockItems = [
    {
      id: 'KIZ-9921-001',
      sku: 'TP-9921',
      name: 'Платье "Midnight"',
      size: 'M',
      status: 'In Stock',
      warehouse: 'Основной склад',
      date: '10.03.2026',
    },
    {
      id: 'KIZ-9921-002',
      sku: 'TP-9921',
      name: 'Платье "Midnight"',
      size: 'S',
      status: 'In Stock',
      warehouse: 'Основной склад',
      date: '10.03.2026',
    },
    {
      id: 'KIZ-8812-045',
      sku: 'TP-8812',
      name: 'Худи "Eco-Life"',
      size: 'L',
      status: 'Shipped',
      warehouse: 'Транзит',
      date: '08.03.2026',
    },
    {
      id: 'KIZ-7734-112',
      sku: 'TP-7734',
      name: 'Брюки "Cargo Pro"',
      size: 'XL',
      status: 'In Stock',
      warehouse: 'Склад Тверь',
      date: '05.03.2026',
    },
    {
      id: 'KIZ-1102-089',
      sku: 'TP-1102',
      name: 'Футболка "Base"',
      size: 'M',
      status: 'Returned',
      warehouse: 'Брак/Возврат',
      date: '01.03.2026',
    },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: 'Синхронизация завершена',
        description: 'Остатки КИЗ актуализированы с ГИС МТ.',
      });
    }, 2000);
  };

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-6 pb-16 duration-500 animate-in fade-in"
    >
      <RegistryPageHeader
        title="Складской учет КИЗ"
        leadPlain="Мониторинг и синхронизация маркированных остатков в реальном времени."
        eyebrow={
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link
              href={ROUTES.brand.compliance}
              className="hover:text-accent-primary flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="size-3" /> Compliance
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-foreground">Складской учет КИЗ</span>
            <AcronymWithTooltip abbr="KIZ" />
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <QrCode className="text-accent-primary size-7 shrink-0" aria-hidden />
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              className="border-border-default h-10 gap-2 rounded-xl bg-white text-[10px] font-bold uppercase tracking-widest shadow-sm"
            >
              <RefreshCcw
                className={cn('text-accent-primary size-4', isSyncing && 'animate-spin')}
              />
              Синхронизировать с ГИС МТ
            </Button>
            <Button className="bg-text-primary h-10 gap-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg hover:bg-black">
              <Download className="size-4" />
              Выгрузить отчет
            </Button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="group space-y-3 rounded-2xl border-none bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <Badge className="border-none bg-emerald-50 text-[8px] font-black uppercase text-emerald-600">
              Active
            </Badge>
          </div>
          <div>
            <p className="text-text-muted mb-1 text-[10px] font-bold uppercase leading-none tracking-widest">
              Всего на складе
            </p>
            <p className="text-text-primary text-2xl font-black leading-none tracking-tight">
              12,450
            </p>
          </div>
        </Card>
        <Card className="group space-y-3 rounded-2xl border-none bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="bg-accent-primary/10 text-accent-primary rounded-lg p-2">
              <Package className="h-5 w-5" />
            </div>
            <p className="text-accent-primary text-[8px] font-black uppercase leading-none tracking-widest">
              Shipping
            </p>
          </div>
          <div>
            <p className="text-text-muted mb-1 text-[10px] font-bold uppercase leading-none tracking-widest">
              В пути / Транзит
            </p>
            <p className="text-text-primary text-2xl font-black leading-none tracking-tight">
              3,150
            </p>
          </div>
        </Card>
        <Card className="group space-y-3 rounded-2xl border-none bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <Badge className="border-none bg-rose-50 text-[8px] font-black uppercase text-rose-600">
              Attention
            </Badge>
          </div>
          <div>
            <p className="text-text-muted mb-1 text-[10px] font-bold uppercase leading-none tracking-widest">
              Брак КИЗ / Ошибки
            </p>
            <p className="text-text-primary text-2xl font-black leading-none tracking-tight">12</p>
          </div>
        </Card>
        <Card className="bg-accent-primary hover:bg-accent-primary group relative cursor-pointer space-y-3 overflow-hidden rounded-2xl border-none p-5 text-white shadow-sm transition-all">
          <div className="absolute right-0 top-0 p-2 opacity-10 transition-transform group-hover:scale-110">
            <Barcode className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-white/10 p-2">
                <RefreshCcw className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-50" />
            </div>
            <p className="text-accent-primary/30 mb-1 text-[10px] font-bold uppercase leading-none tracking-widest">
              Последняя синхр.
            </p>
            <p className="text-sm font-black uppercase leading-none tracking-tight">
              Сегодня, 12:45
            </p>
          </div>
        </Card>
      </div>

      {/* Registry */}
      <Card className="overflow-hidden rounded-2xl border-none bg-white shadow-sm">
        <CardHeader className="border-border-subtle bg-bg-surface2/30 flex flex-col items-center justify-between gap-4 border-b px-6 py-6 md:flex-row">
          <div>
            <CardTitle className="text-text-primary text-sm font-black uppercase tracking-tight">
              Реестр КИЗ (Коды Маркировки)
            </CardTitle>
            <CardDescription className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
              Детальный список всех кодов в системе
            </CardDescription>
          </div>
          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="text-text-muted absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по КИЗ или SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-border-default focus:ring-accent-primary/20 h-10 w-full rounded-xl border bg-white pl-10 pr-4 text-xs font-medium shadow-inner outline-none transition-all focus:ring-2"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-border-default h-10 w-10 rounded-xl bg-white shadow-sm"
            >
              <Filter className="text-text-secondary h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-bg-surface2/80">
              <TableRow className="border-border-subtle h-12 hover:bg-transparent">
                <TableHead className="text-text-muted pl-6 text-[9px] font-black uppercase tracking-widest">
                  Код (<AcronymWithTooltip abbr="KIZ" />)
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Артикул / Модель
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Размер
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Статус ГИС МТ
                </TableHead>
                <TableHead className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                  Локация
                </TableHead>
                <TableHead className="text-text-muted pr-6 text-right text-[9px] font-black uppercase tracking-widest">
                  Дата опер.
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-bg-surface2 border-border-subtle h-14 transition-colors"
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <QrCode className="text-accent-primary h-3.5 w-3.5" />
                      <span className="text-text-primary font-mono text-[11px] font-bold tracking-tighter">
                        {item.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-text-primary text-[10px] font-black uppercase leading-none tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-text-muted text-[9px] font-bold uppercase leading-none tracking-widest">
                        {item.sku}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-border-default text-text-secondary h-5 rounded-md bg-white px-2 text-[9px] font-black"
                    >
                      {item.size}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'h-5 border-none px-2 text-[8px] font-black uppercase',
                        item.status === 'In Stock'
                          ? 'bg-emerald-50 text-emerald-600'
                          : item.status === 'Shipped'
                            ? 'bg-accent-primary/10 text-accent-primary'
                            : item.status === 'Returned'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-bg-surface2 text-text-secondary'
                      )}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-text-secondary text-[10px] font-bold uppercase tracking-tight">
                      {item.warehouse}
                    </p>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <p className="text-text-muted text-[10px] font-bold">{item.date}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Empty State if needed */}
          {stockItems.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
              <div className="bg-bg-surface2 flex h-16 w-16 items-center justify-center rounded-full">
                <Search className="text-text-muted h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-text-primary text-sm font-black uppercase">Ничего не найдено</p>
                <p className="text-text-muted max-w-xs text-xs">
                  Попробуйте изменить параметры поиска или фильтры.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
