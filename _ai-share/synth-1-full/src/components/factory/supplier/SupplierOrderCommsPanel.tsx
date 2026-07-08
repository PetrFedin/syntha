'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { PlatformCoreWmsReserveStrip } from '@/components/platform/PlatformCoreWmsReserveStrip';
import { SupplierCommsBrandPushStrip } from '@/components/factory/supplier/SupplierCommsBrandPushStrip';
import { SupCmOrderContextPeerStrip } from '@/components/factory/supplier/SupCmOrderContextPeerStrip';
import { FactoryCommsAttachTzComposeStrip } from '@/components/factory/FactoryCommsAttachTzComposeStrip';
import { Calendar, MessageSquare, Package } from 'lucide-react';

type Props = {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
};

export function SupplierOrderCommsPanel({ orderId, collectionId, articleId }: Props) {
  const session = buildSupplierOrderCommsSession({ orderId, collectionId, articleId });

  return (
    <div className="space-y-4" data-testid="supplier-order-comms-panel">
      <SupCmOrderContextPeerStrip
        collectionId={session.collectionId}
        articleId={session.articleId}
        orderId={session.orderId}
      />
      <SupplierCommsBrandPushStrip
        collectionId={session.collectionId}
        articleId={session.articleId}
        orderId={session.orderId}
      />
      <FactoryCommsAttachTzComposeStrip variant="supplier" />
      <PlatformCoreWmsReserveStrip
        variant="supplier"
        brandHandoffHref={session.brandOrderHandoffHref}
        shopTrackingHref={session.shopTrackingHref}
        testId="supplier-order-comms-wms-reserve-strip"
      />
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <CardTitle className="text-base">Чат по заказу</CardTitle>
          </div>
          <CardDescription>
            Столп 5 · B2B PO {session.orderId} · связи бренд / магазин / производство.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.messagesHref} data-testid="supplier-order-comms-messages-link">
              Открыть сообщения
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.calendarHref}>
              <Calendar className="mr-1 h-3 w-3" />
              Календарь заказа
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.entitiesHref}>Треды сущностей</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.orderTabHref}>Вкладка заказа</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Package className="h-4 w-4" />
            <CardTitle className="text-base">Цепочка закупок</CardTitle>
          </div>
          <CardDescription>
            MRP-поставка → BOM бренда → трекинг магазина → заказ на производство.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={session.supplyTabHref}>MRP-поставка</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.brandBomHref}>BOM бренда</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopTrackingHref}>Трекинг магазина</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopOrderCommsHref}>Чат заказа магазина</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopLandedMarginHref}>Маржа магазина</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopMatrixHref}>Матрица магазина</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.brandOrderChatHref}>Чат заказа бренда</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.brandOrderHandoffHref}>Передача бренда</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.replenishmentAtpHref}>Пополнение ATP</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.inventoryOverviewHref}>Склад магазина</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.manufacturerOrderHref}>Чат заказа производства</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
