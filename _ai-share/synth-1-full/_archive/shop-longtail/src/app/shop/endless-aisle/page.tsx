'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, ShoppingBag } from 'lucide-react';
import { getEndlessAisleLinks } from '@/lib/data/entity-links';
import { listEndlessAisleRequests } from '@/lib/api';
import type { EndlessAisleRequest } from '@/lib/shop/endless-aisle-pos';
import { ROUTES } from '@/lib/routes';

const statusLabels: Record<EndlessAisleRequest['status'], string> = {
  created: 'Создан',
  reserved: 'Зарезервирован',
  shipping: 'В пути',
  at_store: 'В магазине',
  ready_pickup: 'Готов к выдаче',
  picked_up: 'Выдан',
  cancelled: 'Отменён',
};

export default function EndlessAislePage() {
  const links = getEndlessAisleLinks();
  const [requests, setRequests] = useState<EndlessAisleRequest[]>([]);

  useEffect(() => {
    listEndlessAisleRequests().then(setRequests);
  }, []);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.shop.bopis}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Endless Aisle POS</h1>
          <p className="text-text-secondary text-sm">
            Заказ отсутствующего размера со склада бренда из примерочной (планшет). Склад, каталог,
            BOPIS, заказы.
          </p>
        </div>
      </div>

      <Card className="border-accent-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="text-accent-primary h-4 w-4" />
            Запросы из примерочной
          </CardTitle>
          <CardDescription>
            Товар в нужном размере под заказ со склада бренда, выдача в магазине (BOPIS).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {r.requestedSku} · размер {r.sizeRequested}
                </p>
                <p className="text-text-secondary text-xs">
                  {r.orderId ? `Заказ ${r.orderId}` : 'Резерв'} · {statusLabels[r.status]}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {statusLabels[r.status]}
              </Badge>
            </div>
          ))}
          <p className="text-text-muted mt-3 text-xs">
            API: ENDLESS_AISLE_POS_API — запрос с планшета, резерв со склада, BOPIS.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Связанные модули</CardTitle>
          <CardDescription>Склад, каталог, BOPIS, заказы</CardDescription>
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
