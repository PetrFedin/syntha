import 'server-only';

import {
  buildShopMatrixQtyByArticleFromSessionLines,
  mergeShopMatrixCartSizeRunResults,
  type ShopMatrixSizeRunCartValidationResult,
} from '@/lib/b2b/shop-matrix-size-run-cart-validation';
import { validateShopMatrixSizeRunServer } from '@/lib/server/shop-matrix-size-run-validate-server';

export async function validateShopMatrixCartSizeRunsServer(input: {
  collectionId: string;
  lines: Array<{ articleId: string; size: string; qty: number }>;
}): Promise<{
  ok: boolean;
  results: ShopMatrixSizeRunCartValidationResult[];
  messageRu: string;
  firstFailedArticleId?: string;
}> {
  const collectionId = input.collectionId.trim();
  const articles = buildShopMatrixQtyByArticleFromSessionLines(input.lines);
  if (articles.length === 0) {
    return {
      ok: true,
      results: [],
      messageRu: 'Size run пуст — проверка не требуется.',
    };
  }

  const results: ShopMatrixSizeRunCartValidationResult[] = [];
  for (const { articleId, qtyBySize } of articles) {
    const validated = await validateShopMatrixSizeRunServer({ collectionId, articleId, qtyBySize });
    if (!validated.ok) {
      results.push({
        articleId,
        ok: false,
        violations: [],
        messageRu: validated.messageRu,
      });
      continue;
    }
    results.push({
      articleId,
      ok: validated.result.ok,
      violations: validated.result.violations,
      messageRu: validated.result.messageRu,
    });
  }

  const merged = mergeShopMatrixCartSizeRunResults(results);
  return {
    ok: merged.ok,
    results,
    messageRu: merged.messageRu,
    firstFailedArticleId: merged.firstFailedArticleId,
  };
}
