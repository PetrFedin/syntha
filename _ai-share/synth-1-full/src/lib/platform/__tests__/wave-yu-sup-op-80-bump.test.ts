import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_YU_ADR_BACKLOG,
  WAVE_YU_AUDIT_CRITERION_6,
  WAVE_YU_E2E_SPEC,
  WAVE_YU_PREREQ_WAVE_CODES,
  WAVE_YU_SUP_OP_AUDIT_STATIC_SCORE,
  WAVE_YU_SUP_OP_CELL_PILLAR,
  WAVE_YU_SUP_OP_CELL_ROLE,
  WAVE_YU_SUP_OP_PROCUREMENT_SECTION_ID,
  WAVE_YU_SUP_OP_SECTION_IDS,
  WAVE_YU_SUP_OP_SPOT_TESTIDS,
  findWaveYuSupOpCell,
  findWaveYuSupOpProcurementSection,
  waveYuPrereqE2eSpecsRegistered,
  waveYuSupOp80BumpCheck,
  waveYuSupOp80BumpCriteriaMet,
  waveYuSupOpProcurementApis,
} from '@/lib/platform/wave-yu-sup-op-80-bump';

const PKG_ROOT = path.join(__dirname, '..', '..', '..', '..');
const PLAYWRIGHT_CORE_CONFIG = path.join(PKG_ROOT, 'playwright.core.config.ts');

describe('wave YU — sup-op order_production audit 8.0 bump (YJ/YI/WP/WI)', () => {
  it('documents six closure criteria', () => {
    expect(WAVE_YU_AUDIT_CRITERION_6.length).toBe(6);
    expect(WAVE_YU_AUDIT_CRITERION_6.map((c) => c.id)).toEqual([
      'c1-bad-fix-cleared',
      'c2-wave-yj',
      'c3-wave-wi',
      'c4-wave-wp',
      'c5-wave-yi',
      'c6-wave-yu',
    ]);
  });

  it('prereq waves YJ/YI/WP/WI + WI/WP in YI registry', () => {
    expect(WAVE_YU_PREREQ_WAVE_CODES).toEqual(['YJ', 'YI', 'WP', 'WI']);
    const e2e = waveYuPrereqE2eSpecsRegistered();
    expect(e2e.inYiRegistry).toContain('core-172-wave-wi-partial-ship.spec.ts');
    expect(e2e.inYiRegistry).toContain('core-179-wave-wp-bom-po.spec.ts');
    expect(e2e.postYiBatch).toContain('core-224-wave-yi-e2e-smoke-registry.spec.ts');
    expect(e2e.postYiBatch).toContain('core-225-wave-yj-sup-op.spec.ts');
  });

  it('sup-op-procurement section — staticScore 8.0, bad/fix cleared, wave evidence', () => {
    const section = findWaveYuSupOpProcurementSection('SS27');
    expect(section).toBeDefined();
    expect(section!.staticScore).toBe(WAVE_YU_SUP_OP_AUDIT_STATIC_SCORE);
    expect(section!.liveScore).toBeGreaterThanOrEqual(WAVE_YU_SUP_OP_AUDIT_STATIC_SCORE);
    expect(section!.bad).toEqual([]);
    expect(section!.fix).toEqual([]);
    expect(section!.summary).toMatch(/8\.0|wave YU/i);
    for (const code of WAVE_YU_PREREQ_WAVE_CODES) {
      expect(section!.good.some((g) => g.includes(`Wave ${code}`))).toBe(true);
    }
    expect(section!.good.some((g) => /wave YU/i.test(g))).toBe(true);
  });

  it('all sup-op sections — 8.0 static + no bad/fix', () => {
    const cell = findWaveYuSupOpCell('SS27');
    expect(cell?.roleId).toBe(WAVE_YU_SUP_OP_CELL_ROLE);
    expect(cell?.pillarId).toBe(WAVE_YU_SUP_OP_CELL_PILLAR);
    expect(cell?.bad ?? []).toEqual([]);
    expect(cell?.fix ?? []).toEqual([]);
    expect(cell?.staticScore).toBe(8.0);
    expect(cell?.good.some((g) => /wave YU/i.test(g))).toBe(true);

    for (const id of WAVE_YU_SUP_OP_SECTION_IDS) {
      const sub = cell?.subItems.find((s) => s.id === id);
      expect(sub?.staticScore).toBe(8.0);
      expect(sub?.bad ?? []).toEqual([]);
      expect(sub?.fix ?? []).toEqual([]);
    }
  });

  it('waveYuSupOp80BumpCriteriaMet — chain completeness closure', () => {
    const check = waveYuSupOp80BumpCheck('SS27');
    expect(check.criterion6Count).toBe(6);
    expect(check.sectionStaticScore).toBe(8.0);
    expect(check.cellStaticScore).toBe(8.0);
    expect(check.badCleared).toBe(true);
    expect(check.fixCleared).toBe(true);
    expect(check.allSectionsBadFixCleared).toBe(true);
    expect(check.hasWaveYuGood).toBe(true);
    expect(check.hasPrereqWaveGood).toBe(true);
    expect(waveYuSupOp80BumpCriteriaMet('SS27')).toBe(true);
  });

  it('ADR backlog — deferred gaps documented (not blocking 8.0)', () => {
    expect(WAVE_YU_ADR_BACKLOG.length).toBeGreaterThanOrEqual(2);
    expect(WAVE_YU_ADR_BACKLOG[0].plannerId).toBe('scan-dev-e2e-procurement-wizard-missing');
    expect(WAVE_YU_ADR_BACKLOG.every((item) => item.titleRu.length > 10)).toBe(true);
  });

  it('procurement APIs + spot testids wired', () => {
    const apis = waveYuSupOpProcurementApis();
    expect(apis).toContain('/api/workshop2/supplier/material-request/bulk-confirm');
    expect(apis).toContain('/api/workshop2/supplier/wms-confirm');
    for (const tid of WAVE_YU_SUP_OP_SPOT_TESTIDS) {
      expect(tid.length).toBeGreaterThan(3);
    }
  });

  it(`${WAVE_YU_E2E_SPEC} — on disk + playwright.core.config.ts`, () => {
    expect(fs.existsSync(path.join(PKG_ROOT, 'e2e', WAVE_YU_E2E_SPEC))).toBe(true);
    const config = fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8');
    expect(config).toContain(`**/${WAVE_YU_E2E_SPEC}`);
    expect(WAVE_YU_SUP_OP_PROCUREMENT_SECTION_ID).toBe('sup-op-procurement');
  });
});
