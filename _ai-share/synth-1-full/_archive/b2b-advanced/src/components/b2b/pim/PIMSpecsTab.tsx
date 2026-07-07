'use client';

import React from 'react';
import { Plus, Box, ShieldCheck, CheckCircle2, Wind, Droplets, Settings2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PIMSpecsTabProps {
  selectedProduct: any;
}

export function PIMSpecsTab({ selectedProduct }: PIMSpecsTabProps) {
  return (
    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Box className="h-4 w-4 text-indigo-600" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
              Material Composition
            </h4>
          </div>
          <div className="space-y-3">
            {(selectedProduct.composition || []).map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <Input
                  defaultValue={c.material}
                  className="h-10 flex-1 rounded-xl border-none bg-white text-[10px] font-bold"
                />
                <div className="relative w-24">
                  <Input
                    defaultValue={c.percent}
                    type="number"
                    className="h-10 rounded-xl border-none bg-white pr-6 text-[10px] font-black"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                    %
                  </span>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              className="h-12 w-full rounded-2xl border-2 border-dashed border-slate-100 text-[9px] font-black uppercase text-slate-400 hover:border-indigo-200"
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> Материал
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
              Compliance & Certs
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {(selectedProduct.certs || []).map((cert: string) => (
              <Badge
                key={cert}
                className="flex h-10 items-center gap-2 rounded-xl border-emerald-100 bg-emerald-50 px-4 text-emerald-600"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-[9px] font-black">{cert}</span>
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl border-dashed border-slate-200 text-[9px] font-black uppercase"
            >
              Upload Certificate
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Wind className="h-4 w-4 text-indigo-600" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
              Performance Metrics
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Breathability', val: '20K g/m²', icon: Wind },
              { label: 'Waterproof', val: '15K mm', icon: Droplets },
            ].map((m, i) => (
              <Card key={i} className="space-y-2 border-none bg-slate-50 p-4 shadow-sm">
                <m.icon className="mb-2 h-4 w-4 text-indigo-400" />
                <p className="text-[8px] font-black uppercase text-slate-400">{m.label}</p>
                <Input
                  defaultValue={m.val}
                  className="h-8 border-none bg-transparent p-0 text-sm font-black"
                />
              </Card>
            ))}
          </div>
        </div>

        <Card className="group relative overflow-hidden rounded-xl border-none bg-indigo-900 p-4 text-white shadow-sm">
          <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
            <Settings2 className="h-20 w-20" />
          </div>
          <div className="relative z-10 space-y-4">
            <h4 className="text-base font-black uppercase tracking-tight">Production Tech-Pack</h4>
            <p className="text-[10px] font-medium uppercase leading-relaxed tracking-widest text-white/60">
              Upload your pattern files and BOM for automated factory sync
            </p>
            <Button className="h-12 w-full rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest text-indigo-900 shadow-xl hover:bg-white/90">
              Sync with Factory
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
