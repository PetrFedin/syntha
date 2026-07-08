import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import fs from 'node:fs';
import path from 'node:path';
import { WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS } from '@/lib/platform/wave-yq-hub-matrix-5x4';
import {
  WAVE_ZD_CORE_E2E_SPEC,
  WAVE_ZD_DEAD_END_LINK_FIXES,
  WAVE_ZD_LINKS_FIXED_COUNT,
  scanWaveYqMatrixHrefDeadEnds,
  waveZdBrandLinesheetsHrefMatchesGolden,
  waveZdYqMatrixCellCount,
} from '@/lib/platform/wave-zd-dead-end-link-fix';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave ZD — dead-end link fix batch (hub matrix YQ + distributor nav)', () => {
  it(`documents ${WAVE_ZD_LINKS_FIXED_COUNT} closed href fixes`, () => {
    expect(WAVE_ZD_DEAD_END_LINK_FIXES).toHaveLength(12);
    expect(WAVE_ZD_LINKS_FIXED_COUNT).toBe(12);
  });

  it('scanWaveYqMatrixHrefDeadEnds — 14 active YQ workspace hrefs clean', () => {
    expect(WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS).toHaveLength(14);
    expect(scanWaveYqMatrixHrefDeadEnds()).toEqual([]);
  });

  it('waveZdBrandLinesheetsHref — golden /brand/linesheets SS27', () => {
    expect(waveZdBrandLinesheetsHrefMatchesGolden('SS27')).toBe(true);
  });

  it('wave YQ matrix — 20 cells documented for ZD scan scope', () => {
    expect(waveZdYqMatrixCellCount()).toBe(20);
  });

  it.each(WAVE_ZD_DEAD_END_LINK_FIXES)('$id — source wired + dead-end cleared', (fix) => {
    for (const tid of fix.testids) {
      expect(tid.length).toBeGreaterThan(3);
    }
    const text = read(fix.sourceFile);
    for (const needle of fix.sourceMustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.sourceMustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });

  it('distributor navigation — no legacy discover / order-mode / order-drafts tails', () => {
    const text = read('lib/data/distributor-navigation.ts');
    expect(text).not.toMatch(/ROUTES\.shop\.b2bDiscover[^P]/);
    expect(text).not.toContain('LEGACY_ROUTES.shop.b2bOrderMode');
    expect(text).not.toContain('LEGACY_ROUTES.shop.b2bOrderDrafts');
    expect(text).toContain('ROUTES.shop.b2bPartnersDiscover');
    expect(text).toContain('ROUTES.shop.b2bCalendar');
    expect(text).toContain('ROUTES.shop.b2bMatrix');
  });

  it('core-245 e2e spec — file on disk + playwright.core.config.ts entry', () => {
    const pkgRoot = path.join(SRC, '..');
    expect(fs.existsSync(path.join(pkgRoot, 'e2e', WAVE_ZD_CORE_E2E_SPEC))).toBe(true);
    const configText = fs.readFileSync(path.join(pkgRoot, 'playwright.core.config.ts'), 'utf8');
    expect(configText).toContain(`**/${WAVE_ZD_CORE_E2E_SPEC}`);
  });
});
