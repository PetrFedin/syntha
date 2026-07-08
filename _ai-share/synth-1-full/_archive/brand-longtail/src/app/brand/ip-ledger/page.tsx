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
  ShieldCheck,
  Lock,
  Database,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Cpu,
  Fingerprint,
  History,
  Share2,
  Plus,
  Globe,
  Activity,
  AlertCircle,
  Hash,
  Box,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { IPRecord } from '@/lib/types/intellectual-property';
import { MOCK_IP_RECORDS, getIPStatusColor } from '@/lib/logic/blockchain-utils';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/**
 * Blockchain IP Ledger — Brand OS
 * Реестр интеллектуальной собственности на блокчейне.
 */

export default function IPLedgerPage() {
  const [records, setRecords] = useState<IPRecord[]>(MOCK_IP_RECORDS);
  const [search, setSearch] = useState('');

  const filteredRecords = records.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-6 duration-700 animate-in fade-in">
      <header className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Brand Asset Protection
          </div>
          <h1 className="text-sm font-bold uppercase tracking-tight text-slate-900">
            IP Blockchain Ledger
          </h1>
          <p className="text-[13px] font-medium text-slate-500">
            Защита авторских прав на дизайны и технологии через неизменяемый реестр.
          </p>
        </div>
        <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
          <Button
            variant="ghost"
            className="h-8 gap-2 rounded-lg px-4 text-[10px] font-bold uppercase text-slate-500 transition-all hover:bg-white hover:text-indigo-600"
          >
            <History className="h-3.5 w-3.5" /> History
          </Button>
          <Button className="h-8 gap-2 rounded-lg bg-slate-900 px-4 text-[10px] font-bold uppercase text-white shadow-md transition-all hover:bg-indigo-600">
            <Plus className="h-3.5 w-3.5" /> Register IP
          </Button>
        </div>
      </header>

      {/* Trust & Network Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Assets', value: records.length, icon: Database },
          {
            label: 'Blockchain',
            value: 'Live',
            sub: 'Ethereum',
            icon: Globe,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Disputes',
            value: '0',
            icon: AlertCircle,
            color: 'text-slate-400',
            bg: 'bg-slate-50',
          },
          {
            label: 'Verification',
            value: '100%',
            icon: CheckCircle2,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200"
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className={cn(
                  'rounded-lg border border-slate-50 p-2 shadow-sm',
                  stat.bg || 'bg-slate-50'
                )}
              >
                <stat.icon className={cn('h-4 w-4', stat.color || 'text-slate-400')} />
              </div>
              {stat.sub && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {stat.sub}
                </span>
              )}
            </div>
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>
            <p className={cn('text-base font-bold tracking-tight', stat.color || 'text-slate-900')}>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/30 p-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">
                IP Asset Registry
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Поиск по активам…"
                  className="h-8 w-48 rounded-lg border-slate-200 bg-white pl-9 text-[11px] shadow-sm focus:ring-1 focus:ring-indigo-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="h-10 border-none hover:bg-transparent">
                    <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Asset / ID
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Type
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Blockchain Hash
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </TableHead>
                    <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow
                      key={record.id}
                      className="group h-12 transition-colors hover:bg-slate-50/50"
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 shadow-sm transition-transform group-hover:scale-105">
                            <Fingerprint className="h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold leading-tight text-slate-900">
                              {record.title}
                            </p>
                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {record.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="h-5 border-slate-200 bg-slate-50 px-2 text-[9px] font-bold uppercase text-slate-500"
                        >
                          {record.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="group/hash flex cursor-pointer items-center gap-2">
                          <code className="block w-20 truncate font-mono text-[10px] text-slate-400">
                            {record.hash}
                          </code>
                          <ExternalLink className="h-3 w-3 text-slate-300 opacity-0 transition-opacity group-hover/hash:opacity-100" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-5 border-none px-2 text-[9px] font-bold uppercase shadow-sm',
                            getIPStatusColor(record.status)
                          )}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg border border-transparent text-slate-300 shadow-sm transition-all hover:border-slate-100 hover:bg-white hover:text-indigo-600"
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

        <div className="space-y-6 lg:col-span-4">
          <Card className="group relative overflow-hidden rounded-xl border border-indigo-500 bg-indigo-900 p-4 text-white shadow-xl">
            <div className="absolute -bottom-10 -right-10 opacity-10 transition-transform duration-700 group-hover:scale-110">
              <Lock className="h-40 w-40 text-indigo-400" />
            </div>
            <div className="relative z-10 mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner transition-all duration-300 group-hover:bg-white group-hover:text-indigo-600">
                <Hash className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold uppercase leading-none tracking-tight">
                Secure Mining
              </h3>
            </div>
            <div className="relative z-10 mb-8 space-y-4">
              <p className="text-[13px] font-medium leading-relaxed text-indigo-100">
                Synth-1 использует гибридный метод фиксации IP. Каждый техпакет может быть
                «замайнен» в блокчейн одним кликом.
              </p>
              <p className="text-[11px] font-medium leading-relaxed text-white/40">
                Это создает юридический прецедент владения дизайном для арбитражных споров.
              </p>
            </div>
            <Button className="relative z-10 h-10 w-full rounded-lg bg-white text-[10px] font-bold uppercase tracking-widest text-indigo-900 shadow-lg transition-all hover:bg-indigo-50">
              Run Global IP Scan
            </Button>
          </Card>

          <Card className="space-y-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 shadow-sm">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Network Intelligence
              </h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: 'Similar Designs',
                  value: '2',
                  icon: AlertCircle,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50',
                },
                {
                  label: 'Registry Sync',
                  value: 'Active',
                  icon: CheckCircle2,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-50',
                },
                {
                  label: 'Token Staking',
                  value: 'Inactive',
                  icon: Database,
                  color: 'text-slate-300',
                  bg: 'bg-slate-50',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn('h-4 w-4', item.color)} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </span>
                  </div>
                  <span className={cn('text-[10px] font-bold uppercase', item.color)}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-2">
              <Button
                variant="ghost"
                className="h-9 w-full rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:bg-indigo-50"
              >
                Open Legal Export
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
