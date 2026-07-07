'use client';

import React from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function OrderAllocationTab() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1 text-left">
          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
            Pre-Allocation Plan
          </h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Distribute order items across your physical locations
          </p>
        </div>
        <Button className="h-12 gap-2 rounded-2xl bg-slate-900 px-6 text-[10px] font-black uppercase tracking-widest text-white">
          <Plus className="h-4 w-4" /> Локация
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-left">
        {[
          { name: 'Flagship Store (Tverskaya)', units: 140, capacity: 85 },
          { name: 'Dep. Store (Aviapark)', units: 85, capacity: 42 },
          { name: 'Concept Store (Atrium)', units: 45, capacity: 90 },
        ].map((loc, i) => (
          <Card key={i} className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <Badge className="border-none bg-slate-100 px-2 text-[8px] font-black uppercase tracking-widest text-slate-600">
                {loc.capacity}% UTILIZED
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black uppercase text-slate-900">{loc.name}</p>
              <p className="text-base font-black text-slate-900">{loc.units}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Units Allocated
              </p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-indigo-500" style={{ width: `${loc.capacity}%` }} />
            </div>
            <Button
              variant="outline"
              className="h-10 w-full rounded-xl border-slate-200 text-[9px] font-black uppercase tracking-widest"
            >
              Edit Distribution
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
