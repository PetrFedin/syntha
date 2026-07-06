/**
 * Wave YR — compact readiness cell score dashboard strip (hub cabinet, current role × pillar).
 * SoT: platform-core-readiness-sections + getPlatformCoreReadinessMatrix.
 */

import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  formatReadinessScore,
  getPlatformCoreReadinessMatrix,
  getReadinessCell,
  type ReadinessCell,
  type ReadinessScoreMode,
} from '@/lib/platform-core-readiness-audit';

export const WAVE_YR_READINESS_CELL_DASHBOARD_STRIP_TESTID =
  'wave-yr-readiness-cell-dashboard-strip';
export const WAVE_YR_READINESS_CELL_SCORE_TESTID = 'wave-yr-readiness-cell-score';

export const WAVE_YR_CELL_SCORE_LABEL_RU = 'Готовность ячейки';
export const WAVE_YR_SECTIONS_LABEL_RU = 'Разделы';
export const WAVE_YR_EMPTY_CELL_LABEL_RU = 'Ячейка неактивна';
export const WAVE_YR_SCORE_SUFFIX_RU = '/10';

export type WaveYrReadinessSectionChip = {
  id: string;
  label: string;
  href: string;
  score: number;
  scoreLabel: string;
  testId: string;
};

export type WaveYrReadinessCellDashboardModel = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  active: boolean;
  cellScore: number | null;
  cellScoreLabel: string;
  emptyReason?: string;
  sections: WaveYrReadinessSectionChip[];
  showVerboseDiagnostics: boolean;
};

export function waveYrReadinessSectionTestId(sectionId: string): string {
  return `wave-yr-readiness-section-${sectionId}`;
}

export function buildWaveYrReadinessCellDashboardModel(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId: string,
  options?: { liveChain?: boolean; compact?: boolean; mode?: ReadinessScoreMode }
): WaveYrReadinessCellDashboardModel | null {
  const compact = options?.compact !== false;
  const mode: ReadinessScoreMode =
    options?.mode ?? (options?.liveChain === true ? 'live' : 'static');
  const cells = getPlatformCoreReadinessMatrix(collectionId, {
    liveChain: options?.liveChain === true,
  });
  const cell = getReadinessCell(cells, roleId, pillarId);
  if (!cell) return null;

  return mapReadinessCellToDashboardModel(cell, { compact, mode });
}

export function mapReadinessCellToDashboardModel(
  cell: ReadinessCell,
  options?: { compact?: boolean; mode?: ReadinessScoreMode }
): WaveYrReadinessCellDashboardModel {
  const compact = options?.compact !== false;
  const mode: ReadinessScoreMode = options?.mode ?? 'static';
  const cellScore = mode === 'live' ? cell.liveScore : cell.staticScore;

  return {
    roleId: cell.roleId,
    pillarId: cell.pillarId,
    active: cell.active,
    cellScore,
    cellScoreLabel: formatReadinessScore(cellScore),
    emptyReason: cell.emptyReason,
    sections: cell.subItems.map((sub) => ({
      id: sub.id,
      label: sub.label,
      href: sub.href,
      score: mode === 'live' ? sub.liveScore : sub.staticScore,
      scoreLabel: formatReadinessScore(mode === 'live' ? sub.liveScore : sub.staticScore),
      testId: waveYrReadinessSectionTestId(sub.id),
    })),
    showVerboseDiagnostics: !compact,
  };
}

/** English audit tokens hidden in compact/core hub strip. */
export const WAVE_YR_COMPACT_FORBIDDEN_SNIPPETS = [
  'static',
  'live',
  'good/bad',
  'good:',
  'bad:',
  'fix:',
] as const;
