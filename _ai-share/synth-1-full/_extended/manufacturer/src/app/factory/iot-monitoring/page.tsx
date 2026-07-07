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
  Cpu,
  Activity,
  Zap,
  Settings2,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Gauge,
  Thermometer,
  History,
  MoreVertical,
  Factory,
} from 'lucide-react';
import { MachineKPI, ProductionLine } from '@/lib/types/production-iot';
import { MOCK_LINES, MOCK_MACHINES, getMachineStatusColor } from '@/lib/logic/production-iot-utils';
import { cn } from '@/lib/utils';

/**
 * IoT Machine Monitoring — Factory Dashboard
 * Глобальный мониторинг КПД и состояния оборудования.
 */

export default function MachineMonitoringPage() {
  const [lines] = useState<ProductionLine[]>(MOCK_LINES);
  const [machines] = useState<MachineKPI[]>(MOCK_MACHINES);

  return (
    <>
      <CabinetPageContent maxWidth="6xl" className="space-y-6 duration-700 animate-in fade-in">
        <header className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              <Cpu className="h-3.5 w-3.5" />
              Industry 4.0 Core
            </div>
            <h1 className="text-sm font-bold uppercase tracking-tight text-slate-900">
              Machine Monitoring
            </h1>
            <p className="text-[13px] font-medium text-slate-500">
              Мониторинг КПД, температуры и выработки оборудования в реальном времени.
            </p>
          </div>
          <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
            <Button
              variant="ghost"
              className="h-8 gap-2 rounded-lg px-4 text-[10px] font-bold uppercase text-slate-500 transition-all hover:bg-white"
            >
              <History className="h-3.5 w-3.5" /> Maintenance
            </Button>
            <Button className="h-8 gap-2 rounded-lg bg-slate-900 px-4 text-[10px] font-bold uppercase text-white shadow-md transition-all hover:bg-indigo-600">
              <RefreshCcw className="h-3.5 w-3.5" /> Hard Reset
            </Button>
          </div>
        </header>

        {/* Global OEE (Overall Equipment Effectiveness) */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: 'Factory OEE',
              value: '88.4%',
              icon: Gauge,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
            },
            {
              label: 'Active Machines',
              value: '42 / 45',
              icon: Factory,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Energy Load',
              value: '340 kW/h',
              icon: Zap,
              color: 'text-amber-500',
              bg: 'bg-amber-50',
            },
            {
              label: 'Critical Alerts',
              value: '1',
              icon: AlertTriangle,
              color: 'text-rose-500',
              bg: 'bg-rose-50',
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={cn('rounded-lg border border-slate-50 p-2 shadow-sm', stat.bg)}>
                  {React.createElement(stat.icon, { className: cn('w-4 h-4', stat.color) })}
                </div>
                <Badge
                  variant="outline"
                  className="h-5 border-slate-200 bg-slate-50 px-2 text-[9px] font-bold uppercase text-slate-500"
                >
                  Live
                </Badge>
              </div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className={cn('text-base font-bold tracking-tight', stat.color)}>{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {/* Lines Monitor */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1 w-6 rounded-full bg-indigo-600" />
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Production Lines
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {lines.map((line) => (
                <Card
                  key={line.id}
                  className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:border-indigo-200"
                >
                  <div className="border-b border-slate-50 bg-slate-50/30 p-3">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-[14px] font-bold tracking-tight text-slate-900">
                          {line.name}
                        </h3>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {line.id}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          'h-5 border-none px-2 text-[9px] font-bold uppercase shadow-sm',
                          line.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {line.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Efficiency
                        </span>
                        <span className="text-[13px] font-bold text-indigo-600">
                          {line.efficiency}%
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-1000',
                            line.efficiency > 80 ? 'bg-emerald-500' : 'bg-amber-500'
                          )}
                          style={{ width: `${line.efficiency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4">
                    <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Nodes Activity</span>
                      <span className="cursor-pointer text-indigo-600 hover:underline">Manage</span>
                    </div>
                    <div className="flex -space-x-1.5">
                      {line.machines.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg border-2 border-white text-[9px] font-bold text-white shadow-sm',
                            getMachineStatusColor(m.status)
                          )}
                        >
                          {m.id.split('-')[1]}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-6 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-50 bg-slate-50/30 p-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Machine Fleet Details
                </CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-400">
                  Показатели отдельных узлов и сенсоров.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="h-10 border-none hover:bg-transparent">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Machine ID
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Type / Op
                      </TableHead>
                      <TableHead className="h-10 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Output 24h
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Temp / RPM
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        KPI
                      </TableHead>
                      <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {machines.map((m) => (
                      <TableRow
                        key={m.id}
                        className="group h-12 transition-colors hover:bg-slate-50/50"
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'h-2.5 w-2.5 rounded-full shadow-sm',
                                getMachineStatusColor(m.status)
                              )}
                            />
                            <div>
                              <p className="text-[12px] font-bold leading-tight text-slate-900">
                                {m.id}
                              </p>
                              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {m.status}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-[11px] font-bold uppercase tracking-tight text-slate-700">
                            {m.type}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">{m.operator}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="text-[13px] font-bold text-slate-900">{m.output24h}</p>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Units
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50 px-2 py-1">
                              <Thermometer className="h-3 w-3 text-slate-400" />
                              <span
                                className={cn(
                                  'text-[10px] font-bold',
                                  m.temperature > 50 ? 'text-rose-500' : 'text-slate-600'
                                )}
                              >
                                {m.temperature}°C
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-md border border-slate-100 bg-slate-50 px-2 py-1">
                              <Gauge className="h-3 w-3 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-600">{m.rpm}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'h-5 border-none px-2 text-[9px] font-bold uppercase shadow-sm',
                              m.efficiency > 90
                                ? 'bg-emerald-50 text-emerald-600'
                                : m.efficiency > 50
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-rose-50 text-rose-600'
                            )}
                          >
                            {m.efficiency}% OEE
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-slate-300 transition-all hover:bg-slate-100 hover:text-slate-900"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance & Intelligence */}
          <div className="space-y-6">
            <Card className="group relative overflow-hidden rounded-xl border border-indigo-500 bg-indigo-900 p-4 text-white shadow-xl">
              <div className="absolute -bottom-10 -right-10 opacity-10 transition-transform [transition-duration:1500ms] group-hover:scale-110">
                <Cpu className="h-40 w-40 text-indigo-400" />
              </div>
              <div className="relative z-10 mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner transition-all duration-300 group-hover:bg-white group-hover:text-indigo-600">
                  <Zap className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-tight">Predictive AI</h3>
              </div>
              <div className="relative z-10 mb-2 space-y-6">
                <p className="text-[13px] font-medium leading-relaxed text-indigo-100">
                  AI анализирует вибрации моторов. Узел **EM-301** требует замены подшипников через
                  ~48 часов.
                </p>
                <Button className="h-11 w-full rounded-lg bg-white text-[10px] font-bold uppercase tracking-widest text-indigo-900 shadow-xl transition-all hover:bg-indigo-50">
                  Schedule Service
                </Button>
              </div>
            </Card>

            <Card className="space-y-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Connectivity Hub
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Factory Gateway', status: 'Online', color: 'text-emerald-500' },
                  { label: 'Cutting Node', status: 'Online', color: 'text-emerald-500' },
                  { label: 'Finishing Node', status: 'Offline', color: 'text-rose-500' },
                  { label: 'Cloud Sync', status: 'Active (12ms)', color: 'text-indigo-500' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 transition-colors hover:bg-slate-100"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </span>
                    <span className={cn('text-[10px] font-bold uppercase', item.color)}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </CabinetPageContent>
    </>
  );
}
