'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, CreditCard } from 'lucide-react';
import { getTbybB2CLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { listTbybOrders } from '@/lib/api';
import type { TBYBOrder } from '@/lib/client/try-before-you-buy-b2c';

const statusLabels: Record<TBYBOrder['status'], string> = {
  hold_placed: 'Средства захолдированы',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  purchased: 'Оплачено',
  returned: 'Возврат',
  hold_released: 'Холд снят',
  cancelled: 'Отменён',
};

export default function TryBeforeYouBuyPage() {
  const links = getTbybB2CLinks();
  const [orders, setOrders] = useState<TBYBOrder[]>([]);

  useEffect(() => {
    listTbybOrders().then(setOrders);
  }, []);

  return (
    <div className="container max-w-4xl space-y-6 py-6 pb-24">
      <ClientCabinetSectionHeader description="Примерка с холдированием средств. Заказы, клиент, возвраты." />

      <Card className="border-accent-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="text-accent-primary h-4 w-4" />
            Мои примерки
          </CardTitle>
          <CardDescription>
            Товары на примерку: холд по карте, доставка, решение — купить или вернуть.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {o.orderId} · {o.holdAmountRub.toLocaleString('ru')} ₽ (холд)
                </p>
                <p className="text-text-secondary text-xs">
                  {o.items.map((i) => i.name).join(', ')} · {statusLabels[o.status]}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {statusLabels[o.status]}
              </Badge>
            </div>
          ))}
          <p className="text-text-muted mt-3 text-xs">
            API: TRY_BEFORE_YOU_BUY_B2C_API — create, confirm purchase, return. Не B2B matrix.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Связанные модули</CardTitle>
          <CardDescription>Заказы, клиент, возвраты</CardDescription>
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
