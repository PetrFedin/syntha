'use client';

import Link from 'next/link';
import { Factory } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { shopB2bTrackingOrderHref } from '@/lib/platform-core-routes';
import { factoryProductionHandoffQueueHref, factoryProductionOrdersOrderContextHref } from '@/lib/platform-core-extended-routes';
import {
  PRODUCTION_HANDOFF_DONE_RU,
  PRODUCTION_HANDOFF_PENDING_RU,
  PRODUCTION_HANDOFF_QUEUE_RU,
} from '@/lib/platform-core-canonical-labels';

type Props = {
  orderId: string;
  variant: 'brand' | 'shop';
  poId: string;
  poHandedOff: boolean;
  collectionId: string;
  factoryId?: string;
  demoFactoryId?: string;
  poStatusLabelRu?: string;
};

export function PlatformCoreB2bOrderDetailPoCard({
  orderId,
  variant,
  poId,
  poHandedOff,
  collectionId,
  factoryId,
  demoFactoryId,
  poStatusLabelRu,
}: Props) {
  const resolvedFactoryId = factoryId ?? demoFactoryId;

  return (
    <Card
      id={variant === 'shop' ? 'shop-co-buyer-tracking' : undefined}
      data-testid="platform-core-order-po-card"
      className={poHandedOff ? 'border-emerald-200/80 bg-emerald-50/30' : 'border-amber-200/60'}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <Factory className="h-4 w-4 text-emerald-600" aria-hidden />
          Производственный заказ (PO)
        </CardTitle>
        <CardDescription className="text-xs">
          {poHandedOff
            ? poStatusLabelRu
              ? `${PRODUCTION_HANDOFF_DONE_RU} · ${poStatusLabelRu}.`
              : `${PRODUCTION_HANDOFF_DONE_RU} — производственный заказ в очереди цеха.`
            : `Производственный заказ зарезервирован — ${PRODUCTION_HANDOFF_PENDING_RU.toLowerCase()}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-xs">
        {variant === 'brand' && poHandedOff ? (
          <Link
            href={factoryProductionOrdersOrderContextHref(orderId, {
              factoryId: resolvedFactoryId,
            })}
            className="text-accent-primary font-mono text-[10px] font-semibold hover:underline"
            data-testid="platform-core-order-po"
          >
            {poId}
          </Link>
        ) : (
          <code
            className="font-mono text-[10px] font-semibold"
            data-testid="platform-core-order-po"
          >
            {poId}
          </code>
        )}
        <Badge variant={poHandedOff ? 'default' : 'outline'}>
          {poHandedOff
            ? (poStatusLabelRu ?? PRODUCTION_HANDOFF_QUEUE_RU)
            : PRODUCTION_HANDOFF_PENDING_RU}
        </Badge>
        {factoryId ? <span className="text-text-muted">· {factoryId}</span> : null}
        {variant === 'brand' ? (
          <Link
            href={factoryProductionHandoffQueueHref(orderId, {
              factoryId: resolvedFactoryId,
              collectionId,
            })}
            data-testid="brand-order-detail-factory-queue-link"
            className="text-accent-primary font-medium hover:underline"
          >
            Очередь цеха
          </Link>
        ) : (
          <Link
            href={shopB2bTrackingOrderHref(orderId)}
            data-testid="shop-co-detail-po-tracking-link"
            data-audit-legacy="shop-order-po-tracking-link"
            className="text-accent-primary font-medium hover:underline"
          >
            Трекинг заказа →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
