'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAnalyticsLinks } from '@/lib/data/entity-links';
import { RegistryPageHeader } from '@/components/design-system';

/** Geo-Demand Heatmap: карта спроса по регионам для планирования точек и стока. */
const MOCK_REGIONS = [
  { name: 'Москва', share: 42, demand: 'Высокий' },
  { name: 'СПб', share: 18, demand: 'Высокий' },
  { name: 'Регионы', share: 28, demand: 'Средний' },
  { name: 'Онлайн', share: 12, demand: 'Растущий' },
];

export default function GeoDemandPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Geo-Demand Heatmap"
        leadPlain="Карта спроса по регионам для планирования открытий новых точек и распределения стока."
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
            <MapPin className="h-5 w-5" /> Доля заказов по регионам
          </CardTitle>
          <CardDescription>
            При подключении к данным продаж — интерактивная тепловая карта.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-bg-surface2 border-border-default flex h-64 items-center justify-center rounded-xl border">
            <div className="text-text-secondary text-center">
              <MapPin className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p className="text-sm font-bold">Интерактивная карта спроса</p>
              <p className="text-[11px]">Москва, СПб, регионы — тепловая карта заказов</p>
              <p className="text-text-muted mt-2 text-[10px]">
                Подключите данные продаж для отображения
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MOCK_REGIONS.map((r, i) => (
              <div key={i} className="rounded-lg border bg-white p-3 text-center">
                <p className="text-text-secondary text-[10px] font-bold uppercase">{r.name}</p>
                <p className="text-lg font-black">{r.share}%</p>
                <p className="text-text-secondary text-[10px]">{r.demand}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={getAnalyticsLinks()} />
    </CabinetPageContent>
  );
}
