'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Globe,
  Search,
  Zap,
  ShieldCheck,
  ArrowRight,
  Gavel,
  Calculator,
  Languages,
  Book,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

export function CustomsHSAssistant() {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mockResult = {
    code: '6201.40.10',
    description:
      "Men's overcoats, raincoats, car coats, capes, cloaks and similar articles, of man-made fibers",
    confidence: '98.4%',
    duty: '12.0%',
    vat: '20.0%',
    restrictions: 'CITES Certification required for Graphene membrane',
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  return (
    <div className="bg-bg-surface2 min-h-screen space-y-4 p-3 text-left">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-accent-primary flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg">
              <Gavel className="h-5 w-5" />
            </div>
            <Badge
              variant="outline"
              className="border-accent-primary/20 text-accent-primary text-[9px] font-black uppercase tracking-widest"
            >
              TRADE_COMPLIANCE_v1.2
            </Badge>
          </div>
          <h2 className="text-text-primary text-sm font-black uppercase leading-none tracking-tighter md:text-sm">
            AI-Помощник по
            <br />
            Таможне и ТН ВЭД
          </h2>
          <p className="text-text-muted max-w-md text-xs font-medium">
            Мгновенная классификация товаров для международной торговли. Автоматическое определение
            кодов ТН ВЭД с расчетом пошлин и налогов в реальном времени.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-border-default h-10 gap-2 rounded-2xl bg-white px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <Book className="h-4 w-4" /> Глобальная база тарифов
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Card className="space-y-4 rounded-xl border-none bg-white p-3 shadow-2xl">
            <div className="space-y-4">
              <h4 className="text-text-primary text-base font-black uppercase tracking-tight">
                Движок Классификации
              </h4>
              <div className="relative">
                <Search className="text-text-muted absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2" />
                <Input
                  placeholder="Опишите товар (напр., Мужская парка, 80% переработанный нейлон)..."
                  className="bg-bg-surface2 focus-visible:ring-accent-primary h-20 rounded-[1.5rem] border-none pl-16 text-sm font-medium"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!query || isAnalyzing}
                className="bg-text-primary h-10 w-full gap-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:scale-[1.02]"
              >
                {isAnalyzing ? 'Анализ тех. характеристик...' : 'Определить код ТН ВЭД'}{' '}
                <Zap className={cn('h-4 w-4', isAnalyzing && 'animate-pulse')} />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                  Последние классификации
                </h5>
                <Button
                  variant="ghost"
                  className="text-accent-primary h-auto p-0 text-[10px] font-black uppercase"
                >
                  Очистить историю
                </Button>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Neural Cargo Pants', code: '6203.43', country: 'RU → AE' },
                  { name: 'Graphene Base Layer', code: '6109.90', country: 'IT → US' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-bg-surface2 hover:bg-bg-surface2 hover:border-border-default flex cursor-pointer items-center justify-between rounded-2xl border border-transparent p-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-text-muted border-border-subtle flex h-8 w-8 items-center justify-center rounded-lg border bg-white">
                        <FileText className="h-4 w-4" />
                      </div>
                      <p className="text-text-primary text-[10px] font-black uppercase">
                        {item.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="text-accent-primary font-mono text-[10px] font-bold">
                        {item.code}
                      </code>
                      <span className="text-text-muted text-[8px] font-bold uppercase tracking-widest">
                        {item.country}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <Card
            className={cn(
              'overflow-hidden rounded-xl border-none shadow-2xl transition-all duration-700',
              query && !isAnalyzing
                ? 'bg-accent-primary scale-100'
                : 'bg-border-subtle pointer-events-none scale-95 opacity-50'
            )}
          >
            <div className="space-y-4 p-3 text-white">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-accent-primary/40 text-[10px] font-black uppercase tracking-widest">
                    Рекомендуемый код ТН ВЭД
                  </p>
                  <h3 className="text-sm font-black tracking-tighter">{mockResult.code}</h3>
                </div>
                <Badge className="border-none bg-white/20 px-3 py-1 text-[8px] font-black text-white backdrop-blur-md">
                  ТОЧНОСТЬ: {mockResult.confidence}
                </Badge>
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-accent-primary/40 text-[10px] font-black uppercase">
                  Официальное описание
                </p>
                <p className="text-xs font-medium italic leading-relaxed opacity-90">
                  {mockResult.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-text-primary/40 space-y-1 rounded-2xl p-4">
                  <p className="text-accent-primary text-[10px] font-black uppercase">
                    Ставка пошлины
                  </p>
                  <p className="text-base font-black">{mockResult.duty}</p>
                </div>
                <div className="bg-text-primary/40 space-y-1 rounded-2xl p-4">
                  <p className="text-accent-primary text-[10px] font-black uppercase">
                    Импортный НДС
                  </p>
                  <p className="text-base font-black">{mockResult.vat}</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <p className="text-accent-primary/30 text-[9px] font-bold uppercase leading-relaxed tracking-widest">
                    {mockResult.restrictions}
                  </p>
                </div>
                <Button className="text-accent-primary h-12 w-full rounded-xl bg-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                  Применить к PIM SKU
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-text-primary relative space-y-4 overflow-hidden rounded-xl border-none p-4 text-white shadow-xl">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Languages className="h-24 w-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <h5 className="text-accent-primary text-sm font-black uppercase tracking-widest">
                Региональная адаптивность
              </h5>
              <p className="text-text-muted text-[10px] font-medium uppercase leading-relaxed tracking-widest">
                Коды ТН ВЭД автоматически адаптируются для **190+ стран**, включая вариации для зон
                ЕАЭС, ЕС и NAFTA.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">
                  WCO API: Подключено
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
