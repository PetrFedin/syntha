'use client';

import { Badge } from '@/components/ui/badge';
import { WAVE_YT_PUBLISHED_COUNT_OUT_OF_SYNC_RU } from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';

/** Сравнение live API count и snapshot/страницы — mini ↔ full sync. */
export function PlatformCorePublishedCountSyncBadge({
  liveCount,
  referenceCount,
  loading = false,
  testId,
  compact = false,
}: {
  liveCount: number | null;
  referenceCount?: number | null;
  loading?: boolean;
  testId: string;
  compact?: boolean;
}) {
  if (loading || liveCount == null) {
    return (
      <Badge variant="secondary" className="text-[9px]" data-testid={`${testId}-loading`}>
        …
      </Badge>
    );
  }

  const ref = referenceCount ?? liveCount;
  const inSync = ref === liveCount;

  return (
    <Badge
      variant="outline"
      className={
        inSync
          ? 'border-border-subtle bg-bg-surface2 text-[9px] text-text-secondary'
          : 'border-amber-200 bg-amber-50 text-[9px] text-amber-950'
      }
      data-testid={testId}
      data-published-count-sync={inSync ? '1' : '0'}
      data-live-count={liveCount}
      data-reference-count={ref}
    >
      {inSync
        ? compact
          ? `${liveCount} арт.`
          : `Синхронно · ${liveCount} арт.`
        : WAVE_YT_PUBLISHED_COUNT_OUT_OF_SYNC_RU(liveCount, ref)}
    </Badge>
  );
}
