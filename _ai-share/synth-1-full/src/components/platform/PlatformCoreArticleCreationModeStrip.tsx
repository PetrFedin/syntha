'use client';

import {
  type ArticleCreationMode,
  PLATFORM_CORE_ARTICLE_CREATION_MODES,
  articleCreationModeLabelRu,
  articleCreationModeSummaryRu,
} from '@/lib/platform-core-article-spine';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  value: ArticleCreationMode;
  onChange: (mode: ArticleCreationMode) => void;
  disabled?: boolean;
};

/** Wave 8 · dossier: «Производство по ТЗ» vs «Закупка / импорт образца». */
export function PlatformCoreArticleCreationModeStrip({ value, onChange, disabled }: Props) {
  return (
    <section
      data-testid="platform-core-article-creation-mode-strip"
      className="border-border-subtle w-full min-w-0 rounded-xl border bg-bg-surface p-1"
      aria-label="Режим создания артикула"
    >
      <div className={cn(hubCabinet.pillarSegmentRow, 'w-full')} role="group">
        {PLATFORM_CORE_ARTICLE_CREATION_MODES.map((mode) => {
          const active = value === mode;
          return (
            <button
              key={mode}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              data-testid={`platform-core-article-creation-mode-${mode}`}
              onClick={() => onChange(mode)}
              className={cn(
                hubCabinet.pillarSegmentBtn,
                'min-h-10 min-w-0 flex-1 basis-0 px-2 text-[11px] leading-tight sm:px-3 sm:text-xs',
                active ? hubCabinet.pillarSegmentBtnActive : hubCabinet.pillarSegmentBtnIdle
              )}
            >
              {articleCreationModeLabelRu(mode)}
            </button>
          );
        })}
      </div>
      <p className="text-text-muted px-2 pb-1 pt-1.5 text-[11px] leading-snug">
        {articleCreationModeSummaryRu(value)}
      </p>
    </section>
  );
}
