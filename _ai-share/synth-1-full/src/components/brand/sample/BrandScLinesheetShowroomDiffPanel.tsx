'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

export type BrandScLinesheetShowroomDiff = {
  w2Count: number;
  publishedCount: number;
  syncedCount: number;
  onlyInW2: string[];
  onlyPublished: string[];
};

type LoadState = 'loading' | 'ready' | 'error';

export function BrandScLinesheetShowroomDiffPanel({
  collectionId,
  reloadNonce = 0,
}: {
  collectionId: string;
  reloadNonce?: number;
}) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [diff, setDiff] = useState<BrandScLinesheetShowroomDiff | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    void (async () => {
      try {
        const [devRes, pubRes] = await Promise.all([
          fetch(
            `/api/workshop2/collections/${encodeURIComponent(collectionId)}/development-status`,
            { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
          ),
          fetch(
            `/api/workshop2/collections/${encodeURIComponent(collectionId)}/published-articles`,
            { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
          ),
        ]);
        const devJson = (await devRes.json()) as { status?: { articleIds?: string[] } };
        const pubJson = (await pubRes.json()) as {
          ok?: boolean;
          articles?: Array<{ articleId?: string }>;
        };
        const w2Ids = Array.isArray(devJson.status?.articleIds) ? devJson.status!.articleIds! : [];
        const pubIds =
          pubJson.ok && Array.isArray(pubJson.articles)
            ? pubJson.articles
                .map((a) => a.articleId?.trim())
                .filter((id): id is string => Boolean(id))
            : [];
        const pubSet = new Set(pubIds);
        const w2Set = new Set(w2Ids);
        const onlyInW2 = w2Ids.filter((id) => !pubSet.has(id));
        const onlyPublished = pubIds.filter((id) => !w2Set.has(id));
        const syncedCount = w2Ids.filter((id) => pubSet.has(id)).length;
        if (cancelled) return;
        setDiff({
          w2Count: w2Ids.length,
          publishedCount: pubIds.length,
          syncedCount,
          onlyInW2,
          onlyPublished,
        });
        setLoadState('ready');
      } catch {
        if (!cancelled) {
          setDiff(null);
          setLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, reloadNonce]);

  const inSync = useMemo(
    () => diff != null && diff.onlyInW2.length === 0 && diff.onlyPublished.length === 0,
    [diff]
  );

  if (loadState === 'loading') {
    return (
      <p
        className="text-text-muted text-[10px]"
        data-testid="brand-sc-linesheet-showroom-diff-loading"
      >
        UAT linesheet→showroom: загрузка…
      </p>
    );
  }

  if (loadState === 'error' || !diff) {
    return (
      <p
        className="text-[10px] text-destructive"
        data-testid="brand-sc-linesheet-showroom-diff-error"
      >
        UAT diff недоступен — проверьте API workshop2.
      </p>
    );
  }

  return (
    <div
      className="border-border-subtle bg-bg-surface2/50 space-y-2 rounded-lg border px-4 py-3"
      data-testid="brand-sc-linesheet-showroom-diff"
      data-audit-legacy="brand-linesheet-showroom-diff"
      data-linesheet-showroom-in-sync={inSync ? '1' : '0'}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-bold uppercase tracking-wide">
          UAT · linesheet → showroom
        </span>
        <Badge
          variant="outline"
          className={
            inSync
              ? 'border-emerald-200 bg-emerald-50 text-[10px] text-emerald-900'
              : 'border-amber-200 bg-amber-50 text-[10px] text-amber-950'
          }
          data-testid="brand-sc-linesheet-showroom-diff-status"
        >
          {inSync ? 'Синхронно' : 'Есть расхождения'}
        </Badge>
        <Badge
          variant="secondary"
          className="text-[10px] tabular-nums"
          data-testid="brand-sc-linesheet-showroom-diff-counts"
        >
          W2 {diff.w2Count} · витрина {diff.publishedCount} · совпало {diff.syncedCount}
        </Badge>
      </div>
      {diff.onlyInW2.length > 0 ? (
        <div className="space-y-1" data-testid="brand-sc-linesheet-showroom-diff-only-w2">
          <p className="text-text-muted text-[10px]">
            В разработке, но не на витрине ({diff.onlyInW2.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {diff.onlyInW2.slice(0, 12).map((id) => (
              <Badge key={id} variant="outline" className="font-mono text-[9px]">
                {id}
              </Badge>
            ))}
            {diff.onlyInW2.length > 12 ? (
              <span className="text-text-muted text-[10px]">+{diff.onlyInW2.length - 12}</span>
            ) : null}
          </div>
          <Link
            href={`${ROUTES.brand.productionWorkshop2}?w2col=${encodeURIComponent(collectionId)}`}
            className="text-accent-primary text-[10px] font-medium hover:underline"
            data-testid="brand-sc-linesheet-showroom-diff-w2-link"
          >
            Опубликовать в W2 →
          </Link>
        </div>
      ) : null}
      {diff.onlyPublished.length > 0 ? (
        <div className="space-y-1" data-testid="brand-sc-linesheet-showroom-diff-only-showroom">
          <p className="text-text-muted text-[10px]">
            На витрине без строки в W2 ({diff.onlyPublished.length}) — проверьте гидрацию PG:
          </p>
          <div className="flex flex-wrap gap-1">
            {diff.onlyPublished.slice(0, 8).map((id) => (
              <Badge key={id} variant="outline" className="font-mono text-[9px]">
                {id}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
