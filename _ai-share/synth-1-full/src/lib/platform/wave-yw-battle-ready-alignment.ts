/**
 * Wave YW — agent:battle-ready alignment + planner-runtime YI…YP status sync.
 * SoT for core-238 e2e + unit contract tests. Read-only BFF probes only (no FastAPI/pytest overlap).
 */
import type { PlannerRuntimeState } from '@/lib/server/platform-core-planner-runtime.server';
import { WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API } from '@/lib/platform/wave-yw-shop-checkout-payment';
import {
  WAVE_YS_TECH_DEBT_IDS,
  waveYsPlannerSyncTargetIds,
} from '@/lib/platform/wave-ys-planner-runtime-sync';

export const WAVE_YW_E2E_SPEC = 'core-238-wave-yw-battle-ready.spec.ts' as const;

/** Heavy checkout UI path — not registered in playwright.core.config (battle-ready smoke only). */
export const WAVE_YW_CHECKOUT_E2E_SPEC = 'core-238-wave-yw-checkout.spec.ts' as const;

/** Monorepo shell script — documented for conflict avoidance in unit tests. */
export const WAVE_YW_BATTLE_READY_SHELL = 'scripts/agent-battle-ready.sh' as const;

/** Closed wave letter codes YI … YP (core-224 … core-231). */
export const WAVE_YW_CLOSED_WAVE_CODES = [
  'YI',
  'YJ',
  'YK',
  'YL',
  'YM',
  'YN',
  'YO',
  'YP',
] as const;

export type WaveYwBattleReadyProbeLayer = 'platform_core' | 'planner' | 'payment' | 'spine';

export type WaveYwBattleReadyProbe = {
  id: string;
  layer: WaveYwBattleReadyProbeLayer;
  method: 'GET';
  path: string;
  /** Function name in scripts/agent-battle-ready.sh */
  battleReadyCheck: string;
  maxStatus?: number;
  /** When true, core-238 e2e may probe (read-only, no side effects). */
  e2eSafe: boolean;
};

/** Read-only :3001 probes aligned with agent:battle-ready (shell owns :8000 + pytest). */
export const WAVE_YW_BATTLE_READY_PROBES: readonly WaveYwBattleReadyProbe[] = [
  {
    id: 'syntha-status',
    layer: 'platform_core',
    method: 'GET',
    path: '/api/dev/syntha-status',
    battleReadyCheck: 'check_planner',
    e2eSafe: true,
  },
  {
    id: 'planner-queue',
    layer: 'planner',
    method: 'GET',
    path: '/api/dev/platform-core/planner?collection=SS27',
    battleReadyCheck: 'check_planner',
    e2eSafe: true,
    maxStatus: 404,
  },
  {
    id: 'platform-spine-health',
    layer: 'spine',
    method: 'GET',
    path: '/api/workshop2/platform-core/health',
    battleReadyCheck: 'ensure_core_dev',
    e2eSafe: true,
  },
  {
    id: 'payment-intent-probe',
    layer: 'payment',
    method: 'GET',
    path: WAVE_YW_SHOP_CO_CHECKOUT_PAYMENT_INTENT_API,
    battleReadyCheck: 'wave_yw_checkout',
    e2eSafe: true,
  },
];

/** Checks owned exclusively by agent-battle-ready.sh — e2e must not duplicate. */
export const WAVE_YW_BATTLE_READY_EXCLUDED: readonly { check: string; reason: string }[] = [
  {
    check: 'ensure_fastapi',
    reason: 'FastAPI :8000 + uvicorn lifecycle owned by shell script',
  },
  {
    check: 'run_backend_unit',
    reason: 'pytest in monorepo root — not Playwright scope',
  },
  {
    check: 'run_routing_eval',
    reason: 'tests/eval/test_agent_routing_eval.py — shell only',
  },
  {
    check: 'probe_routing_api',
    reason: 'GET :8000/platform/stack/agents/routing — shell only',
  },
  {
    check: 'probe_registry_api',
    reason: 'GET :8000/platform/stack/agents/registry — shell only',
  },
  {
    check: 'probe_task_dev_scan',
    reason: 'POST :8000/ai/task/dev (120s) — shell only',
  },
  {
    check: 'probe_platform_bff',
    reason: 'POST :3001/api/dev/platform-ai/task (120s) — shell only',
  },
  {
    check: 'run_ollama_eval_optional',
    reason: 'agent-eval-ollama.sh — shell only; SKIP_OLLAMA_EVAL=1 respected there',
  },
  {
    check: 'check_cursor_subagents',
    reason: 'filesystem .cursor/agents scan — shell only',
  },
];

