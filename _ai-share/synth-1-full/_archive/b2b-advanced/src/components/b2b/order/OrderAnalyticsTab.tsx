'use client';

import React from 'react';
import { TrendingUp, Zap, Boxes, Calculator } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function OrderAnalyticsTab() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="space-y-4 rounded-xl border-none bg-white p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h4 className="text-text-primary text-[10px] font-black uppercase">
              Sell-Through Forecast
            </h4>
          </div>
          <div className="space-y-1">
            <p className="text-text-primary text-base font-black">78.4%</p>
            <p className="text-text-muted text-[9px] font-bold uppercase">Estimated by week 12</p>
          </div>
          <div className="bg-bg-surface2 h-1.5 w-full overflow-hidden rounded-full">
            <div className="h-full w-[78%] bg-emerald-500" />
          </div>
        </Card>

        <Card className="space-y-4 rounded-xl border-none bg-white p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Zap className="text-accent-primary h-5 w-5" />
            <h4 className="text-text-primary text-[10px] font-black uppercase">
              Margin Optimization
            </h4>
          </div>
          <div className="space-y-1">
            <p className="text-text-primary text-base font-black">64.2%</p>
            <p className="text-text-muted text-[9px] font-bold uppercase">Projected Net Margin</p>
          </div>
          <div className="bg-bg-surface2 h-1.5 w-full overflow-hidden rounded-full">
            <div className="bg-accent-primary h-full w-[64%]" />
          </div>
        </Card>

        <Card className="space-y-4 rounded-xl border-none bg-white p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Boxes className="h-5 w-5 text-amber-500" />
            <h4 className="text-text-primary text-[10px] font-black uppercase">Stock Balance</h4>
          </div>
          <div className="space-y-1">
            <p className="text-text-primary text-base font-black">Optimal</p>
            <p className="text-text-muted text-[9px] font-bold uppercase">
              Size curve distribution
            </p>
          </div>
          <div className="flex gap-1">
            {[40, 70, 90, 60, 30].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-amber-100" style={{ height: '20px' }}>
                <div className="w-full rounded-sm bg-amber-500" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="bg-text-primary relative overflow-hidden rounded-xl border-none p-3 text-white shadow-2xl">
        <div className="absolute right-0 top-0 p-3 opacity-10">
          <Calculator className="h-32 w-32" />
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3 text-left">
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-tight">AI Budget Advisor</h4>
            <p className="text-text-muted text-sm font-medium leading-relaxed">
              Based on your last season sales in **Moscow Hub**, we recommend increasing
              **Outerwear** allocation by 15% while reducing **Basics** to avoid markdowns.
            </p>
            <Button className="text-text-primary h-12 rounded-2xl bg-white px-8 text-[10px] font-black uppercase tracking-widest">
              Apply AI Rebalancing
            </Button>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="space-y-4">
              {[
                { label: 'Projected Revenue', val: '4.2M ₽' },
                { label: 'Projected Profit', val: '2.7M ₽' },
                { label: 'Break-even Point', val: 'Day 42' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-white/5 pb-4"
                >
                  <span className="text-[10px] font-bold uppercase text-white/40">{s.label}</span>
                  <span className="text-sm font-black">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
