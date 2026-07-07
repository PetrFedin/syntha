'use client';

import React from 'react';
import { Tag, Globe, Sparkles, Cpu, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PIMInfoTabProps {
  selectedProduct: any;
}

export function PIMInfoTab({ selectedProduct }: PIMInfoTabProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-left animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Product Title
            </label>
            <button className="flex items-center gap-1 text-[8px] font-black uppercase text-indigo-600 hover:underline">
              <Sparkles className="h-2 w-2" /> AI Rewrite
            </button>
          </div>
          <Input
            defaultValue={selectedProduct.name}
            className="h-10 rounded-2xl border-none bg-slate-50 font-bold"
          />
        </div>
        <div className="space-y-2">
          <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Category
          </label>
          <Input
            defaultValue={selectedProduct.category}
            className="h-10 rounded-2xl border-none bg-slate-50 font-bold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Wholesale Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₽
              </span>
              <Input
                type="number"
                defaultValue="4500"
                className="h-10 rounded-2xl border-none bg-slate-50 pl-10 font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              РРЦ (розница)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₽
              </span>
              <Input
                type="number"
                defaultValue="12900"
                className="h-10 rounded-2xl border-none bg-slate-50 pl-10 font-bold"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Wholesale Description
            </label>
            <Button
              variant="ghost"
              className="h-6 gap-1 rounded-lg bg-indigo-50 px-2 text-[8px] font-black uppercase text-indigo-600 hover:bg-indigo-100"
            >
              <Cpu className="h-2.5 w-2.5" /> AI Tech Writer
            </Button>
          </div>
          <textarea
            className="h-32 w-full resize-none rounded-2xl border-none bg-slate-50 p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            defaultValue="Premium performance parka featuring graphene-infused nylon for superior thermal regulation..."
          />
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-indigo-900">SEO & Marketplace Tags</h4>
            <Tag className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['#techwear', '#graphene', '#waterproof', '#fw26', '#premium'].map((tag) => (
              <Badge
                key={tag}
                className="border-indigo-100 bg-white text-[9px] font-black text-indigo-600"
              >
                {tag}
              </Badge>
            ))}
            <button className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-200 transition-all hover:bg-indigo-300">
              <Plus className="h-3 w-3 text-indigo-600" />
            </button>
          </div>
        </div>
        <Card className="space-y-4 border-none bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-900">
              Multi-Channel Sync
            </span>
          </div>
          <div className="space-y-3">
            {[
              { ch: 'B2B Showroom', status: 'synced' },
              { ch: 'Global Marketplace', status: 'synced' },
              { ch: 'Social Sync', status: 'pending' },
            ].map((c) => (
              <div key={c.ch} className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase text-slate-500">{c.ch}</span>
                {c.status === 'synced' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
