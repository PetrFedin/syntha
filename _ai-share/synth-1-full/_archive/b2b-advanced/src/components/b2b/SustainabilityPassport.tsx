'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  RefreshCcw,
  Droplets,
  Wind,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Info,
  BarChart3,
  Factory,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

export function SustainabilityPassport({ productId = '1' }: { productId?: string }) {
  return (
    <div className="flex max-w-xl flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-emerald-600" />
            <Badge className="border-none bg-emerald-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">
              Eco_Ledger_v1.0
            </Badge>
          </div>
          <h3 className="text-text-primary text-base font-black uppercase leading-none tracking-tight">
            Digital Product
            <br />
            Passport
          </h3>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-100 bg-white p-2 shadow-xl shadow-emerald-200/50">
          <QrCode className="text-text-primary h-full w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: 'Recycled Content',
            val: '82%',
            icon: RefreshCcw,
            color: 'text-accent-primary',
            bg: 'bg-accent-primary/10',
          },
          {
            label: 'Carbon Footprint',
            val: '2.4kg',
            icon: Wind,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Water Usage',
            val: '12L',
            icon: Droplets,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Lifespan Score',
            val: 'A+',
            icon: BarChart3,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
        ].map((stat, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-emerald-100 bg-white p-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.bg)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <div className="space-y-0.5">
              <p className="text-text-muted text-[8px] font-black uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-text-primary text-base font-black">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-xl shadow-emerald-200/20">
        <div className="flex items-center gap-3">
          <div className="bg-text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Factory className="h-5 w-5 text-white" />
          </div>
          <h4 className="text-text-primary text-sm font-black uppercase tracking-tight">
            Supply Chain Transparency
          </h4>
        </div>
        <div className="space-y-4">
          {[
            { stage: 'Raw Material', location: 'Turkiye (Organic Cotton)', status: 'Verified' },
            { stage: 'Fabric Mill', location: 'Italy (Recycled Nylon)', status: 'Verified' },
            { stage: 'Assembly', location: 'Portugal (Solar-Powered)', status: 'Verified' },
          ].map((step, i) => (
            <div
              key={i}
              className="border-border-subtle flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="space-y-0.5">
                <p className="text-text-primary text-[10px] font-black uppercase">{step.stage}</p>
                <p className="text-text-muted text-[8px] font-medium uppercase">{step.location}</p>
              </div>
              <Badge className="border-none bg-emerald-50 px-2 py-0.5 text-[7px] font-black uppercase text-emerald-600">
                {step.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="bg-text-primary flex items-center justify-between rounded-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase">Blockchain Verified</p>
            <p className="text-text-muted text-[8px] font-medium">Tx: 0x824...f921</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="h-auto gap-2 p-0 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-transparent hover:text-emerald-300"
        >
          Full ESG Report <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
