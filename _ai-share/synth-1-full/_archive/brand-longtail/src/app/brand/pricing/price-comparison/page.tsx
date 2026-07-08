'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp, Link2, BarChart3, ExternalLink } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { getFinanceLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';

export default function PriceComparisonPage() {
  const [manualUrl, setManualUrl] = useState('');

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-6 pb-24">
      <SectionInfoCard
        title="Парсинг цен и сравнение с рынком"
        description="Парсинг цен артикулов на платформе. Автоматическое сравнение с рынком (benchmark) или ручное — добавьте ссылку с другого сайта для сравнения."
        icon={TrendingUp}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              Платформа
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              Рынок
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/brand/pricing">Pricing</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Сравнение цен</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-xl border border-emerald-100 bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Автоматическое сравнение
            </CardTitle>
            <CardDescription>
              Цены артикулов платформы автоматически сравниваются с анонимизированным рыночным
              бенчмарком
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {[
                { sku: 'SS26-DRESS-01', platform: '24 900 ₽', market: '22 500 ₽', diff: '+11%' },
                { sku: 'SS26-JACKET-04', platform: '18 500 ₽', market: '19 200 ₽', diff: '-4%' },
                { sku: 'AW25-DENIM-12', platform: '9 900 ₽', market: '10 100 ₽', diff: '-2%' },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border bg-white p-3"
                >
                  <span className="text-sm font-medium">{row.sku}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600">{row.platform}</span>
                    <span className="text-[11px] text-slate-400">→ {row.market}</span>
                    <Badge
                      variant={row.diff.startsWith('+') ? 'secondary' : 'outline'}
                      className="text-[10px]"
                    >
                      {row.diff}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm">
              Обновить данные
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" /> Ручное сравнение
            </CardTitle>
            <CardDescription>
              Добавьте ссылку на товар с другого сайта — система извлечёт цену для сравнения
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-slate-500">
                URL для парсинга
              </label>
              <Input
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://…/товар…"
                className="h-11"
              />
            </div>
            <Button className="w-full gap-2">
              <ExternalLink className="h-4 w-4" /> Добавить для сравнения
            </Button>
            <p className="text-[10px] text-slate-400">
              Поддерживаются: Wildberries, Ozon, Lamoda, сайты брендов и др.
            </p>
          </CardContent>
        </Card>
      </div>

      <RelatedModulesBlock links={getFinanceLinks()} />
    </div>
  );
}
