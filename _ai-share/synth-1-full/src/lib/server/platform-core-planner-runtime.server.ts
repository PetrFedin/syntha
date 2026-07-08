import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  collectPlatformCorePlannerRegistry,
  type PlannerItemKind,
  type PlannerRuntimeOverlay,
  type PlatformCoreTechDebtItem,
  type TechDebtCategory,
} from '@/lib/platform-core-planner';
import {
  isPlatformCorePlannerClosedWaveTitle,
  PLATFORM_CORE_PLANNER_CLOSED_WAVE_GENERATION,
} from '@/lib/platform-core-planner-auto-done';

export type PlannerTaskStatus = 'open' | 'in_progress' | 'done';

export type PlannerRuntimeClaim = {
  at: string;
  by: string;
};

export type PlannerDiscoveredDevItem = {
  id: string;
  kind: PlannerItemKind;
  priority: 'P0' | 'P1' | 'P2';
  title: string;
  evidence: string;
  href?: string;
  roleId?: CoreChainRoleId;
  pillarId?: CoreHubPillarId;
  addedAt: string;
};

export type PlannerDiscoveredTechDebtItem = PlatformCoreTechDebtItem & {
  evidence: string;
  addedAt: string;
};

export type PlannerAgentDispatch = {
  taskId: string;
  taskTitle: string;
  priority: string;
  by: string;
  startedAt: string;
  prompt: string;
  sessionId?: string;
};

export type PlannerAgentSessionRef = {
  taskId: string;
  taskTitle: string;
  startedAt: string;
  by: string;
};

export type PlannerRuntimeState = {
  updatedAt: string;
  lastAgentAt: string | null;
  statusById: Record<string, PlannerTaskStatus>;
  claims: Record<string, PlannerRuntimeClaim>;
  notes: Record<string, string>;
  /** Wave-level closure notes (wave YS sync). */
  waveNotes?: Record<string, string>;
  discoveredDevelopment: PlannerDiscoveredDevItem[];
  discoveredTechDebt: PlannerDiscoveredTechDebtItem[];
  agentDispatch: PlannerAgentDispatch | null;
  activeAgentSessionId?: string | null;
  agentSessions?: Record<string, PlannerAgentSessionRef>;
};

const RUNTIME_DIR = path.join(process.cwd(), '.planning');
const RUNTIME_FILE = path.join(RUNTIME_DIR, 'platform-core-planner-runtime.json');

const DISPATCH_FILE = path.join(RUNTIME_DIR, 'platform-core-agent-dispatch.json');

async function clearStaleAgentDispatchFile(): Promise<void> {
  try {
    await unlink(DISPATCH_FILE);
  } catch {
    /* no file */
  }
}

export { PLATFORM_CORE_PLANNER_CLOSED_WAVE_GENERATION };

function emptyState(): PlannerRuntimeState {
  return {
    updatedAt: new Date().toISOString(),
    lastAgentAt: null,
    statusById: {},
    claims: {},
    notes: {},
    discoveredDevelopment: [],
    discoveredTechDebt: [],
    agentDispatch: null,
    activeAgentSessionId: null,
    agentSessions: {},
  };
}

export async function readPlannerRuntimeState(): Promise<PlannerRuntimeState> {
  try {
    const raw = await readFile(RUNTIME_FILE, 'utf8');
    const parsed = JSON.parse(raw) as PlannerRuntimeState;
    const merged: PlannerRuntimeState = {
      ...emptyState(),
      ...parsed,
      statusById: parsed.statusById ?? {},
      claims: parsed.claims ?? {},
      notes: parsed.notes ?? {},
      waveNotes: parsed.waveNotes ?? {},
      discoveredDevelopment: parsed.discoveredDevelopment ?? [],
      discoveredTechDebt: parsed.discoveredTechDebt ?? [],
      agentDispatch: parsed.agentDispatch ?? null,
      activeAgentSessionId: parsed.activeAgentSessionId ?? null,
      agentSessions: parsed.agentSessions ?? {},
    };
    const scrubbed = scrubPlannerRuntimeClosedWave(merged);
    const changed =
      (parsed.discoveredDevelopment?.length ?? 0) !== scrubbed.discoveredDevelopment.length ||
      JSON.stringify(parsed.statusById ?? {}) !== JSON.stringify(scrubbed.statusById) ||
      JSON.stringify(parsed.claims ?? {}) !== JSON.stringify(scrubbed.claims) ||
      parsed.agentDispatch !== scrubbed.agentDispatch ||
      Object.keys(parsed.agentSessions ?? {}).length !==
        Object.keys(scrubbed.agentSessions ?? {}).length;
    if (changed) {
      await writePlannerRuntimeState(scrubbed);
      if (!scrubbed.agentDispatch) await clearStaleAgentDispatchFile();
    }
    return scrubbed;
  } catch {
    return emptyState();
  }
}

