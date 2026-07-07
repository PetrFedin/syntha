'use client';

import { DigitalProductionView } from '@/components/brand/digital-production-view';
import {
  Factory,
  Activity,
  Zap,
  Cpu,
  Settings2,
  Leaf,
  Box,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MtoBridge } from '@/components/factory/mto-bridge';

export default function ProductionPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="mb-1 flex items-center gap-2">
            <Factory className="text-accent-primary h-5 w-5" />
            <span className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
              Core Production Engine
            </span>
          </div>
          <h1 className="font-headline text-base font-black uppercase tracking-tighter">
            Линии пошива
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Мониторинг производственных потоков, мощностей и этапов сборки в реальном времени.
          </p>
        </div>
        <div className="flex gap-3">
          <Badge className="flex h-8 items-center gap-2 border-emerald-100 bg-emerald-50 px-4 text-[10px] font-black uppercase text-emerald-600">
            <Activity className="h-3 w-3 animate-pulse" /> IoT Hub: Online
          </Badge>
          <Button
            variant="outline"
            className="border-border-default h-8 rounded-lg text-[10px] font-black uppercase"
          >
            <Settings2 className="mr-2 h-3.5 w-3.5" /> Настроить сенсоры
          </Button>
        </div>
      </header>

      <MtoBridge />

      {/* IoT Real-time Feed Widget */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          { line: 'Line A-1', efficiency: '94%', status: 'Optimal', speed: '120 ops/h' },
          { line: 'Line A-2', efficiency: '88%', status: 'Optimal', speed: '105 ops/h' },
          { line: 'Line B-1', efficiency: '72%', status: 'Warning', speed: '82 ops/h' },
          { line: 'Line C-4', efficiency: '98%', status: 'Ultra', speed: '142 ops/h' },
        ].map((l, i) => (
          <Card
            key={i}
            className="border-border-subtle relative overflow-hidden rounded-2xl shadow-sm"
          >
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <p className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                    {l.line}
                  </p>
                  <h4 className="text-sm font-black">{l.efficiency}</h4>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[8px] font-black uppercase',
                    l.status === 'Optimal'
                      ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                      : l.status === 'Ultra'
                        ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20'
                        : 'border-rose-100 bg-rose-50 text-rose-600'
                  )}
                >
                  {l.status}
                </Badge>
              </div>
              <div className="bg-bg-surface2 h-1.5 w-full overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: l.efficiency }}
                  className={cn(
                    'h-full rounded-full',
                    l.status === 'Optimal'
                      ? 'bg-emerald-500'
                      : l.status === 'Ultra'
                        ? 'bg-accent-primary'
                        : 'bg-rose-500'
                  )}
                />
              </div>
              <p className="text-text-secondary flex items-center gap-1.5 text-[9px] font-bold uppercase">
                <Cpu className="h-3 w-3" /> {l.speed}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Sustainability & Fabric Hub */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="border-border-subtle group overflow-hidden rounded-xl bg-emerald-50/30 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
              <Leaf className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge className="border-none bg-emerald-100 text-[8px] font-black uppercase text-emerald-700">
                  EU Standard 2026
                </Badge>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  ESG Tracker
                </span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight">
                Carbon Footprint Auto-Calculator
              </h3>
              <p className="text-text-secondary mt-1 text-xs font-medium">
                Авто-расчет углеродного следа каждой партии на основе логистики и типа сырья.
              </p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-100">
              <ArrowRight className="h-5 w-5 text-emerald-600" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border-subtle bg-accent-primary/10 group overflow-hidden rounded-xl shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-accent-primary shadow-accent-primary/15 flex h-12 w-12 items-center justify-center rounded-3xl text-white shadow-lg">
              <Database className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge className="bg-accent-primary/15 text-accent-primary border-none text-[8px] font-black uppercase">
                  CLO3D Sync
                </Badge>
                <span className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                  Asset Hub
                </span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight">
                Digital Fabric Swatch Library
              </h3>
              <p className="text-text-secondary mt-1 text-xs font-medium">
                Цифровые свойства тканей для мгновенного импорта в 3D PLM системы.
              </p>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-accent-primary/15 rounded-full">
              <ArrowRight className="text-accent-primary h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="duration-700 animate-in fade-in">
        <DigitalProductionView />
      </div>
    </div>
  );
}
