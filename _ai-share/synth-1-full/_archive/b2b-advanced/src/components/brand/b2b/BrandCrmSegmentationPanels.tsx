'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  summarizeBrandCrmSegmentQuery,
  sortBrandCrmSegments,
  type BrandCrmSegmentObject,
} from '@/lib/b2b/brand-crm-segment-object';
import { fetchBrandCrmSegments, patchBrandCrmSegment, reorderBrandCrmSegments } from '@/lib/b2b/brand-crm-segments-store';
import { BrandCrmShopBuyerAssignPanel } from '@/components/brand/b2b/BrandCrmShopBuyerAssignPanel';
import { buildBrandCrmSegmentationSession } from '@/lib/b2b/brand-crm-segmentation';
import { ROUTES } from '@/lib/routes';
import { Loader2, Store, Users, ChevronDown, ChevronUp } from 'lucide-react';

type Props = {
  collectionId?: string;
};

function useBrandCrmSegments() {
  const [segments, setSegments] = useState<BrandCrmSegmentObject[]>([]);
  const [storageMode, setStorageMode] = useState<'pg' | 'file' | 'memory' | 'demo'>('demo');
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await fetchBrandCrmSegments();
    setSegments(sortBrandCrmSegments(result.segments));
    setStorageMode(result.storageMode);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await reload();
      } finally {
        setLoading(false);
      }
    })();
  }, [reload]);

  const saveSegment = async (
    segmentKey: string,
    patch: { defaultNetTermDays?: number; firstOrderDiscountPct?: number | null }
  ) => {
    setBusyKey(segmentKey);
    try {
      const result = await patchBrandCrmSegment({ segmentKey, ...patch });
      if (result.ok) {
        setSegments(sortBrandCrmSegments(result.segments));
        setStorageMode(result.storageMode);
      } else {
        await reload();
      }
    } finally {
      setBusyKey(null);
    }
  };

  const reorderSegment = async (segmentKey: string, direction: 'up' | 'down') => {
    const ordered = sortBrandCrmSegments(segments);
    const index = ordered.findIndex((segment) => segment.segmentKey === segmentKey);
    if (index < 0) return;
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= ordered.length) return;
    const nextKeys = ordered.map((segment) => segment.segmentKey);
    [nextKeys[index], nextKeys[swapWith]] = [nextKeys[swapWith]!, nextKeys[index]!];
    setBusyKey(segmentKey);
    try {
      const result = await reorderBrandCrmSegments(nextKeys);
      if (result.ok) {
        setSegments(sortBrandCrmSegments(result.segments));
        setStorageMode(result.storageMode);
      } else {
        await reload();
      }
    } finally {
      setBusyKey(null);
    }
  };

  return { segments, storageMode, loading, busyKey, saveSegment, reorderSegment, reload };
}

