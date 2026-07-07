'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Trash2,
  ArrowRight,
  Filter,
  BarChart3,
  Bot,
  Brain,
  ShieldCheck,
  Zap,
  Target,
  History,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { mockAuctions } from '@/lib/auction-data';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAuctionLinks } from '@/lib/data/entity-links';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';

export default function BrandAuctionsPage() {
  const brandAuctions = mockAuctions.filter((a) => a.brandId === 'syntha');

  const priceForecasts = [
    { category: 'Пальто (Кашемир)', current: 4500, forecast: 4200, trend: 'down' },
    { category: 'Джинсы (Деним)', current: 1800, forecast: 1950, trend: 'up' },
    { category: 'Трикотаж', current: 2200, forecast: 2150, trend: 'stable' },
  ];

  const trustedPartners = [
    { name: 'Фабрика #1 (Москва)', score: 98, rating: 4.9, tags: ['Premium', 'Reliable'] },
    { name: 'Текстиль Плюс', score: 95, rating: 4.8, tags: ['Speed', 'Eco'] },
  ];

  return (
    <CabinetPageContent
      maxWidth="full"
      className="bg-bg-surface2/80 w-full space-y-10 pb-16 font-sans"
    >
      <RegistryPageHeader
        title="Управление закупками"
        leadPlain="Auction Manager PRO v2.0 — тендеры и закупки бренда на платформе."
        actions={
          <Button
            asChild
            className="text-text-muted border-border-default group/btn shadow-text-primary/10 inline-flex h-10 items-center justify-center gap-2 rounded-2xl border bg-white px-6 text-[10px] font-black uppercase tracking-widest transition-all duration-500 hover:border-black hover:bg-black hover:text-white hover:shadow-xl"
          >
            <Link href={ROUTES.brand.auctionsNew}>
              <PlusCircle className="h-4 w-4 transition-transform group-hover/btn:scale-110" />{' '}
              Создать новый тендер
            </Link>
          </Button>
        }
      />

      {/* Strategic Insights Widgets */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* AI Price Forecast */}
        <Card className="bg-text-primary relative overflow-hidden rounded-xl border-none p-4 text-white shadow-2xl">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Bot className="h-32 w-32 rotate-12" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-black uppercase leading-none tracking-widest">
                AI Price Forecast
              </h3>
            </div>
            <div className="space-y-4">
              {priceForecasts.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4"
                >
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/40">
                      {f.category}
                    </p>
                    <p className="text-sm font-bold">
                      {f.forecast.toLocaleString('ru-RU')} ₽{' '}
                      <span className="text-[10px] font-medium text-white/20">/ unit</span>
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'border-none px-2 text-[8px] font-black',
                      f.trend === 'down'
                        ? 'bg-green-500'
                        : f.trend === 'up'
                          ? 'bg-rose-500'
                          : 'bg-blue-500'
                    )}
                  >
                    {f.trend === 'down' ? '-7%' : f.trend === 'up' ? '+8%' : 'STABLE'}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-center text-[9px] font-bold uppercase italic tracking-widest text-white/30">
              Прогноз на основе 12,000 закрытых лотов
            </p>
          </div>
        </Card>

        {/* Trusted Partners */}
        <Card className="rounded-xl border-none bg-white p-4 shadow-2xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h3 className="text-text-primary text-sm font-black uppercase leading-none tracking-widest">
                  Top Rated Partners
                </h3>
              </div>
              <Button variant="ghost" size="icon" className="text-text-muted h-8 w-8 rounded-full">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {trustedPartners.map((p, i) => (
                <div
                  key={i}
                  className="hover:bg-bg-surface2 group flex cursor-pointer items-center gap-3 rounded-2xl p-2 transition-all"
                >
                  <div className="bg-bg-surface2 text-text-muted group-hover:bg-text-primary/90 flex h-12 w-12 items-center justify-center rounded-xl font-black transition-colors group-hover:text-white">
                    {p.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary text-xs font-black uppercase tracking-tight">
                      {p.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5 text-green-500" />
                        <span className="text-[9px] font-black uppercase text-green-600">
                          {p.score}% Reliability
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-border-subtle text-[8px] font-black uppercase tracking-widest"
                  >
                    {p.rating}★
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="bg-bg-surface2 text-text-primary hover:bg-bg-surface2 mt-2 h-12 w-full rounded-xl border-none text-[9px] font-black uppercase tracking-widest">
              Весь каталог производств
            </Button>
          </div>
        </Card>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 gap-3">
          <Card className="group flex items-center justify-between overflow-hidden rounded-xl border-none bg-white p-4 shadow-lg">
            <div>
              <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-[0.2em]">
                Active Tenders
              </p>
              <h3 className="text-text-primary text-base font-black tracking-tighter">
                {brandAuctions.length}
              </h3>
            </div>
            <div className="bg-accent-primary/10 flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
              <Zap className="text-accent-primary h-6 w-6" />
            </div>
          </Card>
          <Card className="group flex items-center justify-between overflow-hidden rounded-xl border-none bg-white p-4 shadow-lg">
            <div>
              <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-[0.2em]">
                Projected Savings
              </p>
              <h3 className="text-base font-black tracking-tighter text-green-500">14.2%</h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 transition-transform group-hover:scale-110">
              <Target className="h-6 w-6 text-white" />
            </div>
          </Card>
        </div>
      </div>

      {/* Main Auctions Table */}
      <Card className="overflow-hidden rounded-xl border-none bg-white shadow-2xl">
        <CardHeader className="border-border-subtle flex flex-row items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Filter className="text-text-muted h-4 w-4" />
            <CardTitle className="text-base font-black uppercase tracking-tight">
              Ваши активные запросы
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="text-text-muted absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                placeholder="Поиск по тендеру..."
                className="border-border-subtle h-10 w-64 rounded-xl pl-9 text-[10px] font-bold"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-bg-surface2/80">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-text-muted px-8 py-4 text-[10px] font-black uppercase tracking-widest">
                  Название / SKU
                </TableHead>
                <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                  Статус
                </TableHead>
                <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                  Заявки
                </TableHead>
                <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                  Target Price
                </TableHead>
                <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                  Best Bid
                </TableHead>
                <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                  Прогноз экономии
                </TableHead>
                <TableHead className="text-text-muted px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandAuctions.map((auc) => {
                const bestBid =
                  auc.bids.length > 0
                    ? auc.bids.reduce((prev, curr) => (prev.amount < curr.amount ? prev : curr))
                    : null;
                const targetPrice = auc.targetPrice ?? 0;
                const savings =
                  bestBid && targetPrice > 0
                    ? Math.round(((targetPrice - bestBid.amount) / targetPrice) * 100)
                    : 0;

                return (
                  <TableRow
                    key={auc.id}
                    className="border-border-subtle hover:bg-bg-surface2/30 border-b transition-colors"
                  >
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="border-border-subtle relative h-10 w-12 shrink-0 overflow-hidden rounded-xl border shadow-sm">
                          <Image
                            src={auc.image || ''}
                            alt={auc.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-text-primary font-bold uppercase tracking-tight">
                            {auc.title}
                          </p>
                          <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                            {auc.category}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-6">
                      <Badge
                        className={cn(
                          'border-none px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-sm',
                          auc.status === 'active'
                            ? 'animate-pulse bg-green-500 text-white'
                            : 'bg-border-subtle text-text-secondary'
                        )}
                      >
                        {auc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2">
                        <Users className="text-text-muted h-3.5 w-3.5" />
                        <span className="text-text-primary text-sm font-bold">
                          {auc.bids.length}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-muted py-6 text-sm font-bold">
                      {targetPrice > 0 ? `${targetPrice.toLocaleString('ru-RU')} ₽` : '—'}
                    </TableCell>
                    <TableCell className="py-6">
                      {bestBid ? (
                        <div className="flex flex-col">
                          <span className="text-text-primary text-sm font-black">
                            {bestBid.amount.toLocaleString('ru-RU')} ₽
                          </span>
                          <span className="text-text-muted mt-1 text-[8px] font-bold uppercase leading-none tracking-widest">
                            by {bestBid.bidderName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-muted text-xs font-bold uppercase tracking-widest">
                          Нет заявок
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-6">
                      {savings > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-black text-green-600">-{savings}%</span>
                          <Progress value={savings} className="bg-bg-surface2 h-1 w-12" />
                        </div>
                      ) : (
                        <span className="text-text-muted text-xs font-bold uppercase">...</span>
                      )}
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="hover:bg-bg-surface2 h-10 w-10 rounded-xl"
                        >
                          <Link href={`/auctions/${auc.id}`}>
                            <Eye className="text-text-muted h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-bg-surface2 h-10 w-10 rounded-xl"
                            >
                              <MoreHorizontal className="text-text-muted h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="border-border-subtle w-48 rounded-2xl p-2 shadow-2xl"
                          >
                            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest">
                              Продлить срок
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest">
                              Изменить ТЗ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-bg-surface2" />
                            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                              Отменить аукцион
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-bg-surface2 border-border-subtle flex items-center justify-between border-t p-4 px-8">
          <div className="flex items-center gap-2">
            <History className="text-text-muted h-4 w-4" />
            <span className="text-text-muted text-[9px] font-black uppercase italic tracking-widest">
              Последнее обновление системы: 5 минут назад
            </span>
          </div>
          <Button
            variant="ghost"
            className="text-text-secondary hover:text-text-primary text-[9px] font-black uppercase tracking-widest"
          >
            Показать завершенные тендеры
          </Button>
        </CardFooter>
      </Card>

      <RelatedModulesBlock links={getAuctionLinks()} className="mt-6" />
    </CabinetPageContent>
  );
}
