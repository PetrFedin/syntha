import fs from 'node:fs';
import path from 'node:path';
import { WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS } from '@/lib/platform/wave-yq-hub-matrix-5x4';
import {
  WAVE_YX_CORE_E2E_SPEC,
  WAVE_YX_HUB_DEAD_END_FIXES,
  WAVE_YX_HUB_DEAD_END_FIX_COUNT,
  WAVE_YX_READ_ONLY_PEER_SUFFIX_RU,
  scanWaveYxHubAliasLoops,
  scanWaveYxHubMatrixHrefDeadEnds,
  scanWaveYxReadinessSectionHrefDeadEnds,
  waveYxBrandLinesheetsHrefMatchesGolden,
  waveYxCrossRoleLinkTitleRu,
  waveYxHubMatrixCellCount,
} from '@/lib/platform/wave-yx-hub-dead-end-fix';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YX — hub dead-end + broken href audit fix (all roles)', () => {
  it(`documents ${WAVE_YX_HUB_DEAD_END_FIX_COUNT} closed href fixes (ZD + YX)`, () => {
    expect(WAVE_YX_HUB_DEAD_END_FIXES.length).toBeGreaterThanOrEqual(14);
    expect(WAVE_YX_HUB_DEAD_END_FIX_COUNT).toBe(WAVE_YX_HUB_DEAD_END_FIXES.length);
  });

  it('scanWaveYxHubMatrixHrefDeadEnds — 14 active YQ workspace hrefs clean', () => {
    expect(WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS).toHaveLength(14);
    expect(scanWaveYxHubMatrixHrefDeadEnds()).toEqual([]);
  });

  it('scanWaveYxReadinessSectionHrefDeadEnds — SS27 section audit hrefs clean', () => {
    expect(scanWaveYxReadinessSectionHrefDeadEnds('SS27')).toEqual([]);
  });

  it('scanWaveYxHubAliasLoops — active cells resolve to golden workspaces', () => {
    expect(scanWaveYxHubAliasLoops()).toEqual([]);
  });

  it('waveYxBrandLinesheetsHref — golden /brand/linesheets SS27', () => {
    expect(waveYxBrandLinesheetsHrefMatchesGolden('SS27')).toBe(true);
  });

  it('wave YX hub matrix — 20 cells documented', () => {
    expect(waveYxHubMatrixCellCount()).toBe(20);
  });

  it('waveYxCrossRoleLinkTitleRu — RU read-only peer tooltip', () => {
    const title = waveYxCrossRoleLinkTitleRu('Магазин', 'Не ведёт разработку артикулов');
    expect(title).toContain('Магазин');
    expect(title).toContain(WAVE_YX_READ_ONLY_PEER_SUFFIX_RU);
    expect(title).toContain('Не ведёт разработку артикулов');
  });

  it.each(WAVE_YX_HUB_DEAD_END_FIXES)('$id — source wired + dead-end cleared', (fix) => {
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
    expect(text).not.toContain('ROUTES.shop.b2bOrderMode');
    expect(text).not.toContain('ROUTES.shop.b2bOrderDrafts');
    expect(text).toContain('ROUTES.shop.b2bPartnersDiscover');
    expect(text).toContain('ROUTES.shop.b2bCalendar');
    expect(text).toContain('ROUTES.shop.b2bMatrix');
  });

  it('core-239 e2e spec — file on disk + playwright.core.config.ts entry', () => {
    const pkgRoot = path.join(SRC, '..');
    expect(fs.existsSync(path.join(pkgRoot, 'e2e', WAVE_YX_CORE_E2E_SPEC))).toBe(true);
    const configText = fs.readFileSync(path.join(pkgRoot, 'playwright.core.config.ts'), 'utf8');
    expect(configText).toContain(`**/${WAVE_YX_CORE_E2E_SPEC}`);
  });
});
