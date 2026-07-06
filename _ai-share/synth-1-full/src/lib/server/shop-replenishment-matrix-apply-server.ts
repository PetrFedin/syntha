import 'server-only';

import { getPlatformCoreDemo } from '@/lib/platform-core-hub-matrix';
import { shopB2bMatrixReorderHref } from '@/lib/routes';
import {
  getWorkshop2B2bCartSession,
  upsertWorkshop2B2bCartLine,
} from '@/lib/production/workshop2-b2b-wave23-parity';
import { persistWorkshop2B2bCartSessionToFile } from '@/lib/server/workshop2-b2b-cart-session-file-store';
import { getShopReplenishmentSuggest } from '@/lib/server/shop-replenishment-suggest-server';

function resolveSessionId(existing?: string): string {
  const trimmed = existing?.trim();
  if (trimmed) return trimmed;
  return `b2b-cart-${Date.now()}`;
}

/** ATP reorder rows → matrix cart session (Wave SO). */
export async function applyShopReplenishmentMatrixLines(input: {
  buyerId: string;
  collectionId: string;
  orderId?: string;
  sessionId?: string;
}): Promise<{
  ok: boolean;
  sessionId: string;
  applied: number;
  lineCount: number;
  matrixHref: string;
  messageRu: string;
}> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const collectionId = input.collectionId.trim() || 'SS27';
  const orderId = input.orderId?.trim() ?? '';
  const fallbackArticleId = getPlatformCoreDemo(collectionId).demoArticleId;

  const { rows } = await getShopReplenishmentSuggest({
    shopId: buyerId,
    collectionId,
    limit: 12,
  });

  const reorderRows = rows.filter((row) => row.action === 'reorder' && row.suggestedQty > 0);
  if (reorderRows.length === 0) {
    return {
      ok: false,
      sessionId: resolveSessionId(input.sessionId),
      applied: 0,
      lineCount: 0,
      matrixHref: shopB2bMatrixReorderHref(collectionId, orderId),
      messageRu: 'Нет SKU для автопереноса — проверьте ATP.',
    };
  }

  const sessionId = resolveSessionId(input.sessionId);
  let session = getWorkshop2B2bCartSession(sessionId);
  let applied = 0;

  for (const row of reorderRows) {
    const articleId = row.productId?.trim() || fallbackArticleId;
    session = upsertWorkshop2B2bCartLine({
      sessionId,
      buyerId,
      line: {
        collectionId,
        articleId,
        colorCode: '001',
        size: 'M',
        qty: row.suggestedQty,
        wholesalePriceRub: 0,
      },
    });
    applied += 1;
  }

  if (session) {
    persistWorkshop2B2bCartSessionToFile(session);
  }

  const matrixHref = shopB2bMatrixReorderHref(collectionId, orderId);

  return {
    ok: Boolean(session) && applied > 0,
    sessionId,
    applied,
    lineCount: session?.lines.length ?? 0,
    matrixHref,
    messageRu:
      applied > 0
        ? `${applied} SKU перенесены в матрицу · ${session?.lines.length ?? 0} строк корзины.`
        : 'Не удалось сохранить корзину матрицы.',
  };
}