/** Удаляет закрытую e2e-волну из persisted runtime (discoveredDevelopment + in_progress claims). */
export function scrubPlannerRuntimeClosedWave(state: PlannerRuntimeState): PlannerRuntimeState {
  const before = state.discoveredDevelopment?.length ?? 0;
  const discoveredDevelopment = (state.discoveredDevelopment ?? []).filter(
    (d) => !isPlatformCorePlannerClosedWaveTitle(d.title)
  );
  const statusById = { ...(state.statusById ?? {}) };
  const claims = { ...(state.claims ?? {}) };
  for (const [id, title] of Object.entries(collectRuntimeTitles(state))) {
    if (!isPlatformCorePlannerClosedWaveTitle(title)) continue;
    statusById[id] = 'done';
    delete claims[id];
  }
  for (const { id, title } of collectPlatformCorePlannerRegistry()) {
    if (!isPlatformCorePlannerClosedWaveTitle(title)) continue;
    statusById[id] = 'done';
    delete claims[id];
  }
  const agentDispatch =
    state.agentDispatch && isPlatformCorePlannerClosedWaveTitle(state.agentDispatch.taskTitle)
      ? null
      : state.agentDispatch;
  const agentSessions = { ...(state.agentSessions ?? {}) };
  for (const [sid, ref] of Object.entries(agentSessions)) {
    if (
      isPlatformCorePlannerClosedWaveTitle(ref.taskTitle) ||
      (ref.taskId && statusById[ref.taskId] === 'done')
    ) {
      delete agentSessions[sid];
    }
  }
  const changed =
    before !== discoveredDevelopment.length ||
    Object.keys(claims).length !== Object.keys(state.claims ?? {}).length ||
    agentDispatch !== state.agentDispatch ||
    Object.keys(agentSessions).length !== Object.keys(state.agentSessions ?? {}).length;
  return {
    ...state,
    discoveredDevelopment,
    statusById,
    claims,
    agentDispatch,
    agentSessions,
    updatedAt: changed ? new Date().toISOString() : state.updatedAt,
  };
}

function collectRuntimeTitles(state: PlannerRuntimeState): Record<string, string> {
  const out: Record<string, string> = {};
  for (const d of state.discoveredDevelopment ?? []) out[d.id] = d.title;
  if (state.agentDispatch?.taskId) out[state.agentDispatch.taskId] = state.agentDispatch.taskTitle;
  for (const [sid, ref] of Object.entries(state.agentSessions ?? {})) {
    if (ref.taskId) out[ref.taskId] = ref.taskTitle;
    out[sid] = ref.taskTitle;
  }
  return out;
}

export async function forceScrubPlannerRuntimeClosedWave(): Promise<PlannerRuntimeState> {
  const state = await readPlannerRuntimeState();
  const scrubbed = scrubPlannerRuntimeClosedWave(state);
  await writePlannerRuntimeState(scrubbed);
  if (!scrubbed.agentDispatch) await clearStaleAgentDispatchFile();
  return scrubbed;
}

export async function writePlannerRuntimeState(state: PlannerRuntimeState): Promise<void> {
  await mkdir(RUNTIME_DIR, { recursive: true });
  const next: PlannerRuntimeState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(RUNTIME_FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

export async function patchPlannerTaskStatus(
  id: string,
  status: PlannerTaskStatus,
  by: string,
  note?: string
): Promise<PlannerRuntimeState> {
  const state = await readPlannerRuntimeState();
  state.statusById[id] = status;
  state.lastAgentAt = new Date().toISOString();
  if (status === 'in_progress') {
    state.claims[id] = { at: state.lastAgentAt, by };
  }
  if (note) state.notes[id] = note;
  await writePlannerRuntimeState(state);
  return state;
}

export function isDevPlannerApiEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}

export async function appendPlannerDiscoveredItems(input: {
  development: PlannerDiscoveredDevItem[];
  techDebt: PlannerDiscoveredTechDebtItem[];
}): Promise<PlannerRuntimeState> {
  const state = await readPlannerRuntimeState();
  const seenDev = new Set(state.discoveredDevelopment.map((d) => d.title.toLowerCase()));
  const seenDebt = new Set(state.discoveredTechDebt.map((d) => d.title.toLowerCase()));
  for (const item of input.development) {
    if (isPlatformCorePlannerClosedWaveTitle(item.title)) continue;
    if (seenDev.has(item.title.toLowerCase())) continue;
    seenDev.add(item.title.toLowerCase());
    state.discoveredDevelopment.push(item);
  }
  for (const item of input.techDebt) {
    if (seenDebt.has(item.title.toLowerCase())) continue;
    seenDebt.add(item.title.toLowerCase());
    state.discoveredTechDebt.push(item);
  }
  state.lastAgentAt = new Date().toISOString();
  await writePlannerRuntimeState(state);
  return state;
}

export async function setPlannerAgentDispatch(
  dispatch: PlannerAgentDispatch
): Promise<PlannerRuntimeState> {
  const state = await readPlannerRuntimeState();
  state.agentDispatch = dispatch;
  state.lastAgentAt = dispatch.startedAt;
  await writePlannerRuntimeState(state);
  await mkdir(RUNTIME_DIR, { recursive: true });
  await writeFile(DISPATCH_FILE, `${JSON.stringify(dispatch, null, 2)}\n`, 'utf8');
  return state;
}

export function runtimeToOverlay(state: PlannerRuntimeState): PlannerRuntimeOverlay {
  return {
    statusById: state.statusById,
    claims: state.claims,
    notes: state.notes,
    lastAgentAt: state.lastAgentAt,
    discoveredDevelopment: state.discoveredDevelopment.map((d) => ({
      ...d,
      roleId: d.roleId,
      pillarId: d.pillarId,
    })),
    discoveredTechDebt: state.discoveredTechDebt.map((d) => ({
      ...d,
      category: d.category as TechDebtCategory,
    })),
    agentDispatch: state.agentDispatch,
  };
}
