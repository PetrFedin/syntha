'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Store, Package, Percent } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';

/** RepSpark: Custom Assortments — персональный ассортимент под ритейлера */
const MOCK_ASSORTMENTS = [
  {
    id: 'a1',
    retailerName: 'Сеть «Мода»',
    productCount: 120,
    discount: 5,
    validTo: '2026-06-30',
    status: 'active',
  },
  {
    id: 'a2',
    retailerName: 'Concept Store SPb',
    productCount: 45,
    discount: 10,
    validTo: '2026-04-15',
    status: 'active',
  },
  {
    id: 'a3',
    retailerName: 'Outdoor Pro',
    productCount: 80,
    discount: 0,
    validTo: '2026-05-01',
    status: 'draft',
  },
];

export default function CustomAssortmentsPage() {
  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6">
      <ShopB2bContentHeader lead="Персональный ассортимент под вашу сеть: бренд формирует подборку SKU (сценарий RepSpark / Custom Assortments)." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ваши персональные подборки</CardTitle>
          <CardDescription>
            Бренды назначают вам индивидуальный ассортимент — только релевантные позиции
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_ASSORTMENTS.map((a) => (
            <div
              key={a.id}
              className="border-border-default hover:border-accent-primary/30 flex items-center justify-between rounded-xl border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <Store className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">{a.retailerName}</p>
                  <p className="text-text-secondary mt-0.5 flex items-center gap-2 text-xs">
                    <Package className="h-3 w-3" /> {a.productCount} позиций
                    {a.discount > 0 && (
                      <span className="flex items-center gap-1">
                        <Percent className="h-3 w-3" /> −{a.discount}%
                      </span>
                    )}
                    · до {a.validTo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={a.status === 'active' ? 'default' : 'secondary'}>
                  {a.status === 'active' ? 'Активна' : 'Черновик'}
                </Badge>
                <Button size="sm" asChild>
                  <Link href={`${ROUTES.shop.b2bCatalog}?assortment=${a.id}`}>Смотреть</Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bCatalog}>Каталог</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bCreateOrder}>Написание заказа</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
