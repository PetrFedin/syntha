'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Map as MapIcon,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  Globe,
  Search,
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export function DemandHeatmap() {
  const [activeLayer, setActiveLayer] = useState<'demand' | 'inventory' | 'partners'>('demand');

  const regions = [
    { name: 'Moscow & Central', demand: 92, inventory: 45, partners: 12, trend: '+14%' },
    { name: 'Dubai / MENA', demand: 85, inventory: 60, partners: 8, trend: '+22%' },
    { name: 'Москва / РФ', demand: 78, inventory: 30, partners: 15, trend: '+5%' },
    { name: 'Shanghai / Asia', demand: 64, inventory: 80, partners: 4, trend: '+18%' },
  ];

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-3 text-left">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
              <Globe className="h-5 w-5" />
            </div>
            <Badge
              variant="outline"
              className="border-indigo-100 text-[9px] font-black uppercase tracking-widest text-indigo-600"
            >
              MARKET_INTEL_v2.0
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Global Demand
            <br />
            Heatmap
          </h2>
          <p className="max-w-md text-xs font-medium text-slate-400">
            AI-driven market sentiment analysis. Synchronize your production with real-world demand
            clusters.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {[
            { id: 'demand', label: 'Demand', icon: TrendingUp },
            { id: 'inventory', label: 'Inventory', icon: Layers },
            { id: 'partners', label: 'Partners', icon: Users },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                activeLayer === layer.id
                  ? 'bg-slate-900 text-white shadow-xl'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              )}
            >
              <layer.icon className="h-3.5 w-3.5" />
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="group relative aspect-[16/10] overflow-hidden rounded-xl border-none bg-slate-900 shadow-2xl">
            {/* Mock Map Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000')] bg-cover bg-center opacity-20 grayscale" />

            {/* Interactive Nodes */}
            <div className="group/node absolute left-[20%] top-[30%]">
              <div className="absolute h-4 w-4 animate-ping rounded-full bg-indigo-500 opacity-75" />
              <div className="relative h-4 w-4 cursor-pointer rounded-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.8)]" />
              <div className="pointer-events-none absolute left-1/2 top-4 z-20 w-32 -translate-x-1/2 rounded-xl bg-white p-3 opacity-0 shadow-2xl transition-all group-hover/node:opacity-100">
                <p className="text-[10px] font-black uppercase text-slate-900">Казань</p>
                <p className="text-[8px] font-bold uppercase text-indigo-600">Demand: 94%</p>
              </div>
            </div>

            <div className="group/node absolute left-[50%] top-[40%]">
              <div className="absolute h-6 w-6 animate-ping rounded-full bg-emerald-500 opacity-75" />
              <div className="relative h-6 w-6 cursor-pointer rounded-full bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.8)]" />
              <div className="pointer-events-none absolute left-1/2 top-4 z-20 w-32 -translate-x-1/2 rounded-xl bg-white p-3 opacity-0 shadow-2xl transition-all group-hover/node:opacity-100">
                <p className="text-[10px] font-black uppercase text-slate-900">Moscow</p>
                <p className="text-[8px] font-bold uppercase text-emerald-600">Demand: 98%</p>
              </div>
            </div>

            <div className="group/node absolute bottom-[30%] right-[20%]">
              <div className="absolute h-3 w-3 animate-ping rounded-full bg-amber-500 opacity-75" />
              <div className="relative h-3 w-3 cursor-pointer rounded-full bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
            </div>

            <div className="absolute bottom-8 left-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/80 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
                  High Potential
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
                  Active Growth
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Regional Performance
            </h4>
            <div className="space-y-4">
              {regions.map((r, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-indigo-200"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-900">{r.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold uppercase text-slate-400">
                        Sentiment
                      </span>
                      <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-indigo-600" style={{ width: `${r.demand}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600">{r.trend}</p>
                    <p className="text-[8px] font-bold uppercase text-slate-400">Growth</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-slate-100 text-[9px] font-black uppercase tracking-widest"
            >
              Generate Global Strategy
            </Button>
          </Card>

          <Card className="relative space-y-4 overflow-hidden rounded-xl border-none bg-indigo-600 p-4 text-white shadow-2xl">
            <div className="absolute right-0 top-0 p-4 opacity-20">
              <Sparkles className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <h5 className="text-sm font-black uppercase tracking-widest text-indigo-200">
                AI Market Prediction
              </h5>
              <p className="text-[10px] font-medium uppercase leading-relaxed tracking-widest text-white/80">
                Expect a **15% surge** in demand for **Thermal Shells** in Northern Europe due to
                forecasted temperature drops in Q4.
              </p>
              <Button className="h-10 w-full rounded-xl bg-white text-[9px] font-black uppercase tracking-widest text-indigo-600">
                Allocate Stock
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
