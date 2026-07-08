/**
 * Wave YS — final planner-runtime.json sync (waves SS…YP + TECH_DEBT + S1–S5 cross-cutting).
 * SoT for core-234 e2e + unit contract tests.
 */
import { PLATFORM_CORE_PLANNER_AGENT_ITEMS } from '@/lib/platform-core-planner-agent';
import type { PlannerRuntimeState } from '@/lib/server/platform-core-planner-runtime.server';

export const WAVE_YS_E2E_SPEC = 'core-234-wave-ys-planner-sync.spec.ts' as const;

/** Inclusive wave letter codes SS … YP (core-104 … core-231 + meta core-224). */
export const WAVE_YS_CLOSED_WAVE_CODES = [
  'SS',
  'ST',
  'SU',
  'SV',
  'SW',
  'SX',
  'SZ',
  'TB',
  'TE',
  'TF',
  'TK',
  'TL',
  'TN',
  'TP',
  'TQ',
  'TR',
  'TS',
  'TT',
  'TV',
  'TW',
  'TX',
  'TY',
  'TZ',
  'UA',
  'UC',
  'UD',
  'UE',
  'UF',
  'UG',
  'UH',
  'UI',
  'UK',
  'UL',
  'UM',
  'UN',
  'UP',
  'UQ',
  'UV',
  'UW',
  'UX',
  'UY',
  'VA',
  'VB',
  'VC',
  'VD',
  'VE',
  'VF',
  'VG',
  'VI',
  'VJ',
  'VK',
  'VL',
  'VM',
  'VN',
  'VO',
  'VQ',
  'VR',
  'VS',
  'VZ',
  'WA',
  'WB',
  'WC',
  'WD',
  'WE',
  'WF',
  'WG',
  'WH',
  'WI',
  'WJ',
  'WK',
  'WL',
  'WM',
  'WN',
  'WO',
  'WP',
  'WQ',
  'WR',
  'WS',
  'WT',
  'WU',
  'WV',
  'WW',
  'WX',
  'WY',
  'WZ',
  'XA',
  'XB',
  'XC',
  'XD',
  'XE',
  'XF',
  'XG',
  'XH',
  'XI',
  'XJ',
  'XK',
  'XL',
  'XM',
  'XN',
  'XO',
  'XP',
  'XQ',
  'XR',
  'XS',
  'XT',
  'XU',
  'XV',
  'XW',
  'XX',
  'XY',
  'XZ',
  'YA',
  'YB',
  'YC',
  'YD',
  'YE',
  'YF',
  'YG',
  'YH',
  'YI',
  'YJ',
  'YK',
  'YL',
  'YM',
  'YN',
  'YO',
  'YP',
] as const;

export type WaveYsCrossCuttingAxis = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

/** Resolved cross-cutting planner scan / agent ids (LS purge, push prefs, WMS, events, audit). */
export const WAVE_YS_CROSS_CUTTING: Record<
  WaveYsCrossCuttingAxis,
  { label: string; waves: string; itemIds: readonly string[] }
> = {
  S1: {
    label: 'localStorage fail-closed + PG BFF storageMode',
    waves: 'TU/VP/WR/XE/XZ + UZ/UR/UB/UJ/TC/SM/SL',
    itemIds: [
      'scan-7157zx-b2b-demo-logistics-blind',
      'scan-dev-brand-tasks-kanban-local',
      'scan-dev-shop-partner-session-ls',
      'scan-td-7157zx-stage-modules-ls',
      'td-brand-tasks-localstorage',
      'scan-dev-mfr-dossier-local-before-pg',
      'scan-dev-brand-w2-pg-blip-localstorage',
      'scan-dev-w2-pg-fail-localstorage-fallback',
      'scan-dev-w2-hub-localstorage-readpath',
      'scan-dev-brand-collection-inventory-local-overlay',
      'scan-dev-process-runtime-local',
      'scan-dev-shop-partner-session-localstorage',
      'scan-dev-brand-b2b-message-templates-local',
      'scan-td-range-planner-overlay-storage',
      'scan-td-b2b-message-templates-local',
      'scan-td-sketch-templates-localStorage',
      'scan-dev-shop-rep-offline-local',
      'scan-dev-shop-rep-offline-drafts-localstorage',
      'scan-td-7157zx-range-overlay-ls',
      'scan-td-brand-operations-ls-store',
      'scan-dev-brand-production-operations-localstorage',
      'scan-dev-brand-operations-console-ls',
      'scan-td-create-article-draft-ls',
      'scan-dev-brand-create-article-draft-ls',
      'scan-dev-brand-subcontractor-local-floor',
      'scan-dev-dossier-dual-write-offline',
      'scan-dev-brand-dossier-offline-cache-drift',
      'scan-td-7157zx-shop-comms-prefs-ls',
      'scan-7157zx-shop-comms-prefs-ls',
      'scan-dev-comms-templates-local-only',
      'scan-dev-b2b-message-templates-local',
      'scan-dev-brand-b2b-templates-ls',
      'agent-brand-tasks-localstorage',
      'td-api-process-store',
      'td-dossier-file-fallback',
    ],
  },
  S2: {
    label: 'chain-status push prefs PG + contextual SSE',
    waves: 'VK/SW/TW + comms pillar',
    itemIds: [
      'td-comms-no-realtime',
      'td-comms-sender-hardcoded',
      'agent-comms-no-realtime',
      'agent-comms-sender-hardcoded',
      'agent-comms-chat-memory',
      'td-comms-chat-memory',
    ],
  },
  S3: {
    label: 'WMS inventory reserve + checkout honest badge',
    waves: 'UX/CB/YH',
    itemIds: [
      'agent-shop-reserve-push',
      'agent-shop-batch-delivery-ack',
      'td-b2b-orders-json-snapshot',
      'td-b2b-orders-no-pg',
    ],
  },
  S4: {
    label: 'notification_events PG + production ops SoT',
    waves: 'SD/UP/XI',
    itemIds: ['td-no-pg-json-fallback', 'td-mocks-inventory', 'agent-no-pg-json-fallback'],
  },
  S5: {
    label: 'readiness audit 8.0 + RU dedup + cross-link peers',
    waves: 'VZ/WZ/YE/YF/YP',
    itemIds: [
      'td-demo-dupe-nav',
      'td-noise-session-banner',
      'td-missing-cross-role-e2e',
      'td-dead-end-empty27',
      'agent-brand-cross-role-uat',
      'agent-brand-cross-role-checkout-uat',
      'agent-ui-improvement-platform-dedup',
    ],
  },
};

