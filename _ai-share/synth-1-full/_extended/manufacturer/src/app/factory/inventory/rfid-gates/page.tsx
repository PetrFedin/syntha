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
  Scan,
  Box,
  Zap,
  Wifi,
  WifiOff,
  Search,
  Filter,
  ArrowRight,
  History,
  Settings2,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Cpu,
  ShieldCheck,
  Anchor,
  ArrowUpRight,
  Terminal,
  Database,
} from 'lucide-react';
import { WarehouseGate, PalletScan } from '@/lib/types/warehouse';
import {
  MOCK_GATES,
  MOCK_SCANS,
  getScanStatusColor,
  getGateStatusColor,
} from '@/lib/logic/rfid-utils';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/**
 * RFID Warehouse Gates — Factory/Warehouse Profile
 * Система для мгновенной приемки паллет через RFID-ворота.
 */

export default function RFIDGatesPage() {
  const [gates, setGates] = useState<WarehouseGate[]>(MOCK_GATES);
  const [scans, setScans] = useState<PalletScan[]>(MOCK_SCANS);

  return (
    <div className="container mx-auto space-y-10 px-4 py-4 pb-24">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
            <Scan className="h-3.5 w-3.5" />
            Industrial Automation
          </div>
          <h1 className="font-headline text-sm font-black uppercase tracking-tighter">
            RFID Warehouse Gates
          </h1>
          <p className="font-medium text-muted-foreground">
            Мгновенное сканирование целых паллет при приемке и отгрузке без вскрытия коробок.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase"
          >
            <Settings2 className="h-4 w-4" /> Gates Config
          </Button>
          <Button className="h-11 gap-2 rounded-xl bg-emerald-600 px-6 text-[10px] font-black uppercase text-white shadow-lg shadow-emerald-200">
            <Zap className="h-4 w-4" /> Start Batch Scan
          </Button>
        </div>
      </header>

      {/* Gates Monitor */}
      <div className="grid gap-3 md:grid-cols-4">
        {gates.map((gate) => (
          <Card
            key={gate.id}
            className="group rounded-3xl border-none bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={cn('h-2.5 w-2.5 rounded-full', getGateStatusColor(gate.status))} />
              <Badge variant="outline" className="border-slate-100 text-[8px] font-black uppercase">
                {gate.id}
              </Badge>
            </div>
            <h3 className="mb-2 text-sm font-black uppercase tracking-tight text-slate-900">
              {gate.name}
            </h3>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <History className="h-3 w-3" />{' '}
                {new Date(gate.lastActivity).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="flex items-center gap-1 text-indigo-500">
                <Scan className="h-3 w-3" /> {gate.scanCount24h} / 24h
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="overflow-hidden rounded-xl border-none bg-white shadow-xl shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-4">
              <CardTitle className="text-base font-black uppercase tracking-tight">
                Recent Scans
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input
                  placeholder="Поиск по ID сканирования или воротам…"
                  className="h-10 w-64 rounded-xl border-slate-100 pl-9 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="pl-8 text-[10px] font-black uppercase">
                      Scan ID / Time
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Gate</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase">
                      Qty (Actual/Expected)
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Result</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-black uppercase">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scans.map((scan) => (
                    <TableRow
                      key={scan.id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <TableCell className="py-6 pl-8">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-900">{scan.id}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            {new Date(scan.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-50 text-[8px] font-black uppercase"
                        >
                          {scan.gateId}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm font-black',
                              scan.itemCount === scan.expectedItemCount
                                ? 'text-slate-900'
                                : 'text-rose-500'
                            )}
                          >
                            {scan.itemCount}
                          </span>
                          <span className="text-xs text-slate-300">/</span>
                          <span className="text-xs font-bold text-slate-400">
                            {scan.expectedItemCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-5 px-2 text-[8px] font-black uppercase',
                            getScanStatusColor(scan.status)
                          )}
                        >
                          {scan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-slate-300 hover:text-indigo-600"
                        >
                          <ArrowRight className="h-4 w-4" />
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
          <Card className="group relative overflow-hidden rounded-xl border-none bg-slate-900 p-4 text-white shadow-xl shadow-slate-200/50">
            <div className="absolute -bottom-10 -right-10 opacity-10 transition-transform group-hover:scale-110">
              <Maximize2 className="h-40 w-40 text-indigo-400" />
            </div>
            <div className="relative z-10 mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Cpu className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-black uppercase italic tracking-tight">Scan Tech OS</h3>
            </div>
            <div className="relative z-10 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-white/40">
                    Throughput (Units/min)
                  </span>
                  <ArrowUpRight className="h-3 w-3 text-indigo-400" />
                </div>
                <p className="text-sm font-black">
                  12,500 <span className="text-[10px] not-italic text-white/40">U/M</span>
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-white/60">
                    Inventory Precision
                  </span>
                  <span className="text-sm font-black text-emerald-400">99.98%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '99.98%' }} />
                </div>
              </div>
            </div>
            <p className="relative z-10 mt-8 text-[10px] font-medium italic leading-relaxed text-white/40">
              RFID-ворота мгновенно считывают сотни меток в секунду, сопоставляя их с заказом (PO) и
              автоматически обновляя статус стока в **Integration Hub**.
            </p>
          </Card>

          <Card className="space-y-6 rounded-xl border border-none border-slate-50 bg-white p-4 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                  System Logs
                </h3>
              </div>
              <Badge className="border-none bg-emerald-50 text-[8px] font-black uppercase text-emerald-600">
                Live Sync
              </Badge>
            </div>

            <div className="max-h-40 space-y-4 overflow-hidden font-mono text-[9px] text-slate-400">
              <p className="border-l-2 border-indigo-500 pl-3">
                [09:45:10] SCAN-10025: Batch verified (300 units)
              </p>
              <p className="border-l-2 border-rose-500 pl-3">
                [09:29:55] SCAN-10024: Mismatch detected (2 units missing)
              </p>
              <p className="border-l-2 border-indigo-500 pl-3">
                [08:14:22] SCAN-10023: Batch verified (450 units)
              </p>
              <p className="border-l-2 border-slate-200 pl-3">
                [07:00:01] System boot successful. All gates online.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl border-slate-100 text-[10px] font-black uppercase hover:bg-slate-50"
            >
              Open Control Terminal
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
