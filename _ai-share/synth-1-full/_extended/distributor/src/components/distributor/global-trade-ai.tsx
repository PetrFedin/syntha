'use client';

import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  FileText,
  Download,
  RefreshCcw,
  CheckCircle2,
  Zap,
  Scale,
  Truck,
  Ship,
  Plane,
  AlertTriangle,
  Calculator,
  History,
  ChevronRight,
  BarChart3,
  ExternalLink,
  Landmark,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_DOCS = [
  {
    id: 'doc-1',
    title: 'Export Invoice #9921',
    country: 'EU / Italy',
    status: 'ready',
    type: 'Customs',
  },
  {
    id: 'doc-2',
    title: 'Packing List SS26',
    country: 'UAE / Dubai',
    status: 'generating',
    type: 'Logistics',
  },
  {
    id: 'doc-3',
    title: 'Certificate of Origin',
    country: 'China / Shanghai',
    status: 'pending_sign',
    type: 'Legal',
  },
];

export function GlobalTradeAi() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeRegion, setActiveRegion] = useState('EU');

  return (
    <Card className="overflow-hidden rounded-xl border-none bg-white shadow-2xl">
      <CardHeader className="bg-text-primary p-3 pb-4 text-white">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="mb-1 flex items-center gap-2">
              <Globe className="text-accent-primary h-6 w-6" />
              <span className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                Global Compliance Engine
              </span>
            </div>
            <CardTitle className="text-base font-black uppercase tracking-tighter">
              Global Trade AI
            </CardTitle>
            <CardDescription className="text-text-muted font-medium">
              Автоматизация таможенных документов, расчет пошлин и экспортный контроль.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className="flex items-center gap-1.5 border-none bg-white/10 px-3 py-1 text-[9px] font-black uppercase text-white">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              HS Codes API: Live
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-10 p-3 pt-10">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Main Controls Area */}
          <div className="space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <h4 className="text-text-muted text-[11px] font-black uppercase tracking-widest">
                Активные экспортные потоки
              </h4>
              <div className="bg-bg-surface2 flex rounded-xl p-1">
                {['EU', 'CIS', 'MENA', 'ASIA'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setActiveRegion(reg)}
                    className={cn(
                      'rounded-lg px-4 py-1.5 text-[9px] font-black uppercase transition-all',
                      activeRegion === reg
                        ? 'text-text-primary bg-white shadow-sm'
                        : 'text-text-muted'
                    )}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {MOCK_DOCS.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-bg-surface2 border-border-subtle group flex items-center justify-between rounded-xl border p-4 transition-all hover:bg-white hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="border-border-subtle flex h-10 w-10 items-center justify-center rounded-2xl border bg-white shadow-sm">
                      <FileText className="text-text-muted group-hover:text-accent-primary h-6 w-6 transition-colors" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <p className="text-text-primary text-sm font-black uppercase tracking-tight">
                          {doc.title}
                        </p>
                        <Badge
                          className={cn(
                            'h-4 px-1.5 text-[7px] font-black uppercase',
                            doc.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-600'
                          )}
                        >
                          {doc.status}
                        </Badge>
                      </div>
                      <p className="text-text-muted text-[10px] font-bold uppercase tracking-tighter">
                        {doc.country} • {doc.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-border-subtle h-12 w-12 rounded-2xl p-0"
                    >
                      <Download className="text-text-muted h-5 w-5" />
                    </Button>
                    <Button className="bg-text-primary hover:bg-accent-primary h-12 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all">
                      Проверить AI
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-accent-primary/10 border-accent-primary/20 flex items-center justify-between rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-accent-primary flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg">
                  <Calculator className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-text-primary text-sm font-black uppercase tracking-tighter">
                    Duty Calculator Pro
                  </p>
                  <p className="text-accent-primary/80 text-[10px] font-bold uppercase tracking-widest">
                    Авто-расчет таможенных пошлин и НДС по коду ТН ВЭД
                  </p>
                </div>
              </div>
              <Button className="text-accent-primary border-accent-primary/30 hover:bg-accent-primary h-10 rounded-2xl border bg-white px-8 text-[10px] font-black uppercase tracking-widest transition-all hover:text-white">
                Рассчитать партию
              </Button>
            </div>
          </div>

          {/* Compliance Sidebar */}
          <div className="space-y-4 lg:col-span-4">
            <div className="bg-text-primary relative space-y-4 overflow-hidden rounded-xl p-4 text-white">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <ShieldCheck className="h-32 w-32" />
              </div>

              <div className="relative z-10 space-y-1">
                <p className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                  Compliance Health
                </p>
                <h3 className="text-sm font-black tabular-nums">98.4%</h3>
                <p className="text-accent-primary/60 text-[9px] font-bold uppercase">
                  Риск задержки документов: Низкий
                </p>
              </div>

              <div className="relative z-10 space-y-4 pt-4">
                {[
                  { icon: Landmark, label: 'Валютный контроль', status: 'Pass' },
                  { icon: Scale, label: 'Санкционный комплаенс', status: 'Active' },
                  { icon: Zap, label: 'HS Code Auto-Matching', status: '94%' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="text-accent-primary h-4 w-4" />
                      <span className="text-[10px] font-black uppercase text-white/60">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-emerald-400">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <Button className="bg-accent-primary hover:bg-accent-primary relative z-10 h-10 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl transition-all">
                Новая декларация
              </Button>
            </div>

            <Card className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-black uppercase leading-none text-amber-900">
                  Изменение пошлин (EU)
                </p>
                <p className="text-[10px] font-medium leading-relaxed text-amber-700/80">
                  С 1 марта вводится новый экологический сбор на синтетические волокна в ЕС. AI
                  обновил ваши шаблоны инвойсов.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
