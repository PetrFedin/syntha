'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Coins,
  ArrowRight,
  Info,
  Banknote,
  Wallet,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { cn } from '@/lib/cn';

export function MultiCurrencySwitcher() {
  const { activeCurrency, setCurrency } = useUIState();

  const currencies = [
    { id: 'RUB', symbol: '₽', label: 'Российский рубль', rate: 1, icon: Banknote },
    { id: 'USD', symbol: '$', label: 'Доллар США', rate: 0.011, icon: Banknote },
    { id: 'EUR', symbol: '€', label: 'Евро', rate: 0.01, icon: Wallet },
    { id: 'AED', symbol: 'د.إ', label: 'Дирхам ОАЭ', rate: 0.04, icon: Coins },
  ] as const;

  return (
    <div className="border-border-subtle flex max-w-sm flex-col gap-3 rounded-xl border bg-white p-4 shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="text-accent-primary h-4 w-4" />
            <Badge
              variant="outline"
              className="border-accent-primary/20 text-accent-primary text-[8px] font-black uppercase tracking-widest"
            >
              Global_Engine_v1
            </Badge>
          </div>
          <h3 className="text-text-primary text-base font-black uppercase tracking-tight">
            Валюта расчетов
          </h3>
        </div>
        <div className="bg-bg-surface2 border-border-subtle text-text-muted flex h-10 w-10 items-center justify-center rounded-full border">
          <RefreshCw className="h-4 w-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {currencies.map((curr) => (
          <button
            key={curr.id}
            onClick={() => setCurrency(curr.id)}
            className={cn(
              'group flex items-center justify-between rounded-2xl border p-4 transition-all',
              activeCurrency === curr.id
                ? 'bg-text-primary border-text-primary shadow-md shadow-xl'
                : 'bg-bg-surface2 hover:bg-bg-surface2 border-transparent'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                  activeCurrency === curr.id
                    ? 'bg-white/10 text-white'
                    : 'text-text-muted border-border-subtle border bg-white'
                )}
              >
                <curr.icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <p
                  className={cn(
                    'text-[10px] font-black uppercase tracking-widest',
                    activeCurrency === curr.id ? 'text-white' : 'text-text-primary'
                  )}
                >
                  {curr.id}
                </p>
                <p
                  className={cn(
                    'text-[8px] font-bold uppercase',
                    activeCurrency === curr.id ? 'text-text-muted' : 'text-text-muted'
                  )}
                >
                  {curr.label}
                </p>
              </div>
            </div>
            {activeCurrency === curr.id && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-black text-white">{curr.symbol}</span>
                <div className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-emerald-400">
                  <TrendingUp className="h-2 w-2" />
                  <span className="text-[7px] font-black">LIVE</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-accent-primary/10 border-accent-primary/20 flex items-start gap-3 rounded-xl border p-4">
        <Info className="text-accent-primary mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-accent-primary text-[9px] font-medium leading-relaxed">
          Оптовые цены и условия оплаты будут автоматически пересчитаны на основе выбранной валюты
          расчетов.
        </p>
      </div>

      <Button className="bg-text-primary h-12 w-full gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
        Подтвердить регион <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
