'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import type { RangePlannerTier } from '@/lib/production/workshop2-range-planner-bridge';
import {
  brandRangePlannerBulkTierPartialWarningRu,
  WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API_WAVE_XG,
} from '@/lib/production/wave-xg-brand-range-planner';
import { RANGE_PLANNER_TIER_LABEL_RU } from '@/lib/production/workshop2-range-planner-overlay';
import type { RangePlannerUnassignedArticle } from '@/lib/production/workshop2-range-planner-pg';

const TIER_OPTIONS: { id: RangePlannerTier; label: string }[] = [
  { id: 'core', label: RANGE_PLANNER_TIER_LABEL_RU.core },
  { id: 'trend', label: RANGE_PLANNER_TIER_LABEL_RU.trend },
  { id: 'novelty', label: RANGE_PLANNER_TIER_LABEL_RU.novelty },
];

export function RangePlannerTierAssignPanel({
  collectionId,
  articles,
  onAssigned,
}: {
  collectionId: string;
  articles: RangePlannerUnassignedArticle[];
  onAssigned: () => void;
}) {
  const [tierByArticle, setTierByArticle] = useState<Record<string, RangePlannerTier>>({});
  const [bulkTier, setBulkTier] = useState<RangePlannerTier>('core');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assign = useCallback(
    async (articleId: string) => {
      const tier = tierByArticle[articleId] ?? 'core';
      setBusyId(articleId);
      setError(null);
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/range-planner`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...buildWorkshop2ApiRequestHeaders(),
            },
            body: JSON.stringify({ articleId, tier }),
          }
        );
        const json = (await res.json()) as { ok?: boolean; messageRu?: string };
        if (!res.ok || !json.ok) {
          setError(json.messageRu ?? 'Не удалось назначить уровень');
          return;
        }
        onAssigned();
      } catch {
        setError('Ошибка сети');
      } finally {
        setBusyId(null);
      }
    },
    [collectionId, onAssigned, tierByArticle]
  );

  const assignBulk = useCallback(async () => {
    const articleIds = articles.map((row) => row.articleId);
    if (articleIds.length === 0) return;
    setBulkBusy(true);
    setError(null);
    try {
      const res = await fetch(WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API_WAVE_XG, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildWorkshop2ApiRequestHeaders(),
        },
        body: JSON.stringify({ collectionId, tier: bulkTier, articleIds, allowPartial: true }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        assigned?: number;
        failed?: number;
        partial?: boolean;
      };
      if (!res.ok || !json.ok) {
        setError(json.messageRu ?? 'Пакетное назначение не выполнено');
        return;
      }
      if (json.partial) {
        setError(
          json.messageRu ??
            brandRangePlannerBulkTierPartialWarningRu(json.assigned ?? 0, articleIds.length)
        );
      }
      onAssigned();
    } catch {
      setError('Ошибка сети');
    } finally {
      setBulkBusy(false);
    }
  }, [articles, bulkTier, collectionId, onAssigned]);

  if (articles.length === 0) return null;

  return (
    <div
      className="border-border-default space-y-3 rounded-xl border bg-amber-50/40 p-4"
      data-testid="range-planner-tier-assign-panel"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm font-semibold">
          Без уровня · {articles.length}{' '}
          {articles.length === 1 ? 'артикул' : articles.length < 5 ? 'артикула' : 'артикулов'}
        </p>
        {articles.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="border-border-default h-8 min-w-[7rem] rounded-md border bg-white px-2 text-xs"
              data-testid="range-planner-tier-bulk-select"
              value={bulkTier}
              onChange={(e) => setBulkTier(e.target.value as RangePlannerTier)}
            >
              {TIER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 text-[10px]"
              disabled={bulkBusy || busyId !== null}
              data-testid="range-planner-tier-bulk-assign-btn"
              onClick={() => void assignBulk()}
            >
              {bulkBusy ? '…' : `Назначить все (${articles.length})`}
            </Button>
          </div>
        ) : null}
      </div>
      <ul className="space-y-2">
        {articles.map((row) => (
          <li
            key={row.articleId}
            className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center"
            data-testid={`range-planner-unassigned-${row.articleId}`}
          >
            <span className="min-w-0 flex-1 font-medium">
              {row.sku ?? row.articleId}
              {row.name ? (
                <span className="text-text-muted ml-1 text-xs font-normal">· {row.name}</span>
              ) : null}
            </span>
            <select
              className="border-border-default min-h-11 w-full rounded-md border bg-white px-2 text-xs sm:h-8 sm:min-h-0 sm:w-auto"
              data-testid={`range-planner-tier-select-${row.articleId}`}
              value={tierByArticle[row.articleId] ?? 'core'}
              onChange={(e) =>
                setTierByArticle((prev) => ({
                  ...prev,
                  [row.articleId]: e.target.value as RangePlannerTier,
                }))
              }
            >
              {TIER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-h-11 w-full text-[10px] sm:h-8 sm:min-h-0 sm:w-auto"
              disabled={busyId === row.articleId || bulkBusy}
              data-testid={`range-planner-tier-assign-${row.articleId}`}
              onClick={() => void assign(row.articleId)}
            >
              {busyId === row.articleId ? '…' : 'Назначить'}
            </Button>
          </li>
        ))}
      </ul>
      {error ? (
        <p className="text-xs text-rose-600" data-testid="range-planner-tier-assign-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
