'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAnalyticsLinks } from '@/lib/data/entity-links';
import { RegistryPageHeader } from '@/components/design-system';

/** Network Sell-Through BI: анонимизированное сравнение своих продаж со средними по индустрии. */
const MOCK = {
  yourSellThrough: 72,
  industryAvg: 67,
  topQuartile: 78,
  byCategory: [
    { category: 'Верхняя одежда', yours: 78, industry: 72 },
    { category: 'Трикотаж', yours: 68, industry: 65 },
    { category: 'Брюки', yours: 74, industry: 70 },
  ],
};

export default function SellThroughBIPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Sell-Through BI"
        leadPlain="Сравнение вашего sell-through со средними показателями индустрии по категориям и регионам."
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.analyticsBi} aria-label="Назад к BI">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <Card className="border-accent-primary/20 bg-accent-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" /> Benchmark
          </CardTitle>
          <CardDescription>
            Анонимные агрегированные данные. Подключите импорт из 1С/Мой Склад для актуализации.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-text-secondary text-[10px] font-bold uppercase">
                Ваш Sell-Through
              </p>
              <p className="text-accent-primary text-2xl font-black">{MOCK.yourSellThrough}%</p>
              <p className="mt-1 text-[10px] text-emerald-600">+5% vs индустрия</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-text-secondary text-[10px] font-bold uppercase">
                Среднее по индустрии
              </p>
              <p className="text-2xl font-black">{MOCK.industryAvg}%</p>
              <p className="text-text-secondary mt-1 text-[10px]">Fashion, premium</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-text-secondary text-[10px] font-bold uppercase">Топ-25% брендов</p>
              <p className="text-2xl font-black">{MOCK.topQuartile}%</p>
              <p className="text-text-secondary mt-1 text-[10px]">Потенциал</p>
            </div>
          </div>
          <div>
            <p className="text-text-secondary mb-2 text-xs font-semibold">По категориям</p>
            <ul className="space-y-2">
              {MOCK.byCategory.map((row, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border bg-white p-2"
                >
                  <span className="text-sm font-medium">{row.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-accent-primary text-sm font-bold">Вы: {row.yours}%</span>
                    <span className="text-text-secondary text-xs">Индустрия: {row.industry}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={getAnalyticsLinks()} />
    </CabinetPageContent>
  );
}
