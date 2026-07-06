import fs from 'node:fs';
import path from 'node:path';
import {
  PLATFORM_CORE_HUB_ROWS,
  PLATFORM_CORE_PILLARS,
  getRolePillarWorkspaceHref,
} from '@/lib/platform-core-hub-matrix';
import { getPlatformCoreReadinessMatrix } from '@/lib/platform-core-readiness-audit';
import {
  WAVE_YQ_CORE_E2E_SPEC,
  WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS,
  WAVE_YQ_HUB_MATRIX_CELLS,
  WAVE_YQ_HUB_MATRIX_INACTIVE_HUB_CELLS,
  waveYqCoreE2eSpecGlob,
} from '@/lib/platform/wave-yq-hub-matrix-5x4';

const PKG_ROOT = path.join(__dirname, '..', '..', '..', '..');
const E2E_DIR = path.join(PKG_ROOT, 'e2e');
const PLAYWRIGHT_CORE_CONFIG = path.join(PKG_ROOT, 'playwright.core.config.ts');

function readConfig(): string {
  return fs.readFileSync(PLAYWRIGHT_CORE_CONFIG, 'utf8');
}

describe('wave YQ — hub matrix 5×4 routes + peer strip minimums', () => {
  it('documents 20 cells (4 roles × 5 pillars)', () => {
    expect(WAVE_YQ_HUB_MATRIX_CELLS).toHaveLength(20);
    expect(PLATFORM_CORE_HUB_ROWS).toHaveLength(4);
    expect(PLATFORM_CORE_PILLARS).toHaveLength(5);
  });

  it('active vs inactive hub cells match hub matrix', () => {
    expect(WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS).toHaveLength(14);
    expect(WAVE_YQ_HUB_MATRIX_INACTIVE_HUB_CELLS).toHaveLength(6);
    for (const cell of WAVE_YQ_HUB_MATRIX_CELLS) {
      const row = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === cell.roleId)!;
      expect(cell.active).toBe(row.pillars[cell.pillarId].kind === 'active');
    }
  });

  it.each(WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS)(
    '$id — workspaceHref matches readiness matrix',
    (cell) => {
      const ready = getPlatformCoreReadinessMatrix('SS27').find(
        (c) => c.roleId === cell.roleId && c.pillarId === cell.pillarId
      );
      expect(ready?.workspaceHref).toBe(cell.workspaceHref);
      expect(cell.workspaceHref).toBe(getRolePillarWorkspaceHref(cell.roleId, cell.pillarId));
      expect(cell.workspaceHref).not.toMatch(/^\/404|undefined|null/i);
    }
  );

  it.each(WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS)('$id — hub testids + url pattern', (cell) => {
    expect(cell.hubCellTestId).toBe(`readiness-cell-${cell.roleId}-${cell.pillarId}`);
    expect(cell.hubScoreTestId).toBe(`readiness-score-${cell.roleId}-${cell.pillarId}`);
    expect(cell.hubWorkspaceLinkTestId).toBe(
      `readiness-workspace-${cell.roleId}-${cell.pillarId}`
    );
    expect(cell.anchorTestIds.length).toBeGreaterThan(0);
    expect(cell.urlPattern.test(cell.workspaceHref)).toBe(true);
  });

  it('peer strip minimums — key CO/SC workspaces wired', () => {
    const shopCo = WAVE_YQ_HUB_MATRIX_CELLS.find((c) => c.id === 'shop-collection_order')!;
    expect(shopCo.peerStripMinimums).toContain('shop-co-matrix-spine-peer-strip');

    const shopSc = WAVE_YQ_HUB_MATRIX_CELLS.find((c) => c.id === 'shop-sample_collection')!;
    expect(shopSc.peerStripMinimums).toContain('shop-sc-showroom-b2b-peer-strip');

    const brandDev = WAVE_YQ_HUB_MATRIX_CELLS.find((c) => c.id === 'brand-development')!;
    expect(brandDev.peerStripMinimums).toContain('brand-dev-w2-hub-co-peer-strip');
  });

  it('inactive hub cells — cabinet routes documented for peer insight', () => {
    const inactiveIds = WAVE_YQ_HUB_MATRIX_INACTIVE_HUB_CELLS.map((c) => c.id).sort();
    expect(inactiveIds).toEqual(
      [
        'manufacturer-collection_order',
        'manufacturer-sample_collection',
        'shop-development',
        'shop-order_production',
        'supplier-collection_order',
        'supplier-sample_collection',
      ].sort()
    );
    for (const cell of WAVE_YQ_HUB_MATRIX_INACTIVE_HUB_CELLS) {
      expect(cell.workspaceHref).toContain('/core?pillar=');
    }
  });

  it('core-232 e2e spec — file + playwright.core.config.ts entry', () => {
    expect(fs.existsSync(path.join(E2E_DIR, WAVE_YQ_CORE_E2E_SPEC))).toBe(true);
    expect(readConfig()).toContain(waveYqCoreE2eSpecGlob());
  });
});
