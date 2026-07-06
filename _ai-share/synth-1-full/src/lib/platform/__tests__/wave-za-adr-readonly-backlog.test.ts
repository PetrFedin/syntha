import fs from 'node:fs';
import path from 'node:path';
import { hasEmptyCellInsightPanel } from '@/lib/platform-core-empty-cell-registry';
import { buildEmptySectionSubItems } from '@/lib/platform-core-readiness-sections';
import {
  WAVE_ZA_ADR_DOC,
  WAVE_ZA_ADR_ID,
  WAVE_ZA_ADR_READONLY_BACKLOG,
  WAVE_ZA_E2E_SPEC,
  waveZaAdrBacklogForSection,
} from '@/lib/platform/wave-za-adr-readonly-backlog';

const PKG_ROOT = path.join(process.cwd());
const SRC = path.join(PKG_ROOT, 'src');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave ZA — ADR read-only empty cells backlog', () => {
  it('documents 5 intentional read-only empty-cell anchors', () => {
    expect(WAVE_ZA_ADR_READONLY_BACKLOG.length).toBe(5);
  });

  it('ADR-003 stub doc exists on disk', () => {
    const adrPath = path.join(PKG_ROOT, WAVE_ZA_ADR_DOC);
    expect(fs.existsSync(adrPath)).toBe(true);
    const text = fs.readFileSync(adrPath, 'utf8');
    expect(text).toContain(WAVE_ZA_ADR_ID);
    expect(text).toContain('read-only');
  });

  it.each(WAVE_ZA_ADR_READONLY_BACKLOG)('$id — empty cell insight registered', (item) => {
    expect(hasEmptyCellInsightPanel(item.role, item.pillar)).toBe(true);
    expect(item.adrRef).toBe(WAVE_ZA_ADR_ID);
    expect(item.wasBad.length).toBeGreaterThan(10);
  });

  it.each(WAVE_ZA_ADR_READONLY_BACKLOG)(
    '$id — section bad cleared, wasBad in adrBacklog',
    (item) => {
      const hit = buildEmptySectionSubItems(item.role, item.pillar, 'SS27').find(
        (s) => s.id === item.sectionId
      );
      expect(hit).toBeDefined();
      expect(hit?.bad ?? []).toEqual([]);
      expect(hit?.fix ?? []).toEqual([]);
      expect(hit?.adrBacklog ?? []).toContain(`${WAVE_ZA_ADR_ID}: ${item.wasBad}`);
      expect(hit?.good.some((g) => /Wave ZA|ADR-003|core-242/i.test(g))).toBe(true);
    }
  );

  it.each(WAVE_ZA_ADR_READONLY_BACKLOG)('$id — closure testids wired in source', (item) => {
    for (const tid of item.testids) {
      expect(tid.length).toBeGreaterThan(3);
    }
    if (item.sourceFile) {
      const text = read(item.sourceFile);
      for (const needle of item.sourceMustContain ?? item.testids) {
        expect(text).toContain(needle);
      }
    }
  });

  it('waveZaAdrBacklogForSection — maps wasBad to ADR-prefixed strings', () => {
    const backlog = waveZaAdrBacklogForSection('shop-empty-dev-status');
    expect(backlog.length).toBe(1);
    expect(backlog[0]).toMatch(/^ADR-003:/);
  });

  it('empty-cells-audit.ts — Wave ZA + adrBacklog fields', () => {
    const audit = read('lib/platform-core-readiness-sections/empty-cells-audit.ts');
    expect(audit).toContain('wave-za-adr-readonly-backlog');
    expect(audit).toContain('adrBacklog: waveZaAdrBacklogForSection');
    expect(audit).toContain('Wave ZA: read-only');
  });

  it('core-242 e2e spec — file on disk + playwright.core.config.ts entry', () => {
    const specPath = path.join(PKG_ROOT, 'e2e', WAVE_ZA_E2E_SPEC);
    expect(fs.existsSync(specPath)).toBe(true);
    const config = fs.readFileSync(path.join(PKG_ROOT, 'playwright.core.config.ts'), 'utf8');
    expect(config).toContain(WAVE_ZA_E2E_SPEC);
  });
});
