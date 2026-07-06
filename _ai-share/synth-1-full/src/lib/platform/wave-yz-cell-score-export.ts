/**
 * Wave YZ — readiness cell 8.0 score export strip + JSON API stub (extends wave YR).
 * SoT: platform-core-readiness-audit matrix + summarizePlatformCoreReadiness.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_HUB_ROWS, PLATFORM_CORE_PILLARS } from '@/lib/platform-core-hub-matrix';
import {
  formatReadinessScore,
  getPlatformCoreReadinessMatrix,
  summarizePlatformCoreReadiness,
  type ReadinessScoreMode,
  ROLE_LABELS,
} from '@/lib/platform-core-readiness-audit';

export const WAVE_YZ_READINESS_SCORES_API_PATH =
  '/api/workshop2/platform-core/readiness-scores' as const;

export const WAVE_YZ_READINESS_SCORE_EXPORT_STRIP_TESTID =
  'wave-yz-readiness-score-export-strip';
export const WAVE_YZ_READINESS_SCORE_EXPORT_SUMMARY_TESTID =
  'wave-yz-readiness-score-export-summary';
export const WAVE_YZ_READINESS_SCORE_EXPORT_JSON_LINK_TESTID =
  'wave-yz-readiness-score-export-json-link';

export const WAVE_YZ_EXPORT_LABEL_RU = 'Экспорт оценок';
export const WAVE_YZ_EXPORT_JSON_RU = 'JSON';
export const WAVE_YZ_EXPORT_CELLS_SUFFIX_RU = 'ячеек';
export const WAVE_YZ_SCORE_SUFFIX_RU = '/10';
export const WAVE_YZ_TARGET_MAX_SCORE = 8.0;

export const WAVE_YZ_E2E_SPEC = 'core-241-wave-yz-scores.spec.ts';

const ROLE_ABBR_RU: Record<CoreChainRoleId, string> = {
  brand: 'Бр',
  shop: 'Мг',
  manufacturer: 'Пр',
  supplier: 'Пс',
};

const PILLAR_ABBR_RU: Record<CoreHubPillarId, string> = {
  development: 'ТЗ',
  sample_collection: 'Кл',
  collection_order: 'Зк',
  order_production: 'Вып',
  comms: 'Св',
};

export type WaveYzReadinessScoreCellExport = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  roleLabelRu: string;
  pillarLabelRu: string;
  roleAbbrRu: string;
  pillarAbbrRu: string;
  active: boolean;
  staticScore: number | null;
  liveScore: number | null;
  scoreLabel: string;
  testId: string;
  compactLabelRu: string;
};

export type WaveYzReadinessScoresExportPayload = {
  collectionId: string;
  mode: ReadinessScoreMode;
  generatedAt: string;
  targetMaxScore: number;
  matrixSize: { roles: number; pillars: number; cells: number };
  summary: ReturnType<typeof summarizePlatformCoreReadiness>;
  cells: WaveYzReadinessScoreCellExport[];
  stripLineRu: string;
};

export function waveYzReadinessScoreCellTestId(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): string {
  return `wave-yz-readiness-score-${roleId}-${pillarId}`;
}

function pillarTitleRu(pillarId: CoreHubPillarId): string {
  return PLATFORM_CORE_PILLARS.find((p) => p.id === pillarId)?.title ?? pillarId;
}

export function buildWaveYzReadinessScoresExport(
  collectionId: string,
  options?: { liveChain?: boolean; mode?: ReadinessScoreMode }
): WaveYzReadinessScoresExportPayload {
  const mode: ReadinessScoreMode =
    options?.mode ?? (options?.liveChain === true ? 'live' : 'static');
  const cells = getPlatformCoreReadinessMatrix(collectionId, {
    liveChain: options?.liveChain === true,
  });
  const summary = summarizePlatformCoreReadiness(cells, mode);

  const exportedCells: WaveYzReadinessScoreCellExport[] = cells.map((cell) => {
    const score = mode === 'live' ? cell.liveScore : cell.staticScore;
    const scoreLabel = formatReadinessScore(score);
    const roleAbbrRu = ROLE_ABBR_RU[cell.roleId];
    const pillarAbbrRu = PILLAR_ABBR_RU[cell.pillarId];
    return {
      roleId: cell.roleId,
      pillarId: cell.pillarId,
      roleLabelRu: ROLE_LABELS[cell.roleId],
      pillarLabelRu: pillarTitleRu(cell.pillarId),
      roleAbbrRu,
      pillarAbbrRu,
      active: cell.active,
      staticScore: cell.staticScore,
      liveScore: cell.liveScore,
      scoreLabel,
      testId: waveYzReadinessScoreCellTestId(cell.roleId, cell.pillarId),
      compactLabelRu: `${roleAbbrRu}·${pillarAbbrRu} ${scoreLabel}`,
    };
  });

  const avgLabel = formatReadinessScore(summary.allCellsAvg);
  const stripLineRu = `${WAVE_YZ_EXPORT_LABEL_RU} · ${exportedCells.length} ${WAVE_YZ_EXPORT_CELLS_SUFFIX_RU} · ср. ${avgLabel}${WAVE_YZ_SCORE_SUFFIX_RU}`;

  return {
    collectionId,
    mode,
    generatedAt: new Date().toISOString(),
    targetMaxScore: WAVE_YZ_TARGET_MAX_SCORE,
    matrixSize: {
      roles: PLATFORM_CORE_HUB_ROWS.length,
      pillars: PLATFORM_CORE_PILLARS.length,
      cells: exportedCells.length,
    },
    summary,
    cells: exportedCells,
    stripLineRu,
  };
}

export function buildWaveYzReadinessScoresApiHref(
  collectionId: string,
  mode: ReadinessScoreMode = 'static'
): string {
  const sp = new URLSearchParams({ collectionId, mode });
  return `${WAVE_YZ_READINESS_SCORES_API_PATH}?${sp.toString()}`;
}

/** Active cells only — compact chips for hub export strip. */
export function waveYzReadinessScoreExportActiveCells(
  payload: WaveYzReadinessScoresExportPayload
): WaveYzReadinessScoreCellExport[] {
  return payload.cells.filter((c) => c.active && c.scoreLabel !== '—');
}
