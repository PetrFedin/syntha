'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, AlertTriangle } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { getMarketingLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';

export default function DesignCopyrightPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 pb-16">
      <SectionInfoCard
        title="Design Copyright AI"
        description="Глобальный мониторинг маркетплейсов на предмет появления визуальных копий моделей. Защита интеллектуальной собственности. Связь с IP Ledger, Products."
        icon={Shield}
        iconBg="bg-accent-primary/15"
        iconColor="text-accent-primary"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              AI
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              Маркетплейсы
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.ipLedger}>IP Ledger</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Design Copyright AI</h1>
      <Card className="border-accent-primary/20 bg-accent-primary/10 rounded-xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Мониторинг копий
          </CardTitle>
          <CardDescription>
            Автоматический поиск визуально похожих моделей на Wildberries, Ozon, AliExpress и др.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <div>
              <p className="font-bold">Сканирование</p>
              <p className="text-text-secondary text-[11px]">
                Загрузите образцы для мониторинга. AI сравнивает с каталогами маркетплейсов.
              </p>
            </div>
          </div>
          <p className="text-text-muted mt-4 text-[10px]">Скоро: интеграция с маркетплейсами</p>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={getMarketingLinks()} />
    </CabinetPageContent>
  );
}
