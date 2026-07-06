import fs from 'node:fs';
import path from 'node:path';
import { getPlatformCoreReadinessMatrix } from '@/lib/platform-core-readiness-audit';
import {
  WAVE_YP_CROSS_LINK_AUDIT_FIXES,
  scanReadinessPeerStripTestIdGaps,
  WAVE_YP_PARTNERS_RU,
  WAVE_YP_PLATFORM_B2B_RU,
} from '@/lib/platform/wave-yp-cross-link-audit-fix';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YP — cross-link audit fix batch (all roles × pillars)', () => {
  const cells = getPlatformCoreReadinessMatrix('SS27');

  it('documents 10 closed wave YP cross-link fixes', () => {
    expect(WAVE_YP_CROSS_LINK_AUDIT_FIXES.length).toBe(10);
  });

  it('exports RU peer label constants (smoke)', () => {
    expect(WAVE_YP_PLATFORM_B2B_RU).toBe('B2B-платформа');
    expect(WAVE_YP_PARTNERS_RU).toBe('Партнёры');
  });

  it.each(WAVE_YP_CROSS_LINK_AUDIT_FIXES)('$id — section bad/fix cleared + wave YP evidence', (fix) => {
    const hit = cells
      .flatMap((c) => c.subItems.map((s) => ({ role: c.roleId, pillar: c.pillarId, ...s })))
      .find((s) => s.id === fix.sectionId);
    expect(hit).toBeDefined();
    expect(hit?.bad ?? []).toEqual([]);
    expect(hit?.fix ?? []).toEqual([]);
    expect(hit?.good.some((g) => /Wave YP|core-231/i.test(g))).toBe(true);
  });

  it.each(WAVE_YP_CROSS_LINK_AUDIT_FIXES)('$id — closure testids + source wired', (fix) => {
    for (const tid of fix.testids) {
      expect(tid.length).toBeGreaterThan(3);
    }
    const text = read(fix.sourceFile);
    for (const needle of fix.sourceMustContain ?? []) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.sourceMustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });

  it('readiness matrix — no open bad/fix on wave YP sections', () => {
    for (const fix of WAVE_YP_CROSS_LINK_AUDIT_FIXES) {
      const sub = cells
        .flatMap((c) => c.subItems.map((s) => ({ role: c.roleId, pillar: c.pillarId, ...s })))
        .find((s) => s.id === fix.sectionId);
      expect(sub?.bad ?? []).toEqual([]);
      expect(sub?.fix ?? []).toEqual([]);
    }
  });

  it('scanReadinessPeerStripTestIdGaps — wave YP closures cover documented peer strips', () => {
    const gaps = scanReadinessPeerStripTestIdGaps(cells);
    const blocking = gaps.filter((g) => g.includes(':bad-or-fix-open'));
    expect(blocking).toEqual([]);
  });

  it('shop sample_collection — YP showroom + partners peer evidence', () => {
    const subs = cells
      .filter((c) => c.roleId === 'shop' && c.pillarId === 'sample_collection')
      .flatMap((c) => c.subItems);
    expect(subs.some((s) => s.good.some((g) => g.includes('Wave YP')))).toBe(true);
  });

  it('brand development — YP passport + merch peer evidence', () => {
    const subs = cells
      .filter((c) => c.roleId === 'brand' && c.pillarId === 'development')
      .flatMap((c) => c.subItems);
    expect(subs.some((s) => s.good.some((g) => g.includes('Wave YP')))).toBe(true);
  });

  it('supplier development — YP BOM brand-dev peer evidence', () => {
    const subs = cells
      .filter((c) => c.roleId === 'supplier' && c.pillarId === 'development')
      .flatMap((c) => c.subItems);
    expect(subs.some((s) => s.good.some((g) => g.includes('Wave YP')))).toBe(true);
  });
});
