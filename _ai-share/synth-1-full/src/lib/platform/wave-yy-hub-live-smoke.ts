/**
 * Wave YY — live hub matrix 5×4 smoke helper (extends wave YQ routes).
 * E2E: core-240-wave-yy-hub-live-smoke.spec.ts
 * Batch: scripts/core-hub-matrix-verify.sh · npm run test:e2e:core:hub-matrix
 */
import {
  WAVE_YQ_COLLECTION_ID,
  WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS,
  WAVE_YQ_HUB_MATRIX_CELLS,
  type WaveYqHubMatrixCell,
} from '@/lib/platform/wave-yq-hub-matrix-5x4';

export const WAVE_YY_COLLECTION_ID = WAVE_YQ_COLLECTION_ID;

export const WAVE_YY_CORE_E2E_SPEC = 'core-240-wave-yy-hub-live-smoke.spec.ts' as const;

/** Full YQ hub matrix e2e (peer strips + anchors) — referenced for batch docs. */
export const WAVE_YY_HUB_MATRIX_YQ_CORE_E2E_SPEC =
  'core-232-wave-yq-hub-matrix-5x4.spec.ts' as const;

export type WaveYyHubLiveSmokeCell = WaveYqHubMatrixCell;

/** 14 active hub cells — same SoT as wave YQ. */
export const WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS = WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS;

/** All 20 cells (for docs / inactive exclusion checks). */
export const WAVE_YY_HUB_MATRIX_CELLS = WAVE_YQ_HUB_MATRIX_CELLS;

export type WaveYyHubLiveSmokeRoute = {
  id: WaveYyHubLiveSmokeCell['id'];
  roleId: WaveYyHubLiveSmokeCell['roleId'];
  pillarId: WaveYyHubLiveSmokeCell['pillarId'];
  workspaceHref: string;
};

/** Documented workspace routes for batch verify (wave YQ matrix). */
export const WAVE_YY_HUB_LIVE_SMOKE_ROUTES: readonly WaveYyHubLiveSmokeRoute[] =
  WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS.map((cell) => ({
    id: cell.id,
    roleId: cell.roleId,
    pillarId: cell.pillarId,
    workspaceHref: cell.workspaceHref,
  }));

export function waveYyCoreE2eSpecGlob(basename = WAVE_YY_CORE_E2E_SPEC): string {
  return `**/${basename}`;
}

/** Playwright filter for hub-matrix live smoke (core-240). */
export function waveYyHubMatrixPlaywrightFilter(): string {
  return `e2e/${WAVE_YY_CORE_E2E_SPEC}`;
}
