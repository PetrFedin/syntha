import type { Product, CartItem } from '@/lib/types';
import {
  buildShopMatrixPrepackBreakdown,
  type ShopMatrixSizeCurve,
} from '@/lib/b2b/shop-matrix-prepack-curve';
import {
  mergeCurveIntoStandardGrid,
  type ShopMatrixSizeCurveView,
} from '@/lib/b2b/shop-matrix-size-curve';

export const SHOP_MATRIX_PREPACK_APPLY_PARAM = 'prepackApply';
export const SHOP_MATRIX_PREPACK_ARTICLE_PARAM = 'prepackArticle';
export const SHOP_MATRIX_PREPACK_PACKS_PARAM = 'prepackPacks';

export type ShopMatrixPrepackApplyRequest = {
  articleId: string;
  packCount: number;
};

export function readShopMatrixPrepackApplyFromSearchParams(sp: {
  get(name: string): string | null;
}): ShopMatrixPrepackApplyRequest | undefined {
  if (sp.get(SHOP_MATRIX_PREPACK_APPLY_PARAM) !== '1') return undefined;
  const articleId = sp.get(SHOP_MATRIX_PREPACK_ARTICLE_PARAM)?.trim();
  const packCount = Math.max(1, parseInt(sp.get(SHOP_MATRIX_PREPACK_PACKS_PARAM) ?? '1', 10) || 1);
  if (!articleId) return undefined;
  return { articleId, packCount };
}

export function buildCartItemsFromPrepackBreakdown(
  product: Product,
  bySize: Record<string, number>
): CartItem[] {
  return Object.entries(bySize)
    .filter(([, qty]) => qty > 0)
    .map(([selectedSize, quantity]) => ({
      ...product,
      quantity,
      selectedSize,
    }));
}

export function buildPrepackBreakdownForApply(input: {
  packCount: number;
  curveView?: ShopMatrixSizeCurveView | null;
}): ReturnType<typeof buildShopMatrixPrepackBreakdown> {
  const curve: ShopMatrixSizeCurve | undefined = input.curveView
    ? mergeCurveIntoStandardGrid(input.curveView.curve)
    : undefined;
  return buildShopMatrixPrepackBreakdown({
    packCount: input.packCount,
    packSize: input.curveView?.packSize,
    curve,
  });
}

export function prepackApplyRequestKey(req: ShopMatrixPrepackApplyRequest): string {
  return `${req.articleId}:${req.packCount}`;
}

export function normalizeShopMatrixPrepackApply(
  req?: ShopMatrixPrepackApplyRequest | ShopMatrixPrepackApplyRequest[]
): ShopMatrixPrepackApplyRequest[] {
  if (!req) return [];
  return Array.isArray(req) ? req : [req];
}

export function prepackApplyBatchRequestKey(
  reqs: readonly ShopMatrixPrepackApplyRequest[]
): string {
  return [...reqs].map(prepackApplyRequestKey).sort().join('|');
}
