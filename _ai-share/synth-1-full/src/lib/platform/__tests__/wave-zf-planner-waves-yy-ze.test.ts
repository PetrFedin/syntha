import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_ZF_CLOSED_WAVE_CODES,
  WAVE_ZF_CROSS_CUTTING,
  WAVE_ZF_E2E_SPEC,
  WAVE_ZF_WAVE_NOTES,
  applyWaveZfPlannerRuntimeSync,
  waveZfPlannerSyncTargetIds,
} from '@/lib/platform/wave-zf-planner-runtime-sync';
import type { PlannerRuntimeState } from '@/lib/server/platform-core-planner-runtime.server';

const RUNTIME_PATH = path.join(
  process.cwd(),
  '.planning',
  'platform-core-planner-runtime.json'
);
const PLAYWRIGHT_CORE_CONFIG = path.join(process.cwd(), 'playwright.core.config.ts');

function readRuntime(): PlannerRuntimeState {
  return JSON.parse(fs.readFileSync(RUNTIME_PATH, 'utf8')) as PlannerRuntimeState;
}

describe('wave ZF — planner-runtime.json YY…ZE sync', () => {
  it('documents YY…ZE closed wave batch', () => {
    expect(WAVE_ZF_CLOSED_WAVE_CODES[0]).toBe('YY');
    expect(WAVE_ZF_CLOSED_WAVE_CODES.at(-1)).toBe('ZE');
    expect(WAVE_ZF_CLOSED_WAVE_CODES.length).toBe(7);
  });

  it('S1–S5 final cross-cutting blocks have item ids', () => {
    for (const axis of ['S1', 'S2', 'S3', 'S4', 'S5'] as const) {
      expect(WAVE_ZF_CROSS_CUTTING[axis].itemIds.length).toBeGreaterThan(0);
    }
    expect(WAVE_ZF_CROSS_CUTTING.S1.itemIds).toContain('td-dead-end-empty27');
    expect(WAVE_ZF_CROSS_CUTTING.S3.itemIds).toContain('agent-shop-co-matrix-quota-ui');
    expect(WAVE_ZF_CROSS_CUTTING.S5.itemIds).toContain('td-noise-session-banner');
  });

  it('persisted runtime — wave ZF sync applied (statusById + waveNotes)', () => {
    const runtime = readRuntime();
    const targetIds = waveZfPlannerSyncTargetIds(runtime);
    const notDone = targetIds.filter((id) => runtime.statusById?.[id] !== 'done');
    expect(notDone).toEqual([]);

    expect(runtime.waveNotes?.ZF).toMatch(/wave-zf/i);
    expect(runtime.waveNotes?.YY).toMatch(/wave-yy/i);
    expect(runtime.waveNotes?.ZE).toMatch(/wave-ze/i);
    expect(runtime.notes?.['wave-zf-sync']).toMatch(/Wave ZF final sync/i);

    for (const axis of ['S1', 'S2', 'S3', 'S4', 'S5'] as const) {
      const id = WAVE_ZF_CROSS_CUTTING[axis].itemIds[0];
      expect(runtime.notes?.[id]).toMatch(/wave-zf-s\d|final/i);
    }
  });

  it('applyWaveZfPlannerRuntimeSync — idempotent (0 newly marked on re-apply)', () => {
    const runtime = readRuntime();
    const second = applyWaveZfPlannerRuntimeSync(runtime);
    expect(second.newlyMarkedDone).toBe(0);
    expect(second.syncedCount).toBeGreaterThan(500);
  });

  it('wave notes cover every YY…ZE code', () => {
    for (const code of WAVE_ZF_CLOSED_WAVE_CODES) {
      expect(WAVE_ZF_WAVE_NOTES[code]).toMatch(new RegExp(`wave-${code.toLowerCase()}`, 'i'));
    }
  });

  it(`${WAVE_ZF_E2E_SPEC} — registered in playwright.core.config.ts`, () => {
    const config = fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8');
    expect(config).toContain(WAVE_ZF_E2E_SPEC);
  });
});
