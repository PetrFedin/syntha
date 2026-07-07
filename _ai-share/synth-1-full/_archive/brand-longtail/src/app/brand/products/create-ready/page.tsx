'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, CheckCircle2 } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { getProductLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';

export default function CreateReadyProductPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 pb-16">
      <SectionInfoCard
        title="Создание карточки готового товара"
        description="Товар уже произведён — создайте карточку без привязки к производственному циклу. Детальное ведение: артикул, описание, фото, размеры, цены."
        icon={Package}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              Готовый товар
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.products}>PIM</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Создать карточку готового товара</h1>

      <Card className="rounded-xl border border-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> Детальная карточка
          </CardTitle>
          <CardDescription>
            Артикул, название, коллекция, категория, состав, размерная сетка, цены, фото
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Артикул</Label>
              <Input placeholder="SS26-DRESS-01" />
            </div>
            <div className="space-y-2">
              <Label>Название</Label>
              <Input placeholder="Платье вечернее" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Описание</Label>
              <Input placeholder="Краткое описание товара" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button>Создать карточку</Button>
            <Button variant="outline" asChild>
              <Link href={ROUTES.brand.products}>Отмена</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={getProductLinks()} />
    </CabinetPageContent>
  );
}
