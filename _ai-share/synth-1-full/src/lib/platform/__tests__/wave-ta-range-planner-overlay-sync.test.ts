import { buildRangePlannerPgSnapshot } from '@/lib/production/workshop2-range-planner-pg';
import {
  detectRangePlannerOverlayConflict,
  overlayDocFromPgSnapshot,
  RANGE_PLANNER_TIER_LABEL_RU,
} from '@/lib/production/workshop2-range-planner-overlay';

describe('wave TA — brand range planner overlay sync + bulk tier assign', () => {
  it('detectRangePlannerOverlayConflict flags PG vs local tier count drift', () => {
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
      row.id === 'core' ? { ...row, pgSkuCount: row.pgSkuCount + 1 } : row
    );

    const conflict = detectRangePlannerOverlayConflict(snap, overlay);
    expect(conflict.hasConflict).toBe(true);
    expect(conflict.summaryRu).toContain(RANGE_PLANNER_TIER_LABEL_RU.core);
    expect(conflict.summaryRu).toContain('расходится с PG');
  });

  it('no conflict when tiers match or overlay not authoritative', () => {
    const snap = buildRangePlannerPgSnapshot({
      collectionId: 'SS27',
      articleCount: 1,
      pgEnabled: true,
      tierHints: [],
    });
    const overlay = overlayDocFromPgSnapshot(snap);
    expect(detectRangePlannerOverlayConflict(snap, overlay).hasConflict).toBe(false);

    overlay.tiersFromPg = false;
    expect(detectRangePlannerOverlayConflict(snap, overlay).hasConflict).toBe(false);
  });

  it('overlay PG API + conflict banner testids', () => {
    expect('/api/brand/range-planner/overlay').toContain('range-planner/overlay');
    expect('brand-range-planner-overlay-conflict-banner').toContain('overlay-conflict');
    expect('brand-range-planner-overlay-sync-btn').toContain('overlay-sync');
  });

  it('bulk tier assign PATCH contract (assignTier + articleIds)', () => {
    expect('bulkAssignWorkshop2ArticleRangePlannerTier').toContain('bulkAssign');
    expect('assignTier').toContain('assignTier');
    expect('range-planner-tier-bulk-assign-btn').toContain('bulk-assign');
    expect('range-planner-tier-bulk-select').toContain('bulk-select');
  });
});
