'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  ArrowRight,
  Calculator,
  Ship,
  FileCheck,
  ShieldCheck,
  Zap,
  BrainCircuit,
  Info,
  ChevronDown,
  PieChart as PieChartIcon,
  ChevronRight,
  Target,
} from 'lucide-react';
import { LandedCostBreakdown } from '@/lib/types/finance';
import { calculateLandedCost, generateCostOptimizationInsights } from '@/lib/logic/finance-utils';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

/**
 * Landed Cost Engine UI
 * Умный калькулятор себестоимости с учетом логистики и пошлин.
 */

export default function LandedCostPage() {
  const [formData, setFormData] = useState<Partial<LandedCostBreakdown>>({
    fabricCost: 45,
    cmtCost: 15,
    trimsCost: 5,
    packagingCost: 2,
    freightCost: 12,
    dutyRate: 15,
    insuranceCost: 1.5,
    markingCost: 0.8,
    overheadRate: 18,
    amortizationCost: 5,
    targetRetailPrice: 350,
  });

  const calculatedLC = useMemo(() => calculateLandedCost(formData), [formData]);
  const aiInsights = useMemo(() => generateCostOptimizationInsights(calculatedLC), [calculatedLC]);

  const handleInputChange = (field: keyof LandedCostBreakdown, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-10 pb-16">
      <RegistryPageHeader
        title="Landed Cost Engine"
        leadPlain="Расчёт полной себестоимости: ткань, CMT, логистика, пошлины. Связи с Finance, Production, Warehouse и Duty Calculator."
        actions={
          <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-1">
              <Badge variant="outline" className="text-[9px]">
                Full Cost
              </Badge>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.finance}>Finance</Link>
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.production}>Production</Link>
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.warehouse}>Warehouse</Link>
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.logisticsDutyCalculator}>Duty Calc</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase"
              >
                <Target className="h-4 w-4" /> Анализ конкурентов
              </Button>
              <Button className="bg-text-primary h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase text-white shadow-lg">
                <Zap className="h-4 w-4" /> Экспорт в P&L
              </Button>
            </div>
            <Calculator className="size-6 shrink-0 text-emerald-600" aria-hidden />
          </div>
        }
      />

      <div className="grid gap-3 lg:grid-cols-12">
        {/* Input Form */}
        <div className="space-y-4 lg:col-span-7">
          <Card className="overflow-hidden rounded-xl border-none shadow-md shadow-xl">
            <CardHeader className="border-border-subtle border-b p-4">
              <CardTitle className="text-base font-black uppercase tracking-tight">
                Параметры расчета
              </CardTitle>
              <CardDescription>
                Введите данные для расчета себестоимости (USD/Unit).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Production Section */}
                <div className="space-y-4">
                  <h4 className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                    Производство (CMT+M)
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-text-secondary mb-1 block text-[10px] font-bold uppercase">
                        Fabric (Ткань)
                      </label>
                      <Input
                        type="number"
                        value={formData.fabricCost}
                        onChange={(e) => handleInputChange('fabricCost', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-1 block text-[10px] font-bold uppercase">
                        CMT (Пошив)
                      </label>
                      <Input
                        type="number"
                        value={formData.cmtCost}
                        onChange={(e) => handleInputChange('cmtCost', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-1 block text-[10px] font-bold uppercase">
                        Trims (Фурнитура)
                      </label>
                      <Input
                        type="number"
                        value={formData.trimsCost}
                        onChange={(e) => handleInputChange('trimsCost', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Logistics Section */}
                <div className="space-y-4">
                  <h4 className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                    Логистика и пошлины
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-text-secondary mb-1 block text-[10px] font-bold uppercase">
                        Freight (Доставка)
                      </label>
                      <Input
                        type="number"
                        value={formData.freightCost}
                        onChange={(e) => handleInputChange('freightCost', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-1 block text-[10px] font-bold uppercase">
                        Duty Rate (%)
                      </label>
                      <Input
                        type="number"
                        value={formData.dutyRate}
                        onChange={(e) => handleInputChange('dutyRate', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-1 block text-[10px] font-bold uppercase">
                        Marking (Маркировка)
                      </label>
                      <Input
                        type="number"
                        value={formData.markingCost}
                        onChange={(e) => handleInputChange('markingCost', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Overheads Section */}
                <div className="space-y-4">
                  <h4 className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                    Операционные расходы
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-text-secondary mb-1 block text-[10px] font-bold uppercase">
                        Overhead Rate (%)
                      </label>
                      <Input
                        type="number"
                        value={formData.overheadRate}
                        onChange={(e) => handleInputChange('overheadRate', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-text-secondary mb-1 block text-[10px] font-bold uppercase">
                        Amortization (Амортизация)
                      </label>
                      <Input
                        type="number"
                        value={formData.amortizationCost}
                        onChange={(e) => handleInputChange('amortizationCost', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="space-y-4">
                  <h4 className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                    Целевая цена
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-accent-primary mb-1 block text-[10px] font-bold uppercase">
                        Retail Price (Розница)
                      </label>
                      <Input
                        type="number"
                        value={formData.targetRetailPrice}
                        onChange={(e) => handleInputChange('targetRetailPrice', e.target.value)}
                        className="border-accent-primary/30 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Dashboard */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="shadow-accent-primary/10 bg-accent-primary relative overflow-hidden rounded-xl border-none p-3 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute right-0 top-0 h-48 w-48 -translate-y-24 translate-x-24 rounded-full bg-white/5 blur-3xl" />
            <div className="bg-accent-primary/20 absolute bottom-0 left-0 h-32 w-32 -translate-x-16 translate-y-16 rounded-full blur-2xl" />

            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">Total Landed Cost</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Финальная себестоимость за единицу
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-base font-black tracking-tighter">
                  ${calculatedLC.totalLandedCost.toFixed(2)}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  USD PER UNIT (LANDED)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Целевая Маржа
                  </p>
                  <p className="text-sm font-black text-emerald-400">
                    {calculatedLC.targetMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Ценовая Эластичность
                  </p>
                  <p className="text-accent-primary/40 text-sm font-black">Medium</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border-none bg-white p-3 shadow-md shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <BrainCircuit className="text-accent-primary h-5 w-5" />
              <h3 className="text-text-primary text-sm font-black uppercase tracking-tight">
                AI Financial Insights
              </h3>
            </div>

            <div className="space-y-4">
              {aiInsights.map((insight, i) => (
                <div
                  key={i}
                  className="bg-bg-surface2 border-border-subtle flex gap-3 rounded-2xl border p-4"
                >
                  <div className="bg-accent-primary mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <p className="text-text-secondary text-xs font-medium leading-relaxed">
                    {insight}
                  </p>
                </div>
              ))}
              {aiInsights.length === 0 && (
                <div className="text-text-muted py-6 text-center text-[10px] font-bold uppercase">
                  Все показатели в норме
                </div>
              )}
            </div>

            <div className="border-border-subtle mt-8 space-y-4 border-t pt-8">
              <h4 className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                Структура себестоимости
              </h4>
              <div className="space-y-3">
                {[
                  {
                    label: 'Production (BOM+CMT)',
                    value: calculatedLC.fabricCost + calculatedLC.cmtCost + calculatedLC.trimsCost,
                    color: 'bg-accent-primary',
                  },
                  {
                    label: 'Logistics & Duties',
                    value:
                      calculatedLC.freightCost +
                      calculatedLC.calculatedDuty +
                      calculatedLC.markingCost,
                    color: 'bg-emerald-500',
                  },
                  {
                    label: 'Ops & Amortization',
                    value: calculatedLC.calculatedOverhead + calculatedLC.amortizationCost,
                    color: 'bg-amber-500',
                  },
                ].map((part, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                      <span className="text-text-secondary">{part.label}</span>
                      <span className="text-text-primary">${part.value.toFixed(2)}</span>
                    </div>
                    <div className="bg-bg-surface2 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          part.color
                        )}
                        style={{ width: `${(part.value / calculatedLC.totalLandedCost) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </CabinetPageContent>
  );
}
