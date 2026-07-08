'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type {
  BrandWssiCapacityFeedRow,
  BrandWssiMixFeedRow,
} from '@/lib/fashion/brand-wssi-otb-feed';
import {
  fetchBrandWssiOtb,
  patchBrandWssiMixTarget,
  refreshBrandWssiOtb,
} from '@/lib/fashion/brand-wssi-otb-store';
import { brandWssiSupplyHref } from '@/lib/fashion/brand-wssi-plan';
import { PLATFORM_CORE_DEMO, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type Props = {
  collectionId?: string;
  articleId?: string;
};

function useBrandWssiOtbFeed(collectionId: string) {
  const [mix, setMix] = useState<BrandWssiMixFeedRow[]>([]);
  const [capacity, setCapacity] = useState<BrandWssiCapacityFeedRow[]>([]);
  const [mixSummary, setMixSummary] = useState({
    categories: 0,
    overAssorted: 0,
    underAssorted: 0,
    pgSourced: 0,
  });
  const [storageMode, setStorageMode] = useState('demo');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const res = await fetchBrandWssiOtb(collectionId);
    setMix(res.mix ?? []);
    setCapacity(res.capacity ?? []);
    setMixSummary(
      res.mixSummary ?? { categories: 0, overAssorted: 0, underAssorted: 0, pgSourced: 0 }
    );
    setStorageMode(res.storageMode ?? 'demo');
  }, [collectionId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        await reload();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  return {
    mix,
    capacity,
    mixSummary,
    storageMode,
    loading,
    reload,
    setMix,
    setMixSummary,
    setStorageMode,
  };
}

export function BrandWssiOtbPanel({
  collectionId: collectionIdProp = PLATFORM_CORE_DEMO.collectionId,
}: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection') ?? collectionIdProp,
  });
  const { mix, mixSummary, storageMode, loading, reload, setMix, setMixSummary, setStorageMode } =
    useBrandWssiOtbFeed(collectionId);
  const [busyCategory, setBusyCategory] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const saveTarget = async (category: string, targetPct: number) => {
    if (!Number.isFinite(targetPct)) return;
    setBusyCategory(category);
    try {
      const res = await patchBrandWssiMixTarget({ collectionId, category, targetPct });
      if (res.ok && res.mix) {
        setMix(res.mix);
        setMixSummary(
          res.mixSummary ?? { categories: 0, overAssorted: 0, underAssorted: 0, pgSourced: 0 }
        );
        setStorageMode(res.storageMode ?? storageMode);
      } else {
        await reload();
      }
    } finally {
      setBusyCategory(null);
    }
  };

  const syncOtb = async () => {
    setSyncBusy(true);
    try {
      const res = await refreshBrandWssiOtb(collectionId);
      if (res.ok && res.mix) {
        setMix(res.mix);
        setMixSummary(
          res.mixSummary ?? { categories: 0, overAssorted: 0, underAssorted: 0, pgSourced: 0 }
        );
        setStorageMode(res.storageMode ?? storageMode);
      } else {
        await reload();
      }
    } finally {
      setSyncBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="brand-wssi-otb-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Categories: {mixSummary.categories}</Badge>
        <Badge variant="outline">Over: {mixSummary.overAssorted}</Badge>
        <Badge variant="outline" data-testid={`brand-wssi-otb-source-${storageMode}`}>
          {storageMode === 'pg' ? 'PG OTB ledger' : `Local ${storageMode}`}
        </Badge>
        <Button size="sm" variant="outline" disabled={syncBusy} onClick={() => void syncOtb()}>
          {syncBusy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
          Sync catalog
        </Button>
      </div>
      {loading ? (
        <p className="text-text-secondary text-sm">Загрузка OTB…</p>
      ) : (
        <div className="grid gap-3">
          {mix.map((item) => (
            <Card key={item.category}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{item.category}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span>Target</span>
                    <Input
                      type="number"
                      className="h-7 w-16 text-right font-mono text-xs"
                      defaultValue={item.targetPct}
                      disabled={busyCategory === item.category}
                      onBlur={(e) => {
                        const next = Number(e.target.value);
                        if (next !== item.targetPct) void saveTarget(item.category, next);
                      }}
                      data-testid={`brand-wssi-target-${item.category}`}
                    />
                    <span>% · Current {item.currentPct}%</span>
                  </div>
                </div>
                <Progress value={item.currentPct} className="h-2" />
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {Math.abs(item.gap) > 10 ? (
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  )}
                  <span>{item.gap > 0 ? `Over ${item.gap}%` : `Gap ${Math.abs(item.gap)}%`}</span>
                  <span>· {item.skuCount} SKU</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function BrandWssiMixPanel({
  collectionId: collectionIdProp = PLATFORM_CORE_DEMO.collectionId,
}: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection') ?? collectionIdProp,
  });
  const { mix, loading } = useBrandWssiOtbFeed(collectionId);
  const rows = useMemo(() => mix.slice(0, 8), [mix]);

  return (
    <div className="space-y-4" data-testid="brand-wssi-mix-panel">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Category mix snapshot</CardTitle>
          <CardDescription>Из PG OTB ledger · deep link на CSV mix.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-text-secondary text-sm">Загрузка mix…</p>
          ) : (
            rows.map((r) => (
              <div key={r.category} className="flex justify-between text-sm">
                <span>{r.category}</span>
                <span className="font-mono text-xs">
                  {r.currentPct}% · target {r.targetPct}% · {r.skuCount} SKU
                </span>
              </div>
            ))
          )}
          <Button size="sm" className="mt-2" asChild>
            <Link href={ROUTES.brand.assortmentMix}>Open mix · CSV export</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function BrandWssiCapacityPanel({
  collectionId = PLATFORM_CORE_DEMO.collectionId,
  articleId = PLATFORM_CORE_DEMO.demoArticleId,
}: Props) {
  const searchParams = useSearchParams();
  const resolvedCollection = resolvePageCollectionId({
    collection: searchParams.get('collection') ?? collectionId,
  });
  const { capacity, storageMode, loading } = useBrandWssiOtbFeed(resolvedCollection);

  return (
    <div className="space-y-4" data-testid="brand-wssi-capacity-panel">
      <Badge variant="outline" data-testid={`brand-wssi-capacity-source-${storageMode}`}>
        {storageMode === 'pg' ? 'PG capacity' : `Local ${storageMode}`}
      </Badge>
      {loading ? (
        <p className="text-text-secondary text-sm">Загрузка capacity…</p>
      ) : (
        capacity.map((row) => (
          <Card key={row.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{row.labelRu}</CardTitle>
              <CardDescription>
                Buy {row.plannedUnits} / capacity {row.capacityUnits} · {row.utilizationPct}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={row.utilizationPct} className="h-2" />
            </CardContent>
          </Card>
        ))
      )}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <Link href={brandWssiSupplyHref(resolvedCollection, articleId)}>W2 · supply / MRP</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={ROUTES.brand.productionOperations}>Операции производства</Link>
        </Button>
      </div>
    </div>
  );
}
