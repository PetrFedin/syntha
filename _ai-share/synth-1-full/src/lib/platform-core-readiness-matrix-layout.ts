import { cn } from '@/lib/utils';
import { platformCoreHubLayout } from '@/lib/platform-core-hub-layout';

export function readinessMatrixCellKey(roleId: string, pillarId: string) {
  return `${roleId}__${pillarId}`;
}

/** Колонка «Роль» — фиксированная ширина. */
export const READINESS_ROLE_COL =
  'w-[5.35rem] min-w-[5.35rem] max-w-[5.35rem] shrink-0 bg-white align-middle';

/** Sticky только в общей таблице (desktop / широкий экран). */
export const READINESS_ROLE_COL_STICKY = cn(
  READINESS_ROLE_COL,
  'sticky left-0 z-30 border-border-subtle border-r bg-white'
);

export const READINESS_PILLAR_COL =
  'relative z-0 w-[4.65rem] min-w-[4.65rem] max-w-[4.65rem] px-0.5 text-center align-middle';

export const READINESS_MATRIX_HEAD_H = platformCoreHubLayout.matrixHeadRow;

export const READINESS_MATRIX_BODY_H = platformCoreHubLayout.matrixBodyRow;

export const READINESS_PILLAR_HEAD = cn(READINESS_PILLAR_COL, READINESS_MATRIX_HEAD_H);

export const READINESS_SCORE_BOX =
  'inline-flex h-6 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-bold tabular-nums transition-colors';

export const READINESS_ROW_LABEL = 'flex h-full items-center py-0';

export const READINESS_CELL_CORE =
  'flex h-full items-center justify-center gap-0.5 px-0.5';

export const MATRIX_COL_LABEL =
  'text-text-primary block max-w-full text-[8px] font-semibold leading-[1.18] sm:text-[9px]';