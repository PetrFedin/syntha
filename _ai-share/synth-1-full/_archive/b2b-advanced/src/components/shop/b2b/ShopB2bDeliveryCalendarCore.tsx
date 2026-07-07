'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Truck } from 'lucide-react';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { formatWholesaleOrderDisplayId } from '@/lib/integrations/spine/integration-ui-utils';
import { ROUTES, shopB2bOrderHref, shopCalendarB2bOrderContextHref } from '@/lib/routes';

type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  kind: string;
  b2bOrderId?: string;
};

function formatRuDate(iso: string): string {
  const d = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return iso;
  return new Date(`${d}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Shop · столп 3/5 · окна поставки из spine + W2 calendar-events (не mock JOOR). */
export function ShopB2bDeliveryCalendarCore() {
  const collectionId = PLATFORM_CORE_DEMO.collectionId;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/platform-core/calendar-events?collectionId=${encodeURIComponent(collectionId)}`,
          { cache: 'no-store' }
        );
        const json = (await res.json()) as { ok?: boolean; events?: CalendarEvent[] };
        if (!cancelled) {
          if (res.ok && json.ok && Array.isArray(json.events)) {
            setEvents(json.events.filter((e) => e.kind === 'delivery_window'));
            setLoadState('ready');
          } else {
            setLoadState('error');
          }
        }
      } catch {
        if (!cancelled) setLoadState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [events]
  );

  return (
    <Card className="mb-6" data-testid="shop-b2b-delivery-calendar-core">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
          <Truck className="h-4 w-4" /> Окна поставки
        </CardTitle>
        <CardDescription>
          Даты отгрузки по коллекции и импортированным оптовым заказам — синхронизация с календарём
          коммуникаций.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadState === 'loading' ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Загрузка окон поставки…
          </p>
        ) : null}
        {loadState === 'error' ? (
          <p className="text-sm text-amber-900" data-testid="shop-b2b-delivery-calendar-error">
            Не удалось загрузить календарь. Проверьте подключение к Platform Core.
          </p>
        ) : null}
        {loadState === 'ready' && sorted.length === 0 ? (
          <div
            className="border-border-subtle space-y-3 rounded-xl border border-dashed p-6 text-center"
            data-testid="shop-b2b-delivery-calendar-empty"
          >
            <p className="text-text-secondary text-sm">
              Окна поставки появятся после подтверждения заказов и синхронизации B2B-каналов.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.shop.b2bOrders}>Оптовый реестр</Link>
            </Button>
          </div>
        ) : null}
        {loadState === 'ready'
          ? sorted.map((w) => {
              const orderId = w.b2bOrderId?.trim();
              const orderLabel = orderId ? formatWholesaleOrderDisplayId(orderId) : null;
              return (
                <div
                  key={w.id}
                  className="border-border-subtle bg-bg-surface2/80 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                  data-testid={`shop-b2b-delivery-window-${w.id}`}
                >
                  <div className="space-y-1">
                    <p className="text-text-primary font-bold">{w.title.replace(/^Окно поставки · /, '')}</p>
                    <p className="text-text-secondary text-xs">
                      {formatRuDate(w.startAt)} — {formatRuDate(w.endAt)}
                    </p>
                    {orderLabel ? (
                      <Badge variant="outline" className="text-[9px]">
                        {orderLabel}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {orderId ? (
                      <>
                        <Button variant="outline" size="sm" className="text-[10px] font-black uppercase" asChild>
                          <Link href={shopB2bOrderHref(orderId)}>Заказ</Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase" asChild>
                          <Link href={shopCalendarB2bOrderContextHref(orderId)}>Календарь</Link>
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" className="text-[10px] font-black uppercase" asChild>
                        <Link href={ROUTES.shop.b2bCreateOrder}>Новый заказ</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          : null}
      </CardContent>
    </Card>
  );
}
