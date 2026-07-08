/**
 * Wave ZF — planner-runtime.json sync (waves YY…ZE + S1–S5 final markers).
 * SoT for core-247 e2e + unit contract tests. Extends wave YS closure.
 */
import { PLATFORM_CORE_PLANNER_AGENT_ITEMS } from '@/lib/platform-core-planner-agent';
import type { PlannerRuntimeState } from '@/lib/server/platform-core-planner-runtime.server';
import {
  WAVE_YS_TECH_DEBT_IDS,
  waveYsPlannerSyncTargetIds,
} from '@/lib/platform/wave-ys-planner-runtime-sync';

export const WAVE_ZF_E2E_SPEC = 'core-247-wave-zf-planner.spec.ts' as const;

/** Closed wave letter codes YY … ZE (core-240 … core-246). */
export const WAVE_ZF_CLOSED_WAVE_CODES = ['YY', 'YZ', 'ZA', 'ZB', 'ZC', 'ZD', 'ZE'] as const;

export type WaveZfCrossCuttingAxis = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

/** Final S1–S5 markers after YY…ZE batch (extends YS cross-cutting closure). */
export const WAVE_ZF_CROSS_CUTTING: Record<
  WaveZfCrossCuttingAxis,
  { label: string; waves: string; itemIds: readonly string[] }
> = {
  S1: {
    label: 'hub matrix 5×4 live smoke + dead-end href fixes',
    waves: 'YY/YD/YQ',
    itemIds: [
      'td-dead-end-empty27',
      'td-missing-cross-role-e2e',
      'agent-hub-routing-api',
      'scan-td-7157zx-stage-review-dead-end',
    ],
  },
  S2: {
    label: 'readiness cell dashboard + score export strip/API',
    waves: 'YZ/YR/YQ',
    itemIds: [
      'agent-brand-cross-role-uat',
      'agent-brand-cross-role-checkout-uat',
      'td-missing-cross-role-e2e',
    ],
  },
  S3: {
    label: 'audit §6 8.0 score bumps (supplier OP + shop CO)',
    waves: 'ZB/ZC/YJ/YK',
    itemIds: [
      'agent-mfr-handoff-anomaly-e2e',
      'agent-shop-co-matrix-quota-ui',
      'agent-shop-co-registry-anomaly',
      'td-b2b-orders-no-pg',
    ],
  },
  S4: {
    label: 'ADR backlog for intentional read-only empty cells',
    waves: 'ZA/YM/YV',
    itemIds: [
      'td-brand-create-article-wizard-gap',
      'td-dead-end-empty27',
      'td-spine-no-single-pg-e2e',
    ],
  },
  S5: {
    label: 'RU microcopy pass 3 — hub diagnostics without English noise',
    waves: 'ZE/YT/YF/WZ',
    itemIds: [
      'td-noise-session-banner',
      'td-demo-dupe-nav',
      'agent-ui-improvement-platform-dedup',
      'td-monster-nav-matrix',
    ],
  },
};

export const WAVE_ZF_AGENT_ITEM_IDS = PLATFORM_CORE_PLANNER_AGENT_ITEMS.map((r) => r.id);

const CORE_BY_WAVE: Record<string, string> = {
  YY: '240',
  YZ: '241',
  ZA: '242',
  ZB: '243',
  ZC: '244',
  ZD: '245',
  ZE: '246',
};

export const WAVE_ZF_WAVE_NOTES: Record<string, string> = Object.fromEntries(
  WAVE_ZF_CLOSED_WAVE_CODES.map((code) => [
    code,
    `wave-${code.toLowerCase()}: closed wave ZF sync (core-${CORE_BY_WAVE[code]}); status done in planner-runtime`,
  ])
);

WAVE_ZF_WAVE_NOTES.ZF =
  'wave-zf: final planner-runtime sync YY…ZE + S1–S5 final markers (core-247)';

export function waveZfCrossCuttingItemIds(): string[] {
  return (['S1', 'S2', 'S3', 'S4', 'S5'] as const).flatMap((k) => [
    ...WAVE_ZF_CROSS_CUTTING[k].itemIds,
  ]);
}

export function waveZfPlannerSyncTargetIds(state: PlannerRuntimeState): string[] {
  const sessionIds = Object.keys(state.agentSessions ?? {});
  return [
    ...new Set([
      ...waveYsPlannerSyncTargetIds(state),
      ...WAVE_ZF_AGENT_ITEM_IDS,
      ...waveZfCrossCuttingItemIds(),
      ...sessionIds,
    ]),
  ];
}

export type WaveZfPlannerRuntimeSyncResult = {
  state: PlannerRuntimeState;
  syncedCount: number;
  newlyMarkedDone: number;
};

/** Apply wave ZF closure patch (persist via writePlannerRuntimeState or JSON write). */
export function applyWaveZfPlannerRuntimeSync(
  state: PlannerRuntimeState
): WaveZfPlannerRuntimeSyncResult {
  const statusById = { ...(state.statusById ?? {}) };
  const notes = { ...(state.notes ?? {}) };
  const waveNotes = { ...(state.waveNotes ?? {}), ...WAVE_ZF_WAVE_NOTES };
  let newlyMarkedDone = 0;

  for (const id of waveZfPlannerSyncTargetIds(state)) {
    if (statusById[id] !== 'done') {
      newlyMarkedDone += 1;
    }
    statusById[id] = 'done';
  }

  for (const axis of ['S1', 'S2', 'S3', 'S4', 'S5'] as const) {
    const block = WAVE_ZF_CROSS_CUTTING[axis];
    for (const id of block.itemIds) {
      notes[id] = `wave-zf-${axis.toLowerCase()}: ${block.label} (${block.waves}) — final`;
    }
  }

  for (const id of WAVE_YS_TECH_DEBT_IDS) {
    notes[id] = 'wave-zf: TECH_DEBT registry item final (core-247)';
  }

  notes['wave-zf-sync'] =
    `Wave ZF final sync: ${WAVE_ZF_CLOSED_WAVE_CODES.length} waves YY…ZE + S1–S5 final markers`;

  return {
    state: {
      ...state,
      statusById,
      notes,
      waveNotes,
      claims: {},
      agentDispatch: null,
      activeAgentSessionId: null,
      agentSessions: {},
      updatedAt: new Date().toISOString(),
      lastAgentAt: state.lastAgentAt ?? new Date().toISOString(),
    },
    syncedCount: waveZfPlannerSyncTargetIds(state).length,
    newlyMarkedDone,
  };
}
