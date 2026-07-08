'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Percent, Calendar } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { getFinanceLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';

export default function MarkdownOptimizerPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 pb-16">
      <SectionInfoCard
        title="Markdown Optimizer"
        description="AI-рекомендации по времени и глубине скидок для максимизации прибыли. Когда и на сколько снижать цену по остаткам."
        icon={Percent}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              AI
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              Скидки
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.pricing}>Pricing</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Markdown Optimizer</h1>
      <Card className="rounded-xl border border-amber-100 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Рекомендации по скидкам
          </CardTitle>
          <CardDescription>
            Оптимальные сроки и глубина уценок по остаткам. Правила: остаток более 30 дней — 15%;
            более 60 дней — 25%; сезонный остаток — до 40%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { when: 'Сейчас', discount: 15, rule: 'Остаток до 30 дней' },
              { when: 'Через 2 нед.', discount: 25, rule: 'Остаток 30–60 дней' },
              { when: 'Через 4 нед.', discount: 40, rule: 'Сезонный остаток' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                <p className="text-sm font-bold">{item.when}</p>
                <p className="text-text-secondary mt-1 text-[11px]">
                  Рекомендуемая скидка: <strong>{item.discount}%</strong>
                </p>
                <p className="text-text-secondary mt-1 text-[10px]">{item.rule}</p>
              </div>
            ))}
          </div>
          <div className="bg-bg-surface2 border-border-default text-text-secondary rounded-lg border p-3 text-[11px]">
            <strong>Правила AI:</strong> Глубина скидки растёт с возрастом остатка. Для максимизации
            прибыли не снижайте раньше 2 недель до конца сезона; после — агрессивнее (до 40%).
          </div>
          <div>
            <p className="text-text-secondary mb-2 text-[10px] font-bold uppercase">
              Рекомендации по категориям
            </p>
            <div className="border-border-default overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-bg-surface2 border-border-default border-b">
                    <th className="text-text-secondary p-2 text-[10px] font-bold uppercase">
                      Категория
                    </th>
                    <th className="text-text-secondary p-2 text-[10px] font-bold uppercase">
                      Остаток (дн.)
                    </th>
                    <th className="text-text-secondary p-2 text-[10px] font-bold uppercase">
                      Скидка сейчас
                    </th>
                    <th className="text-text-secondary p-2 text-[10px] font-bold uppercase">
                      Когда
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: 'Верхняя одежда', days: 45, discount: 15, when: 'Сейчас' },
                    { cat: 'Брюки', days: 75, discount: 25, when: 'Через 2 нед.' },
                    { cat: 'Трикотаж', days: 90, discount: 40, when: 'Через 4 нед.' },
                  ].map((r, i) => (
                    <tr key={i} className="border-border-subtle border-b">
                      <td className="p-2 font-medium">{r.cat}</td>
                      <td className="p-2 tabular-nums">{r.days}</td>
                      <td className="p-2">
                        <strong>{r.discount}%</strong>
                      </td>
                      <td className="text-text-secondary p-2">{r.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={getFinanceLinks()} />
    </CabinetPageContent>
  );
}