const CORE_BY_WAVE: Record<(typeof WAVE_YW_CLOSED_WAVE_CODES)[number], string> = {
  YI: '224',
  YJ: '225',
  YK: '226',
  YL: '227',
  YM: '228',
  YN: '229',
  YO: '230',
  YP: '231',
};

export const WAVE_YW_WAVE_NOTES: Record<string, string> = Object.fromEntries(
  WAVE_YW_CLOSED_WAVE_CODES.map((code) => [
    code,
    `wave-${code.toLowerCase()}: closed wave YW sync (core-${CORE_BY_WAVE[code]}); battle-ready aligned`,
  ])
);

WAVE_YW_WAVE_NOTES.YW =
  'wave-yw: agent:battle-ready alignment + YI…YP planner-runtime sync (core-238)';

/** Planner item ids touched by battle-ready shell (marked done on YW sync). */
export const WAVE_YW_BATTLE_READY_PLANNER_ITEM_IDS = [
  'agent-hub-routing-api',
  'agent-brand-cross-role-checkout-uat',
  'td-b2b-orders-no-pg',
] as const;

export function waveYwE2eSafeProbePaths(): string[] {
  return WAVE_YW_BATTLE_READY_PROBES.filter((p) => p.e2eSafe).map((p) => p.path);
}

export function waveYwPlannerSyncTargetIds(state: PlannerRuntimeState): string[] {
  return [
    ...new Set([
      ...waveYsPlannerSyncTargetIds(state),
      ...WAVE_YW_BATTLE_READY_PLANNER_ITEM_IDS,
    ]),
  ];
}

export type WaveYwPlannerRuntimeSyncResult = {
  state: PlannerRuntimeState;
  syncedCount: number;
  newlyMarkedDone: number;
};

/** Apply wave YW closure patch (persist via writePlannerRuntimeState or JSON write). */
export function applyWaveYwPlannerRuntimeSync(
  state: PlannerRuntimeState
): WaveYwPlannerRuntimeSyncResult {
  const statusById = { ...(state.statusById ?? {}) };
  const notes = { ...(state.notes ?? {}) };
  const waveNotes = { ...(state.waveNotes ?? {}), ...WAVE_YW_WAVE_NOTES };
  let newlyMarkedDone = 0;

  for (const id of waveYwPlannerSyncTargetIds(state)) {
    if (statusById[id] !== 'done') {
      newlyMarkedDone += 1;
    }
    statusById[id] = 'done';
  }

  for (const id of WAVE_YW_BATTLE_READY_PLANNER_ITEM_IDS) {
    if ((WAVE_YS_TECH_DEBT_IDS as readonly string[]).includes(id)) {
      continue;
    }
    notes[id] = 'wave-yw: agent:battle-ready alignment — resolved (core-238)';
  }

  notes['wave-yw-sync'] =
    `Wave YW sync: ${WAVE_YW_CLOSED_WAVE_CODES.length} waves YI…YP + battle-ready BFF probes`;

  return {
    state: {
      ...state,
      statusById,
      notes,
      waveNotes,
      updatedAt: new Date().toISOString(),
      lastAgentAt: state.lastAgentAt ?? new Date().toISOString(),
    },
    syncedCount: waveYwPlannerSyncTargetIds(state).length,
    newlyMarkedDone,
  };
}
