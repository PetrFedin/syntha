'use client';

import { useEffect, useState } from 'react';
import { Factory } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { usePlatformCoreSampleStatusPoll } from '@/hooks/use-platform-core-sample-status-poll';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { labelWorkshop2SampleOrderStatusRu } from '@/lib/production/workshop2-release-production-display';
import type { Workshop2SampleOrderStatus } from '@/lib/production/workshop2-dossier-phase1.types';

type RollupResponse = {
  ok?: boolean;
  collectionId?: string | null;
  scope?: 'collection' | 'multi';
  articleCount?: number;
  total?: number;
  byStatus?: Record<string, number>;
  avgLeadTimeDays?: number | null;
  hintRu?: string;
};

type Props = {
  /** Одна коллекция — классический rollup. */
  collectionId?: string;
  /** Multi-scope: видимые артикулы hub (col:art). */
  articleScope?: Array<{ collectionId: string; articleId: string }>;
};

/** Hub dashboard: sample orders by status + avg lead time (production-rollup API). */
export function Workshop2HubProductionRollupWidget({ collectionId, articleScope }: Props) {
  const [rollup, setRollup] = useState<RollupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const platformCore = isPlatformCoreMode();
  const scopeKey = collectionId?.trim()
    ? `col:${collectionId.trim()}`
    : articleScope?.length
      ? articleScope.map((a) => `${a.collectionId}:${a.articleId}`).join(',')
      : '';
  const { tick: samplePollTick, sseConnected } = usePlatformCoreSampleStatusPoll(
    platformCore && Boolean(scopeKey),
    collectionId?.trim() || undefined,
    !collectionId?.trim() ? articleScope : undefined
  );

  useEffect(() => {
    if (!scopeKey) return;
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (collectionId?.trim()) {
      params.set('collectionId', collectionId.trim());
    }
    if (articleScope?.length && !collectionId?.trim()) {
      params.set('articles', articleScope.map((a) => `${a.collectionId}:${a.articleId}`).join(','));
    }
    void fetch(`/api/workshop2/hub/production-rollup?${params.toString()}`, {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    })
      .then(async (r) => {
        if (!r.ok) return null;
        return (await r.json()) as RollupResponse;
      })
      .then((data) => {
        if (!cancelled) setRollup(data);
      })
      .catch(() => {
        if (!cancelled) setRollup(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scopeKey, collectionId, articleScope, samplePollTick]);

  if (!scopeKey) return null;

  const statuses = (Object.keys(rollup?.byStatus ?? {}) as Workshop2SampleOrderStatus[]).filter(
    (s) => (rollup?.byStatus?.[s] ?? 0) > 0
  );

  return (
    <div
      className="space-y-2 rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-2.5"
      data-testid="workshop2-hub-production-rollup"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-text-primary flex items-center gap-1.5 text-[11px] font-semibold">
          <Factory className="h-3.5 w-3.5 text-indigo-600" />
          Производство · образцы
          {rollup?.scope === 'multi' ? (
            <Badge variant="outline" className="text-[8px]">
              все коллекции
            </Badge>
          ) : null}
        </p>
        {platformCore && collectionId?.trim() ? (
          <PlatformCoreChainStatusRefreshBadge
            sseConnected={sseConnected}
            enabled
            variant="dot"
            sseTestId="brand-w2-sample-status-sse-live"
            pollTestId="brand-w2-sample-status-sse-poll"
          />
        ) : null}
      </div>
      {loading ? (
        <p className="text-text-muted text-[10px]">Загрузка rollup…</p>
      ) : rollup?.ok ? (
        <>
          <p className="text-text-secondary text-[10px]">
            Заказов: <span className="font-semibold text-slate-800">{rollup.total ?? 0}</span>
            {rollup.avgLeadTimeDays != null ? (
              <>
                {' '}
                · ср. lead time{' '}
                <span className="font-semibold text-slate-800">{rollup.avgLeadTimeDays} дн.</span>
              </>
            ) : (
              <span className="text-text-muted"> · lead time N/A</span>
            )}
          </p>
          <div className="flex flex-wrap gap-1">
            {statuses.length === 0 ? (
              <Badge variant="secondary" className="text-[9px]">
                нет заказов
              </Badge>
            ) : (
              statuses.map((st) => (
                <Badge key={st} variant="outline" className="text-[9px]">
                  {labelWorkshop2SampleOrderStatusRu(st)} {rollup.byStatus?.[st] ?? 0}
                </Badge>
              ))
            )}
          </div>
          {rollup.hintRu ? <p className="text-text-muted text-[9px]">{rollup.hintRu}</p> : null}
        </>
      ) : (
        <p className="text-text-muted text-[10px]">Rollup недоступен (PG / auth).</p>
      )}
    </div>
  );
}
