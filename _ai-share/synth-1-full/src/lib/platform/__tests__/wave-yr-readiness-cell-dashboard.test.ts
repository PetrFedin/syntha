import fs from 'node:fs';
import path from 'node:path';
import {
  buildWaveYrReadinessCellDashboardModel,
  mapReadinessCellToDashboardModel,
  waveYrReadinessSectionTestId,
} from '@/lib/platform/wave-yr-readiness-cell-dashboard';
import { getReadinessCell, getPlatformCoreReadinessMatrix } from '@/lib/platform-core-readiness-audit';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

/** Wave YR — readiness cell score dashboard strip in hub cabinet (RU, compact). */
export const WAVE_YR_HUB_WIRING = [
  {
    id: 'role-cabinet-hub-strip',
    file: 'components/platform/RoleCoreCabinetHub.tsx',
    mustContain: [
      'WaveYrReadinessCellDashboardStrip',
      'shouldShowHubCabinetInvestorReadinessStrip',
      'roleId={roleId}',
      'pillarId={selectedPillar}',
    ],
    mustNotContain: [] as string[],
  },
  {
    id: 'strip-component-ru',
    file: 'components/platform/WaveYrReadinessCellDashboardStrip.tsx',
    mustContain: [
      'WAVE_YR_CELL_SCORE_LABEL_RU',
      'WAVE_YR_SECTIONS_LABEL_RU',
      'WAVE_YR_READINESS_CELL_DASHBOARD_STRIP_TESTID',
      'WAVE_YR_READINESS_CELL_SCORE_TESTID',
      'showVerboseDiagnostics',
    ],
    mustNotContain: ['good/bad', 'Release gate'],
  },
] as const;

describe('wave YR — readiness cell dashboard strip', () => {
  it.each(WAVE_YR_HUB_WIRING)('$id — wiring + RU labels', ({ file, mustContain, mustNotContain }) => {
    const text = read(file);
    for (const snippet of mustContain) {
      expect(text).toContain(snippet);
    }
    for (const snippet of mustNotContain) {
      expect(text).not.toContain(snippet);
    }
  });

  it('brand × development — cell model with section chips from readiness-sections', () => {
    const model = buildWaveYrReadinessCellDashboardModel('brand', 'development', 'SS27', {
      compact: true,
    });
    expect(model).not.toBeNull();
    expect(model!.active).toBe(true);
    expect(model!.cellScore).not.toBeNull();
    expect(model!.sections.length).toBeGreaterThanOrEqual(4);
    expect(model!.showVerboseDiagnostics).toBe(false);
    expect(model!.sections[0]?.testId).toBe(waveYrReadinessSectionTestId(model!.sections[0]!.id));
    expect(model!.sections.some((s) => /цех|досье/i.test(s.label))).toBe(true);
  });

  it('shop × sample_collection — section scores present', () => {
    const model = buildWaveYrReadinessCellDashboardModel('shop', 'sample_collection', 'SS27', {
      compact: true,
    });
    expect(model).not.toBeNull();
    expect(model!.sections.length).toBeGreaterThan(0);
    for (const section of model!.sections) {
      expect(section.scoreLabel).toMatch(/^\d(\.\d)?$/);
      expect(section.score).toBeGreaterThanOrEqual(5);
    }
  });

  it('compact model — no verbose diagnostics flag', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const cell = getReadinessCell(cells, 'brand', 'development');
    expect(cell).toBeDefined();
    const compact = mapReadinessCellToDashboardModel(cell!, { compact: true });
    const verbose = mapReadinessCellToDashboardModel(cell!, { compact: false });
    expect(compact.showVerboseDiagnostics).toBe(false);
    expect(verbose.showVerboseDiagnostics).toBe(true);
  });

  it('compact strip labels — RU constants wired, no audit list rendering', () => {
    const strip = read('components/platform/WaveYrReadinessCellDashboardStrip.tsx');
    expect(strip).toContain('WAVE_YR_SCORE_SUFFIX_RU');
    expect(strip).not.toContain('sub.good');
    expect(strip).not.toContain('sub.bad');
    expect(strip).not.toContain('sub.fix');
    expect(strip).not.toMatch(/>static</i);
    expect(strip).not.toMatch(/>live</i);
  });

  it('core-233 e2e spec — file on disk + playwright.core.config.ts entry', () => {
    const pkgRoot = path.join(SRC, '..');
    expect(fs.existsSync(path.join(pkgRoot, 'e2e/core-233-wave-yr-cell-dashboard.spec.ts'))).toBe(
      true
    );
    const config = fs.readFileSync(path.join(pkgRoot, 'playwright.core.config.ts'), 'utf8');
    expect(config).toContain('**/core-233-wave-yr-cell-dashboard.spec.ts');
  });
});
