import type { ShopB2bMatrixDraftDoc } from '@/lib/server/shop-b2b-matrix-draft-repository';
import { validateShopMatrixSizeRunMoq } from '@/lib/b2b/shop-matrix-size-run-validate';

export const SHOP_MATRIX_DRAFT_EMPTY_HINT_RU =
  'Черновик пуст — укажите qty в матрице перед оформлением.';

export const SHOP_MATRIX_DRAFT_SAVED_HINT_RU = 'Черновик матрицы сохранён в PG.';

export function validateShopMatrixDraftDocRu(
  draft: ShopB2bMatrixDraftDoc,
  opts?: { moqPerCell?: number; collectionId?: string }
): { ok: boolean; hintsRu: string[]; messageRu: string } {
  const hints: string[] = [];
  const moq = Math.max(1, opts?.moqPerCell ?? 1);
  const coll = draft.collectionId.trim() || opts?.collectionId?.trim() || '';

  if (draft.lines.length === 0) {
    hints.push(SHOP_MATRIX_DRAFT_EMPTY_HINT_RU);
  }

  if (coll && draft.collectionId.trim() && draft.collectionId.trim().toUpperCase() !== coll.toUpperCase()) {
    hints.push(`Коллекция черновика (${draft.collectionId}) не совпадает с экраном (${coll}).`);
  }

  const qtyByArticle = new Map<string, Record<string, number>>();
  for (const line of draft.lines) {
    if (!line.articleId?.trim() || line.qty <= 0) continue;
    const bySize = qtyByArticle.get(line.articleId) ?? {};
    const size = line.size?.trim() || 'M';
    bySize[size] = (bySize[size] ?? 0) + line.qty;
    qtyByArticle.set(line.articleId, bySize);
  }

  for (const [articleId, qtyBySize] of qtyByArticle) {
    const moqCheck = validateShopMatrixSizeRunMoq({ qtyBySize, moqPerCell: moq });
    if (!moqCheck.ok) {
      hints.push(`${articleId}: ${moqCheck.messageRu}`);
    }
  }

  const uniqueHints = [...new Set(hints)];
  return {
    ok: uniqueHints.length === 0,
    hintsRu: uniqueHints,
    messageRu:
      uniqueHints.length === 0
        ? SHOP_MATRIX_DRAFT_SAVED_HINT_RU
        : uniqueHints.slice(0, 3).join(' · '),
  };
}
