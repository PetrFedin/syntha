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
        <header className="border-border-subtle flex flex-col justify-between gap-3 border-b pb-4 md:flex-row md:items-end">
          <div className="space-y-1">
            <div className="text-accent-primary flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <Cpu className="h-3.5 w-3.5" />
              Industry 4.0 Core
            </div>
            <h1 className="text-text-primary text-sm font-bold uppercase tracking-tight">
              Machine Monitoring
            </h1>
            <p className="text-text-secondary text-[13px] font-medium">
              Мониторинг КПД, температуры и выработки оборудования в реальном времени.
            </p>
          </div>
          <div className="bg-bg-surface2 border-border-default flex gap-2 rounded-xl border p-1 shadow-inner">
            <Button
              variant="ghost"
              className="text-text-secondary h-8 gap-2 rounded-lg px-4 text-[10px] font-bold uppercase transition-all hover:bg-white"
            >
              <History className="h-3.5 w-3.5" /> Maintenance
            </Button>
            <Button className="bg-text-primary hover:bg-accent-primary h-8 gap-2 rounded-lg px-4 text-[10px] font-bold uppercase text-white shadow-md transition-all">
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
              color: 'text-accent-primary',
              bg: 'bg-accent-primary/10',
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
              className="border-border-subtle hover:border-accent-primary/30 group rounded-xl border bg-white p-4 shadow-sm transition-all"
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className={cn('border-border-subtle rounded-lg border p-2 shadow-sm', stat.bg)}
                >
                  {React.createElement(stat.icon, { className: cn('w-4 h-4', stat.color) })}
                </div>
                <Badge
                  variant="outline"
                  className="border-border-default bg-bg-surface2 text-text-secondary h-5 px-2 text-[9px] font-bold uppercase"
                >
                  Live
                </Badge>
              </div>
              <p className="text-text-muted mb-0.5 text-[10px] font-bold uppercase tracking-wider">
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
              <div className="bg-accent-primary h-1 w-6 rounded-full" />
              <h2 className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                Production Lines
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {lines.map((line) => (
                <Card
                  key={line.id}
                  className="border-border-subtle hover:border-accent-primary/30 overflow-hidden rounded-xl border bg-white shadow-sm transition-all"
                >
                  <div className="border-border-subtle bg-bg-surface2/30 border-b p-3">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-text-primary text-[14px] font-bold tracking-tight">
                          {line.name}
                        </h3>
                        <p className="text-text-muted mt-0.5 text-[10px] font-bold uppercase tracking-wider">
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
                        <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                          Efficiency
                        </span>
                        <span className="text-accent-primary text-[13px] font-bold">
                          {line.efficiency}%
                        </span>
                      </div>
                      <div className="bg-bg-surface2 h-1 w-full overflow-hidden rounded-full">
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
                    <div className="text-text-muted mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span>Nodes Activity</span>
                      <span className="text-accent-primary cursor-pointer hover:underline">
                        Manage
                      </span>
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

            <Card className="border-border-subtle mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
              <CardHeader className="border-border-subtle bg-bg-surface2/30 border-b p-4">
                <CardTitle className="text-text-primary text-sm font-bold uppercase tracking-wider">
                  Machine Fleet Details
                </CardTitle>
                <CardDescription className="text-text-muted text-[11px] font-medium">
                  Показатели отдельных узлов и сенсоров.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader className="bg-bg-surface2/80">
                    <TableRow className="h-10 border-none hover:bg-transparent">
                      <TableHead className="text-text-muted pl-6 text-[10px] font-bold uppercase tracking-wider">
                        Machine ID
                      </TableHead>
                      <TableHead className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                        Type / Op
                      </TableHead>
                      <TableHead className="text-text-muted h-10 text-center text-[10px] font-bold uppercase tracking-wider">
                        Output 24h
                      </TableHead>
                      <TableHead className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                        Temp / RPM
                      </TableHead>
                      <TableHead className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                        KPI
                      </TableHead>
                      <TableHead className="text-text-muted pr-6 text-right text-[10px] font-bold uppercase tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {machines.map((m) => (
                      <TableRow
                        key={m.id}
                        className="hover:bg-bg-surface2/80 group h-12 transition-colors"
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
                              <p className="text-text-primary text-[12px] font-bold leading-tight">
                                {m.id}
                              </p>
                              <p className="text-text-muted mt-0.5 text-[10px] font-bold uppercase tracking-wider">
                                {m.status}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-text-primary text-[11px] font-bold uppercase tracking-tight">
                            {m.type}
                          </p>
                          <p className="text-text-muted text-[10px] font-medium">{m.operator}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="text-text-primary text-[13px] font-bold">{m.output24h}</p>
                          <p className="text-text-muted text-[9px] font-bold uppercase tracking-wider">
                            Units
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-bg-surface2 border-border-subtle flex items-center gap-1.5 rounded-md border px-2 py-1">
                              <Thermometer className="text-text-muted h-3 w-3" />
                              <span
                                className={cn(
                                  'text-[10px] font-bold',
                                  m.temperature > 50 ? 'text-rose-500' : 'text-text-secondary'
                                )}
                              >
                                {m.temperature}°C
                              </span>
                            </div>
                            <div className="bg-bg-surface2 border-border-subtle flex items-center gap-1.5 rounded-md border px-2 py-1">
                              <Gauge className="text-text-muted h-3 w-3" />
                              <span className="text-text-secondary text-[10px] font-bold">
                                {m.rpm}
                              </span>
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
                            className="text-text-muted hover:text-text-primary hover:bg-bg-surface2 h-7 w-7 rounded-lg transition-all"
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
            <Card className="border-accent-primary bg-accent-primary group relative overflow-hidden rounded-xl border p-4 text-white shadow-xl">
              <div className="absolute -bottom-10 -right-10 opacity-10 transition-transform [transition-duration:1500ms] group-hover:scale-110">
                <Cpu className="text-accent-primary h-40 w-40" />
              </div>
              <div className="relative z-10 mb-6 flex items-center gap-3">
                <div className="group-hover:text-accent-primary flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner transition-all duration-300 group-hover:bg-white">
                  <Zap className="text-accent-primary h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-tight">Predictive AI</h3>
              </div>
              <div className="relative z-10 mb-2 space-y-6">
                <p className="text-accent-primary/30 text-[13px] font-medium leading-relaxed">
                  AI анализирует вибрации моторов. Узел **EM-301** требует замены подшипников через
                  ~48 часов.
                </p>
                <Button className="text-accent-primary hover:bg-accent-primary/10 h-11 w-full rounded-lg bg-white text-[10px] font-bold uppercase tracking-widest shadow-xl transition-all">
                  Schedule Service
                </Button>
              </div>
            </Card>

            <Card className="border-border-subtle space-y-6 rounded-xl border bg-white p-4 shadow-sm">
              <div className="border-border-subtle flex items-center gap-3 border-b pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-text-primary text-sm font-bold uppercase tracking-wider">
                  Connectivity Hub
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Factory Gateway', status: 'Online', color: 'text-emerald-500' },
                  { label: 'Cutting Node', status: 'Online', color: 'text-emerald-500' },
                  { label: 'Finishing Node', status: 'Offline', color: 'text-rose-500' },
                  { label: 'Cloud Sync', status: 'Active (12ms)', color: 'text-accent-primary' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-bg-surface2 border-border-subtle hover:bg-bg-surface2 flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors"
                  >
                    <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
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
