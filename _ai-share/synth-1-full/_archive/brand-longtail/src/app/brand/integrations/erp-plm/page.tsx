'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Package } from 'lucide-react';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';
import { getRelatedLinks } from '@/lib/data/integration-modules';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';

/** 1С, Мой Склад (РФ). Sellty, Compo: синхронизация заказов, остатков, справочников. */
export default function BrandIntegrationsErpPlmPage() {
  const links = getRelatedLinks('1c-sync').map((l) => ({ label: l.label, href: l.href }));

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Синхронизация 1С (ERP, PLM)"
        leadPlain="Sellty, Compo: заказы, остатки, справочники. Двусторонняя синхронизация с 1С, Мой Склад."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Database className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <AcronymWithTooltip abbr="ERP" />
            <AcronymWithTooltip abbr="PLM" />
            <Badge variant="outline" className="text-[9px]">
              Sellty
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              Compo
            </Badge>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Статус подключений</CardTitle>
          <CardDescription>1С:Предприятие, Мой Склад, обмен заказами и остатками.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-bg-surface2 border-border-subtle flex items-center justify-between rounded-lg border p-3">
            <span className="font-medium">1С</span>
            <Badge className="bg-emerald-100 text-emerald-700">Подключено</Badge>
          </div>
          <div className="bg-bg-surface2 border-border-subtle flex items-center justify-between rounded-lg border p-3">
            <span className="font-medium">Мой Склад</span>
            <Badge variant="outline">Не настроено</Badge>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.shop.b2bDealerCabinet}>
              <Package className="mr-1 h-3 w-3" /> Личный кабинет дилера
            </Link>
          </Button>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={links} title="Связанные модули" />
    </CabinetPageContent>
  );
}
