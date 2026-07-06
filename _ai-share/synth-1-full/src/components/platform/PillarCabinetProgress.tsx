'use client';

import { cn } from '@/lib/utils';

type Props = {
  done: number;
  total: number;
  className?: string;
};

/** Полоска прогресса цепочки в заголовке кабинета. */
export function PillarCabinetProgress({ done, total, className }: Props) {
  if (total <= 0) return null;
  const pct = Math.min(100, Math.round((done / total) * 100));

  return (
    <div data-testid="pillar-cabinet-progress" className={cn('space-y-1.5', className)}>
      <div className="text-text-muted flex items-center justify-between gap-2 text-[11px] font-medium">
        <span>
          {done}/{total} этапов цепочки
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div
        className="bg-bg-surface2 h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="bg-accent-primary h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
