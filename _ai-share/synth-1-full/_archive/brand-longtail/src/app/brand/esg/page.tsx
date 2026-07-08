'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import ESGDashboard from '@/components/brand/esg/ESGDashboard';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Factory, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { RegistryPageHeader } from '@/components/design-system';

const ESG_LINKS = [
  { label: 'Production & BOM', href: ROUTES.brand.production },
  { label: 'ЭДО и Compliance', href: ROUTES.brand.compliance },
  { label: 'Поставщики', href: ROUTES.brand.suppliers },
  { label: 'Фабрики', href: ROUTES.brand.factories },
  { label: 'Materials', href: ROUTES.brand.materials },
  { label: 'Gold Sample', href: ROUTES.brand.productionGoldSample },
  { label: 'Академия', href: ROUTES.brand.academy },
  { label: 'Документы', href: ROUTES.brand.documents },
  { label: 'Команда', href: ROUTES.brand.team },
];

export default function BrandESGPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-20">
      <RegistryPageHeader
        title="ESG-мониторинг"
        leadPlain="Сертификаты, углеродный след и отчётность: статус A+ (демо)."
        actions={
          <>
            <Badge
              variant="outline"
              className="hidden shrink-0 border-emerald-200 bg-emerald-50 text-[9px] font-bold uppercase text-emerald-700 sm:inline-flex"
            >
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" /> A+
            </Badge>
            <Button
              variant="outline"
              asChild
              size="sm"
              className="h-8 text-[10px] font-bold uppercase"
            >
              <Link href={ROUTES.brand.production}>
                <Factory className="mr-1 h-3.5 w-3.5" /> Production
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              size="sm"
              className="h-8 text-[10px] font-bold uppercase"
            >
              <Link href={ROUTES.brand.compliance}>Compliance</Link>
            </Button>
          </>
        }
      />

      <div
        className={cn(
          cabinetSurface.groupTabList,
          'flex h-auto min-h-9 flex-wrap items-center gap-1'
        )}
      >
        <Button
          variant="ghost"
          className="text-text-secondary hover:text-accent-primary h-8 rounded-lg px-3 text-[10px] font-bold uppercase"
        >
          Сертификация SKU
        </Button>
        <Button
          variant="ghost"
          className="text-text-secondary hover:text-accent-primary h-8 gap-1.5 rounded-lg px-3 text-[10px] font-bold uppercase"
        >
          <FileText className="h-3.5 w-3.5" /> GRI/CDP
        </Button>
      </div>

      <div className="border-border-subtle overflow-hidden rounded-2xl border bg-white shadow-sm">
        <ESGDashboard />
      </div>

      <RelatedModulesBlock links={ESG_LINKS} className="mt-6" />
    </CabinetPageContent>
  );
}
