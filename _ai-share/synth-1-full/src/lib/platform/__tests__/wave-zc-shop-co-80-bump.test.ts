import fs from 'node:fs';
import path from 'node:path';
import {
  getPlatformCoreReadinessMatrix,
  getReadinessCell,
} from '@/lib/platform-core-readiness-audit';
import {
  WAVE_ZC_E2E_SPEC,
  WAVE_ZC_SHOP_CO_AUDIT_CLOSURES,
  WAVE_ZC_SHOP_CO_CELL_PILLAR,
  WAVE_ZC_SHOP_CO_CELL_ROLE,
  WAVE_ZC_SHOP_CO_CELL_SCORE_MIN,
  WAVE_ZC_SHOP_CO_SECTION_IDS_80,
  waveZcShopCoGoldenPathLabelsRu,
} from '@/lib/platform/wave-zc-shop-co-80-bump';

const PKG_ROOT = path.join(__dirname, '..', '..', '..', '..');
const SRC = path.join(PKG_ROOT, 'src');
const PLAYWRIGHT_CORE_CONFIG = path.join(PKG_ROOT, 'playwright.core.config.ts');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave ZC — shop CO audit §6 8.0 bump (YK/XT/WM/XL)', () => {
  it('documents nine §6 closure sections', () => {
    expect(WAVE_ZC_SHOP_CO_SECTION_IDS_80.length).toBe(9);
    expect(WAVE_ZC_SHOP_CO_AUDIT_CLOSURES.length).toBe(9);
  });

  it('golden path labels RU — five steps', () => {
    const labels = waveZcShopCoGoldenPathLabelsRu();
    expect(labels).toEqual(['Матрица', 'Оформление', 'Пополнение', 'Реестр', 'Трекинг']);
  });

  it('shop collection_order cell — staticScore >= 8.0', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const cell = getReadinessCell(cells, WAVE_ZC_SHOP_CO_CELL_ROLE, WAVE_ZC_SHOP_CO_CELL_PILLAR);
    expect(cell?.staticScore).toBeGreaterThanOrEqual(WAVE_ZC_SHOP_CO_CELL_SCORE_MIN);
    expect(cell?.good.some((g) => /wave (ZC|YV)/i.test(g))).toBe(true);
  });

  it.each(WAVE_ZC_SHOP_CO_SECTION_IDS_80)('%s — section staticScore 8.0', (sectionId) => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const cell = getReadinessCell(cells, WAVE_ZC_SHOP_CO_CELL_ROLE, WAVE_ZC_SHOP_CO_CELL_PILLAR);
    const section = cell?.subItems.find((s) => s.id === sectionId);
    expect(section).toBeDefined();
    expect(section!.staticScore).toBeGreaterThanOrEqual(WAVE_ZC_SHOP_CO_CELL_SCORE_MIN);
    expect(section!.bad ?? []).toEqual([]);
    expect(section!.fix ?? []).toEqual([]);
  });

  it.each(WAVE_ZC_SHOP_CO_AUDIT_CLOSURES)('$id — source wired', (item) => {
    const text = read(item.sourceFile);
    for (const needle of item.sourceMustContain) {
      expect(text).toContain(needle);
    }
    for (const tid of item.testids) {
      expect(tid.length).toBeGreaterThan(3);
    }
  });

  it(`${WAVE_ZC_E2E_SPEC} — on disk + playwright.core.config.ts`, () => {
    expect(fs.existsSync(path.join(PKG_ROOT, 'e2e', WAVE_ZC_E2E_SPEC))).toBe(true);
    const config = fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8');
    expect(config).toContain(`**/${WAVE_ZC_E2E_SPEC}`);
  });
});
