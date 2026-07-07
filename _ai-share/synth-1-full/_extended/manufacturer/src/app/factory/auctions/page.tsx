'use client';

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
  Gavel,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Search,
  Zap,
  Filter,
  Eye,
  Handshake,
  LayoutGrid,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockAuctions } from '@/lib/auction-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { SlotAuction } from '@/components/factory/slot-auction';

export default function FactoryAuctionsPage() {
  const factoryId = 'fact-1';

  // Find auctions where this factory has participated
  const myBids = mockAuctions.flatMap((auc) =>
    auc.bids.filter((bid) => bid.bidderId === factoryId).map((bid) => ({ ...bid, auction: auc }))
  );

  return (
    <div className="min-h-screen space-y-10 bg-slate-50/50 p-4 font-sans md:p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">
              Bid Hub v1.0
            </h2>
          </div>
          <h1 className="text-sm font-black uppercase tracking-tighter text-slate-900">
            Мои ставки и Тендеры
          </h1>
        </div>
        <Button
          asChild
          className="group/btn hover:button-glimmer hover:button-professional flex h-10 min-w-[200px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-slate-900/10 transition-all duration-500 hover:border-black hover:bg-black hover:text-white hover:shadow-xl"
        >
          <Link href="/search?category=tenders">
            <Search className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" /> Найти
            новый тендер
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="rounded-xl border-none bg-white p-4 shadow-xl">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Всего участий
          </p>
          <h3 className="text-base font-black tracking-tighter text-slate-900">{myBids.length}</h3>
        </Card>
        <Card className="rounded-xl border-none bg-white p-4 shadow-xl">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Активно лидируем
          </p>
          <h3 className="text-base font-black tracking-tighter text-green-500">
            {myBids.filter((b) => b.status === 'leading').length}
          </h3>
        </Card>
        <Card className="rounded-xl border-none bg-white p-4 shadow-xl">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Вас перебили
          </p>
          <h3 className="text-base font-black tracking-tighter text-rose-500">
            {myBids.filter((b) => b.status === 'outbid').length}
          </h3>
        </Card>
        <Card className="rounded-xl border-none bg-white p-4 shadow-xl">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Принято офферов
          </p>
          <h3 className="text-base font-black tracking-tighter text-blue-600">12</h3>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-xl border-none bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-4">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-4 w-4 text-slate-400" />
            <CardTitle className="text-base font-black uppercase tracking-tight">
              Активность в тендерах
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Поиск по тендеру..."
                className="h-10 w-64 rounded-xl border-slate-100 pl-9 text-[10px] font-bold"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Аукцион / Заказчик
                </TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Ваша ставка
                </TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Статус ставки
                </TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  AI Score
                </TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Окончание
                </TableHead>
                <TableHead className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myBids.map((bid) => (
                <TableRow
                  key={bid.id}
                  className="border-b border-slate-50 transition-colors hover:bg-slate-50/30"
                >
                  <TableCell className="px-8 py-6">
                    <div>
                      <p className="font-bold uppercase tracking-tight text-slate-900">
                        {bid.auction.title}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {bid.auction.brandName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-sm font-black text-slate-900">
                    {bid.amount.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge
                      className={cn(
                        'border-none px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-sm',
                        bid.status === 'leading'
                          ? 'bg-green-500 text-white'
                          : bid.status === 'outbid'
                            ? 'bg-rose-500 text-white'
                            : 'bg-blue-500 text-white'
                      )}
                    >
                      {bid.status === 'leading'
                        ? 'Лидируете'
                        : bid.status === 'outbid'
                          ? 'Перебито'
                          : bid.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6">
                    {bid.aiAnalysis && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-900">
                          {bid.aiAnalysis.reliabilityScore}%
                        </span>
                        <span
                          className={cn(
                            'text-[7px] font-black uppercase tracking-widest',
                            bid.aiAnalysis.riskLevel === 'low' ? 'text-green-500' : 'text-amber-500'
                          )}
                        >
                          Risk: {bid.aiAnalysis.riskLevel}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs font-bold uppercase">
                        {new Date(bid.auction.endDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-slate-100"
                      >
                        <Link href={`/auctions/${bid.auctionId}`}>
                          <Eye className="h-4 w-4 text-slate-400" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-xl border-slate-100 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-slate-900 hover:text-white"
                      >
                        Обновить ставку
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SlotAuction />

      <Card className="relative overflow-hidden rounded-xl border-none bg-blue-600 p-3 text-white shadow-2xl">
        <div className="absolute right-0 top-0 p-4 opacity-10">
          <Handshake className="h-48 w-48 rotate-12" />
        </div>
        <div className="relative z-10 grid grid-cols-1 items-center gap-3 lg:grid-cols-2">
          <div>
            <Badge className="mb-4 border-none bg-white/20 px-3 text-[10px] font-black uppercase tracking-widest text-white">
              Growth Opportunity
            </Badge>
            <h4 className="mb-6 text-base font-black uppercase leading-tight tracking-tighter">
              Получите статус 'Priority Factory'
            </h4>
            <p className="mb-8 max-w-md text-sm font-bold leading-relaxed text-white/80">
              Ваш текущий AI Score надежности: 92%. Выполните еще 2 заказа в срок, чтобы попасть в
              топ-рейтинг Syntha и получать эксклюзивные приглашения в закрытые тендеры.
            </p>
            <Button className="h-10 rounded-2xl border-none bg-white px-8 text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-xl transition-all hover:bg-slate-50">
              Узнать условия
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/60">
                Наш рейтинг
              </p>
              <p className="text-sm font-black">#4 в Москве</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/60">
                Win Rate
              </p>
              <p className="text-sm font-black">24%</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
