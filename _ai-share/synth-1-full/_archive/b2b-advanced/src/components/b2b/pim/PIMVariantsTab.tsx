'use client';

import React from 'react';
import { Plus, RefreshCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PIMVariantsTabProps {
  selectedProduct: any;
}

export function PIMVariantsTab({ selectedProduct }: PIMVariantsTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
            Color & Size Matrix
          </h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Manage available to sell (ATS) quantities per variant
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-xl border-slate-200 bg-white px-6 text-[9px] font-black uppercase tracking-widest"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Sync All ATS
          </Button>
          <Button className="h-10 gap-2 rounded-xl bg-slate-900 px-6 text-[9px] font-black uppercase tracking-widest text-white">
            <Plus className="h-3.5 w-3.5" /> Новый цвет
          </Button>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between rounded-2xl bg-indigo-900 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Zap className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-black uppercase">Rapid ATS Adjustment</p>
            <p className="text-[9px] font-medium uppercase text-indigo-200">
              Apply +/- offsets across all sizes for the selected season
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Смещение (напр. +50)"
            className="h-10 w-32 border-white/10 bg-white/5 text-[10px] font-black text-white placeholder:text-white/20"
          />
          <Button className="h-10 rounded-xl bg-white px-6 text-[10px] font-black uppercase text-indigo-900">
            Apply
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {(selectedProduct.variants || []).map((v: any, idx: number) => (
          <div key={idx} className="space-y-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full border-4 border-white shadow-sm"
                  style={{ backgroundColor: v.hex }}
                />
                <div>
                  <p className="text-xs font-black uppercase text-slate-900">{v.color}</p>
                  <p className="text-[9px] font-bold uppercase text-slate-400">
                    Status: Live on Marketplace
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200 bg-white text-[8px] font-black uppercase"
                >
                  Edit Mapping
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-slate-200 bg-white text-[8px] font-black uppercase text-rose-600"
                >
                  Disable
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {Object.entries(v.sizes).map(([size, qty]: [string, any]) => (
                <div key={size} className="space-y-2">
                  <label className="block text-center text-[9px] font-black uppercase text-slate-400">
                    {size}
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      defaultValue={qty}
                      className="h-12 rounded-xl border-slate-100 bg-white text-center text-xs font-black focus:ring-indigo-500"
                    />
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
