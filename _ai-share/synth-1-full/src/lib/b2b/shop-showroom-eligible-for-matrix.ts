/** Wave TL · Shop SC showroom — eligible-for-matrix filter (client-safe). */

export const SHOP_SHOWROOM_ELIGIBLE_FOR_MATRIX_API_PATH =
  '/api/shop/b2b/showroom/eligible-for-matrix' as const;

export type ShopShowroomEligibleForMatrixArticle = {
  collectionId: string;
  articleId: string;
  name: string;
  wholesalePriceRub: number;
  moq?: number;
  heroImageUrl?: string;
  eligibleForMatrix: boolean;
  eligibleSources: string[];
  eligibleReasonsRu: string[];
};

export type ShopShowroomEligibleForMatrixSnapshot = {
  buyerId: string;
  collectionId: string;
  publishedCount: number;
  eligibleCount: number;
  articles: ShopShowroomEligibleForMatrixArticle[];
  storageMode: string;
  filterActive: boolean;
};

export const SHOP_SHOWROOM_ELIGIBLE_FILTER_LABEL_RU = 'Только для матрицы';

export const SHOP_SHOWROOM_ELIGIBLE_FILTER_HINT_RU =
  'Показаны артикулы с eligible-gate — готовы к оптовой матрице.';

export const SHOP_SHOWROOM_ELIGIBLE_FILTER_EMPTY_RU =
  'Нет eligible-артикулов — дождитесь signoff бренда или Centric Approved.';

export const SHOP_SHOWROOM_PARTNER_LOGO_PG_RU = 'Лого партнёра · PG';

export const SHOP_SHOWROOM_PARTNER_LOGO_DOSSIER_FALLBACK_RU = 'Hero · dossier (без лого PG)';

export function shopShowroomEligibleForMatrixApiPath(
  collectionId: string,
  buyerId?: string
): string {
  const params = new URLSearchParams({ collection: collectionId.trim() });
  if (buyerId?.trim()) params.set('buyerId', buyerId.trim());
  return `${SHOP_SHOWROOM_ELIGIBLE_FOR_MATRIX_API_PATH}?${params.toString()}`;
}

export const SHOP_SHOWROOM_MATRIX_CARRY_QTY_PARAM = 'carryQty' as const;
export const SHOP_SHOWROOM_MATRIX_CARRY_SIZE_PARAM = 'carrySize' as const;

export const SHOP_SHOWROOM_MATRIX_CARRY_PREFILL_HINT_RU =
  'Qty и размер перенесены с витрины — проверьте size run в матрице.';

export type ShopShowroomMatrixCarryOpts = {
  carryQty?: number;
  carrySize?: string;
};

export function shopShowroomMatrixHrefWithCarry(
  collectionId: string,
  articleId: string,
  opts?: ShopShowroomMatrixCarryOpts
): string {
  const params = new URLSearchParams({
    collection: collectionId.trim(),
    article: articleId.trim(),
  });
  if (opts?.carryQty != null && opts.carryQty > 0) {
    params.set(SHOP_SHOWROOM_MATRIX_CARRY_QTY_PARAM, String(Math.floor(opts.carryQty)));
  }
  const size = opts?.carrySize?.trim();
  if (size) params.set(SHOP_SHOWROOM_MATRIX_CARRY_SIZE_PARAM, size);
  return `/shop/b2b/matrix?${params.toString()}`;
}

/** @deprecated use shopShowroomMatrixHrefWithCarry */
export function shopShowroomMatrixHrefWithCarryQty(
  collectionId: string,
  articleId: string,
  carryQty?: number
): string {
  return shopShowroomMatrixHrefWithCarry(collectionId, articleId, { carryQty });
}

export function parseShopShowroomMatrixCarryFromSearchParams(input: {
  carryQty?: string | null;
  carrySize?: string | null;
}): ShopShowroomMatrixCarryOpts {
  const qtyRaw = input.carryQty?.trim();
  const carryQty = qtyRaw ? Number(qtyRaw) : undefined;
  const carrySize = input.carrySize?.trim() || undefined;
  return {
    carryQty: Number.isFinite(carryQty) && (carryQty ?? 0) > 0 ? Math.floor(carryQty!) : undefined,
    carrySize,
  };
}
