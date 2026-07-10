'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ReadinessSubItem } from '@/lib/platform-core-readiness-audit';
import { WAVE_YT_HUB_CHAIN_STATUS_OWNER_TESTID } from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';
import { hubSectionLabelClassName } from '@/lib/platform-core-hub-layout';
import { cn } from '@/lib/utils';

type Props = {
  sections: ReadinessSubItem[];
  className?: string;
  title?: string;
  liveConnected?: boolean;
  /** Доп. row в той же сетке (напр. «Магазины» picker). */
  appendRow?: ReactNode;
};

/** Compact navigation list: один паттерн строки, понятное число разделов, без audit noise. */
export function PillarSectionList({
  sections,
  className,
  title = 'Разделы',
  liveConnected,
  appendRow,
}: Props) {
  if (sections.length === 0 && !appendRow) return null;

  return (
    <section
      data-testid={WAVE_YT_HUB_CHAIN_STATUS_OWNER_TESTID}
      aria-label={title}
      className={cn('space-y-1.5', className)}
    >
      <div className="flex min-h-5 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className={hubSectionLabelClassName()}>{title}</p>
          {sections.length > 0 ? (
            <span className="text-text-muted text-[10px] tabular-nums">{sections.length}</span>
          ) : null}
        </div>
        {liveConnected != null ? (
          <span
            className="text-text-muted inline-flex shrink-0 items-center gap-1 text-[10px]"
            title={liveConnected ? 'Данные обновляются в реальном времени' : 'Данные обновляются опросом'}
          >
            <span
              className={cn(
                pillarInsight.liveDot,
                liveConnected ? pillarInsight.liveDotOn : pillarInsight.liveDotPoll
              )}
              aria-hidden
            />
            {liveConnected ? 'Live' : 'Sync'}
          </span>
        ) : null}
      </div>

      <nav className={pillarInsight.sectionList} aria-label={`${title}: навигация`}>
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            data-testid={`pillar-section-${section.id}`}
            className={cn(pillarInsight.sectionRow, 'group')}
          >
            <span className={pillarInsight.sectionRowLabel}>{section.label}</span>
            <ChevronRight
              className="text-text-muted h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        ))}
        {appendRow}
      </nav>
    </section>
  );
}
