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
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  BatteryMedium,
  RefreshCcw,
  Tag,
  Search,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Zap,
  Cpu,
  Smartphone,
  Globe,
  Monitor,
  Settings2,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { ESLDevice } from '@/lib/types/retail';
import { MOCK_ESL_DEVICES, getBatteryStatus } from '@/lib/logic/esl-utils';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/**
 * Dynamic ESL Sync Page — Shop OS
 * Управление электронными ценниками в торговом зале.
 */

export default function ESLManagementPage() {
  const [devices, setDevices] = useState<ESLDevice[]>(MOCK_ESL_DEVICES);
  const [updating, setUpdating] = useState<string | null>(null);

  const syncAll = () => {
    setUpdating('all');
    setTimeout(() => setUpdating(null), 2000);
  };

  const getBatteryIcon = (level: number) => {
    const status = getBatteryStatus(level);
    if (status === 'critical')
      return <BatteryLow className="h-4 w-4 animate-pulse text-rose-500" />;
    if (status === 'low') return <BatteryLow className="h-4 w-4 text-amber-500" />;
    if (status === 'normal') return <BatteryMedium className="h-4 w-4 text-slate-400" />;
    return <Battery className="h-4 w-4 text-emerald-500" />;
  };

  return (
    <div className="container mx-auto space-y-10 px-4 py-4">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
            <Tag className="h-3.5 w-3.5" />
            Retail Operations
          </div>
          <h1 className="font-headline text-sm font-black uppercase tracking-tighter">
            Dynamic ESL Sync
          </h1>
          <p className="font-medium text-muted-foreground">
            Синхронизация цен и акций с электронными ценниками в реальном времени.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase"
          >
            <Settings2 className="h-4 w-4" /> Gateway Config
          </Button>
          <Button
            onClick={syncAll}
            disabled={!!updating}
            className="h-11 gap-2 rounded-xl bg-indigo-600 px-6 text-[10px] font-black uppercase text-white shadow-lg shadow-indigo-200"
          >
            <RefreshCcw className={cn('h-4 w-4', updating === 'all' && 'animate-spin')} />
            Sync All Devices
          </Button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Total Devices', value: devices.length, status: 'Active' },
          {
            label: 'Online',
            value: devices.filter((d) => d.status === 'online').length,
            status: 'Healthy',
            color: 'text-emerald-500',
          },
          {
            label: 'Low Battery',
            value: devices.filter((d) => d.batteryLevel < 20).length,
            status: 'Requires Action',
            color: 'text-rose-500',
          },
          { label: 'Pending Updates', value: '0', status: 'All Synced' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-3xl border-none bg-white p-4 shadow-sm">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {stat.label}
            </p>
            <p className={cn('mb-2 text-base font-black', stat.color)}>{stat.value}</p>
            <Badge variant="outline" className="border-slate-100 text-[8px] font-black uppercase">
              {stat.status}
            </Badge>
          </Card>
        ))}
      </div>

      {/* Main Management Table */}
      <Card className="overflow-hidden rounded-xl border-none bg-white shadow-xl shadow-slate-200/50">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-4">
          <div>
            <CardTitle className="text-base font-black uppercase tracking-tight">
              Label Registry
            </CardTitle>
            <CardDescription>Устройства, привязанные к артикулам в торговом зале.</CardDescription>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <Input
                placeholder="Поиск SKU или ID…"
                className="h-10 w-64 rounded-xl border-slate-100 pl-9 text-xs"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-8 text-[10px] font-black uppercase">
                  Device / SKU
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase">Product</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Display Price</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Power/Signal</TableHead>
                <TableHead className="pr-8 text-right text-[10px] font-black uppercase">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id} className="group transition-colors hover:bg-slate-50/50">
                  <TableCell className="py-6 pl-8">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900">{device.id}</p>
                      <code className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] text-indigo-600">
                        {device.sku}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-black text-slate-900">{device.productName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
                      {device.location}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {device.promoPrice ? (
                        <>
                          <span className="text-sm font-black text-rose-500">
                            ${device.promoPrice}
                          </span>
                          <span className="text-xs font-bold text-slate-300 line-through">
                            ${device.currentPrice}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-black text-slate-900">
                          ${device.currentPrice}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          device.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                        )}
                      />
                      <span className="text-[10px] font-black uppercase text-slate-600">
                        {device.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {getBatteryIcon(device.batteryLevel)}
                        <span className="text-[10px] font-bold text-slate-500">
                          {device.batteryLevel}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wifi
                          className={cn(
                            'h-4 w-4',
                            device.signalStrength > 50 ? 'text-indigo-400' : 'text-slate-300'
                          )}
                        />
                        <span className="text-[10px] font-bold text-slate-500">
                          {device.signalStrength}%
                        </span>
                      </div>
                    </div>
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

      {/* Info Section */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="group relative overflow-hidden rounded-xl border-none bg-slate-900 p-4 text-white shadow-xl shadow-slate-200/50">
          <div className="absolute -bottom-10 -right-10 opacity-10 transition-transform group-hover:scale-110">
            <Zap className="h-40 w-40 text-indigo-400" />
          </div>
          <div className="relative z-10 mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <Smartphone className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-sm font-black uppercase italic tracking-tight">
              Storefront Automation
            </h3>
          </div>
          <p className="relative z-10 mb-8 text-sm font-medium leading-relaxed text-white/60">
            Ценники автоматически переключаются в режим «PROMO», когда маркетинговый отдел запускает
            акцию в Brand OS. При сканировании QR-кода на ценнике клиент попадает в **Digital
            Product Passport** с историей вещи.
          </p>
          <Button className="relative z-10 h-10 rounded-xl border-none bg-indigo-600 px-6 text-[10px] font-black uppercase text-white">
            View Automation Logs
          </Button>
        </Card>

        <Card className="space-y-6 rounded-xl border border-none border-slate-50 bg-white p-4 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
              Sync Status
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Cloud Gateway', status: 'Operational', color: 'text-emerald-500' },
              {
                label: 'Local Base Station',
                status: 'Online (Showroom A)',
                color: 'text-emerald-500',
              },
              { label: 'Firmware Update', status: 'v2.4.1 (Stable)', color: 'text-slate-400' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0"
              >
                <span className="text-[10px] font-black uppercase text-slate-400">
                  {item.label}
                </span>
                <span className={cn('text-[10px] font-black uppercase', item.color)}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
