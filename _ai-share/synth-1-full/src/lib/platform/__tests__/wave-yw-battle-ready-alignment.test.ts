import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_YW_BATTLE_READY_EXCLUDED,
  WAVE_YW_BATTLE_READY_PROBES,
  WAVE_YW_BATTLE_READY_SHELL,
  WAVE_YW_CHECKOUT_E2E_SPEC,
  WAVE_YW_CLOSED_WAVE_CODES,
  WAVE_YW_E2E_SPEC,
  WAVE_YW_WAVE_NOTES,
  applyWaveYwPlannerRuntimeSync,
  waveYwE2eSafeProbePaths,
  waveYwPlannerSyncTargetIds,
} from '@/lib/platform/wave-yw-battle-ready-alignment';
import type { PlannerRuntimeState } from '@/lib/server/platform-core-planner-runtime.server';

const RUNTIME_PATH = path.join(process.cwd(), '.planning', 'platform-core-planner-runtime.json');
const PLAYWRIGHT_CORE_CONFIG = path.join(process.cwd(), 'playwright.core.config.ts');
const BATTLE_READY_SHELL = path.join(process.cwd(), '..', '..', 'scripts', 'agent-battle-ready.sh');

function readRuntime(): PlannerRuntimeState {
  return JSON.parse(fs.readFileSync(RUNTIME_PATH, 'utf8')) as PlannerRuntimeState;
}

describe('wave YW — agent:battle-ready alignment', () => {
  it('documents YI…YP closed wave batch', () => {
    expect(WAVE_YW_CLOSED_WAVE_CODES[0]).toBe('YI');
    expect(WAVE_YW_CLOSED_WAVE_CODES.at(-1)).toBe('YP');
    expect(WAVE_YW_CLOSED_WAVE_CODES.length).toBe(8);
  });

  it('e2e-safe probes are read-only GET on :3001 BFF', () => {
    for (const probe of WAVE_YW_BATTLE_READY_PROBES) {
      expect(probe.method).toBe('GET');
      expect(probe.e2eSafe).toBe(true);
      expect(probe.path.startsWith('/api/')).toBe(true);
    }
    expect(waveYwE2eSafeProbePaths()).toHaveLength(WAVE_YW_BATTLE_READY_PROBES.length);
  });

  it('excluded checks do not overlap e2e-safe probe battleReadyCheck ids', () => {
    const e2eChecks = new Set(WAVE_YW_BATTLE_READY_PROBES.map((p) => p.battleReadyCheck));
    for (const row of WAVE_YW_BATTLE_READY_EXCLUDED) {
      expect(e2eChecks.has(row.check)).toBe(false);
    }
    expect(WAVE_YW_BATTLE_READY_EXCLUDED.length).toBeGreaterThanOrEqual(8);
  });

  it('shell script exists and does not invoke playwright core e2e', () => {
    expect(WAVE_YW_BATTLE_READY_SHELL).toBe('scripts/agent-battle-ready.sh');
    const shell = fs.readFileSync(BATTLE_READY_SHELL, 'utf8');
    expect(shell).toMatch(/agent-battle-ready/);
    expect(shell).not.toMatch(/test:e2e:core/);
    expect(shell).not.toMatch(/playwright\.core\.config/);
  });

  it('checkout spec is separate from battle-ready smoke spec', () => {
    expect(WAVE_YW_E2E_SPEC).toBe('core-238-wave-yw-battle-ready.spec.ts');
    expect(WAVE_YW_CHECKOUT_E2E_SPEC).toBe('core-238-wave-yw-checkout.spec.ts');
    expect(WAVE_YW_E2E_SPEC).not.toBe(WAVE_YW_CHECKOUT_E2E_SPEC);
  });

  it('persisted runtime — wave YW sync applied (YI…YP waveNotes + YW marker)', () => {
    const runtime = readRuntime();
    const targetIds = waveYwPlannerSyncTargetIds(runtime);
    const notDone = targetIds.filter((id) => runtime.statusById?.[id] !== 'done');
    expect(notDone).toEqual([]);

    expect(runtime.waveNotes?.YW).toMatch(/wave-yw/i);
    expect(runtime.waveNotes?.YI).toMatch(/wave-yi|core-224/i);
    expect(runtime.waveNotes?.YP).toMatch(/wave-yp|core-231/i);
    expect(runtime.notes?.['wave-yw-sync']).toMatch(/Wave YW sync/i);

    for (const code of WAVE_YW_CLOSED_WAVE_CODES) {
      expect(runtime.waveNotes?.[code]).toMatch(/battle-ready aligned|wave-yw/i);
    }
  });

  it('applyWaveYwPlannerRuntimeSync — idempotent (0 newly marked on re-apply)', () => {
    const runtime = readRuntime();
    const second = applyWaveYwPlannerRuntimeSync(runtime);
    expect(second.newlyMarkedDone).toBe(0);
    expect(second.syncedCount).toBeGreaterThan(500);
  });

  it('wave notes cover every YI…YP code', () => {
    for (const code of WAVE_YW_CLOSED_WAVE_CODES) {
      expect(WAVE_YW_WAVE_NOTES[code]).toMatch(new RegExp(`wave-${code.toLowerCase()}`, 'i'));
    }
  });

  it(`${WAVE_YW_E2E_SPEC} — registered in playwright.core.config.ts`, () => {
    const config = fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8');
    expect(config).toContain(WAVE_YW_E2E_SPEC);
    expect(config).not.toContain(WAVE_YW_CHECKOUT_E2E_SPEC);
  });
});
