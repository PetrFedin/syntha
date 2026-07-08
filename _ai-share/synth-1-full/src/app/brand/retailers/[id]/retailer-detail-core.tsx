'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Package } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import {
  ROUTES,
  brandB2bOrderHref,
  brandB2bOrdersRegistryHref,
  brandMessagesB2bOrderContextHref,
} from '@/lib/routes';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { fmtMoney } from '@/lib/format';
import { PLATFORM_CORE_RETAILER_NO_ORDERS_RU } from '@/lib/platform-core-user-messages';

type W2OrderRow = {
  id: string;
  status: string;
  totalRub: number;
  createdAt?: string;
};

type Props = {
  retailerId: string;
  retailerName: string;
};

export function BrandRetailerDetailCorePage({ retailerId, retailerName }: Props) {
  const [w2Orders, setW2Orders] = useState<W2OrderRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/brand/retailers/${encodeURIComponent(retailerId)}/b2b-orders`
        );
        const json = (await res.json()) as { ok?: boolean; orders?: W2OrderRow[] };
        if (!cancelled && json.ok && Array.isArray(json.orders)) {
          setW2Orders(json.orders);
        }
      } catch {
        if (!cancelled) setW2Orders([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retailerId]);

  return (
    <CabinetPageContent
      maxWidth="5xl"
      className="space-y-6 px-4 py-6 pb-24 sm:px-6"
      data-testid="brand-co-retailer-detail-panel"
      data-audit-legacy="brand-retailer-detail-core"
    >
      <PlatformCoreListChrome
        highlightRole="brand"
        pillarId="collection_order"
        entityLabel={retailerName}
      >
        <div
          className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
          data-testid="brand-co-retailer-detail-context-strip"
        >
          <Link
            href={ROUTES.brand.retailers}
            data-testid="brand-co-retailer-detail-back-link"
            className="text-accent-primary font-medium hover:underline"
          >
            Сеть ритейлеров
          </Link>
          <Link
            href={brandB2bOrdersRegistryHref({ partner: retailerId })}
            data-testid="brand-co-retailer-detail-orders-link"
            className="text-accent-primary font-medium hover:underline"
          >
            Заказы партнёра
          </Link>
          <Link
            href={`${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(PLATFORM_CORE_DEMO.collectionId)}&partner=${encodeURIComponent(retailerId)}`}
            data-testid="brand-co-retailer-detail-showroom-link"
            className="text-accent-primary font-medium hover:underline"
          >
            Витрина
          </Link>
          {w2Orders[0]?.id ? (
            <Link
              href={brandMessagesB2bOrderContextHref(w2Orders[0].id)}
              data-testid="brand-co-retailer-detail-chat-link"
              className="text-accent-primary font-medium hover:underline"
            >
              Чат по заказу
            </Link>
          ) : null}
        </div>
        <Card data-testid="brand-co-retailer-detail-orders-card">
          <CardHeader>
            <CardTitle className="text-sm">Оптовые заказы</CardTitle>
            <CardDescription>
              {w2Orders.length > 0
                ? `${w2Orders.length} оптовых заказ(ов) по партнёру`
                : PLATFORM_CORE_RETAILER_NO_ORDERS_RU}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {w2Orders.map((o) => (
                <Link
                  key={o.id}
                  href={brandB2bOrderHref(o.id)}
                  data-testid={`brand-co-retailer-detail-order-link-${o.id}`}
                  data-audit-legacy={`retailer-detail-order-link-${o.id}`}
                  className="hover:bg-bg-surface2 flex items-center justify-between rounded-lg border p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="text-text-muted h-4 w-4" />
                    <span className="font-mono text-sm">{o.id}</span>
                    {o.createdAt ? (
                      <span className="text-text-secondary text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{fmtMoney(o.totalRub)}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {o.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link
                href={brandB2bOrdersRegistryHref({ partner: retailerId })}
                data-testid="brand-co-retailer-detail-all-orders-link"
              >
                Все B2B-заказы
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PlatformCoreListChrome>
    </CabinetPageContent>
  );
}
