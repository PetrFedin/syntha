'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCcw, ShieldCheck, ShoppingCart, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import {
  getReplenishmentRecommendations,
  type ReplenishmentRecommendation,
} from '@/lib/b2b/replenishment-recommendations';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { cn } from '@/lib/utils';

type Props = {
  collectionId?: string;
};

export function OrderReplenishTab({ collectionId = 'SS27' }: Props) {
  const coreMode = isPlatformCoreMode();
  const { buyerId } = useShopCoreBuyerId();
  const [recommendations, setRecommendations] = useState<ReplenishmentRecommendation[]>(() =>
    coreMode ? [] : getReplenishmentRecommendations().slice(0, 6)
  );
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    coreMode ? 'loading' : 'ready'
  );
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    if (!coreMode) {
      setRecommendations(getReplenishmentRecommendations().slice(0, 6));
      setLoadState('ready');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    void (async () => {
      try {
        const res = await fetch(
          `/api/shop/b2b/replenishment/suggest?collection=${encodeURIComponent(collectionId)}&buyerId=${encodeURIComponent(buyerId)}&limit=6`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          recommendations?: ReplenishmentRecommendation[];
          source?: string;
        };
        if (cancelled) return;
        if (res.ok && json.ok && Array.isArray(json.recommendations)) {
          setRecommendations(json.recommendations);
          setSource(json.source ?? null);
          setLoadState('ready');
          return;
        }
        setRecommendations([]);
        setLoadState('error');
      } catch {
        if (!cancelled) {
          setRecommendations([]);
          setLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [coreMode, collectionId, buyerId]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 gap-3 text-left lg:grid-cols-2">
        <Card className="space-y-6 rounded-xl border-none bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-tight">
                Рекомендации к пополнению
              </h4>
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                {coreMode
                  ? `Spine + ATP · ${collectionId}${source ? ` · ${source}` : ''}`
                  : 'По sell-through и остатку · Дозаказать X шт. или не дозаказывать'}
              </p>
            </div>
            <RefreshCcw
              className={cn(
                'text-accent-primary h-8 w-8',
                loadState === 'loading' && 'animate-spin'
              )}
            />
          </div>
          <div className="space-y-4">
            {loadState === 'loading' ? (
              <p className="text-text-secondary text-[10px] font-bold uppercase">Загрузка…</p>
            ) : recommendations.length === 0 ? (
              <p className="text-text-secondary text-[10px] font-bold uppercase">
                {loadState === 'error'
                  ? 'Нет данных из PG — оформите заказ SS27 или проверьте bootstrap.'
                  : 'Нет данных. Оформите заказы — появятся подсказки.'}
              </p>
            ) : (
              recommendations.map((r) => (
                <div
                  key={`${r.orderId}-${r.sku}`}
                  className={cn(
                    'flex items-center justify-between rounded-2xl border p-4',
                    r.action === 'reorder'
                      ? 'bg-accent-primary/15 border-accent-primary/20'
                      : 'bg-bg-surface2 border-border-subtle'
                  )}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-text-primary truncate text-xs font-black uppercase">
                      {r.productName}
                    </p>
                    <p className="text-text-muted text-[9px] font-bold uppercase">
                      Sell-through {Math.round(r.sellThroughRate * 100)}% · Продано: {r.soldQty} ·
                      Остаток: {r.currentStock}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    {r.action === 'reorder' ? (
                      <>
                        <div className="text-right">
                          <p className="text-accent-primary text-sm font-black">
                            +{r.suggestedQty} шт.
                          </p>
                          <p className="text-text-muted text-[8px] font-black uppercase">
                            Дозаказать
                          </p>
                        </div>
                        <Button
                          className="bg-text-primary h-10 rounded-xl px-6 text-[9px] font-black uppercase text-white"
                          asChild
                        >
                          <Link
                            href={`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}&sku=${encodeURIComponent(r.sku)}`}
                          >
                            Apply
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Minus className="text-text-muted h-5 w-5" />
                        <Badge variant="secondary" className="text-[8px] font-black">
                          Не дозаказывать
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <Button
            className="bg-accent-primary shadow-accent-primary/10 h-10 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl"
            asChild
          >
            <Link href={`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`}>
              <ShoppingCart className="mr-2 h-3.5 w-3.5" /> В матрицу заказа
            </Link>
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="bg-text-primary rounded-xl border-none p-3 text-white shadow-xl">
            <h4 className="mb-4 text-base font-black uppercase tracking-tight">Stock Protection</h4>
            <p className="text-text-muted mb-8 text-sm font-medium">
              Automatically reserves stock from incoming factory shipments when your local inventory
              drops below **15%** of weekly average sales.
            </p>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Auto-Reserve Active
                </span>
              </div>
              <div className="flex h-5 w-10 cursor-pointer items-center justify-end rounded-full bg-emerald-500 px-1">
                <div className="h-3.5 w-3.5 rounded-full bg-white" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
