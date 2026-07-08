'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { colorPalette } from '@/lib/colors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Palette, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';

export default function ColorsPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="Справочник цветов"
        leadPlain="Палитра для карточек товаров. Связь с Products (цвета SKU), Matrix (варианты) и PIM."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Palette className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <Badge variant="outline" className="text-[9px]">
              SKU Colors
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.products}>Products</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.productsMatrix}>
                <Layers className="mr-1 size-3" /> Matrix
              </Link>
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить цвет
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Основная палитра</CardTitle>
          <CardDescription>Эти цвета доступны для выбора в карточке товара.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {colorPalette.map((color) => (
              <div key={color.hex} className="space-y-2">
                <div
                  className="h-20 w-full rounded-md border"
                  style={{ backgroundColor: color.hex }}
                />
                <Input value={color.name} readOnly />
                <Input value={color.hex} readOnly />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