export function BrandCrmSegmentationSegmentsPanel({ collectionId }: Props) {
  const { segments, storageMode, loading, busyKey, saveSegment, reorderSegment } = useBrandCrmSegments();
  const session = buildBrandCrmSegmentationSession({ collectionId });
  const orderedSegments = useMemo(() => sortBrandCrmSegments(segments), [segments]);

  return (
    <div className="space-y-4" data-testid="brand-crm-segmentation-segments-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" data-testid={`brand-crm-segments-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG segments' : `Local ${storageMode}`}
        </Badge>
        <Button size="sm" variant="outline" asChild>
          <Link href={session.orderCommsHref}>Трекинг заказа</Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-base">Customer segments</CardTitle>
          </div>
          <CardDescription>
            Persisted segment object · editable net terms / first-order discount.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {loading ? (
            <p className="text-text-secondary col-span-2 text-sm">Загрузка сегментов…</p>
          ) : segments.length === 0 ? (
            <p className="text-text-secondary col-span-2 text-sm" data-testid="brand-crm-segments-empty">
              Нет сегментов — проверьте PG seed.
            </p>
          ) : (
            orderedSegments.map((segment, index) => {
              const queryChips = summarizeBrandCrmSegmentQuery(segment.query);
              const groupId = segment.customerGroupId ?? segment.segmentKey;
              const busy = busyKey === segment.segmentKey;
              return (
                <div
                  key={segment.id}
                  className="border-border-default flex flex-col rounded-xl border p-4"
                  data-testid={`brand-crm-segment-${segment.segmentKey}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{segment.nameRu}</p>
                      <p className="text-text-secondary mt-1 text-xs">Tier: {segment.defaultPriceTier}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={busy || index === 0}
                        onClick={() => void reorderSegment(segment.segmentKey, 'up')}
                        data-testid={`brand-crm-segment-up-${segment.segmentKey}`}
                        aria-label={`Поднять ${segment.nameRu}`}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={busy || index === orderedSegments.length - 1}
                        onClick={() => void reorderSegment(segment.segmentKey, 'down')}
                        data-testid={`brand-crm-segment-down-${segment.segmentKey}`}
                        aria-label={`Опустить ${segment.nameRu}`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Badge variant="outline">{segment.segmentKey}</Badge>
                    </div>
                  </div>
                  {queryChips.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {queryChips.map((chip) => (
                        <Badge key={chip} variant="secondary" className="text-[9px]">
                          {chip}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <label className="text-xs">
                      Net terms (дн.)
                      <Input
                        type="number"
                        className="mt-1 h-8 font-mono text-xs"
                        defaultValue={segment.defaultNetTermDays}
                        disabled={busy}
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          if (Number.isFinite(next) && next !== segment.defaultNetTermDays) {
                            void saveSegment(segment.segmentKey, { defaultNetTermDays: next });
                          }
                        }}
                        data-testid={`brand-crm-net-${segment.segmentKey}`}
                      />
                    </label>
                    <label className="text-xs">
                      First order −%
                      <Input
                        type="number"
                        className="mt-1 h-8 font-mono text-xs"
                        defaultValue={segment.firstOrderDiscountPct ?? ''}
                        disabled={busy}
                        onBlur={(e) => {
                          const raw = e.target.value.trim();
                          const next = raw === '' ? null : Number(raw);
                          if (!Number.isFinite(next as number) && next !== null) return;
                          if (next !== (segment.firstOrderDiscountPct ?? null)) {
                            void saveSegment(segment.segmentKey, { firstOrderDiscountPct: next });
                          }
                        }}
                        data-testid={`brand-crm-discount-${segment.segmentKey}`}
                      />
                    </label>
                  </div>
                  {busy ? (
                    <p className="text-text-secondary mt-2 flex items-center gap-1 text-[10px]">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                    </p>
                  ) : null}
                  <Button size="sm" variant="ghost" className="mt-2 self-start px-0" asChild>
                    <Link href={`${ROUTES.brand.priceLists}?group=${groupId}`}>Price list →</Link>
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandCrmSegmentationPricelistPanel({ collectionId }: Props) {
  const session = buildBrandCrmSegmentationSession({ collectionId });

  return (
    <div className="space-y-4" data-testid="brand-crm-segmentation-pricelist-panel">
      <BrandCrmShopBuyerAssignPanel collectionId={collectionId} />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Price lists · tiers</CardTitle>
          <CardDescription>Segment → price list versions → shop matrix sync.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.priceListsHref} data-testid="brand-crm-pricelist-deep-link">
              Price lists workspace
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={ROUTES.brand.companyAccounts}>Company accounts</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopMarginPricelistHref}>Прайс-лист маржи магазина</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandCrmSegmentationShowroomPanel({ collectionId }: Props) {
  const session = buildBrandCrmSegmentationSession({ collectionId });

  return (
    <div className="space-y-4" data-testid="brand-crm-segmentation-showroom-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Store className="h-4 w-4" />
            <CardTitle className="text-base">Шоурум · доступ покупателя</CardTitle>
          </div>
          <CardDescription>Segment-gated linesheets · brand preview → shop buy.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.brandShowroomPreviewHref} data-testid="brand-crm-showroom-brand-link">
              Brand showroom
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.shopShowroomHref}>Шоурум магазина</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.retailersHref}>Retailers registry</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
