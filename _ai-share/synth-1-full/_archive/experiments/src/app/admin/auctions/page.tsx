'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import * as React from 'react';
import {
  Gavel,
  Users,
  TrendingUp,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Bot,
  ArrowUpRight,
  ShieldAlert,
  Archive,
  Factory,
  Box,
  Shirt,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminAuctionsPage() {
  const [filter, setFilter] = React.useState<'all' | 'production' | 'materials' | 'collaboration'>(
    'all'
  );
  const [search, setSearch] = React.useState('');

  const filteredAuctions = mockAuctions.filter((auc) => {
    const matchesSearch =
      auc.title.toLowerCase().includes(search.toLowerCase()) ||
      auc.brandName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || auc.type === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      label: 'Всего аукционов',
      value: '1,240',
      icon: Gavel,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Активные торги',
      value: '48',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Общий GMV',
      value: '42.5M ₽',
      icon: BarChart3,
      color: 'text-accent-primary',
      bg: 'bg-accent-primary/10',
    },
    {
      label: 'AI Оптимизация',
      value: '14.2%',
      icon: Bot,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <CabinetPageContent maxWidth="full" className="space-y-4">
      {/* Admin Stats Row */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-3xl border-none shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-text-muted mb-1 text-[10px] font-black uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-text-primary text-sm font-black tracking-tighter">
                  {stat.value}
                </p>
              </div>
              <div
                className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', stat.bg)}
              >
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-xl border-none bg-white shadow-xl">
        <CardHeader className="border-border-subtle space-y-6 border-b p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-tight">
                Глобальный мониторинг аукционов
              </CardTitle>
              <p className="text-text-muted mt-1 text-sm font-medium">
                Управление всеми B2B-запросами на платформе
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                <Archive className="mr-2 h-4 w-4" /> Архив
              </Button>
              <Button className="bg-text-primary rounded-xl text-[10px] font-black uppercase tracking-widest text-white">
                Экспорт отчета
              </Button>
            </div>
          </div>

          <div className="bg-bg-surface2 flex flex-col items-center justify-between gap-3 rounded-2xl p-4 md:flex-row">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {(['all', 'production', 'materials', 'collaboration'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    'shrink-0 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all',
                    filter === t
                      ? 'text-text-primary bg-white shadow-sm'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {t === 'all'
                    ? 'Все лоты'
                    : t === 'production'
                      ? 'Пошив/Кройка'
                      : t === 'materials'
                        ? 'Сырье/Фурнитура'
                        : 'Коллаборации'}
                </button>
              ))}
            </div>
            <div className="group relative w-full md:w-80">
              <Search className="text-text-muted absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Поиск по бренду или названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="focus:ring-text-primary h-11 rounded-xl border-white bg-white pl-12 text-[10px] font-bold uppercase tracking-widest"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-bg-surface2/80">
              <TableRow className="border-none">
                <TableHead className="text-text-muted px-8 py-5 text-[10px] font-black uppercase tracking-widest">
                  Тип / Категория
                </TableHead>
                <TableHead className="text-text-muted py-5 text-[10px] font-black uppercase tracking-widest">
                  Бренд / Заказчик
                </TableHead>
                <TableHead className="text-text-muted py-5 text-[10px] font-black uppercase tracking-widest">
                  Название лота
                </TableHead>
                <TableHead className="text-text-muted py-5 text-center text-[10px] font-black uppercase tracking-widest">
                  Ставок
                </TableHead>
                <TableHead className="text-text-muted py-5 text-[10px] font-black uppercase tracking-widest">
                  Лимит цены
                </TableHead>
                <TableHead className="text-text-muted py-5 text-[10px] font-black uppercase tracking-widest">
                  Статус системы
                </TableHead>
                <TableHead className="text-text-muted px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest">
                  Контроль
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuctions.map((auc) => (
                <TableRow
                  key={auc.id}
                  className="border-border-subtle hover:bg-bg-surface2/30 border-b transition-colors"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl shadow-sm',
                          auc.type === 'production'
                            ? 'bg-blue-50'
                            : auc.type === 'materials'
                              ? 'bg-emerald-50'
                              : 'bg-accent-primary/10'
                        )}
                      >
                        {auc.type === 'production' ? (
                          <Scissors className="h-5 w-5 text-blue-600" />
                        ) : auc.type === 'materials' ? (
                          <Box className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Sparkles className="text-accent-primary h-5 w-5" />
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="border-border-subtle text-[8px] font-black uppercase"
                      >
                        {auc.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex flex-col">
                      <span className="text-text-primary text-xs font-bold uppercase">
                        {auc.brandName}
                      </span>
                      <span className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                        ID: {auc.brandId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs py-6">
                    <p className="text-text-primary line-clamp-1 text-xs font-bold">{auc.title}</p>
                    <p className="text-text-muted line-clamp-1 text-[9px] font-medium italic">
                      {auc.category}
                    </p>
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <div className="bg-bg-surface2 text-text-primary inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-black">
                      {auc.bids.length}
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <span className="text-text-primary text-xs font-bold">
                      {auc.targetPrice ? `${auc.targetPrice.toLocaleString('ru-RU')} ₽` : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          auc.status === 'active'
                            ? 'animate-pulse bg-green-500'
                            : 'bg-border-default'
                        )}
                      />
                      <span className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                        {auc.status}
                      </span>
                    </div>
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
                          className="border-border-subtle w-56 rounded-2xl p-2 shadow-2xl"
                        >
                          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                            <ShieldAlert className="h-4 w-4 text-rose-500" /> Проверить заявки
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="h-4 w-4 text-green-500" /> Верифицировать лот
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-bg-surface2" />
                          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500">
                            <AlertCircle className="h-4 w-4" /> Приостановить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-bg-surface2/80 border-border-subtle flex items-center justify-between border-t p-4">
          <p className="text-text-muted text-[10px] font-black uppercase italic tracking-widest">
            Система управления торгами v4.2.0-stable
          </p>
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-[10px] font-bold uppercase">
              Показать: 20 из 1240
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black',
                    p === 1
                      ? 'bg-text-primary text-white'
                      : 'text-text-secondary border-border-subtle border bg-white'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </CabinetPageContent>
  );
}
