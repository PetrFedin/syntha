import { buildShopShowroomBuySession } from '@/lib/b2b/shop-showroom-buy';
import type { RangePlannerTier } from '@/lib/production/workshop2-range-planner-bridge';
import { ROUTES } from '@/lib/routes';

/** Wave XG · extends Wave UM bulk tier POST for brand range planner. */
export const WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API_WAVE_XG =
  '/api/workshop2/range-planner/bulk-tier-assign' as const;

export const BRAND_RANGE_PLANNER_SHOP_MATRIX_TIER_BADGE_LINK_TESTID =
  'brand-dev-range-shop-matrix-tier-badge-link';

export const SHOP_MATRIX_RANGE_PLANNER_TIER_BADGE_LINK_TESTID =
  'shop-co-matrix-range-planner-tier-badge-link';

export const RANGE_PLANNER_BULK_TIER_MAX_BATCH = 48;

export const RANGE_PLANNER_OVERLAY_CONFLICT_BANNER_TITLE_RU =
  'Расхождение overlay и PostgreSQL';

export const RANGE_PLANNER_OVERLAY_CONFLICT_SYNC_CTA_RU = 'Синхронизировать';
export const RANGE_PLANNER_OVERLAY_CONFLICT_PULL_CTA_RU = 'Подтянуть из PG';
export const RANGE_PLANNER_OVERLAY_CONFLICT_SYNCING_RU = 'Синхронизация…';

export const RANGE_PLANNER_OVERLAY_CONFLICT_LAST_SYNC_RU = (label: string) =>
  `Последняя синхронизация overlay: ${label}`;

export function brandRangePlannerShopMatrixTierBadgeHref(
  collectionId: string,
  orderId?: string
): string {
  return buildShopShowroomBuySession({ collectionId, orderId }).matrixHref;
}

export function shopMatrixRangePlannerTierBadgeHref(collectionId: string): string {
  return `${ROUTES.brand.rangePlanner}?collection=${encodeURIComponent(collectionId.trim())}`;
}

export function rangePlannerOverlayConflictSummaryRu(tierLabels: string[]): string {
  if (tierLabels.length === 0) return '';
  return `Локальный overlay расходится с PG (${tierLabels.join(', ')}). Подтяните актуальные счётчики SKU.`;
}

export function rangePlannerOverlayConflictTierRowRu(input: {
  localPgSkuCount: number;
  pgSkuCount: number;
  localPlanSkuCount: number;
  planSkuCount: number;
}): string {
  return `SKU в базе: ${input.localPgSkuCount} → ${input.pgSkuCount} · план: ${input.localPlanSkuCount} → ${input.planSkuCount}`;
}

export function brandRangePlannerBulkTierAssignMessageRu(
  assigned: number,
  failed: number,
  total: number
): string {
  if (failed === 0) {
    return `Назначено ${assigned} из ${total} артикулов.`;
  }
  return `Назначено ${assigned} из ${total}, не удалось: ${failed}.`;
}

export function brandRangePlannerBulkTierPartialWarningRu(assigned: number, total: number): string {
  return `Частично: ${assigned}/${total}`;
}

export function waveXgBrandRangePlannerContract(): {
  bulkTierAssignApiPath: string;
  maxBatch: number;
  shopMatrixTierBadgeTestId: string;
  rangePlannerTierBadgeTestId: string;
} {
  return {
    bulkTierAssignApiPath: WORKSHOP2_RANGE_PLANNER_BULK_TIER_ASSIGN_API_WAVE_XG,
    maxBatch: RANGE_PLANNER_BULK_TIER_MAX_BATCH,
    shopMatrixTierBadgeTestId: BRAND_RANGE_PLANNER_SHOP_MATRIX_TIER_BADGE_LINK_TESTID,
    rangePlannerTierBadgeTestId: SHOP_MATRIX_RANGE_PLANNER_TIER_BADGE_LINK_TESTID,
  };
}

export type RangePlannerBulkTierAssignWaveXgBody = {
  collectionId: string;
  tier: RangePlannerTier | string;
  articleIds: string[];
  allowPartial?: boolean;
};