/** Canonical TECH_DEBT registry ids (all resolved in wave YS). */
export const WAVE_YS_TECH_DEBT_IDS = [
  'td-ts-brand',
  'td-ts-shop-b2b',
  'td-api-process-store',
  'td-comms-chat-memory',
  'td-comms-sender-hardcoded',
  'td-comms-no-realtime',
  'td-brand-tasks-localstorage',
  'td-b2b-orders-json-snapshot',
  'td-b2b-invoice-pdf-stub',
  'td-b2b-orders-no-pg',
  'td-spine-no-single-pg-e2e',
  'td-dossier-file-fallback',
  'td-no-pg-json-fallback',
  'td-brand-create-article-wizard-gap',
  'td-mocks-inventory',
  'td-demo-dupe-nav',
  'td-missing-cross-role-e2e',
  'td-dead-end-empty27',
  'td-noise-session-banner',
  'td-monster-dossier',
  'td-monster-nav-matrix',
] as const;

export const WAVE_YS_AGENT_ITEM_IDS = PLATFORM_CORE_PLANNER_AGENT_ITEMS.map((r) => r.id);

export const WAVE_YS_WAVE_NOTES: Record<string, string> = Object.fromEntries(
  WAVE_YS_CLOSED_WAVE_CODES.map((code) => [
    code,
    `wave-${code.toLowerCase()}: closed wave YS sync (core-104…231); status done in planner-runtime`,
  ])
);

WAVE_YS_WAVE_NOTES.YS =
  'wave-ys: final planner-runtime sync SS…YP + TECH_DEBT + S1–S5 cross-cutting (core-234)';

export function waveYsCrossCuttingItemIds(): string[] {
  return (['S1', 'S2', 'S3', 'S4', 'S5'] as const).flatMap((k) => [
    ...WAVE_YS_CROSS_CUTTING[k].itemIds,
  ]);
}

export function waveYsPlannerSyncTargetIds(state: PlannerRuntimeState): string[] {
  const discoveredDev = (state.discoveredDevelopment ?? []).map((d) => d.id);
  const discoveredTd = (state.discoveredTechDebt ?? []).map((d) => d.id);
  const sessionIds = Object.keys(state.agentSessions ?? {});
  const priorStatus = Object.keys(state.statusById ?? {});

  return [
    ...new Set([
      ...priorStatus,
      ...discoveredDev,
      ...discoveredTd,
      ...WAVE_YS_TECH_DEBT_IDS,
      ...WAVE_YS_AGENT_ITEM_IDS,
      ...waveYsCrossCuttingItemIds(),
      ...sessionIds,
    ]),
  ];
}

export type WaveYsPlannerRuntimeSyncResult = {
  state: PlannerRuntimeState;
  syncedCount: number;
  newlyMarkedDone: number;
};

/** Apply wave YS closure patch to an in-memory runtime state (persist via writePlannerRuntimeState). */
export function applyWaveYsPlannerRuntimeSync(
  state: PlannerRuntimeState
): WaveYsPlannerRuntimeSyncResult {
  const statusById = { ...(state.statusById ?? {}) };
  const notes = { ...(state.notes ?? {}) };
  const waveNotes = { ...(state.waveNotes ?? {}), ...WAVE_YS_WAVE_NOTES };
  let newlyMarkedDone = 0;

  for (const id of waveYsPlannerSyncTargetIds(state)) {
    if (statusById[id] !== 'done') {
      newlyMarkedDone += 1;
    }
    statusById[id] = 'done';
  }

  for (const axis of ['S1', 'S2', 'S3', 'S4', 'S5'] as const) {
    const block = WAVE_YS_CROSS_CUTTING[axis];
    for (const id of block.itemIds) {
      notes[id] = `wave-ys-${axis.toLowerCase()}: ${block.label} (${block.waves}) — resolved`;
    }
  }

  for (const id of WAVE_YS_TECH_DEBT_IDS) {
    notes[id] = 'wave-ys: TECH_DEBT registry item resolved (core-234)';
  }

  notes['wave-ys-sync'] =
    `Wave YS final sync: ${WAVE_YS_CLOSED_WAVE_CODES.length} waves SS…YP + TECH_DEBT + S1–S5`;

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
    syncedCount: waveYsPlannerSyncTargetIds(state).length,
    newlyMarkedDone,
  };
}
