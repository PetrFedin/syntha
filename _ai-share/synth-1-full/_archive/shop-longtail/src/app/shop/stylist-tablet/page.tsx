'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, ArrowLeft, ShoppingCart, Users } from 'lucide-react';
import { getEndlessStylistLinks } from '@/lib/data/entity-links';
import { listStylistLooks } from '@/lib/api';
import type { StylistLook } from '@/lib/shop/endless-stylist';
import { ROUTES } from '@/lib/routes';

export default function EndlessStylistTabletPage() {
  const links = getEndlessStylistLinks();
  const [looks, setLooks] = useState<StylistLook[]>([]);

  useEffect(() => {
    listStylistLooks().then(setLooks);
  }, []);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.shop.clienteling}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Endless Stylist Tablet</h1>
          <p className="text-text-secondary text-sm">
            Сборка полного образа из онлайн-каталога на планшете продавца. Связь с клиентингом,
            каталогом и заказами.
          </p>
        </div>
      </div>

      <Card className="border-accent-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <LayoutGrid className="text-accent-primary h-4 w-4" />
            Последние образы
          </CardTitle>
          <CardDescription>Образы, собранные на планшете в магазине</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {looks.map((look) => (
            <div
              key={look.id}
              className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{look.items.map((i) => i.name).join(' + ')}</p>
                {look.customerId && (
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    Клиент привязан
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm">
                Оформить заказ
              </Button>
            </div>
          ))}
          <p className="text-text-muted mt-3 text-xs">
            API: ENDLESS_STYLIST_API — образы, каталог, создание заказа из образа.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Связанные модули</CardTitle>
          <CardDescription>Клиентинг, каталог, заказы</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <Link href={l.href}>{l.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
