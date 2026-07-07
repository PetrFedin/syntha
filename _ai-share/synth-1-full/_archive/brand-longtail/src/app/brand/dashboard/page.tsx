'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { BrandDashboardWidgets } from '@/components/brand/brand-dashboard-widgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Factory, Map, ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { B2B_ORDERS_REGISTRY_LABEL } from '@/lib/ui/b2b-registry-label';
import { RegistryPageHeader } from '@/components/design-system';

import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getBrandPartnerRetailCrossRoleLinks } from '@/lib/data/entity-links';
import { B2BWorkspaceModuleGrid } from '@/components/b2b/B2BWorkspaceModuleGrid';

export default function BrandDashboardPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Главный дашборд"
        leadPlain={
          <>
            Сводка по бренду: <AcronymWithTooltip abbr="KPI" />, алерты, каналы. Центр управления —
            детальная аналитика. Связь с производством, B2B, финансами.
          </>
        }
        actions={
          <>
            <Badge variant="outline" className="text-[9px]">
              <AcronymWithTooltip abbr="KPI" />
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.controlCenter}>
                <BarChart3 className="mr-1 h-3 w-3" /> Центр управления
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.production}>
                <Factory className="mr-1 h-3 w-3" /> Производство
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.b2bOrders}>
                <ShoppingBag className="mr-1 h-3 w-3" /> {B2B_ORDERS_REGISTRY_LABEL}
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.shop.b2bWorkspaceMap}>
                <Map className="mr-1 h-3 w-3" /> Карта B2B (ритейл)
              </Link>
            </Button>
          </>
        }
      />
      <B2BWorkspaceModuleGrid
        primaryRole="brand"
        className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
        title="Модули B2B (роль бренда)"
        lead="Матрица из общего workplace: PIM, шоурум, производство, контракты — с переходами в кабинет бренда и связанные экраны ритейла."
      />
      <BrandDashboardWidgets />
      <RelatedModulesBlock
        links={getBrandPartnerRetailCrossRoleLinks()}
        title="Партнёрский контур: ритейл и байеры"
        className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
      />
    </CabinetPageContent>
  );
}
