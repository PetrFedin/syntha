'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shirt, LayoutGrid } from 'lucide-react';
import { getDigitalWardrobeLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { listWardrobeItems, listWardrobeLooks } from '@/lib/api';
import type { WardrobeItem, WardrobeLook } from '@/lib/client/digital-wardrobe';

export default function DigitalWardrobePage() {
  const links = getDigitalWardrobeLinks();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [looks, setLooks] = useState<WardrobeLook[]>([]);

  useEffect(() => {
    listWardrobeItems().then(setItems);
    listWardrobeLooks().then(setLooks);
  }, []);

  return (
    <div className="container max-w-4xl space-y-6 py-6 pb-24">
      <ClientCabinetSectionHeader
        title="Мой гардероб"
        description="Виртуальный шкаф купленного + конструктор луков. Заказы, Body Scan, каталог."
      />

      <Card className="border-amber-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shirt className="h-4 w-4 text-amber-600" />
            Мой шкаф
          </CardTitle>
          <CardDescription>Товары из ваших заказов. Синхронизация при API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((i) => (
            <div
              key={i.id}
              className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{i.name}</p>
                <p className="text-text-secondary text-xs">
                  {i.sku} · заказ {i.orderId}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {i.category}
              </Badge>
            </div>
          ))}
          <p className="text-text-muted mt-3 text-xs">
            API: DIGITAL_WARDROBE_API — items, sync from orders, recommend.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <LayoutGrid className="h-4 w-4" />
            Мои образы
          </CardTitle>
          <CardDescription>Конструктор луков из вещей шкафа.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {looks.map((l) => (
              <li key={l.id} className="bg-bg-surface2 border-border-subtle rounded-lg border p-3">
                <p className="text-sm font-medium">{l.name ?? 'Без названия'}</p>
                <p className="text-text-secondary text-xs">Вещей в образе: {l.itemIds.length}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Связанные модули</CardTitle>
          <CardDescription>Заказы, Body Scan, каталог</CardDescription>
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
    </div>
  );
}
