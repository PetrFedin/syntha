'use client';

import { useCallback, useState } from 'react';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import type { RangePlannerTier } from '@/lib/production/workshop2-range-planner-bridge';
import {
  RANGE_PLANNER_DEMO_TIERS,
  type RangePlannerTierArticles,
} from '@/lib/production/workshop2-range-planner-pg';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

const TIER_SHORT: Record<RangePlannerTier, string> = {
  core: 'Базовый',
  trend: 'Тренд',
  novelty: 'Новинки',
};

export function RangePlannerTierArticleBoard({
  collectionId,
  tierArticles,
  onMoved,
}: {
  collectionId: string;
  tierArticles: RangePlannerTierArticles;
  onMoved: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOverTier, setDragOverTier] = useState<RangePlannerTier | null>(null);
  const [dragArticleId, setDragArticleId] = useState<string | null>(null);
  const [dragSourceTier, setDragSourceTier] = useState<RangePlannerTier | null>(null);

  const reorderWithinTier = useCallback(
    async (tier: RangePlannerTier, articleIds: string[]) => {
      setBusyId('reorder');
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
            body: JSON.stringify({ tier, articleIds }),
          }
        );
        const json = (await res.json()) as { ok?: boolean; messageRu?: string };
        if (!res.ok || !json.ok) {
          setError(json.messageRu ?? 'Не удалось сохранить порядок');
          return;
        }
        onMoved();
      } catch {
        setError('Ошибка сети');
      } finally {
        setBusyId(null);
        setDragOverTier(null);
        setDragArticleId(null);
        setDragSourceTier(null);
      }
    },
    [collectionId, onMoved]
  );

  const moveWithinTier = useCallback(
    (tier: RangePlannerTier, articleId: string, direction: -1 | 1) => {
      const ids = tierArticles[tier].map((row) => row.articleId);
      const idx = ids.indexOf(articleId);
      if (idx < 0) return;
      const swap = idx + direction;
      if (swap < 0 || swap >= ids.length) return;
      const next = [...ids];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      void reorderWithinTier(tier, next);
    },
    [tierArticles, reorderWithinTier]
  );

  const moveArticle = useCallback(
    async (articleId: string, tier: RangePlannerTier) => {
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
          setError(json.messageRu ?? 'Не удалось перенести артикул');
          return;
        }
        onMoved();
      } catch {
        setError('Ошибка сети');
      } finally {
        setBusyId(null);
        setDragOverTier(null);
      }
    },
    [collectionId, onMoved]
  );

  const totalArticles = RANGE_PLANNER_DEMO_TIERS.reduce(
    (sum, row) => sum + tierArticles[row.id].length,
    0
  );
  if (totalArticles === 0) return null;

  return (
    <div
      className="border-border-default space-y-3 rounded-xl border bg-slate-50/30 p-4"
      data-testid="range-planner-tier-article-board"
    >
      <div>
        <p className="text-sm font-semibold">Состав по уровням ассортимента</p>
        <p className="text-text-secondary text-xs">
          Перетащите артикул между колонками или внутри колонки — tier и порядок сохраняются в
          PostgreSQL.
        </p>
      </div>
      <div
        className={cn(
          hubCabinet.workspaceTableScroll,
          'flex gap-3 max-md:pb-1 md:grid md:grid-cols-3 md:overflow-visible'
        )}
        data-testid="brand-dev-range-tier-board-scroll"
      >
        {RANGE_PLANNER_DEMO_TIERS.map((row) => {
          const articles = tierArticles[row.id];
          const isDropTarget = dragOverTier === row.id;
          return (
            <div
              key={row.id}
              className={cn(
                'border-border-default min-h-[8rem] min-w-[min(72vw,16rem)] shrink-0 rounded-lg border bg-white p-3 transition-colors md:min-w-0',
                isDropTarget && 'border-accent-primary bg-accent-primary/5'
              )}
              data-testid={`range-planner-tier-column-${row.id}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverTier(row.id);
              }}
              onDragLeave={() => setDragOverTier((prev) => (prev === row.id ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                const articleId = e.dataTransfer.getData('text/article-id');
                if (!articleId) return;
                if (dragSourceTier === row.id && dragArticleId && dragArticleId !== articleId) {
                  const ids = tierArticles[row.id].map((art) => art.articleId);
                  const fromIdx = ids.indexOf(dragArticleId);
                  const toIdx = ids.indexOf(articleId);
                  if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
                    const next = [...ids];
                    next.splice(fromIdx, 1);
                    next.splice(toIdx, 0, dragArticleId);
                    void reorderWithinTier(row.id, next);
                    return;
                  }
                }
                if (dragSourceTier !== row.id) void moveArticle(articleId, row.id);
              }}
            >
              <p className="text-text-secondary mb-2 text-[10px] font-bold uppercase tracking-wide">
                {TIER_SHORT[row.id]} · {articles.length}
              </p>
              {articles.length === 0 ? (
                <p className="text-text-muted text-xs">Перетащите сюда артикул</p>
              ) : (
                <ul className="space-y-2">
                  {articles.map((art, artIndex) => (
                    <li
                      key={art.articleId}
                      draggable={busyId !== art.articleId && busyId !== 'reorder'}
                      data-testid={`range-planner-tier-article-${art.articleId}`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/article-id', art.articleId);
                        e.dataTransfer.effectAllowed = 'move';
                        setDragArticleId(art.articleId);
                        setDragSourceTier(row.id);
                      }}
                      onDragEnd={() => {
                        setDragArticleId(null);
                        setDragSourceTier(null);
                      }}
                      className="border-border-default flex cursor-grab flex-col gap-1.5 rounded-md border bg-slate-50/80 px-2 py-2 text-xs active:cursor-grabbing sm:flex-row sm:flex-wrap sm:items-center"
                    >
                      <span className="min-w-0 flex-1 font-medium">
                        {art.sku ?? art.articleId}
                        {art.name ? (
                          <span className="text-text-muted ml-1 font-normal">· {art.name}</span>
                        ) : null}
                      </span>
                      <span className="flex shrink-0 gap-0.5">
                        <button
                          type="button"
                          disabled={busyId === art.articleId || artIndex === 0}
                          data-testid={`range-planner-tier-reorder-up-${art.articleId}`}
                          onClick={() => moveWithinTier(row.id, art.articleId, -1)}
                          className="text-text-muted hover:text-accent-primary inline-flex h-7 w-7 items-center justify-center rounded disabled:opacity-40"
                          title="Выше в tier"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={busyId === art.articleId || artIndex === articles.length - 1}
                          data-testid={`range-planner-tier-reorder-down-${art.articleId}`}
                          onClick={() => moveWithinTier(row.id, art.articleId, 1)}
                          className="text-text-muted hover:text-accent-primary inline-flex h-7 w-7 items-center justify-center rounded disabled:opacity-40"
                          title="Ниже в tier"
                        >
                          ↓
                        </button>
                      </span>
                      {RANGE_PLANNER_DEMO_TIERS.filter((t) => t.id !== row.id).map((target) => (
                        <button
                          key={target.id}
                          type="button"
                          disabled={busyId === art.articleId}
                          data-testid={`range-planner-tier-move-${art.articleId}-${target.id}`}
                          onClick={() => void moveArticle(art.articleId, target.id)}
                          className="text-accent-primary hover:bg-accent-primary/10 inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 text-[10px] font-semibold disabled:opacity-50"
                          title={`Перенести в ${TIER_SHORT[target.id]}`}
                        >
                          → {target.id}
                        </button>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      {error ? (
        <p className="text-xs text-rose-600" data-testid="range-planner-tier-move-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
