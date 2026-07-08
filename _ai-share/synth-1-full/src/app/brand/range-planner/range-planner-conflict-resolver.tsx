'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  RANGE_PLANNER_OVERLAY_CONFLICT_BANNER_TITLE_RU,
  RANGE_PLANNER_OVERLAY_CONFLICT_LAST_SYNC_RU,
  RANGE_PLANNER_OVERLAY_CONFLICT_PULL_CTA_RU,
  RANGE_PLANNER_OVERLAY_CONFLICT_SYNCING_RU,
  RANGE_PLANNER_OVERLAY_CONFLICT_SYNC_CTA_RU,
  rangePlannerOverlayConflictTierRowRu,
} from '@/lib/production/wave-xg-brand-range-planner';
import type { RangePlannerOverlayConflict } from '@/lib/production/workshop2-range-planner-overlay';

export function RangePlannerConflictResolverStrip({
  conflict,
  onSync,
  syncing,
}: {
  conflict: RangePlannerOverlayConflict;
  onSync: () => void;
  syncing?: boolean;
}) {
  if (!conflict.hasConflict) return null;

  const syncedLabel = conflict.syncedFromPgAt
    ? new Date(conflict.syncedFromPgAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div
      className="space-y-2 rounded-xl border border-amber-300 bg-amber-50/90 p-3"
      role="alert"
      aria-live="polite"
      data-testid="brand-range-planner-conflict-resolver-strip"
    >
      <div
        className="flex flex-wrap items-start gap-x-2 gap-y-1 text-[12px] text-amber-950"
        data-testid="brand-range-planner-overlay-conflict-banner"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-semibold">{RANGE_PLANNER_OVERLAY_CONFLICT_BANNER_TITLE_RU}</p>
          <p data-testid="brand-range-planner-conflict-resolver-summary">{conflict.summaryRu}</p>
          {syncedLabel ? (
            <p
              className="text-text-muted text-[11px]"
              data-testid="brand-range-planner-overlay-conflict-last-sync"
            >
              {RANGE_PLANNER_OVERLAY_CONFLICT_LAST_SYNC_RU(syncedLabel)}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 border-amber-400 bg-white text-[11px] text-amber-950 hover:bg-amber-100/80"
          disabled={syncing}
          data-testid="brand-range-planner-overlay-sync-btn"
          onClick={() => void onSync()}
        >
          {syncing ? '…' : RANGE_PLANNER_OVERLAY_CONFLICT_SYNC_CTA_RU}
        </Button>
      </div>

      {conflict.tiers.length > 0 ? (
        <ul
          className="divide-border-default divide-y rounded-lg border border-amber-200/80 bg-white/70 text-[11px] text-amber-950"
          data-testid="brand-range-planner-conflict-resolver-tier-list"
        >
          {conflict.tiers.map((row) => (
            <li
              key={row.tierId}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-2 py-1.5"
              data-testid={`brand-range-planner-conflict-resolver-tier-${row.tierId}`}
            >
              <span className="font-medium">{row.labelRu}</span>
              <span className="tabular-nums">
                {rangePlannerOverlayConflictTierRowRu({
                  localPgSkuCount: row.localPgSkuCount,
                  pgSkuCount: row.pgSkuCount,
                  localPlanSkuCount: row.localPlanSkuCount,
                  planSkuCount: row.planSkuCount,
                })}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 text-[11px]"
          disabled={syncing}
          data-testid="brand-range-planner-conflict-resolver-sync-btn"
          onClick={() => void onSync()}
        >
          {syncing
            ? RANGE_PLANNER_OVERLAY_CONFLICT_SYNCING_RU
            : RANGE_PLANNER_OVERLAY_CONFLICT_PULL_CTA_RU}
        </Button>
      </div>
    </div>
  );
}
