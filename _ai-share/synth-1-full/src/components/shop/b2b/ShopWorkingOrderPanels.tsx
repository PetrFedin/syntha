'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopWorkingOrderSpinePanel } from '@/components/integrations/ShopWorkingOrderSpinePanel';
import { PlatformCoreWmsReserveStrip } from '@/components/platform/PlatformCoreWmsReserveStrip';
import { buildShopWorkingOrderSession } from '@/lib/b2b/shop-working-order-session';
import { shopB2bOrderHref } from '@/lib/routes';

type Props = {
  wholesaleOrderId: string;
  collectionId?: string;
};

export function ShopWorkingOrderVersionsPanel({ wholesaleOrderId, collectionId }: Props) {
  const session = buildShopWorkingOrderSession({ wholesaleOrderId, collectionId });

  return (
    <div className="space-y-4" data-testid="shop-working-order-versions-panel">
      <PlatformCoreWmsReserveStrip
        variant="workspace"
        checkoutHref={session.checkoutHref}
        trackingHref={session.orderCommsHref}
      />
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Заказ: {session.wholesaleOrderId}</Badge>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.bulkHref}>Оптовый ввод</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.handoffHref}>Передача</Link>
        </Button>
      </div>
      <ShopWorkingOrderSpinePanel wholesaleOrderId={wholesaleOrderId} collectionId={collectionId} />
    </div>
  );
}

export function ShopWorkingOrderBulkPanel({ wholesaleOrderId, collectionId }: Props) {
  const session = buildShopWorkingOrderSession({ wholesaleOrderId, collectionId });

  return (
    <div className="space-y-4" data-testid="shop-working-order-bulk-panel">
      <PlatformCoreWmsReserveStrip
        variant="workspace"
        checkoutHref={session.checkoutHref}
        trackingHref={session.orderCommsHref}
      />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Оптовый ввод</CardTitle>
          <CardDescription>Пополнение → матрица → препак → версии рабочего заказа.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.matrixHref}>Совместная матрица</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.replenishmentHref}>Пополнение ATP</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.versionsHref}>Версии</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function ShopWorkingOrderHandoffPanel({ wholesaleOrderId, collectionId }: Props) {
  const session = buildShopWorkingOrderSession({ wholesaleOrderId, collectionId });

  return (
    <div className="space-y-4" data-testid="shop-working-order-handoff-panel">
      <PlatformCoreWmsReserveStrip
        variant="workspace"
        checkoutHref={session.checkoutHref}
        trackingHref={session.orderCommsHref}
      />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Передача · связь</CardTitle>
          <CardDescription>Подтверждение экспорта → согласования → чат заказа.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={shopB2bOrderHref(wholesaleOrderId)}>Карточка заказа</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.collaborativeHref}>Согласования совместного заказа</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.messagesHref}>Чат заказа</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.brandOrderHandoffHref}>Передача бренда</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
