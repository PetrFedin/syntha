'use client';

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
  ShieldAlert,
  MessageSquare,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  History,
  Plus,
  Search,
  Info,
  ChevronRight,
  UserCircle,
  Building2,
  Filter,
  ArrowRight,
  Zap,
  BrainCircuit,
  Scale,
  DollarSign,
  Clock,
  MoreVertical,
  ExternalLink,
  MessageCircle,
  Gavel,
  Lock,
  Flag,
} from 'lucide-react';
import { Dispute, DisputeStatus, DisputeCategory, DisputeSeverity } from '@/lib/types/disputes';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/**
 * Dispute Resolution Hub — Admin OS (Arbitration)
 * Цифровой арбитраж для B2B-споров (брак, недовоз, задержка).
 */

export default function AdminDisputesPage() {
  const [activeDisputes, setActiveDisputes] = useState<Dispute[]>([
    {
      id: 'DISP-1',
      caseNumber: 'SYNTH-8821',
      title: 'Партия Q3-101: дефект подкладки (шёлк)',
      category: 'quality_issue',
      status: 'under_review',
      severity: 'high',
      claimantId: 'brand-luxury-silk',
      claimantName: 'ООО «Шёлк Премиум»',
      respondentId: 'factory-ivanovo-textile',
      respondentName: 'АО «Ивановский текстиль»',
      claimValue: 1150000,
      currency: 'RUB',
      description:
        'У 500 платьев партии Q3-101 подкладка из шёлка рвётся по швам; дефект подтверждён ОТК.',
      evidence: [],
      messages: [],
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-05T14:30:00Z',
    },
    {
      id: 'DISP-2',
      caseNumber: 'SYNTH-9122',
      title: 'Недопоставка 50 ед. оверсайз-пальто (шерсть)',
      category: 'shortage',
      status: 'mediation',
      severity: 'medium',
      claimantId: 'retailer-spb-store',
      claimantName: 'ООО «Ритейл-Подиум» (СПб)',
      respondentId: 'brand-severnaya-sherst',
      respondentName: 'ООО «Северная шерсть»',
      claimValue: 420000,
      currency: 'RUB',
      description: 'По упаковочному листу не досчитаны 50 единиц при приёмке на складе.',
      evidence: [],
      messages: [],
      createdAt: '2026-03-04T09:00:00Z',
      updatedAt: '2026-03-07T11:20:00Z',
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

  const categoryLabelRu = (c: string) => {
    const map: Record<string, string> = {
      quality_issue: 'Качество',
      shortage: 'Недопоставка',
      delay: 'Сроки',
      payment: 'Оплата',
      contract: 'Договор',
    };
    return map[c] ?? c.replace(/_/g, ' ');
  };

  const getSeverityBadge = (severity: DisputeSeverity) => {
    const config: Record<DisputeSeverity, { label: string; color: string }> = {
      low: { label: 'Низкая', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
      medium: { label: 'Средняя', color: 'bg-amber-50 text-amber-600 border-amber-100' },
      high: { label: 'Высокая', color: 'bg-rose-50 text-rose-600 border-rose-100' },
      critical: { label: 'Критич.', color: 'bg-rose-600 text-white border-none' },
    };
    const item = config[severity];
    return (
      <Badge
        variant="outline"
        className={cn('h-5 px-2 text-[8px] font-black uppercase', item.color)}
      >
        {item.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-4 duration-700 animate-in fade-in">
      <header className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-end">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <Gavel className="h-2.5 w-2.5" />
            <span>Центр арбитража Synth-1</span>
          </div>
          <h1 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900">
            Споры и арбитраж B2B
          </h1>
          <p className="px-0.5 text-[11px] font-medium text-slate-500">
            Рассмотрение претензий: качество, недопоставки, сроки. Валюта претензий — ₽.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:text-indigo-600"
          >
            <Filter className="mr-1.5 h-3 w-3" /> Фильтр
          </Button>
          <Button className="h-7 rounded-lg bg-slate-900 px-4 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-slate-800">
            <Zap className="mr-1.5 h-3 w-3" /> ИИ-разбор
          </Button>
        </div>
      </header>

      {/* KPI Stats — Normalized & Compact */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: 'Активные споры',
            value: activeDisputes.length,
            icon: ShieldAlert,
            color: 'text-slate-900',
            bg: 'bg-slate-50/50',
          },
          {
            label: 'Сумма претензий',
            value: `${activeDisputes.reduce((s, d) => s + (d.claimValue ?? 0), 0).toLocaleString('ru-RU')} ₽`,
            icon: DollarSign,
            color: 'text-rose-600',
            bg: 'bg-rose-50/50',
          },
          {
            label: 'На медиации',
            value: String(activeDisputes.filter((d) => d.status === 'mediation').length),
            icon: MessageCircle,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50/50',
          },
          {
            label: 'Ср. срок решения',
            value: '4,2 дн.',
            icon: Clock,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50/50',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-100"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase leading-none tracking-[0.15em] text-slate-400">
                {stat.label}
              </span>
              <div
                className={cn('rounded-lg border border-slate-200/50 p-1.5 shadow-inner', stat.bg)}
              >
                <stat.icon className={cn('h-3.5 w-3.5 transition-colors', stat.color)} />
              </div>
            </div>
            <p
              className={cn(
                'text-sm font-black tabular-nums leading-none tracking-tighter',
                stat.color
              )}
            >
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Card className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 p-3">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-black uppercase tracking-tight">
                  Активные дела
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Очередь рассмотрения
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
                <Input
                  placeholder="Поиск по № дела…"
                  className="h-8 w-48 rounded-lg border-slate-200 bg-white pl-9 text-[10px] font-bold uppercase"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-b border-slate-50 hover:bg-transparent">
                    <TableHead className="h-10 pl-6 text-[9px] font-black uppercase tracking-wider">
                      Дело
                    </TableHead>
                    <TableHead className="h-10 text-[9px] font-black uppercase tracking-wider">
                      Стороны
                    </TableHead>
                    <TableHead className="h-10 text-[9px] font-black uppercase tracking-wider">
                      Статус и важность
                    </TableHead>
                    <TableHead className="h-10 text-[9px] font-black uppercase tracking-wider">
                      Претензия
                    </TableHead>
                    <TableHead className="h-10 pr-6 text-right text-[9px] font-black uppercase tracking-wider">
                      Действие
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDisputes.map((dispute) => (
                    <TableRow
                      key={dispute.id}
                      className="group cursor-pointer border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/50"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter text-indigo-600">
                              {dispute.caseNumber}
                            </span>
                            <span className="max-w-[150px] truncate text-[11px] font-black uppercase text-slate-900">
                              {dispute.title}
                            </span>
                          </div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 opacity-70">
                            {categoryLabelRu(dispute.category)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50">
                              <Building2 className="h-2.5 w-2.5 text-emerald-600" />
                            </div>
                            <span className="max-w-[100px] truncate text-[10px] font-bold uppercase text-slate-700">
                              {dispute.claimantName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-md border border-rose-100 bg-rose-50">
                              <Building2 className="h-2.5 w-2.5 text-rose-600" />
                            </div>
                            <span className="max-w-[100px] truncate text-[10px] font-bold uppercase text-slate-700">
                              {dispute.respondentName}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          {getStatusBadge(dispute.status)}
                          <div className="block">{getSeverityBadge(dispute.severity)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-black tabular-nums text-slate-900">
                          {dispute.claimValue?.toLocaleString('ru-RU')} ₽
                        </p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                          {dispute.currency}
                        </p>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-slate-300 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="group rounded-2xl border border-slate-800 bg-slate-900 p-3 text-white shadow-lg transition-all hover:border-indigo-500/30">
            <div className="mb-5 flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner transition-transform group-hover:scale-105">
                <BrainCircuit className="w-4.5 h-4.5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight text-white">
                  ИИ: прогноз исхода
                </h3>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                  Вероятностная оценка
                </p>
              </div>
            </div>

            <div className="space-y-5 px-1">
              <div className="space-y-2.5 rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
                    Вероятность: истец
                  </span>
                  <span className="text-xs font-black tabular-nums text-indigo-400">72%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                    style={{ width: '72%' }}
                  />
                </div>
                <p className="mt-1 border-t border-white/5 pt-3 text-[9px] italic leading-relaxed text-white/30">
                  По истории дел о качестве партий вероятность удовлетворения истца выше при плотном
                  комплекте доказательств.
                </p>
              </div>

              <div className="space-y-2 px-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Scale className="h-3 w-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Рекомендация
                  </span>
                </div>
                <p className="text-[10px] font-medium leading-relaxed text-white/60">
                  Перевести на этап медиации: ответчик не предоставил производственные журналы в
                  срок 48 ч по регламенту.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="mt-6 h-9 w-full rounded-lg border-none bg-indigo-600 text-[9px] font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-indigo-700"
            >
              Открыть разбор дела
            </Button>
          </Card>

          <Card className="group space-y-5 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-indigo-100">
            <h3 className="px-1 text-xs font-black uppercase tracking-tight text-slate-900">
              Действия арбитра
            </h3>
            <div className="space-y-2 px-1">
              <Button
                variant="outline"
                size="sm"
                className="group/btn h-9 w-full justify-start gap-3 rounded-lg border-slate-200 px-4 text-[9px] font-black uppercase transition-all hover:bg-slate-50"
              >
                <Flag className="h-3.5 w-3.5 text-rose-500 transition-transform group-hover/btn:scale-110" />{' '}
                Пометить как критич.
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="group/btn h-9 w-full justify-start gap-3 rounded-lg border-slate-200 px-4 text-[9px] font-black uppercase transition-all hover:bg-slate-50"
              >
                <Scale className="h-3.5 w-3.5 text-indigo-500 transition-transform group-hover/btn:scale-110" />{' '}
                Назначить медиатора
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="group/btn h-9 w-full justify-start gap-3 rounded-lg border-slate-200 px-4 text-[9px] font-black uppercase transition-all hover:bg-slate-50"
              >
                <History className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover/btn:scale-110" />{' '}
                Прецеденты
              </Button>
            </div>
            <div className="mt-4 border-t border-slate-100 px-1 pt-4">
              <div className="flex items-center gap-2 px-1 text-rose-500">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Без ответственного: 4
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
