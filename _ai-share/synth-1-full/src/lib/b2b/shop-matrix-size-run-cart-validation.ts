import type { CartItem } from '@/lib/types';
import { shopB2bMatrixArticleHref } from '@/lib/routes';

export const SHOP_MATRIX_SIZE_RUN_CHECKOUT_BLOCK_RU =
  'Оформление заблокировано — исправьте size run в матрице.';

export const SHOP_MATRIX_SIZE_RUN_FIX_MATRIX_LINK_RU = 'Исправить size run в матрице';

export type ShopMatrixSizeRunArticleQty = {
  articleId: string;
  qtyBySize: Record<string, number>;
};

export type ShopMatrixSizeRunCartValidationResult = {
  articleId: string;
  ok: boolean;
  violations: string[];
  messageRu: string;
};

/** Group cart lines by article → qty per size. */
export function buildShopMatrixQtyByArticleFromCartItems(
  items: Array<Pick<CartItem, 'id' | 'sku' | 'quantity' | 'selectedSize'>>
): ShopMatrixSizeRunArticleQty[] {
  const byArticle = new Map<string, Record<string, number>>();
  for (const item of items) {
    const articleId = item.id?.trim() || item.sku?.trim();
    if (!articleId) continue;
    const qty = Math.max(0, Math.round(item.quantity ?? 0));
    if (qty <= 0) continue;
    const size = item.selectedSize?.trim() || 'M';
    const map = byArticle.get(articleId) ?? {};
    map[size] = (map[size] ?? 0) + qty;
    byArticle.set(articleId, map);
  }
  return [...byArticle.entries()].map(([articleId, qtyBySize]) => ({ articleId, qtyBySize }));
}

export function buildShopMatrixQtyByArticleFromSessionLines(
  lines: Array<{ articleId: string; size: string; qty: number }>
): ShopMatrixSizeRunArticleQty[] {
  const byArticle = new Map<string, Record<string, number>>();
  for (const line of lines) {
    const articleId = line.articleId?.trim();
    if (!articleId) continue;
    const qty = Math.max(0, Math.round(line.qty ?? 0));
    if (qty <= 0) continue;
    const size = line.size?.trim() || 'M';
    const map = byArticle.get(articleId) ?? {};
    map[size] = (map[size] ?? 0) + qty;
    byArticle.set(articleId, map);
  }
  return [...byArticle.entries()].map(([articleId, qtyBySize]) => ({ articleId, qtyBySize }));
}

export function mergeShopMatrixCartSizeRunResults(
  results: ShopMatrixSizeRunCartValidationResult[]
): { ok: boolean; messageRu: string; firstFailedArticleId?: string } {
  const failed = results.filter((r) => !r.ok);
  if (failed.length === 0) {
    return { ok: true, messageRu: 'Size run по всем артикулам соблюдён.' };
  }
  const first = failed[0]!;
  return {
    ok: false,
    firstFailedArticleId: first.articleId,
    messageRu: `Size run: ${failed.length} артикул(ов) — ${first.messageRu}`,
  };
}

export function shopMatrixSizeRunFixHref(collectionId: string, articleId: string): string {
  return shopB2bMatrixArticleHref(collectionId, articleId);
}
