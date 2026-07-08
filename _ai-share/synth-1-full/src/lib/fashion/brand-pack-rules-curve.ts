import type { PackRuleRow } from '@/lib/fashion/types';
import {
  DEFAULT_SHOP_MATRIX_SIZE_CURVE,
  SHOP_MATRIX_SIZE_CURVE_SIZES,
  shopMatrixPrepackSizeSummary,
  buildShopMatrixPrepackBreakdown,
} from '@/lib/b2b/shop-matrix-prepack-curve';
import { buildBrandPackRulesSession } from '@/lib/fashion/brand-pack-rules-workspace';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

export function summarizeBrandPackRulesRows(rows: readonly PackRuleRow[]): {
  total: number;
  withMoq: number;
  withCasePack: number;
} {
  const withMoq = rows.filter((r) => r.moq != null && r.moq > 0).length;
  const withCasePack = rows.filter((r) => r.casePack != null && r.casePack > 0).length;
  return { total: rows.length, withMoq, withCasePack };
}

export function brandPackRulesSizeCurveSummary(packCount = 2): string {
  const breakdown = buildShopMatrixPrepackBreakdown({
    packCount,
    curve: DEFAULT_SHOP_MATRIX_SIZE_CURVE,
  });
  return shopMatrixPrepackSizeSummary(breakdown.bySize);
}

export function brandPackRulesShopPrepackHref(
  collectionId: string = PLATFORM_CORE_DEMO.collectionId,
  orderId?: string
): string {
  return buildBrandPackRulesSession({ collectionId, orderId }).shopMatrixPrepackHref;
}

export function brandPackRulesSizeChartHref(collectionId?: string): string {
  return buildBrandPackRulesSession({ collectionId }).sizeChartHref;
}

export function brandPackRulesCurveWeights(): readonly { size: string; weight: number }[] {
  return SHOP_MATRIX_SIZE_CURVE_SIZES.map((size) => ({
    size,
    weight: DEFAULT_SHOP_MATRIX_SIZE_CURVE[size],
  }));
}
