import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_YS_CLOSED_WAVE_CODES,
  WAVE_YS_CROSS_CUTTING,
  WAVE_YS_E2E_SPEC,
  WAVE_YS_TECH_DEBT_IDS,
  WAVE_YS_WAVE_NOTES,
  applyWaveYsPlannerRuntimeSync,
  waveYsPlannerSyncTargetIds,
} from '@/lib/platform/wave-ys-planner-runtime-sync';
import type { PlannerRuntimeState } from '@/lib/server/platform-core-planner-runtime.server';

const RUNTIME_PATH = path.join(process.cwd(), '.planning', 'platform-core-planner-runtime.json');
const PLAYWRIGHT_CORE_CONFIG = path.join(process.cwd(), 'playwright.core.config.ts');

function readRuntime(): PlannerRuntimeState {
  return JSON.parse(fs.readFileSync(RUNTIME_PATH, 'utf8')) as PlannerRuntimeState;
}

describe('wave YS — planner-runtime.json final sync', () => {
  it('documents SS…YP closed wave batch', () => {
    expect(WAVE_YS_CLOSED_WAVE_CODES[0]).toBe('SS');
    expect(WAVE_YS_CLOSED_WAVE_CODES.at(-1)).toBe('YP');
    expect(WAVE_YS_CLOSED_WAVE_CODES.length).toBeGreaterThanOrEqual(120);
  });

  it('S1–S5 cross-cutting blocks have resolved item ids', () => {
    for (const axis of ['S1', 'S2', 'S3', 'S4', 'S5'] as const) {
      expect(WAVE_YS_CROSS_CUTTING[axis].itemIds.length).toBeGreaterThan(0);
    }
    expect(WAVE_YS_CROSS_CUTTING.S1.itemIds).toContain('td-brand-tasks-localstorage');
    expect(WAVE_YS_CROSS_CUTTING.S3.itemIds).toContain('agent-shop-reserve-push');
  });

  it('TECH_DEBT registry ids — all listed for YS closure', () => {
    expect(WAVE_YS_TECH_DEBT_IDS.length).toBe(21);
    expect(WAVE_YS_TECH_DEBT_IDS).toContain('td-ts-brand');
    expect(WAVE_YS_TECH_DEBT_IDS).toContain('td-monster-nav-matrix');
  });

  it('persisted runtime — wave YS sync applied (statusById + waveNotes)', () => {
    const runtime = readRuntime();
    const targetIds = waveYsPlannerSyncTargetIds(runtime);
    const notDone = targetIds.filter((id) => runtime.statusById?.[id] !== 'done');
    expect(notDone).toEqual([]);

    expect(runtime.waveNotes?.YS).toMatch(/wave-ys/i);
    expect(runtime.waveNotes?.SS).toMatch(/wave-ss/i);
    expect(runtime.waveNotes?.YP).toMatch(/wave-yp/i);
    expect(runtime.notes?.['wave-ys-sync']).toMatch(/Wave YS final sync/i);

    for (const id of WAVE_YS_TECH_DEBT_IDS) {
      expect(runtime.statusById?.[id]).toBe('done');
      expect(runtime.notes?.[id]).toMatch(/TECH_DEBT|wave-ys/i);
    }
  });

  it('applyWaveYsPlannerRuntimeSync — idempotent (0 newly marked on re-apply)', () => {
    const runtime = readRuntime();
    const second = applyWaveYsPlannerRuntimeSync(runtime);
    expect(second.newlyMarkedDone).toBe(0);
    expect(second.syncedCount).toBeGreaterThan(500);
  });

  it('wave notes cover every closed wave code', () => {
    for (const code of WAVE_YS_CLOSED_WAVE_CODES) {
      expect(WAVE_YS_WAVE_NOTES[code]).toMatch(new RegExp(`wave-${code.toLowerCase()}`, 'i'));
    }
  });

  it(`${WAVE_YS_E2E_SPEC} — registered in playwright.core.config.ts`, () => {
    const config = fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8');
    expect(config).toContain(WAVE_YS_E2E_SPEC);
  });
});
