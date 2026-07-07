'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const CARD_CLASS =
  'border-border-subtle bg-bg-surface2/80 h-[280px] min-h-[280px] w-[200px] shrink-0 animate-pulse rounded-xl border';

type MetricStripRow = { cards: number; titleWidthClass: string };

export function OrgHubCardStripSkeleton({
  rows,
  className,
  busyLabel = 'Загрузка',
}: {
  rows: MetricStripRow[];
  className?: string;
  busyLabel?: string;
}) {
  return (
    <div className={cn(className)} aria-busy="true" aria-label={busyLabel}>
      {rows.map((row, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <div className="mt-6" aria-hidden /> : null}
          <div
            className={cn('bg-bg-surface2 mb-2 h-3 animate-pulse rounded', row.titleWidthClass)}
            aria-hidden
          />
          <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
            {Array.from({ length: row.cards }).map((_, j) => (
              <div key={j} className={CARD_CLASS} aria-hidden />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export function OrgHubModulesStripSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(className)} aria-busy="true" aria-label="Загрузка разделов организации">
      <div className="bg-bg-surface2 mb-2 h-3 w-24 animate-pulse rounded" aria-hidden />
      <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, j) => (
          <div key={j} className={CARD_CLASS} aria-hidden />
        ))}
      </div>
    </div>
  );
}

const ROLE_REPORTS_PANEL = 'rounded-xl border border-border-subtle bg-bg-surface shadow-sm';

/** Пока грузится health/дашборд — заглушка под блок отчётов по ролям */
export function OrgHubRoleReportsSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(ROLE_REPORTS_PANEL, 'space-y-3 p-4', className)}
      aria-busy="true"
      aria-label="Загрузка блока отчётов по ролям"
    >
      <div className="bg-bg-surface2 h-3 w-full max-w-md animate-pulse rounded" aria-hidden />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 9 }).map((_, j) => (
          <div
            key={j}
            className="border-border-subtle bg-bg-surface2/80 h-8 w-[4.5rem] animate-pulse rounded-md border"
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
