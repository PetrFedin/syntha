import fs from 'node:fs';
import path from 'node:path';
import {
  buildWaveYzReadinessScoresApiHref,
  buildWaveYzReadinessScoresExport,
  waveYzReadinessScoreCellTestId,
  WAVE_YZ_E2E_SPEC,
  WAVE_YZ_EXPORT_LABEL_RU,
  WAVE_YZ_READINESS_SCORE_EXPORT_JSON_LINK_TESTID,
  WAVE_YZ_READINESS_SCORE_EXPORT_STRIP_TESTID,
  WAVE_YZ_READINESS_SCORE_EXPORT_SUMMARY_TESTID,
  WAVE_YZ_READINESS_SCORES_API_PATH,
  WAVE_YZ_TARGET_MAX_SCORE,
} from '@/lib/platform/wave-yz-cell-score-export';
import { PLATFORM_CORE_HUB_ROWS, PLATFORM_CORE_PILLARS } from '@/lib/platform-core-hub-matrix';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

/** Wave YZ — readiness cell 8.0 score export strip + JSON API (extends wave YR). */
export const WAVE_YZ_HUB_WIRING = [
  {
    id: 'hub-audit-launcher-inline-matrix',
    file: 'components/platform/PlatformCoreHubAuditLauncher.tsx',
    mustContain: [
      'PlatformCorePillarRoleScoreMatrix',
      'Оценка готовности',
      'Матрица 5×4',
      'hideSectionHeader',
    ],
    mustNotContain: ['WaveYzReadinessScoreExportStrip', 'Открыть матрицу', '<Sheet'] as string[],
  },
  {
    id: 'export-strip-component-ru',
    file: 'components/platform/WaveYzReadinessScoreExportStrip.tsx',
    mustContain: [
      'WAVE_YZ_EXPORT_LABEL_RU',
      'WAVE_YZ_READINESS_SCORE_EXPORT_STRIP_TESTID',
      'WAVE_YZ_READINESS_SCORE_EXPORT_JSON_LINK_TESTID',
      'waveYzReadinessScoreExportActiveCells',
    ],
    mustNotContain: ['good/bad', 'Release gate'],
  },
  {
    id: 'readiness-scores-api-route',
    file: 'app/api/workshop2/platform-core/readiness-scores/route.ts',
    mustContain: ['buildWaveYzReadinessScoresExport', 'guardWorkshop2Route', 'readiness-scores'],
    mustNotContain: [] as string[],
  },
] as const;

describe('wave YZ — readiness score export strip + API', () => {
  it.each(WAVE_YZ_HUB_WIRING)(
    '$id — wiring + RU labels',
    ({ file, mustContain, mustNotContain }) => {
      const text = read(file);
      for (const snippet of mustContain) {
        expect(text).toContain(snippet);
      }
      for (const snippet of mustNotContain) {
        expect(text).not.toContain(snippet);
      }
    }
  );

  it('buildWaveYzReadinessScoresExport — 4×5 matrix with summary', () => {
    const payload = buildWaveYzReadinessScoresExport('SS27', { mode: 'static' });
    expect(payload.collectionId).toBe('SS27');
    expect(payload.mode).toBe('static');
    expect(payload.targetMaxScore).toBe(WAVE_YZ_TARGET_MAX_SCORE);
    expect(payload.matrixSize.roles).toBe(PLATFORM_CORE_HUB_ROWS.length);
    expect(payload.matrixSize.pillars).toBe(PLATFORM_CORE_PILLARS.length);
    expect(payload.matrixSize.cells).toBe(20);
    expect(payload.cells).toHaveLength(20);
    expect(payload.summary.scoredCellCount).toBeGreaterThan(0);
    expect(payload.stripLineRu).toContain(WAVE_YZ_EXPORT_LABEL_RU);
    expect(payload.stripLineRu).toMatch(/ср\./);
  });

  it('active cells — score labels within 8.0 calibration band', () => {
    const payload = buildWaveYzReadinessScoresExport('SS27');
    const active = payload.cells.filter((c) => c.active);
    expect(active.length).toBeGreaterThanOrEqual(14);
    for (const cell of active) {
      expect(cell.scoreLabel).toMatch(/^\d(\.\d)?$/);
      const n = Number(cell.scoreLabel);
      expect(n).toBeGreaterThanOrEqual(5.5);
      expect(n).toBeLessThanOrEqual(WAVE_YZ_TARGET_MAX_SCORE);
      expect(cell.testId).toBe(waveYzReadinessScoreCellTestId(cell.roleId, cell.pillarId));
      expect(cell.compactLabelRu).toMatch(/^[А-Яа-я]{2}·[А-Яа-я]{2,3} \d/);
    }
  });

  it('buildWaveYzReadinessScoresApiHref — collection + mode query', () => {
    const href = buildWaveYzReadinessScoresApiHref('SS27', 'static');
    expect(href).toContain(WAVE_YZ_READINESS_SCORES_API_PATH);
    expect(href).toContain('collectionId=SS27');
    expect(href).toContain('mode=static');
  });

  it('extends wave YR — cabinet strip unchanged', () => {
    const hub = read('components/platform/RoleCoreCabinetHub.tsx');
    expect(hub).toContain('WaveYrReadinessCellDashboardStrip');
    expect(hub).not.toContain('WaveYzReadinessScoreExportStrip');
  });

  it(`${WAVE_YZ_E2E_SPEC} — file on disk + playwright.core.config.ts entry`, () => {
    const pkgRoot = path.join(SRC, '..');
    expect(fs.existsSync(path.join(pkgRoot, 'e2e', WAVE_YZ_E2E_SPEC))).toBe(true);
    const config = fs.readFileSync(path.join(pkgRoot, 'playwright.core.config.ts'), 'utf8');
    expect(config).toContain(`**/${WAVE_YZ_E2E_SPEC}`);
  });
});
