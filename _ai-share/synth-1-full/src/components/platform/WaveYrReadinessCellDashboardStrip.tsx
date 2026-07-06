'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  formatReadinessScore,
  getPlatformCoreReadinessMatrix,
  getReadinessCell,
  readinessScoreTone,
} from '@/lib/platform-core-readiness-audit';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  buildWaveYrReadinessCellDashboardModel,
  WAVE_YR_CELL_SCORE_LABEL_RU,
  WAVE_YR_EMPTY_CELL_LABEL_RU,
  WAVE_YR_READINESS_CELL_DASHBOARD_STRIP_TESTID,
  WAVE_YR_READINESS_CELL_SCORE_TESTID,
  WAVE_YR_SCORE_SUFFIX_RU,
  WAVE_YR_SECTIONS_LABEL_RU,
} from '@/lib/platform-core-ports/platform/wave-yr-readiness-cell-dashboard';
import { WAVE_ZE_VERBOSE_DIAGNOSTICS_RU } from '@/lib/platform-core-ports/platform/wave-ze-hub-diagnostics-ru';
import { cn } from '@/lib/utils';

type Props = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  collectionId: string;
  /** compact/core — без verbose audit diagnostics (summary, audit lists). */
  compact?: boolean;
};

/** Wave YR: compact cell + section scores from readiness-sections (current role/pillar). */
export function WaveYrReadinessCellDashboardStrip({
  roleId,
  pillarId,
  collectionId,
  compact = true,
}: Props) {
  const model = useMemo(() => {
    const cells = getPlatformCoreReadinessMatrix(collectionId, { liveChain: false });
    const cell = getReadinessCell(cells, roleId, pillarId);
    if (!cell) return null;
    return buildWaveYrReadinessCellDashboardModel(roleId, pillarId, collectionId, {
      compact,
      liveChain: false,
      mode: 'static',
    });
  }, [roleId, pillarId, collectionId, compact]);

  if (!model) return null;

  const inactive = !model.active && model.sections.length === 0;

  return (
    <div
      className={cn(hubGadget.goldenPath, 'flex-wrap items-center gap-x-2 gap-y-1')}
      data-testid={WAVE_YR_READINESS_CELL_DASHBOARD_STRIP_TESTID}
      data-compact={compact ? '1' : '0'}
      aria-label={WAVE_YR_CELL_SCORE_LABEL_RU}
    >
      <span className="text-text-muted text-[11px] font-bold uppercase">
        {WAVE_YR_CELL_SCORE_LABEL_RU}
      </span>
      {inactive ? (
        <span className="text-text-muted text-[11px]" data-testid="wave-yr-readiness-cell-empty">
          {model.emptyReason ?? WAVE_YR_EMPTY_CELL_LABEL_RU}
        </span>
      ) : (
        <span
          className={cn(
            'font-mono text-[11px] font-bold tabular-nums',
            readinessScoreTone(model.cellScore, false)
          )}
          data-testid={WAVE_YR_READINESS_CELL_SCORE_TESTID}
        >
          {model.cellScoreLabel}
          {WAVE_YR_SCORE_SUFFIX_RU}
        </span>
      )}

      {model.sections.length > 0 ? (
        <>
          <span className={hubGadget.goldenSep} aria-hidden />
          <span className="text-text-muted text-[11px] font-semibold uppercase">
            {WAVE_YR_SECTIONS_LABEL_RU}
          </span>
          {model.sections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              data-testid={section.testId}
              className={cn(
                hubGadget.goldenLink,
                'inline-flex max-w-[11rem] items-center gap-1 truncate'
              )}
              title={`${section.label} · ${section.scoreLabel}${WAVE_YR_SCORE_SUFFIX_RU}`}
            >
              <span className="truncate">{section.label}</span>
              <span
                className={cn(
                  'shrink-0 font-mono text-[11px] font-bold tabular-nums',
                  readinessScoreTone(section.score, false)
                )}
              >
                {formatReadinessScore(section.score)}
              </span>
            </Link>
          ))}
        </>
      ) : null}

      {model.showVerboseDiagnostics ? (
        <span className="text-text-muted text-[9px]" data-testid="wave-yr-readiness-verbose-diagnostics">
          {WAVE_ZE_VERBOSE_DIAGNOSTICS_RU}
        </span>
      ) : null}
    </div>
  );
}
