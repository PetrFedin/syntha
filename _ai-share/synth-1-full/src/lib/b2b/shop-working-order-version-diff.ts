/** Wave TP · Shop 2.2 working order version diff (client-safe). Wave XL polish. */

export const SHOP_WORKING_ORDER_DIFF_API_PATH = '/api/shop/b2b/working-order/diff' as const;

export const SHOP_WORKING_ORDER_VERSION_DIFF_LEGACY_PATH = '/api/shop/b2b/working-order' as const;

export const SHOP_WORKING_ORDER_MERGE_TO_MATRIX_PATH_SUFFIX = '/merge-to-matrix' as const;

export const SHOP_WORKING_ORDER_MERGE_NETWORK_ERROR_RU =
  'Ошибка сети при переносе в матрицу. Повторите позже.';

export const SHOP_WORKING_ORDER_MERGE_AUTH_ERROR_RU =
  'Нужна авторизация магазина для переноса в матрицу.';

export const SHOP_WORKING_ORDER_DIFF_PG_READY_RU =
  'Diff версий рабочего заказа — журнал в PostgreSQL (Wave TP).';

export const SHOP_WORKING_ORDER_DIFF_PG_HINT_RU =
  'Сравнение версий и журнал merge — в PostgreSQL при core bootstrap.';

export const SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_PARTIAL_RU =
  'Дозаполнить матрицу (частичный перенос)';

export const SHOP_WORKING_ORDER_MERGE_MATRIX_LINK_FULL_RU =
  'Открыть матрицу с перенесёнными строками';

export const SHOP_WORKING_ORDER_MERGE_BTN_RU = 'В матрицу';

export const SHOP_WORKING_ORDER_DIFF_LINE_PREVIEW_LIMIT = 6;

export type ShopWorkingOrderVersionLineDiff = {
  productId: string;
  fromQty: number;
  toQty: number;
  delta: number;
};

export type ShopWorkingOrderVersionDiffSnapshot = {
  ok: boolean;
  wholesaleOrderId: string;
  fromVersionId?: string;
  toVersionId?: string;
  fromLabel?: string;
  toLabel?: string;
  addedLines: ShopWorkingOrderVersionLineDiff[];
  removedLines: ShopWorkingOrderVersionLineDiff[];
  changedLines: ShopWorkingOrderVersionLineDiff[];
  changedSkuCount?: number;
  summaryRu: string;
  journalId?: string;
};

export function shopWorkingOrderVersionDiffChangedSkuCount(
  diff: Pick<ShopWorkingOrderVersionDiffSnapshot, 'addedLines' | 'removedLines' | 'changedLines'>
): number {
  return diff.addedLines.length + diff.removedLines.length + diff.changedLines.length;
}

/** Flat preview for UI strip (changed → added → removed). */
export function shopWorkingOrderVersionDiffLinePreview(
  diff: Pick<ShopWorkingOrderVersionDiffSnapshot, 'addedLines' | 'removedLines' | 'changedLines'>,
  limit = SHOP_WORKING_ORDER_DIFF_LINE_PREVIEW_LIMIT
): ShopWorkingOrderVersionLineDiff[] {
  return [...diff.changedLines, ...diff.addedLines, ...diff.removedLines].slice(0, limit);
}

export function shopWorkingOrderVersionDiffLegacyPath(wholesaleOrderId: string): string {
  return `${SHOP_WORKING_ORDER_VERSION_DIFF_LEGACY_PATH}/${encodeURIComponent(
    wholesaleOrderId.trim()
  )}/version-diff`;
}

export function shopWorkingOrderMergeToMatrixApiPath(wholesaleOrderId: string): string {
  return `${SHOP_WORKING_ORDER_VERSION_DIFF_LEGACY_PATH}/${encodeURIComponent(
    wholesaleOrderId.trim()
  )}${SHOP_WORKING_ORDER_MERGE_TO_MATRIX_PATH_SUFFIX}`;
}

export function shopWorkingOrderDiffApiPath(
  wholesaleOrderId: string,
  opts?: { fromVersionId?: string; toVersionId?: string }
): string {
  const params = new URLSearchParams({ orderId: wholesaleOrderId.trim() });
  if (opts?.fromVersionId?.trim()) params.set('from', opts.fromVersionId.trim());
  if (opts?.toVersionId?.trim()) params.set('to', opts.toVersionId.trim());
  return `${SHOP_WORKING_ORDER_DIFF_API_PATH}?${params.toString()}`;
}

/** Deep-link to matrix after partial merge (carries merged line count for matrix prefill hint). */
export function shopWorkingOrderMergeMatrixHref(
  collectionId: string,
  wholesaleOrderId: string,
  opts?: { partialMerge?: boolean; mergedLines?: number }
): string {
  const sp = new URLSearchParams({
    collection: collectionId.trim(),
    mode: 'reorder',
    order: wholesaleOrderId.trim(),
    orderId: wholesaleOrderId.trim(),
  });
  if (opts?.partialMerge) sp.set('partialMerge', '1');
  if (opts?.mergedLines != null && opts.mergedLines > 0) {
    sp.set('mergedLines', String(opts.mergedLines));
  }
  return `/shop/b2b/matrix?${sp.toString()}`;
}
