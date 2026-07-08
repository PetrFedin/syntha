'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLocations, getStockByLocation } from '@/lib/b2b/multi-location-inventory';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getProductionLinks } from '@/lib/data/entity-links';
import { Package, ArrowLeft, MapPin } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

export default function MultiLocationInventoryPage() {
  const locations = getLocations();
  const stocks = locations.flatMap((loc) =>
    getStockByLocation(loc.id).map((s) => ({ ...s, locationName: loc.name }))
  );

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Остатки по складам"
        leadPlain="Москва, СПб, регионы — остатки по локациям."
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.warehouse} aria-label="Назад к складу">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={<MapPin className="size-6 shrink-0 text-muted-foreground" aria-hidden />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Склады</CardTitle>
          <CardDescription>Локации для учёта остатков.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {locations.map((l) => (
            <div
              key={l.id}
              className="border-border-default flex items-center gap-3 rounded-xl border p-4"
            >
              <div className="bg-accent-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Package className="text-accent-primary h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{l.name}</p>
                {l.city && <p className="text-text-secondary text-xs">{l.city}</p>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Остатки по SKU</CardTitle>
          <CardDescription>Данные из localStorage (мок). В проде — API.</CardDescription>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (
            <div className="text-text-secondary py-8 text-center text-sm">
              <Package className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p>Нет данных. Настройте синхронизацию с ERP.</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={ROUTES.brand.integrationsErpPlm}>ERP 1С / Мой Склад</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">SKU</th>
                    <th className="py-2 text-left">Локация</th>
                    <th className="py-2 text-right">Доступно</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => (
                    <tr key={`${s.productId}-${s.locationId}`} className="border-b">
                      <td className="py-2 font-mono">{s.sku}</td>
                      <td className="py-2">{s.locationName}</td>
                      <td className="py-2 text-right tabular-nums">{s.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.warehouse}>Склад</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.integrationsErpPlm}>ERP</Link>
        </Button>
      </div>
      <RelatedModulesBlock links={getProductionLinks()} title="Логистика" />
    </CabinetPageContent>
  );
}
