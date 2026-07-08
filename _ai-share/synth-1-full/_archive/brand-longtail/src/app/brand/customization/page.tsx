'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import {
  Scissors,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Calendar,
  User,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  Activity,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  MOCK_CUSTOM_ORDERS,
  getStatusLabel,
  getStatusColor,
} from '@/lib/logic/customization-utils';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

export default function BrandCustomizationPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-6 pb-16 duration-700 animate-in fade-in"
    >
      <RegistryPageHeader
        title="Управление пошивом"
        leadPlain="Customization Hub P3: активных заказов 148, очередь 12 дней. Реестр спецзаказов и 3D-мерки."
        eyebrow={
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link href={ROUTES.brand.home} className="hover:text-accent-primary transition-colors">
              Бренд-офис
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Customization Hub</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge variant="outline" className="text-[9px]">
              Beta
            </Badge>
            <Scissors className="text-accent-primary size-6 shrink-0" aria-hidden />
            <Button
              className="bg-text-primary hover:bg-text-primary/90 h-11 rounded-xl px-6 text-[10px] font-bold uppercase tracking-widest text-white shadow-md"
              asChild
            >
              <Link href={ROUTES.brand.customizationPatterns}>Библиотека лекал</Link>
            </Button>
            <Button
              variant="outline"
              className="border-border-default h-11 rounded-xl px-6 text-[10px] font-bold uppercase tracking-widest"
            >
              Аналитика спроса
            </Button>
          </div>
        }
      />

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: 'Средний чек',
            value: '54 200 ₽',
            sub: '+12% vs RTW',
            icon: TrendingUp,
            color: 'text-accent-primary',
            bg: 'bg-accent-primary/10',
          },
          {
            label: 'Точность посадки',
            value: '98.4%',
            sub: 'AI Scanner',
            icon: Activity,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'В очереди',
            value: '42',
            sub: 'За 24 часа',
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Проблемные',
            value: '3',
            sub: 'Требуют правок',
            icon: AlertCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-border-subtle hover:border-accent-primary/30 group rounded-xl border bg-white p-4 shadow-sm transition-all"
          >
            <div className="mb-3 flex items-start justify-between">
              <div
                className={cn(
                  'border-border-subtle rounded-lg border p-2 shadow-sm transition-transform group-hover:scale-105',
                  stat.bg
                )}
              >
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <Badge
                variant="outline"
                className="border-border-subtle text-text-muted text-[9px] font-bold uppercase"
              >
                Live
              </Badge>
            </div>
            <div className="space-y-0.5">
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-text-primary text-base font-bold tracking-tight">
                  {stat.value}
                </h4>
                <p
                  className={cn(
                    'rounded px-1 text-[9px] font-bold uppercase',
                    stat.sub.includes('+')
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-text-muted bg-bg-surface2'
                  )}
                >
                  {stat.sub}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="border-border-subtle overflow-hidden rounded-xl border bg-white shadow-sm lg:col-span-3">
          <CardHeader className="border-border-subtle bg-bg-surface2/30 border-b p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <CardTitle className="text-text-primary text-sm font-bold uppercase tracking-wider">
                  Реестр спецзаказов
                </CardTitle>
                <CardDescription className="text-text-muted mt-0.5 text-[11px] font-medium">
                  Очередь производства на основе 3D-мерок
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="text-text-muted absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                  <Input
                    placeholder="Поиск клиента или ID..."
                    className="border-border-default focus:ring-accent-primary h-8 w-48 rounded-lg bg-white pl-9 text-[11px] font-medium shadow-sm focus:ring-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="border-border-default hover:bg-bg-surface2 h-8 w-8 rounded-lg border bg-white shadow-sm"
                >
                  <Filter className="text-text-secondary h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader className="bg-bg-surface2/80">
                <TableRow className="h-10 border-none hover:bg-transparent">
                  <TableHead className="text-text-muted pl-6 text-[10px] font-bold uppercase tracking-wider">
                    Заказ / Дата
                  </TableHead>
                  <TableHead className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                    Клиент
                  </TableHead>
                  <TableHead className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                    Модель
                  </TableHead>
                  <TableHead className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                    Конфигурация
                  </TableHead>
                  <TableHead className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                    Готовность
                  </TableHead>
                  <TableHead className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                    Сумма
                  </TableHead>
                  <TableHead className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                    Статус
                  </TableHead>
                  <TableHead className="text-text-muted h-10 pr-6 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_CUSTOM_ORDERS.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-border-subtle hover:bg-bg-surface2/80 group h-10 border-b transition-all"
                  >
                    <TableCell className="pl-6">
                      <div>
                        <p className="text-text-primary group-hover:text-accent-primary text-[12px] font-bold transition-colors">
                          {order.id}
                        </p>
                        <p className="text-text-muted mt-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="bg-bg-surface2 text-text-muted border-border-default flex h-7 w-7 items-center justify-center rounded-full border">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-text-primary text-[12px] font-bold">
                          {order.clientName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-accent-primary bg-accent-primary/10 rounded-md px-2 py-0.5 text-[12px] font-bold">
                        {order.productName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[180px] flex-wrap gap-1">
                        {order.selectedOptions.map((opt, i) => (
                          <Badge
                            key={i}
                            className="bg-bg-surface2 text-text-secondary border-border-subtle h-4.5 rounded px-1.5 text-[9px] font-bold shadow-sm"
                          >
                            {opt.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="text-text-muted h-3 w-3" />
                        <span className="text-text-secondary text-[11px] font-bold tabular-nums">
                          {new Date(order.estimatedDelivery).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-text-primary text-[12px] font-bold tabular-nums">
                        {order.totalPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'h-5 border-none px-2 text-[9px] font-bold uppercase shadow-sm',
                          getStatusColor(order.status)
                        )}
                      >
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="hover:border-border-subtle h-7 w-7 rounded-lg border border-transparent p-0 transition-all hover:bg-white hover:shadow-sm"
                          >
                            <MoreVertical className="text-text-muted h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-border-subtle w-48 rounded-xl bg-white p-1.5 shadow-xl"
                        >
                          <DropdownMenuItem className="text-text-secondary flex h-8 cursor-pointer items-center gap-2 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                            <Maximize2 className="h-3.5 w-3.5" /> Детали заказа
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-text-secondary flex h-8 cursor-pointer items-center gap-2 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                            <Scissors className="h-3.5 w-3.5" /> Генерировать лекала
                          </DropdownMenuItem>
                          <div className="bg-bg-surface2 my-1 h-px" />
                          <DropdownMenuItem className="flex h-8 cursor-pointer items-center gap-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-rose-600">
                            <AlertCircle className="h-3.5 w-3.5" /> Отменить заказ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="bg-bg-surface2/80 border-border-subtle flex justify-center border-t p-4">
              <Button
                variant="ghost"
                className="border-border-default text-text-secondary hover:text-text-primary h-8 rounded-lg border bg-white px-6 text-[10px] font-bold uppercase tracking-wider transition-all hover:shadow-sm"
              >
                Загрузить еще
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CabinetPageContent>
  );
}
