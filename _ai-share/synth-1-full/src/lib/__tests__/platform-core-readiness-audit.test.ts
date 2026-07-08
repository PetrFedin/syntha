import {
  SECTION_AUDIT,
  EMPTY_SECTION_AUDIT,
  averageSectionScores,
  formatReadinessScore,
  getExpectedEmptySectionCount,
  getPlatformCoreReadinessMatrix,
  getReadinessCell,
  summarizePlatformCoreReadiness,
} from '@/lib/platform-core-readiness-audit';
import { PLATFORM_CORE_TWO_ROLE_SECTION_DENYLIST } from '@/lib/platform-core-two-role-sections';
import {
  hasEmptyCellInsightPanel,
  PLATFORM_CORE_SHOW_PEER_INSIGHT_IN_HUB_AUDIT,
  PLATFORM_CORE_SHOW_PEER_INSIGHT_IN_UI,
} from '@/lib/platform-core-empty-cell-registry';

function expectedVisibleSectionCount(
  roleId: import('@/lib/platform-core-hub-matrix').CoreChainRoleId,
  pillarId: import('@/lib/platform-core-hub-matrix').CoreHubPillarId
): number {
  const templates = SECTION_AUDIT[roleId]?.[pillarId] ?? [];
  return templates.filter(
    (t) => !t.scoreAliasOf && !PLATFORM_CORE_TWO_ROLE_SECTION_DENYLIST.has(t.id)
  ).length;
}

describe('platform-core-readiness-audit', () => {
  const prevCore = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
  const prevExt = process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    delete process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
  });

  afterAll(() => {
    if (prevCore === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCore;
    if (prevExt === undefined) delete process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
    else process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES = prevExt;
  });

  it('returns baseline 10 cells (brand + shop × 5 pillars)', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    expect(cells).toHaveLength(10);
    expect(cells.map((c) => c.roleId)).not.toContain('manufacturer');
    expect(cells.map((c) => c.roleId)).not.toContain('supplier');
  });

  it('returns 20 cells when extended roles enabled', () => {
    const prevExt = process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
    process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES = '1';
    try {
      const cells = getPlatformCoreReadinessMatrix('SS27');
      expect(cells).toHaveLength(20);
    } finally {
      if (prevExt === undefined) delete process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES;
      else process.env.NEXT_PUBLIC_PC_EXTENDED_ROLES = prevExt;
    }
  });

  it('brand development is active with full section audit', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const cell = getReadinessCell(cells, 'brand', 'development');
    expect(cell?.active).toBe(true);
    expect(cell?.staticScore).toBeGreaterThanOrEqual(7);
    expect(cell?.subItems.length).toBe(expectedVisibleSectionCount('brand', 'development'));
    expect(cell?.subItems.length).toBeGreaterThanOrEqual(4);
    expect(cell?.subItems[0]?.summary).toBeTruthy();
    expect(cell?.subItems[0]?.good.length).toBeGreaterThan(0);
    expect(cell?.workspaceHref).toMatch(/collection=SS27/);
  });

  it('every active cell has SECTION_AUDIT coverage (3+ разделов)', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const active = cells.filter((c) => c.active);
    expect(active.length).toBe(9);
    for (const cell of active) {
      const expected = expectedVisibleSectionCount(cell.roleId, cell.pillarId);
      expect(expected).toBeGreaterThanOrEqual(3);
      expect(cell.subItems).toHaveLength(expected);
      expect(cell.subItems.every((s) => s.summary && s.good.length > 0)).toBe(true);
    }
  });

  it('inactive pillars: no score in matrix (peer-insight off)', () => {
    expect(PLATFORM_CORE_SHOW_PEER_INSIGHT_IN_UI).toBe(false);
    expect(PLATFORM_CORE_SHOW_PEER_INSIGHT_IN_HUB_AUDIT).toBe(false);
    const cells = getPlatformCoreReadinessMatrix('SS27');
    for (const cell of cells.filter((c) => !c.active)) {
      expect(cell.staticScore).toBeNull();
      expect(cell.liveScore).toBeNull();
      expect(cell.subItems).toEqual([]);
      if (hasEmptyCellInsightPanel(cell.roleId, cell.pillarId)) {
        expect(getExpectedEmptySectionCount(cell.roleId, cell.pillarId)).toBeGreaterThan(0);
        expect(EMPTY_SECTION_AUDIT[cell.roleId]?.[cell.pillarId]).toBeDefined();
      }
    }
  });

  it('shop development inactive — no matrix score', () => {
    const cell = getReadinessCell(getPlatformCoreReadinessMatrix('SS27'), 'shop', 'development');
    expect(cell?.active).toBe(false);
    expect(cell?.staticScore).toBeNull();
    expect(cell?.subItems).toEqual([]);
  });

  it('liveChain uses liveScore for active cells', () => {
    const staticCells = getPlatformCoreReadinessMatrix('SS27', { liveChain: false });
    const liveCells = getPlatformCoreReadinessMatrix('SS27', { liveChain: true });
    const staticCell = getReadinessCell(staticCells, 'shop', 'collection_order');
    const liveCell = getReadinessCell(liveCells, 'shop', 'collection_order');
    expect(liveCell?.liveScore).toBeGreaterThanOrEqual(staticCell?.staticScore ?? 0);
  });

  it('formatReadinessScore handles integers and decimals', () => {
    expect(formatReadinessScore(8)).toBe('8');
    expect(formatReadinessScore(7.5)).toBe('7.5');
    expect(formatReadinessScore(null)).toBe('—');
  });

  it('summary: 9 active scored cells (baseline, shop OP active)', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27', { liveChain: true });
    const summary = summarizePlatformCoreReadiness(cells, 'live');
    expect(summary.activeScoredCount).toBe(9);
    expect(summary.scoredCellCount).toBe(9);
    expect(summary.allCellsAvg).toBeGreaterThanOrEqual(7.0);
    expect(summary.activeCellsAvg).toBeGreaterThanOrEqual(7.0);
    expect(summary.activeCellsAvg).toBeLessThan(8.0);
  });

  it('section averages align roughly with cell scores (within 1.0)', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    for (const cell of cells.filter((c) => c.staticScore != null)) {
      const secAvg = averageSectionScores(cell.subItems, 'static');
      expect(secAvg).not.toBeNull();
      if (cell.staticScore != null && secAvg != null) {
        expect(Math.abs(secAvg - cell.staticScore)).toBeLessThanOrEqual(1.0);
      }
    }
  });
});
