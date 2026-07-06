import { shopB2bMatrixReorderHref } from '@/lib/routes';
import { resolveWorkshop2HubPublishedArticlesReadPath } from '@/lib/production/workshop2-pg-read-path-policy';
import type { Workshop2PublishedArticlesReadPath } from '@/lib/production/workshop2-pg-source-stats';
import {
  formatBrandScMiniMatrixHintRu,
  formatPublishedReadPathBadgeRu,
  WAVE_ZE_READ_PATH_API_BADGE_RU,
  WAVE_ZE_READ_PATH_LS_BADGE_RU,
} from '@/lib/platform/wave-ze-hub-diagnostics-ru';

/** Wave UE · Brand SC → shop matrix deep-link with linesheet SKU prefill. */
export const BRAND_SC_CROSS_MATRIX_LINESHEET_ARTICLE_IDS_PARAM = 'linesheetArticleIds' as const;

export const BRAND_SC_CROSS_MATRIX_CARRY_QTY_TOTAL_PARAM = 'carryQtyTotal' as const;

export const BRAND_SC_CROSS_MATRIX_PREFILL_APPLY_PARAM = 'linesheetPrefill' as const;

export const BRAND_SC_CROSS_MATRIX_OPEN_SHOP_BTN_RU =
  'Открыть матрицу магазина · SKU лайншита';

export const BRAND_SC_CROSS_MATRIX_MINI_MATRIX_LABEL_RU = 'Матрица магазина';

export const BRAND_SC_CROSS_MATRIX_MINI_MATRIX_HINT_RU =
  'SKU лайншита подставятся в матрицу — qty переносится при наличии черновика.';

export const BRAND_SC_CROSS_MATRIX_PREFILL_HINT_RU =
  'Предзаполнение из лайншита бренда — проверьте qty в матрице.';

export const BRAND_SC_PUBLISHED_READ_PATH_API_BADGE_RU = WAVE_ZE_READ_PATH_API_BADGE_RU;

export const BRAND_SC_PUBLISHED_READ_PATH_LS_BADGE_RU = WAVE_ZE_READ_PATH_LS_BADGE_RU;

export const BRAND_SC_LINESET_PDF_EMPTY_API_RU =
  'PDF недоступен: в коллекции нет опубликованных артикулов. Опубликуйте витрину в W2 или откройте SS27.';

export function normalizeLinesheetArticleIds(articleIds: readonly string[]): string[] {
  return [...new Set(articleIds.map((id) => id.trim()).filter(Boolean))];
}

export function parseLinesheetArticleIdsParam(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return normalizeLinesheetArticleIds(raw.split(','));
}

export function resolveBrandScPublishedArticlesReadPath(
  collectionId: string
): Workshop2PublishedArticlesReadPath {
  return resolveWorkshop2HubPublishedArticlesReadPath({
    collectionId,
    preferApi: true,
  });
}

export function formatBrandScPublishedReadPathBadgeRu(
  readPath: Workshop2PublishedArticlesReadPath
): string {
  return formatPublishedReadPathBadgeRu(readPath);
}

export function brandScCrossMatrixOpenShopHref(
  collectionId: string,
  articleIds: readonly string[],
  opts?: { buyerId?: string; carryQtyTotal?: number; orderId?: string }
): string {
  const ids = normalizeLinesheetArticleIds(articleIds);
  const base = shopB2bMatrixReorderHref(collectionId, opts?.orderId, {
    buyerId: opts?.buyerId,
  });
  const sp = new URLSearchParams(base.split('?')[1] ?? '');
  if (ids.length > 0) {
    sp.set(BRAND_SC_CROSS_MATRIX_LINESHEET_ARTICLE_IDS_PARAM, ids.join(','));
    sp.set(BRAND_SC_CROSS_MATRIX_PREFILL_APPLY_PARAM, '1');
  }
  const carry = opts?.carryQtyTotal;
  if (carry != null && carry > 0) {
    sp.set(BRAND_SC_CROSS_MATRIX_CARRY_QTY_TOTAL_PARAM, String(carry));
  }
  return `/shop/b2b/matrix?${sp.toString()}`;
}

/** Cabinet mini-matrix CTA — same prefill contract, compact label. */
export function brandScCrossMatrixMiniMatrixHref(
  collectionId: string,
  articleIds: readonly string[],
  carryQtyTotal?: number
): string {
  return brandScCrossMatrixOpenShopHref(collectionId, articleIds, { carryQtyTotal });
}

export function brandScCrossMatrixMiniMatrixHintRu(
  articleCount: number,
  carryQtyTotal?: number
): string {
  return formatBrandScMiniMatrixHintRu(
    articleCount,
    carryQtyTotal,
    BRAND_SC_CROSS_MATRIX_MINI_MATRIX_HINT_RU
  );
}
