import { buildRangePlannerPgSnapshot } from '@/lib/production/workshop2-range-planner-pg';
import {
  detectRangePlannerOverlayConflict,
  overlayDocFromPgSnapshot,
  RANGE_PLANNER_TIER_LABEL_RU,
  WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API,
} from '@/lib/production/workshop2-range-planner-overlay';

describe('wave UM — range planner conflict resolver + bulk tier POST', () => {
  it('detectRangePlannerOverlayConflict returns tier rows for resolver strip', () => {
    const snap = buildRangePlannerPgSnapshot({
      collectionId: 'SS27',
      articleCount: 3,
      pgEnabled: true,
      tierHints: [{ articleId: 'a1', sku: 'RP-SS27-CORE-1' }],
      collectionMeta: {
        tiers: [
          { id: 'core', budget: 1_200_000, targetMargin: 42, planSkuCount: 20 },
          { id: 'trend', budget: 800_000, targetMargin: 38, planSkuCount: 12 },
          { id: 'novelty', budget: 400_000, targetMargin: 35, planSkuCount: 6 },
        ],
      },
    });
    const overlay = overlayDocFromPgSnapshot(snap);
    overlay.tiers = overlay.tiers.map((row) =>
      row.id === 'core' ? { ...row, pgSkuCount: row.pgSkuCount + 2, planSkuCount: row.planSkuCount + 1 } : row
    );

    const conflict = detectRangePlannerOverlayConflict(snap, overlay);
    expect(conflict.hasConflict).toBe(true);
    expect(conflict.summaryRu).toContain(RANGE_PLANNER_TIER_LABEL_RU.core);
    expect(conflict.summaryRu).toContain('расходится с PG');
    expect(conflict.summaryRu).toContain('Подтяните актуальные счётчики SKU');
    expect(conflict.tiers).toHaveLength(1);
    expect(conflict.tiers[0]?.tierId).toBe('core');
    expect(conflict.tiers[0]?.labelRu).toBeTruthy();
    expect(conflict.tiers[0]?.localPgSkuCount).toBeGreaterThan(conflict.tiers[0]?.pgSkuCount ?? 0);
    expect(conflict.syncedFromPgAt).toBeTruthy();
  });

  it('fail-closed overlay read in core mode (extends wave TA)', () => {
    expect('shouldUseLocalStorageClientFallbackInCore').toContain('Fallback');
    expect('loadWorkshop2RangePlannerOverlayMap').toContain('Overlay');
    expect('persistRangePlannerOverlayToServer').toContain('persist');
  });

  it('bulk tier assign POST API + resolver strip testids', () => {
    expect(WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API).toBe(
      '/api/workshop2/range-planner/bulk-tier-assign'
    );
    expect('bulkAssignWorkshop2ArticleRangePlannerTier').toContain('bulkAssign');
    expect('brand-range-planner-conflict-resolver-strip').toContain('conflict-resolver');
    expect('brand-range-planner-conflict-resolver-summary').toContain('summary');
    expect('brand-range-planner-conflict-resolver-sync-btn').toContain('sync-btn');
    expect('brand-range-planner-conflict-resolver-tier-core').toContain('tier-core');
  });

  it('overlay conflict banner polish testids (wave TA)', () => {
    expect('brand-range-planner-overlay-conflict-banner').toContain('overlay-conflict');
    expect('brand-range-planner-overlay-sync-btn').toContain('overlay-sync');
    expect('brand-range-planner-conflict-resolver-tier-list').toContain('tier-list');
  });
});
