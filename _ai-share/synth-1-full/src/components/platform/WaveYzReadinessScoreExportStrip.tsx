'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  buildWaveYzReadinessScoresApiHref,
  buildWaveYzReadinessScoresExport,
  WAVE_YZ_EXPORT_JSON_RU,
  WAVE_YZ_EXPORT_LABEL_RU,
  WAVE_YZ_READINESS_SCORE_EXPORT_JSON_LINK_TESTID,
  WAVE_YZ_READINESS_SCORE_EXPORT_STRIP_TESTID,
  WAVE_YZ_READINESS_SCORE_EXPORT_SUMMARY_TESTID,
  WAVE_YZ_SCORE_SUFFIX_RU,
  waveYzReadinessScoreExportActiveCells,
} from '@/lib/platform-core-ports/platform/wave-yz-cell-score-export';
import { formatReadinessScore, readinessScoreTone } from '@/lib/platform-core-readiness-audit';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  compact?: boolean;
};

/** Wave YZ: compact hub strip — export readiness scores per role×pillar (extends YR). */
export function WaveYzReadinessScoreExportStrip({ collectionId, compact = true }: Props) {
  const payload = useMemo(
    () => buildWaveYzReadinessScoresExport(collectionId, { mode: 'static' }),
    [collectionId]
  );
  const activeCells = waveYzReadinessScoreExportActiveCells(payload);
  const apiHref = buildWaveYzReadinessScoresApiHref(collectionId, 'static');

  return (
    <div
      className={cn(hubGadget.goldenPath, 'flex-wrap items-center gap-x-2 gap-y-1')}
      data-testid={WAVE_YZ_READINESS_SCORE_EXPORT_STRIP_TESTID}
      data-compact={compact ? '1' : '0'}
      aria-label={WAVE_YZ_EXPORT_LABEL_RU}
    >
      <span className="text-text-muted text-[11px] font-bold uppercase">
        {WAVE_YZ_EXPORT_LABEL_RU}
      </span>
      <span
        className="text-text-secondary font-mono text-[11px] tabular-nums"
        data-testid={WAVE_YZ_READINESS_SCORE_EXPORT_SUMMARY_TESTID}
      >
        {payload.matrixSize.cells} яч · ср. {formatReadinessScore(payload.summary.allCellsAvg)}
        {WAVE_YZ_SCORE_SUFFIX_RU}
      </span>
      <span className={hubGadget.goldenSep} aria-hidden />
      {activeCells.map((cell) => (
        <span
          key={`${cell.roleId}-${cell.pillarId}`}
          className={cn(
            'border-border-subtle inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums',
            readinessScoreTone(cell.staticScore, false)
          )}
          data-testid={cell.testId}
          title={`${cell.roleLabelRu} · ${cell.pillarLabelRu}`}
        >
          <span className="text-text-muted font-sans text-[9px] font-bold uppercase">
            {cell.roleAbbrRu}·{cell.pillarAbbrRu}
          </span>
          {cell.scoreLabel}
        </span>
      ))}
      <Link
        href={apiHref}
        className={cn(hubGadget.goldenLink, 'shrink-0 text-[10px] font-bold uppercase')}
        data-testid={WAVE_YZ_READINESS_SCORE_EXPORT_JSON_LINK_TESTID}
        prefetch={false}
        target="_blank"
        rel="noopener noreferrer"
      >
        {WAVE_YZ_EXPORT_JSON_RU}
      </Link>
    </div>
  );
}
