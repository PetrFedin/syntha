'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Clock, BookOpen, QrCode, Package, ChevronRight } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { getMarketingLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

const MOCK_TIMELINE = [
  {
    id: '1',
    step: 'Идея и эскиз',
    date: 'Янв 2026',
    desc: 'Концепция модели Cyber Parka',
    productId: 'P-502',
    sku: 'CP-001',
  },
  {
    id: '2',
    step: 'Техпакет и лекала',
    date: 'Фев 2026',
    desc: 'Digital Tech Pack 2.0, градация',
    productId: 'P-502',
    sku: 'CP-001',
  },
  {
    id: '3',
    step: 'Прототипы',
    date: 'Мар 2026',
    desc: 'Proto 1 → 2 → PP, Fit Comments',
    productId: 'P-502',
    sku: 'CP-001',
  },
  {
    id: '4',
    step: 'Gold Sample',
    date: 'Апр 2026',
    desc: 'Утверждение эталона, ЭДО',
    productId: 'P-502',
    sku: 'CP-001',
  },
  {
    id: '5',
    step: 'Массовый пошив',
    date: 'Май 2026',
    desc: 'Запуск в производство',
    productId: 'P-502',
    sku: 'CP-001',
  },
  {
    id: '6',
    step: 'Digital Passport',
    date: 'Июн 2026',
    desc: 'QR-история вещи для клиента',
    productId: 'P-502',
    sku: 'CP-001',
    passportId: 'PASS-9921',
  },
];

export default function HeritageTimelinePage() {
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_TIMELINE[0]?.id ?? null);
  const selected = MOCK_TIMELINE.find((t) => t.id === selectedId);

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 pb-16">
      <SectionInfoCard
        title="Brand Heritage Timeline"
        description="Интерактивная история создания каждой вещи для конечных клиентов. Storytelling, аутентичность. Связь с Digital Passport, Products, Production."
        icon={History}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              Storytelling
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href="/dpp/1">Digital Passport</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.products}>Products</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.production}>Production</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Brand Heritage Timeline</h1>

      <Card className="border-border-default rounded-xl border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> История продукта: Cyber Parka (CP-001)
          </CardTitle>
          <CardDescription>
            От идеи до производства — этапы для клиентского storytelling и Digital Passport
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {MOCK_TIMELINE.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  'shrink-0 rounded-xl border px-4 py-2 text-left text-[11px] font-bold transition-all',
                  selectedId === t.id
                    ? 'border-amber-300 bg-amber-100 text-amber-900'
                    : 'bg-bg-surface2 border-border-default hover:border-amber-200'
                )}
              >
                {t.step}
              </button>
            ))}
          </div>
          {selected && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <div>
                <p className="text-text-secondary text-[10px] font-bold uppercase">
                  {selected.date}
                </p>
                <p className="text-text-primary font-bold">{selected.step}</p>
                <p className="text-text-secondary mt-1 text-sm">{selected.desc}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="rounded-lg text-[10px]">
                  <Link href={ROUTES.brand.productsCard(selected.productId)}>
                    <Package className="mr-1 h-3 w-3" /> Карточка товара
                  </Link>
                </Button>
                {selected.passportId && (
                  <Button variant="outline" size="sm" asChild className="rounded-lg text-[10px]">
                    <Link href="/dpp/1">
                      <QrCode className="mr-1 h-3 w-3" /> Digital Passport
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" asChild className="text-[10px]">
              <Link href={ROUTES.brand.productionFitComments}>
                Fit Comments <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-[10px]">
              <Link href={ROUTES.brand.productionGoldSample}>
                Gold Sample <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={getMarketingLinks()} />
    </CabinetPageContent>
  );
}
