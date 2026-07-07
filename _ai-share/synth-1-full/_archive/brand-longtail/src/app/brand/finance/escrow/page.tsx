'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ShieldCheck,
  Lock,
  Unlock,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Building2,
  Factory,
  ArrowRight,
  TrendingUp,
  History,
  Info,
  Plus,
} from 'lucide-react';
import { EscrowAccount, EscrowMilestone } from '@/lib/types/finance';
import { cn } from '@/lib/utils';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';

/**
 * Escrow Milestone Engine UI
 * Поэтапная оплата производства через эскроу-счета (Safe Deals).
 */

export default function EscrowPage() {
  const [escrow, setEscrow] = useState<EscrowAccount>({
    id: 'ESC-2026-001',
    orderId: 'PO-8872',
    brandId: 'brand-synth',
    factoryId: 'factory-china-01',
    totalAmount: 125000,
    balance: 37500, // Funded but not released
    status: 'active',
    milestones: [
      {
        id: 'm1',
        title: 'Предоплата до запуска производства',
        amount: 37500,
        percentage: 30,
        status: 'released',
        releasedAt: '2026-02-15T12:00:00Z',
        conditions: ['Tech Pack Approval', 'BOM Verification'],
      },
      {
        id: 'm2',
        title: 'Bulk Start (Cutting)',
        amount: 37500,
        percentage: 30,
        status: 'funded',
        conditions: ['PPS (Pre-production Sample) Approval', 'Material Arrival'],
      },
      {
        id: 'm3',
        title: 'Quality Control (Inline)',
        amount: 25000,
        percentage: 20,
        status: 'pending',
        conditions: ['AQL 2.5 Inspection Passed', 'Production Photos'],
      },
      {
        id: 'm4',
        title: 'Final Shipment',
        amount: 25000,
        percentage: 20,
        status: 'pending',
        conditions: ['Bill of Lading Upload', 'Packing List Verification'],
      },
    ],
  });

  const getStatusBadge = (status: EscrowMilestone['status']) => {
    const config: Record<EscrowMilestone['status'], { label: string; color: string; icon: any }> = {
      pending: {
        label: 'Ожидает',
        color: 'bg-slate-50 text-slate-500 border-slate-100',
        icon: Clock,
      },
      funded: {
        label: 'Депонировано',
        color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        icon: Lock,
      },
      released: {
        label: 'Выплачено',
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        icon: CheckCircle2,
      },
      disputed: {
        label: 'Спор',
        color: 'bg-rose-50 text-rose-600 border-rose-100',
        icon: AlertTriangle,
      },
    };
    const item = config[status];
    return (
      <Badge
        variant="outline"
        className={cn('h-5 gap-1 px-2 text-[8px] font-black uppercase', item.color)}
      >
        <item.icon className="h-2.5 w-2.5" />
        {item.label}
      </Badge>
    );
  };

  const progress =
    (escrow.milestones.filter((m) => m.status === 'released').length / escrow.milestones.length) *
    100;

  return (
    <div className="container mx-auto space-y-10 px-4 py-4">
      <SectionInfoCard
        title="Escrow Milestone Engine"
        description="Безопасные сделки с фабриками: поэтапная оплата. Связи: Finance, Disputes, B2B Orders, Production."
        icon={ShieldCheck}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              Safe Deals
            </Badge>
            <Button variant="outline" size="sm" className="ml-1 h-7 text-[9px]" asChild>
              <Link href="/brand/finance">Finance</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/calendar?layers=finance,orders">Календарь</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/disputes">Disputes</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/b2b-orders">B2B Orders</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/production">Production</Link>
            </Button>
          </>
        }
      />
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
            <ShieldCheck className="h-3 w-3" />
            Fintech & Escrow
          </div>
          <h1 className="font-headline text-sm font-black tracking-tighter">
            Escrow Milestone Engine
          </h1>
          <p className="font-medium text-muted-foreground">
            Безопасные сделки с фабриками: оплата только после подтверждения этапов.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase"
          >
            <FileText className="h-4 w-4" /> Договор Escrow
          </Button>
          <Button className="h-11 gap-2 rounded-xl bg-slate-900 px-6 text-[10px] font-black uppercase text-white shadow-lg">
            <Plus className="h-4 w-4" /> Создать Escrow-счет
          </Button>
        </div>
      </header>

      {/* Main Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="relative overflow-hidden rounded-xl border-none bg-indigo-600 p-4 text-white shadow-xl shadow-indigo-100 md:col-span-2">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Всего по контракту
                </p>
                <p className="text-sm font-black tracking-tighter">
                  ${escrow.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <Lock className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Прогресс выплат</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          {/* Decoration */}
          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-white/5 blur-3xl" />
        </Card>

        <Card className="flex flex-col justify-between rounded-xl border-none bg-white p-4 shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              На Escrow-балансе
            </p>
            <p className="text-sm font-black text-indigo-600">${escrow.balance.toLocaleString()}</p>
          </div>
          <div className="border-t border-slate-50 pt-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
              <Unlock className="h-3 w-3" /> Ожидает выплаты: $25,000
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between rounded-xl border-none bg-slate-900 p-4 text-white shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Контрагент (Фабрика)
            </p>
            <p className="text-sm font-black tracking-tight">Dongguan Textile Group</p>
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 pt-4">
            <Badge className="border-none bg-emerald-500/20 text-[8px] font-black uppercase text-emerald-400">
              Verified Provider
            </Badge>
          </div>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden rounded-xl border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="border-b border-slate-50 p-4">
              <CardTitle className="text-base font-black uppercase tracking-tight">
                Milestone Roadmap
              </CardTitle>
              <CardDescription>
                Управление этапами оплаты и условиями разморозки средств.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="pl-8 text-[10px] font-black uppercase">
                      Этап / Цель
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Сумма (%)</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Статус</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-black uppercase">
                      Действие
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escrow.milestones.map((m, i) => (
                    <TableRow key={m.id} className="transition-colors hover:bg-slate-50/50">
                      <TableCell className="py-6 pl-8">
                        <p className="text-sm font-bold text-slate-900">{m.title}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {m.conditions.map((c, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-500"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-black text-slate-900">
                          ${m.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">
                          {m.percentage}%
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(m.status)}</TableCell>
                      <TableCell className="pr-8 text-right">
                        {m.status === 'pending' && (
                          <Button
                            size="sm"
                            className="h-8 rounded-lg bg-indigo-600 text-[9px] font-black uppercase text-white"
                          >
                            Депонировать
                          </Button>
                        )}
                        {m.status === 'funded' && (
                          <Button
                            size="sm"
                            className="h-8 rounded-lg bg-emerald-600 text-[9px] font-black uppercase text-white"
                          >
                            Разморозить
                          </Button>
                        )}
                        {m.status === 'released' && (
                          <div className="flex flex-col items-end">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <p className="mt-1 text-[8px] font-black uppercase text-slate-400">
                              {new Date(m.releasedAt!).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border-none p-4 shadow-xl shadow-slate-200/50">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                Arbitrage & Security
              </h3>
            </div>

            <p className="mb-6 text-xs font-medium leading-relaxed text-slate-500">
              В случае невыполнения условий этапа вы можете инициировать процедуру спора. Средства
              будут заморожены до решения арбитража Synth-1.
            </p>

            <Button
              variant="outline"
              className="h-11 w-full rounded-xl border-rose-100 text-[9px] font-black uppercase text-rose-600 hover:bg-rose-50"
            >
              Открыть диспут
            </Button>
          </Card>

          <Card className="rounded-xl border-none p-4 shadow-xl shadow-slate-200/50">
            <h3 className="mb-6 text-sm font-black uppercase tracking-tight">Recent Log</h3>
            <div className="space-y-4">
              {[
                {
                  msg: 'Funds Released: Milestone #1',
                  date: 'Feb 15, 2026',
                  icon: Unlock,
                  color: 'text-emerald-500',
                },
                {
                  msg: 'Account Created',
                  date: 'Feb 12, 2026',
                  icon: FileText,
                  color: 'text-slate-400',
                },
              ].map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50',
                      log.color
                    )}
                  >
                    <log.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{log.msg}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400">{log.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="mt-6 h-10 w-full rounded-xl text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-50"
            >
              Полный аудит-лог
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
