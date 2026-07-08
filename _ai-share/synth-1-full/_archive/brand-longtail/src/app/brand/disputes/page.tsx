'use client';

import React, { useState } from 'react';

/** Формат суммы для РФ (без $). */
function formatClaimValue(value: number | undefined): string {
  if (value == null) return '—';
  return value.toLocaleString('ru-RU');
}
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
  ShieldAlert,
  Plus,
  Search,
  Info,
  ChevronRight,
  Building2,
  Filter,
  ArrowRight,
  Zap,
  Gavel,
  DollarSign,
  Clock,
  MoreVertical,
  ExternalLink,
  MessageCircle,
  Package,
  Factory,
  CheckCircle2,
  AlertTriangle,
  History,
  Scale,
  FileCheck,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Dispute, DisputeStatus, DisputeCategory, DisputeSeverity } from '@/lib/types/disputes';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { getArbitrationLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';

/**
 * Dispute Resolution Hub — Brand OS
 * Управление спорами с фабриками и ритейлерами.
 */

export default function BrandDisputesPage() {
  const [activeDisputes, setActiveDisputes] = useState<Dispute[]>([
    {
      id: 'DISP-1',
      caseNumber: 'SYNTH-8821',
      title: 'Batch Q3-101: Quality Defects in Silk Lining',
      category: 'quality_issue',
      status: 'under_review',
      severity: 'high',
      claimantId: 'brand-luxury-silk',
      claimantName: 'Luxury Silk Brand',
      respondentId: 'factory-ivanovo-textile',
      respondentName: 'АО «Ивановский текстиль»',
      claimValue: 1150000,
      currency: 'RUB',
      description:
        'The internal silk lining of 500 dresses from Batch Q3-101 shows significant tearing at the seams.',
      evidence: [],
      messages: [],
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-05T14:30:00Z',
    },
  ]);

  const getStatusBadge = (status: DisputeStatus) => {
    const config: Record<DisputeStatus, { label: string; color: string; icon: any }> = {
      draft: {
        label: 'Черновик',
        color: 'bg-slate-50 text-slate-400 border-slate-100',
        icon: Info,
      },
      filed: {
        label: 'Подано',
        color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        icon: Plus,
      },
      under_review: {
        label: 'На проверке',
        color: 'bg-amber-50 text-amber-600 border-amber-100',
        icon: Clock,
      },
      evidence_required: {
        label: 'Нужны док-ва',
        color: 'bg-rose-50 text-rose-600 border-rose-100',
        icon: FileCheck,
      },
      mediation: {
        label: 'Медиация',
        color: 'bg-purple-50 text-purple-600 border-purple-100',
        icon: MessageCircle,
      },
      resolved: {
        label: 'Решено',
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        icon: CheckCircle2,
      },
      closed: { label: 'Закрыто', color: 'bg-slate-900 text-white border-none', icon: Lock },
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

  return (
    <div className="container mx-auto space-y-10 px-4 py-4">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-600">
            <ShieldAlert className="h-3.5 w-3.5" />
            Dispute Resolution
          </div>
          <h1 className="font-headline text-sm font-black uppercase tracking-tighter">
            Dispute Hub
          </h1>
          <p className="font-medium text-muted-foreground">
            Центр управления B2B-претензиями и арбитражем.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase"
          >
            <History className="h-4 w-4" /> История споров
          </Button>
          <Button
            variant="outline"
            asChild
            className="h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase"
          >
            <Link href="/brand/finance/escrow">Escrow</Link>
          </Button>
          <Button className="h-11 gap-2 rounded-xl bg-rose-600 px-6 text-[10px] font-black uppercase text-white shadow-lg shadow-rose-200 hover:bg-rose-700">
            <Plus className="h-4 w-4" /> Подать новую претензию
          </Button>
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden rounded-xl border-none bg-white shadow-xl shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-4">
              <div>
                <CardTitle className="text-base font-black uppercase tracking-tight text-slate-900">
                  Ваши активные споры
                </CardTitle>
                <CardDescription>Статус претензий к фабрикам и партнерам.</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input
                  placeholder="Поиск: номер кейса / фабрика"
                  className="h-10 w-64 rounded-xl border-slate-100 pl-9 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="pl-8 text-[10px] font-black uppercase">
                      Case Info
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Respondent</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Claim Value</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-black uppercase">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDisputes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center">
                        <div className="space-y-4">
                          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-100" />
                          <p className="text-sm font-bold uppercase italic tracking-widest text-slate-400">
                            Нет активных споров
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeDisputes.map((dispute) => (
                      <TableRow
                        key={dispute.id}
                        className="group cursor-pointer transition-colors hover:bg-slate-50/50"
                      >
                        <TableCell className="py-6 pl-8">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-black text-rose-600">
                                {dispute.caseNumber}
                              </span>
                              <span className="text-xs font-black text-slate-900">
                                {dispute.title}
                              </span>
                            </div>
                            <p className="text-[9px] font-bold uppercase text-slate-400">
                              {dispute.category.replace('_', ' ')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100">
                              <Factory className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              {dispute.respondentName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                        <TableCell>
                          <p className="text-sm font-black text-slate-900">
                            {formatClaimValue(dispute.claimValue)} ₽
                          </p>
                          <p className="text-[9px] font-bold uppercase text-slate-400">
                            {dispute.currency}
                          </p>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl text-slate-300 transition-all hover:text-rose-600 group-hover:bg-rose-50"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="relative overflow-hidden rounded-xl border-none bg-slate-900 p-4 text-white shadow-xl shadow-slate-200/50">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Scale className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight">How Arbitration works</h3>
            </div>

            <div className="mb-4 space-y-2">
              <p className="text-[9px] font-black uppercase text-slate-400">Workflow статусов</p>
              <div className="flex flex-wrap gap-1">
                {['Черновик', 'Подано', 'На проверке', 'Медиация', 'Решено'].map((s, i) => (
                  <span
                    key={s}
                    className="rounded bg-white/5 px-2 py-1 text-[8px] font-bold text-white/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                'Smart Escrow: Средства заморожены до решения арбитража.',
                'AI Analysis: Synth-1 автоматически оценивает доказательства.',
                'Final Decision: Решение выносится в течение 72 часов.',
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-xs font-medium leading-relaxed text-white/70">{text}</p>
                </div>
              ))}
            </div>
            <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-indigo-500/10 blur-2xl" />
          </Card>

          <Card className="rounded-xl border border-none border-slate-50 bg-white p-4 shadow-xl shadow-slate-200/50">
            <h3 className="mb-6 text-sm font-black uppercase tracking-tight text-slate-900">
              Dispute Statistics
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Win Rate', value: '88%', color: 'text-emerald-500' },
                { label: 'Total Recovered', value: '2 850 000 ₽', color: 'text-slate-900' },
                { label: 'Avg Claim Time', value: '5 дней', color: 'text-indigo-600' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-end justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                >
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    {stat.label}
                  </span>
                  <span className={cn('text-base font-black', stat.color)}>{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <RelatedModulesBlock links={getArbitrationLinks()} className="mt-6" />
    </div>
  );
}
