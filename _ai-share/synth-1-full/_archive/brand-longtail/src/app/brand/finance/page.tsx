'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { FinancialHub } from '@/components/brand/finance/FinancialHub';
import BudgetControl from '@/components/brand/finance/BudgetControl';
import { FactoringAutomation } from '@/components/brand/FactoringAutomation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  Landmark,
  Wallet,
  BarChart3,
  TrendingUp,
  PiggyBank,
  Calculator,
  Shield,
  Scale,
  ShieldCheck,
  Banknote,
  Clock,
  Gavel,
  Activity,
  Hammer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BudgetVsActual from '@/components/brand/finance/BudgetVsActual';
import { getFinanceLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';

const EscrowPageContent = dynamic(() => import('@/app/brand/finance/escrow/page'), { ssr: false });
const LandedCostPageContent = dynamic(() => import('@/app/brand/finance/landed-cost/page'), {
  ssr: false,
});
const EmbeddedPaymentContent = dynamic(
  () => import('@/app/brand/finance/embedded-payment/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const RfTermsContent = dynamic(
  () => import('@/app/brand/finance/rf-terms/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const AuctionsContent = dynamic(() => import('@/app/brand/auctions/page').then((m) => m.default), {
  ssr: false,
  loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div>,
});
const EscrowLiveContent = dynamic(
  () => import('@/app/brand/finance/escrow-live/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const DemandAuctionsContent = dynamic(
  () => import('@/app/brand/finance/demand-auctions/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);

const financeTabTriggerClass = cn(
  cabinetSurface.tabsTrigger,
  'h-7 gap-1.5 data-[state=active]:text-accent-primary'
);

export default function BrandFinancePage() {
  const [tab, setTab] = useState('factoring');
  return (
    <CabinetPageContent
      maxWidth="5xl"
      className="space-y-4 px-4 py-6 pb-24 duration-700 animate-in fade-in sm:px-6"
    >
      {/* Control Panel: Executive Style */}
      <div className="border-border-subtle flex flex-col items-start justify-between gap-3 border-b pb-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <p className="text-text-muted flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />{' '}
            Ликвидность: OK
          </p>
        </div>
        <div className="bg-bg-surface2 border-border-default flex items-center gap-2 rounded-xl border p-1 shadow-inner">
          <Button
            variant="ghost"
            className="text-text-secondary hover:text-accent-primary h-7 rounded-lg px-3 text-[9px] font-bold uppercase tracking-wider transition-all hover:bg-white hover:shadow-sm"
          >
            Сверить счета
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-border-default text-text-secondary hover:border-accent-primary/30 h-7 rounded-lg bg-white px-3 text-[9px] font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            Экспорт P&L
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-h-9 w-full shadow-inner')}>
          <TabsTrigger value="factoring" className={financeTabTriggerClass}>
            <Landmark className="h-3 w-3 shrink-0" /> Факторинг
          </TabsTrigger>
          <TabsTrigger value="hub" className={financeTabTriggerClass}>
            <Wallet className="h-3 w-3 shrink-0" /> Баланс
          </TabsTrigger>
          <TabsTrigger value="budget" className={financeTabTriggerClass}>
            <PiggyBank className="h-3 w-3 shrink-0" /> Лимиты
          </TabsTrigger>
          <TabsTrigger value="budgetVsActual" className={financeTabTriggerClass}>
            <Scale className="h-3 w-3 shrink-0" /> План vs Факт
          </TabsTrigger>
          <TabsTrigger value="analytics" className={financeTabTriggerClass}>
            <TrendingUp className="h-3 w-3 shrink-0" /> Анализ
          </TabsTrigger>
          <TabsTrigger value="escrow" className={financeTabTriggerClass}>
            <ShieldCheck className="h-3 w-3 shrink-0" /> Эскроу
          </TabsTrigger>
          <TabsTrigger value="escrow-live" className={financeTabTriggerClass}>
            <Activity className="h-3 w-3 shrink-0" /> LIVE: Эскроу
          </TabsTrigger>
          <TabsTrigger value="demand-auctions" className={financeTabTriggerClass}>
            <Hammer className="h-3 w-3 shrink-0" /> Аукционы потребностей
          </TabsTrigger>
          <TabsTrigger value="landedCost" className={financeTabTriggerClass}>
            <Calculator className="h-3 w-3 shrink-0" /> Себестоимость
          </TabsTrigger>
          <TabsTrigger value="embedded-payment" className={financeTabTriggerClass}>
            <Banknote className="h-3 w-3 shrink-0" /> Оплата
          </TabsTrigger>
          <TabsTrigger value="rf-terms" className={financeTabTriggerClass}>
            <Clock className="h-3 w-3 shrink-0" /> Отсрочка НДС
          </TabsTrigger>
          <TabsTrigger value="auctions" className={financeTabTriggerClass}>
            <Gavel className="h-3 w-3 shrink-0" /> Аукционы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="factoring" className={cabinetSurface.cabinetProfileTabPanel}>
          <FactoringAutomation />
        </TabsContent>

        <TabsContent value="hub" className={cabinetSurface.cabinetProfileTabPanel}>
          <div className="mx-auto max-w-5xl">
            <FinancialHub />
          </div>
        </TabsContent>

        <TabsContent value="budget" className={cabinetSurface.cabinetProfileTabPanel}>
          <BudgetControl brandId="BRAND-XYZ" />
        </TabsContent>

        <TabsContent value="budgetVsActual" className={cabinetSurface.cabinetProfileTabPanel}>
          <BudgetVsActual brandId="BRAND-XYZ" embedded />
        </TabsContent>

        <TabsContent value="analytics" className={cabinetSurface.cabinetProfileTabPanel}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'P&L за месяц', value: '2.4M ₽', delta: '+12%', color: 'text-emerald-600' },
              {
                label: 'Cash Flow',
                value: '1.8M ₽',
                delta: 'стабильно',
                color: 'text-text-primary',
              },
              { label: 'Доля B2B', value: '68%', delta: '+3%', color: 'text-accent-primary' },
              {
                label: 'Средний чек PO',
                value: '420K ₽',
                delta: '-2%',
                color: 'text-text-secondary',
              },
            ].map((m, i) => (
              <Card key={i} className="border-border-subtle rounded-xl border p-4">
                <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                  {m.label}
                </p>
                <p className={`text-xl font-black ${m.color} mt-1`}>{m.value}</p>
                <p className="text-text-secondary mt-0.5 text-[10px]">{m.delta}</p>
              </Card>
            ))}
            <Card className="border-border-subtle rounded-xl border p-4 md:col-span-2">
              <p className="text-text-muted mb-3 text-[10px] font-bold uppercase tracking-wider">
                Динамика выручки
              </p>
              <div className="flex h-24 items-end gap-1">
                {[65, 72, 58, 81, 75, 88].map((h, i) => (
                  <div
                    key={i}
                    className="bg-accent-primary/15 min-h-[20px] flex-1 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-text-muted mt-2 text-[9px]">Последние 6 месяцев</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="escrow" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'escrow' && <EscrowPageContent />}
        </TabsContent>

        <TabsContent value="escrow-live" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'escrow-live' && <EscrowLiveContent />}
        </TabsContent>

        <TabsContent value="demand-auctions" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'demand-auctions' && <DemandAuctionsContent />}
        </TabsContent>

        <TabsContent value="landedCost" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'landedCost' && <LandedCostPageContent />}
        </TabsContent>

        <TabsContent value="embedded-payment" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'embedded-payment' && <EmbeddedPaymentContent />}
        </TabsContent>

        <TabsContent value="rf-terms" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'rf-terms' && <RfTermsContent />}
        </TabsContent>

        <TabsContent value="auctions" className={cabinetSurface.cabinetProfileTabPanel}>
          {tab === 'auctions' && <AuctionsContent />}
        </TabsContent>
      </Tabs>

      <RelatedModulesBlock links={getFinanceLinks()} className="mt-6" />
    </CabinetPageContent>
  );
}
