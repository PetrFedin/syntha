'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { getAuctionLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';

export default function NewAuctionPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Новый тендер / закупка"
        leadPlain="Создание аукциона для закупок бренда: ткани, фурнитура, услуги. Полноценный сценарий закупок и потребностей."
        actions={
          <>
            <Badge variant="outline" className="text-[9px]">
              Закупки
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.auctions}>Аукционы</Link>
            </Button>
          </>
        }
      />
      <Card className="border-border-subtle rounded-xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Новая закупка
          </CardTitle>
          <CardDescription>
            Опишите потребность: категория, объём, сроки. Поставщики смогут участвовать в аукционе.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-bg-surface2 border-border-default rounded-xl border border-dashed p-4">
              <p className="mb-2 text-sm font-medium">Тип закупки</p>
              <div className="flex gap-2">
                {['Ткани', 'Фурнитура', 'Услуги пошива', 'Логистика'].map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="hover:bg-accent-primary/10 cursor-pointer"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href={ROUTES.brand.auctions}>← Назад к аукционам</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={getAuctionLinks()} />
    </CabinetPageContent>
  );
}
