'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { b2bV1SynthaActorRoleHeaders } from '@/lib/auth/b2b-v1-api-client-headers';
import { parseOperationalOrderV1DetailResponse } from '@/lib/order/operational-order-dto.schema';
import type { OperationalOrderIntegration } from '@/lib/integrations/spine/integration-external-ref.schema';
import { B2bOrderIntegrationBadge } from '@/components/b2b/B2bOrderIntegrationBadge';
import { B2bOrderChainStatusCard } from '@/components/b2b/B2bOrderChainStatusCard';
import { BrandAllocationSpinePanel } from '@/components/integrations/BrandAllocationSpinePanel';
import { BrandOrderShipmentSpineStrip } from '@/components/integrations/BrandOrderShipmentSpineStrip';
import { ShopOrderShipmentTrackingStrip } from '@/components/integrations/ShopOrderShipmentTrackingStrip';
import { SpineOrderExportStrip } from '@/components/integrations/SpineOrderExportStrip';
import {
  formatWholesaleOrderDisplayId,
  integrationPlatformLabelRu,
  mapOperationalStatusLabelRu,
  wholesaleOrderKindLabelRu,
} from '@/lib/integrations/spine/integration-ui-utils';
import { ROUTES, brandMessagesB2bOrderContextHref, shopMessagesB2bOrderContextHref, shopB2bWorkingOrderOrderContextHref } from '@/lib/routes';

type Props = {
  orderId: string;
  variant: 'brand' | 'shop';
};

/** Detail для INT-* wholesale orders (столп 3 · operational v1, не W2). */
export function OperationalImportedOrderDetailCard({ orderId, variant }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chainReloadNonce, setChainReloadNonce] = useState(0);
  const [order, setOrder] = useState<{
    wholesaleOrderId: string;
    status: string;
    shop: string;
    brand: string;
    amount: string;
    date: string;
    deliveryDate: string;
    integration?: OperationalOrderIntegration;
    items: Array<{ productId?: string; size?: string; quantity?: number; price?: number }>;
    orderNotes?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(`/api/b2b/v1/operational-orders/${encodeURIComponent(orderId)}`, {
          headers: {
            ...b2bV1SynthaActorRoleHeaders(variant === 'shop' ? 'shop' : 'brand'),
          },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('not found');
        const parsed = parseOperationalOrderV1DetailResponse(await res.json());
        if (!parsed.success) throw new Error('parse');
        if (!cancelled) {
          setOrder(parsed.data.data.order);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setOrder(null);
          setError('Operational order не найден');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, variant]);

  if (loading) {
    return (
      <p className="text-text-secondary py-6 text-center text-sm" data-testid="imported-order-detail-loading">
        Загрузка внешнего оптового заказа…
      </p>
    );
  }

  if (error || !order) {
    return (
      <Card data-testid="imported-order-detail-error">
        <CardContent className="py-6 text-center text-sm text-amber-900">{error}</CardContent>
      </Card>
    );
  }

  const messagesHref =
    variant === 'brand'
      ? brandMessagesB2bOrderContextHref(orderId)
      : shopMessagesB2bOrderContextHref(orderId);

  return (
    <div className="space-y-4" data-testid="imported-order-detail-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            {wholesaleOrderKindLabelRu(orderId)}
          </CardTitle>
          <B2bOrderIntegrationBadge
            wholesaleOrderId={orderId}
            integration={order.integration ?? undefined}
          />
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-text-muted text-xs">Заказ</span>
            <p className="font-mono text-xs">{formatWholesaleOrderDisplayId(order.wholesaleOrderId)}</p>
          </div>
          <div>
            <span className="text-text-muted text-xs">Статус</span>
            <p>
              <Badge variant="outline">{mapOperationalStatusLabelRu(order.status)}</Badge>
            </p>
          </div>
          <div>
            <span className="text-text-muted text-xs">{variant === 'brand' ? 'Магазин' : 'Бренд'}</span>
            <p>{variant === 'brand' ? order.shop : order.brand}</p>
          </div>
          <div>
            <span className="text-text-muted text-xs">Сумма</span>
            <p>{order.amount}</p>
          </div>
          {order.integration?.sourcePlatform ? (
            <div>
              <span className="text-text-muted text-xs">Платформа</span>
              <p>{integrationPlatformLabelRu(order.integration.sourcePlatform)}</p>
            </div>
          ) : null}
          {order.integration?.lastSyncedAt ? (
            <div>
              <span className="text-text-muted text-xs">Синхрон</span>
              <p className="text-xs">{order.integration.lastSyncedAt}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <B2bOrderChainStatusCard orderId={orderId} variant={variant} productionPillar={false} />

      {variant === 'brand' ? <BrandAllocationSpinePanel orderId={orderId} /> : null}

      <SpineOrderExportStrip
        orderId={orderId}
        variant={variant}
        reloadNonce={chainReloadNonce}
        onExportDone={() => setChainReloadNonce((n) => n + 1)}
      />

      {variant === 'brand' ? (
        <BrandOrderShipmentSpineStrip
          orderId={orderId}
          sourcePlatform={order.integration?.sourcePlatform}
        />
      ) : (
        <ShopOrderShipmentTrackingStrip wholesaleOrderId={orderId} />
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Строки заказа</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU / product</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Цена</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((line, i) => (
                <TableRow key={`${line.productId}-${i}`}>
                  <TableCell>{line.productId ?? '—'}</TableCell>
                  <TableCell>{line.size ?? '—'}</TableCell>
                  <TableCell>{line.quantity ?? '—'}</TableCell>
                  <TableCell>{line.price ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link href={messagesHref} className="text-accent-primary font-medium hover:underline">
          Чат по заказу
        </Link>
        {variant === 'shop' ? (
          <Link
            href={shopB2bWorkingOrderOrderContextHref(orderId)}
            className="text-accent-primary font-medium hover:underline"
            data-testid="imported-order-detail-working-order-link"
          >
            Рабочий заказ
          </Link>
        ) : null}
        <Link href={ROUTES.brand.integrationsWebhooks} className="text-accent-primary font-medium hover:underline">
          {order.integration?.sourcePlatform
            ? `${integrationPlatformLabelRu(order.integration.sourcePlatform)} · настройки`
            : 'Настройки B2B-каналов'}
        </Link>
      </div>
    </div>
  );
}
