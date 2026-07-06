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

/** Список разделов столпа в кабинете — 1–2 колонки, без audit scores. */
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
      className={cn('space-y-2', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={hubSectionLabelClassName()}>{title}</p>
        {liveConnected != null ? (
          <span
            className="text-text-muted inline-flex items-center gap-1.5 text-[11px]"
            title={liveConnected ? 'SSE в эфире' : 'Опрос'}
          >
            <span
              className={cn(
                pillarInsight.liveDot,
                liveConnected ? pillarInsight.liveDotOn : pillarInsight.liveDotPoll
              )}
              aria-hidden
            />
            {liveConnected ? 'В эфире' : 'Опрос'}
          </span>
        ) : null}
      </div>
      <nav className={pillarInsight.sectionList}>
        {sections.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            data-testid={`pillar-section-${section.id}`}
            className={pillarInsight.sectionRow}
          >
            <span className={pillarInsight.sectionRowLabel}>{section.label}</span>
            <ChevronRight className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
          </Link>
        ))}
        {appendRow}
      </nav>
    </section>
  );
}
