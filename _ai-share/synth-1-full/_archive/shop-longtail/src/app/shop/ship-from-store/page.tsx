'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, ArrowLeft, MapPin } from 'lucide-react';
import { getShipFromStoreLinks } from '@/lib/data/entity-links';
import { listShipFromStoreAssignments } from '@/lib/api';
import type { ShipFromStoreAssignment } from '@/lib/shop/ship-from-store';
import { ROUTES } from '@/lib/routes';

const statusLabels: Record<ShipFromStoreAssignment['status'], string> = {
  eligible: 'Доступен',
  assigned: 'Назначен',
  picking: 'Комплектация',
  shipped: 'Отправлен',
  cancelled: 'Отменён',
};

export default function ShipFromStorePage() {
  const links = getShipFromStoreLinks();
  const [assignments, setAssignments] = useState<ShipFromStoreAssignment[]>([]);

  useEffect(() => {
    listShipFromStoreAssignments().then(setAssignments);
  }, []);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.shop.orders}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ship-from-Store</h1>
          <p className="text-text-secondary text-sm">
            Отправка онлайн-заказа из ближайшей точки (омниканал). Заказы, склад, логистика, BOPIS.
          </p>
        </div>
      </div>

      <Card className="border-emerald-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-emerald-600" />
            Назначения по заказам
          </CardTitle>
          <CardDescription>Какой магазин отправил заказ клиенту.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {a.orderId} → {a.storeName}
                </p>
                <p className="text-text-secondary text-xs">
                  {a.trackingNumber
                    ? `Трек ${a.trackingNumber}`
                    : a.assignedAt.slice(0, 16).replace('T', ' ')}
                </p>
              </div>
              <Badge
                variant={a.status === 'shipped' ? 'default' : 'secondary'}
                className="text-[10px]"
              >
                {statusLabels[a.status]}
              </Badge>
            </div>
          ))}
          <p className="text-text-muted mt-3 text-xs">
            API: SHIP_FROM_STORE_API — eligible stores, assign, ship. Омниканал.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Связанные модули</CardTitle>
          <CardDescription>Заказы, склад, логистика, BOPIS</CardDescription>
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
