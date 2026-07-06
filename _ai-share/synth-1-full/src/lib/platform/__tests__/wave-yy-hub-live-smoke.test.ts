import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_YY_CORE_E2E_SPEC,
  WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS,
  WAVE_YY_HUB_LIVE_SMOKE_ROUTES,
  WAVE_YY_HUB_MATRIX_CELLS,
  WAVE_YY_HUB_MATRIX_YQ_CORE_E2E_SPEC,
  waveYyCoreE2eSpecGlob,
  waveYyHubMatrixPlaywrightFilter,
} from '@/lib/platform/wave-yy-hub-live-smoke';
import { WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS } from '@/lib/platform/wave-yq-hub-matrix-5x4';

const PKG_ROOT = path.join(__dirname, '..', '..', '..', '..');
const E2E_DIR = path.join(PKG_ROOT, 'e2e');
const PLAYWRIGHT_CORE_CONFIG = path.join(PKG_ROOT, 'playwright.core.config.ts');

describe('wave YY — hub live smoke routes (extends YQ matrix)', () => {
  it('documents 14 active routes from wave YQ matrix', () => {
    expect(WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS).toHaveLength(14);
    expect(WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS).toEqual(WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS);
    expect(WAVE_YY_HUB_LIVE_SMOKE_ROUTES).toHaveLength(14);
  });

  it.each(WAVE_YY_HUB_LIVE_SMOKE_ROUTES)('$id — workspaceHref from YQ matrix', (route) => {
    const yq = WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS.find((c) => c.id === route.id)!;
    expect(route.workspaceHref).toBe(yq.workspaceHref);
    expect(route.roleId).toBe(yq.roleId);
    expect(route.pillarId).toBe(yq.pillarId);
    expect(route.workspaceHref).not.toMatch(/^\/404|undefined|null/i);
  });

  it('inactive YQ cells excluded from live smoke batch', () => {
    const inactiveIds = WAVE_YY_HUB_MATRIX_CELLS.filter((c) => !c.active).map((c) => c.id);
    const activeIds = WAVE_YY_HUB_LIVE_SMOKE_ACTIVE_CELLS.map((c) => c.id);
    expect(inactiveIds).toHaveLength(6);
    for (const id of inactiveIds) {
      expect(activeIds).not.toContain(id);
    }
  });

  it('playwright filter targets core-240 spec', () => {
    expect(waveYyHubMatrixPlaywrightFilter()).toBe(`e2e/${WAVE_YY_CORE_E2E_SPEC}`);
  });

  it('core-240 e2e spec — file + playwright.core.config.ts entry', () => {
    expect(fs.existsSync(path.join(E2E_DIR, WAVE_YY_CORE_E2E_SPEC))).toBe(true);
    expect(fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8')).toContain(waveYyCoreE2eSpecGlob());
  });

  it('extends YQ core-232 full matrix spec', () => {
    expect(WAVE_YY_HUB_MATRIX_YQ_CORE_E2E_SPEC).toBe('core-232-wave-yq-hub-matrix-5x4.spec.ts');
    expect(fs.existsSync(path.join(E2E_DIR, WAVE_YY_HUB_MATRIX_YQ_CORE_E2E_SPEC))).toBe(true);
  });
});
