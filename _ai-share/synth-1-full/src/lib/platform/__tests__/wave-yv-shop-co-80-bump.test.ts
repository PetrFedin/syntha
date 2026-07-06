import fs from 'node:fs';
import path from 'node:path';
import {
  getPlatformCoreReadinessMatrix,
  getReadinessCell,
} from '@/lib/platform-core-readiness-audit';
import {
  WAVE_YV_E2E_SPEC,
  WAVE_YV_SHOP_CO_AUDIT_CLOSURES,
  WAVE_YV_SHOP_CO_CELL_PILLAR,
  WAVE_YV_SHOP_CO_CELL_ROLE,
  WAVE_YV_SHOP_CO_CELL_SCORE_MIN,
  WAVE_YV_SHOP_CO_GOLDEN_PATH_DEDUP,
  WAVE_YV_SHOP_CO_SECTION_IDS_80,
  waveYvShopCoGoldenPathLabelsRu,
} from '@/lib/platform/wave-yv-shop-co-80-bump';

const PKG_ROOT = path.join(__dirname, '..', '..', '..', '..');
const SRC = path.join(PKG_ROOT, 'src');
const PLAYWRIGHT_CORE_CONFIG = path.join(PKG_ROOT, 'playwright.core.config.ts');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YV — shop CO audit §6 8.0 bump (YK/XT/WM/XL/WG)', () => {
  it('documents nine §6 closure sections + golden path dedup rules', () => {
    expect(WAVE_YV_SHOP_CO_SECTION_IDS_80.length).toBe(9);
    expect(WAVE_YV_SHOP_CO_AUDIT_CLOSURES.length).toBe(9);
    expect(WAVE_YV_SHOP_CO_GOLDEN_PATH_DEDUP.length).toBeGreaterThanOrEqual(6);
  });

  it('golden path labels RU — five CO spine steps', () => {
    const labels = waveYvShopCoGoldenPathLabelsRu();
    expect(labels).toEqual(['Матрица', 'Оформление', 'Пополнение', 'Реестр', 'Трекинг']);
  });

  it('shop collection_order cell — staticScore >= 8.0 + wave YV evidence', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const cell = getReadinessCell(cells, WAVE_YV_SHOP_CO_CELL_ROLE, WAVE_YV_SHOP_CO_CELL_PILLAR);
    expect(cell?.staticScore).toBeGreaterThanOrEqual(WAVE_YV_SHOP_CO_CELL_SCORE_MIN);
    expect(cell?.liveScore).toBeGreaterThanOrEqual(WAVE_YV_SHOP_CO_CELL_SCORE_MIN);
    expect(cell?.good.some((g) => /wave YV/i.test(g))).toBe(true);
  });

  it.each(WAVE_YV_SHOP_CO_SECTION_IDS_80)('%s — section staticScore 8.0', (sectionId) => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const cell = getReadinessCell(cells, WAVE_YV_SHOP_CO_CELL_ROLE, WAVE_YV_SHOP_CO_CELL_PILLAR);
    const section = cell?.subItems.find((s) => s.id === sectionId);
    expect(section).toBeDefined();
    expect(section!.staticScore).toBeGreaterThanOrEqual(WAVE_YV_SHOP_CO_CELL_SCORE_MIN);
    expect(section!.liveScore).toBeGreaterThanOrEqual(WAVE_YV_SHOP_CO_CELL_SCORE_MIN);
    expect(section!.bad ?? []).toEqual([]);
    expect(section!.fix ?? []).toEqual([]);
    expect(section!.good.some((g) => /wave YV/i.test(g))).toBe(true);
  });

  it.each(WAVE_YV_SHOP_CO_AUDIT_CLOSURES)('$id — source wired', (item) => {
    const text = read(item.sourceFile);
    for (const needle of item.sourceMustContain) {
      expect(text).toContain(needle);
    }
    for (const tid of item.testids) {
      expect(tid.length).toBeGreaterThan(3);
    }
  });

  it.each(WAVE_YV_SHOP_CO_GOLDEN_PATH_DEDUP)('$id — golden path dedup', (item) => {
    const text = read(item.file);
    for (const needle of item.mustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of item.mustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });

  it(`${WAVE_YV_E2E_SPEC} — on disk + playwright.core.config.ts`, () => {
    expect(fs.existsSync(path.join(PKG_ROOT, 'e2e', WAVE_YV_E2E_SPEC))).toBe(true);
    const config = fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8');
    expect(config).toContain(`**/${WAVE_YV_E2E_SPEC}`);
  });
});
