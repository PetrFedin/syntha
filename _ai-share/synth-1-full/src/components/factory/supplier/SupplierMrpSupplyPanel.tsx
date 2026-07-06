'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildSupplierMrpSupplySession } from '@/lib/fashion/supplier-mrp-supply';
import { supplierOrderCommsFeatureHref } from '@/lib/b2b/supplier-order-comms';
import { SupplierProcurementBrandNotifyStrip } from '@/components/factory/supplier/SupplierProcurementBrandNotifyStrip';
import { SupplierWmsReserveActionStrip } from '@/components/factory/supplier/SupplierWmsReserveActionStrip';
import { buildSupplierOrderCommsSession } from '@/lib/b2b/supplier-order-comms';
import { Boxes, Factory, ShoppingCart } from 'lucide-react';

type Props = {
  collectionId?: string;
  articleId?: string;
  orderId?: string;
};

export function SupplierMrpSupplyPanel({
  collectionId,
  articleId,
  orderId,
}: Props) {
  const session = buildSupplierMrpSupplySession({ collectionId, articleId, orderId });
  const orderComms = buildSupplierOrderCommsSession({ collectionId, articleId, orderId });

  return (
    <div className="space-y-4" data-testid="supplier-mrp-supply-panel">
      <SupplierWmsReserveActionStrip
        collectionId={session.collectionId}
        articleId={session.articleId}
        b2bOrderId={orderId}
        brandHandoffHref={orderComms.brandOrderHandoffHref}
        shopTrackingHref={orderComms.shopTrackingHref}
        testId="sup-op-procurement-wms-reserve-strip"
      />
      {orderId ? (
        <SupplierProcurementBrandNotifyStrip
          collectionId={session.collectionId}
          articleId={session.articleId}
          orderId={orderId}
        />
      ) : null}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Boxes className="h-4 w-4" />
            <CardTitle className="text-base">MRP · дефицит → PO</CardTitle>
          </div>
          <CardDescription>
            Onfinity MRP: BOM × кол-во заказа → досье материалов → BOM бренда → пополнение.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.materialsHref} data-testid="supplier-mrp-materials-link">
              Досье материалов
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.w2SupplyHref}>Поставка W2</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.brandBomHref}>BOM бренда</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.centricRfqHref}>Centric RFQ</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Factory className="h-4 w-4" />
            <CardTitle className="text-base">Связи цепочки</CardTitle>
          </div>
          <CardDescription>Столп 4 ↔ пополнение магазина ↔ производство бренда.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={session.brandProductionHref}>Операции производства бренда</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.replenishmentHref}>
              <ShoppingCart className="mr-1 h-3 w-3" />
              Пополнение магазина
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopMatrixHref}>Матрица магазина</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.shopOrderCommsHref}>Чат заказа магазина</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.shopLandedMarginHref}>Маржа магазина</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.manufacturerOrderCommsHref}>Чат заказа производства</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.supplyTabHref}>Вкладка поставки</Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={supplierOrderCommsFeatureHref(session.orderId, session.collectionId, session.articleId)}>
              Чат по заказу
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
