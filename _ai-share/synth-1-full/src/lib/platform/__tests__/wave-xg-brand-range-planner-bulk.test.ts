import { buildRangePlannerPgSnapshot } from '@/lib/production/workshop2-range-planner-pg';
import {
  detectRangePlannerOverlayConflict,
  overlayDocFromPgSnapshot,
  RANGE_PLANNER_TIER_LABEL_RU,
  WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API,
} from '@/lib/production/workshop2-range-planner-overlay';
import {
  BRAND_RANGE_PLANNER_SHOP_MATRIX_TIER_BADGE_LINK_TESTID,
  brandRangePlannerBulkTierAssignMessageRu,
  brandRangePlannerBulkTierPartialWarningRu,
  brandRangePlannerShopMatrixTierBadgeHref,
  RANGE_PLANNER_BULK_TIER_MAX_BATCH,
  RANGE_PLANNER_OVERLAY_CONFLICT_BANNER_TITLE_RU,
  RANGE_PLANNER_OVERLAY_CONFLICT_PULL_CTA_RU,
  RANGE_PLANNER_OVERLAY_CONFLICT_SYNC_CTA_RU,
  rangePlannerOverlayConflictSummaryRu,
  rangePlannerOverlayConflictTierRowRu,
  SHOP_MATRIX_RANGE_PLANNER_TIER_BADGE_LINK_TESTID,
  shopMatrixRangePlannerTierBadgeHref,
  waveXgBrandRangePlannerContract,
  WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API_WAVE_XG,
} from '@/lib/production/wave-xg-brand-range-planner';

describe('wave XG — brand range planner bulk tier + conflict polish', () => {
  it('detectRangePlannerOverlayConflict includes labelRu on tier rows (wave XG)', () => {
    const snap = buildRangePlannerPgSnapshot({
      collectionId: 'SS27',
      articleCount: 3,
      pgEnabled: true,
      tierHints: [{ articleId: 'a1', sku: 'RP-SS27-CORE-1' }],
      collectionMeta: {
        tiers: [
          { id: 'core', budget: 1_200_000, targetMargin: 42, planSkuCount: 20 },
          { id: 'trend', budget: 800_000, targetMargin: 38, planSkuCount: 12 },
        ],
      },
    });
    const overlay = overlayDocFromPgSnapshot(snap);
    overlay.tiers = overlay.tiers.map((row) =>
      row.id === 'core'
        ? { ...row, pgSkuCount: row.pgSkuCount + 2, planSkuCount: row.planSkuCount + 1 }
        : row
    );

    const conflict = detectRangePlannerOverlayConflict(snap, overlay);
    expect(conflict.hasConflict).toBe(true);
    expect(conflict.summaryRu).toContain('расходится с PG');
    expect(conflict.summaryRu).toContain('Подтяните актуальные счётчики SKU');
    expect(conflict.tiers[0]?.labelRu).toBe(RANGE_PLANNER_TIER_LABEL_RU.core);
    expect(conflict.tiers[0]?.tierId).toBe('core');
  });

  it('rangePlannerOverlayConflictSummaryRu RU polish', () => {
    const summary = rangePlannerOverlayConflictSummaryRu(['Базовый', 'Тренд']);
    expect(summary).toContain('Базовый');
    expect(summary).toContain('расходится с PG');
    expect(summary).toContain('SKU');
  });

  it('rangePlannerOverlayConflictTierRowRu formats SKU drift', () => {
    expect(
      rangePlannerOverlayConflictTierRowRu({
        localPgSkuCount: 5,
        pgSkuCount: 3,
        localPlanSkuCount: 22,
        planSkuCount: 20,
      })
    ).toBe('SKU в базе: 5 → 3 · план: 22 → 20');
  });

  it('bulk tier assign POST API extends wave UM (wave XG contract)', () => {
    const contract = waveXgBrandRangePlannerContract();
    expect(contract.bulkTierAssignApiPath).toBe(WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API_WAVE_XG);
    expect(WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API_WAVE_XG).toBe(
      WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API
    );
    expect(contract.maxBatch).toBe(RANGE_PLANNER_BULK_TIER_MAX_BATCH);
    expect(RANGE_PLANNER_BULK_TIER_MAX_BATCH).toBeGreaterThan(0);
  });

  it('brandRangePlannerBulkTierAssignMessageRu full and partial outcomes', () => {
    expect(brandRangePlannerBulkTierAssignMessageRu(3, 0, 3)).toContain('3 из 3');
    expect(brandRangePlannerBulkTierAssignMessageRu(2, 1, 3)).toContain('не удалось: 1');
    expect(brandRangePlannerBulkTierPartialWarningRu(2, 3)).toBe('Частично: 2/3');
  });

  it('cross-link range planner ↔ shop matrix tier badge hrefs + testids', () => {
    expect(brandRangePlannerShopMatrixTierBadgeHref('SS27')).toContain('/shop/b2b/matrix');
    expect(shopMatrixRangePlannerTierBadgeHref('SS27')).toContain('/brand/range-planner');
    expect(shopMatrixRangePlannerTierBadgeHref('SS27')).toContain('collection=SS27');
    expect(BRAND_RANGE_PLANNER_SHOP_MATRIX_TIER_BADGE_LINK_TESTID).toContain('tier-badge');
    expect(SHOP_MATRIX_RANGE_PLANNER_TIER_BADGE_LINK_TESTID).toContain('range-planner');
  });

  it('overlay conflict banner RU strings + resolver testids', () => {
    expect(RANGE_PLANNER_OVERLAY_CONFLICT_BANNER_TITLE_RU).toContain('PostgreSQL');
    expect(RANGE_PLANNER_OVERLAY_CONFLICT_SYNC_CTA_RU).toBe('Синхронизировать');
    expect(RANGE_PLANNER_OVERLAY_CONFLICT_PULL_CTA_RU).toBe('Подтянуть из PG');
    expect('brand-range-planner-overlay-conflict-banner').toContain('overlay-conflict');
    expect('brand-range-planner-overlay-conflict-last-sync').toContain('last-sync');
    expect('brand-range-planner-conflict-resolver-strip').toContain('conflict-resolver');
    expect('range-planner-tier-bulk-assign-btn').toContain('bulk-assign');
  });
});
