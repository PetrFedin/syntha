import 'server-only';

import {
  resolveWorkingOrderVersionsForOrder,
} from '@/lib/server/shop-working-order-version-diff';
import {
  resolveArticleIdFromProductId,
  resolveSpineCollectionIdFromLines,
} from '@/lib/integrations/spine/spine-production-forecast-lines';
import { shopWorkingOrderMergeMatrixHref } from '@/lib/b2b/shop-working-order-version-diff';
import { shopB2bMatrixReorderHref } from '@/lib/routes';
import {
  getWorkshop2B2bCartSession,
  upsertWorkshop2B2bCartLine,
} from '@/lib/production/workshop2-b2b-wave23-parity';
import { persistWorkshop2B2bCartSessionToFile } from '@/lib/server/workshop2-b2b-cart-session-file-store';
import { appendShopWorkingOrderMergeJournal } from '@/lib/server/shop-working-order-version-journal-repository';

export type ShopWorkingOrderMergeToMatrixResult = {
  ok: boolean;
  wholesaleOrderId: string;
  sessionId: string;
  collectionId: string;
  versionId?: string;
  mergedLines: number;
  eligibleLines: number;
  partialMerge: boolean;
  lineCount: number;
  matrixHref: string;
  messageRu: string;
  journalId?: string;
};

/** Перенос последней версии working order в B2B cart / matrix session. */
export async function mergeShopWorkingOrderToMatrix(input: {
  wholesaleOrderId: string;
  sessionId: string;
  buyerId: string;
  collectionId?: string;
  versionId?: string;
  persistJournal?: boolean;
}): Promise<ShopWorkingOrderMergeToMatrixResult> {
  const wholesaleOrderId = input.wholesaleOrderId.trim();
  const sessionId = input.sessionId.trim();
  const versions = await resolveWorkingOrderVersionsForOrder(wholesaleOrderId);
  const version =
    (input.versionId
      ? versions.find((v) => v.versionId === input.versionId)
      : versions[versions.length - 1]) ?? undefined;

  const fallbackCollectionId = input.collectionId?.trim() || 'SS27';

  if (!version || version.lines.length === 0) {
    const result: ShopWorkingOrderMergeToMatrixResult = {
      ok: false,
      wholesaleOrderId,
      sessionId,
      collectionId: fallbackCollectionId,
      mergedLines: 0,
      eligibleLines: 0,
      partialMerge: false,
      lineCount: 0,
      matrixHref: shopB2bMatrixReorderHref(fallbackCollectionId, wholesaleOrderId),
      messageRu: 'Нет строк для переноса в матрицу.',
    };
    if (input.persistJournal !== false) {
      const journal = await appendShopWorkingOrderMergeJournal({
        result,
        buyerId: input.buyerId,
      });
      result.journalId = journal.id;
    }
    return result;
  }

  const collectionId =
    input.collectionId?.trim() ||
    resolveSpineCollectionIdFromLines(version.lines, 'SS27');

  const eligibleLines = version.lines.filter(
    (line) => Math.max(0, Number(line.quantity ?? 0)) > 0
  ).length;

  let mergedLines = 0;
  let session = getWorkshop2B2bCartSession(sessionId);
  for (const line of version.lines) {
    const qty = Math.max(0, Number(line.quantity ?? 0));
    if (qty <= 0) continue;
    const articleId = resolveArticleIdFromProductId(String(line.productId ?? ''));
    if (!articleId) continue;
    session = upsertWorkshop2B2bCartLine({
      sessionId,
      buyerId: input.buyerId,
      line: {
        collectionId,
        articleId,
        colorCode: 'default',
        size: line.size?.trim() || 'OS',
        qty,
        wholesalePriceRub: Math.round(Number(line.price ?? 0)),
      },
    });
    mergedLines += 1;
  }

  if (session) {
    persistWorkshop2B2bCartSessionToFile(session);
  }

  const partialMerge = mergedLines > 0 && mergedLines < eligibleLines;
  const matrixHref =
    partialMerge
      ? shopWorkingOrderMergeMatrixHref(collectionId, wholesaleOrderId, {
          partialMerge: true,
          mergedLines,
        })
      : shopB2bMatrixReorderHref(collectionId, wholesaleOrderId);

  const result: ShopWorkingOrderMergeToMatrixResult = {
    ok: mergedLines > 0,
    wholesaleOrderId,
    sessionId,
    collectionId,
    versionId: version.versionId,
    mergedLines,
    eligibleLines,
    partialMerge,
    lineCount: session?.lines.length ?? 0,
    matrixHref,
    messageRu:
      mergedLines > 0
        ? partialMerge
          ? `Частичный перенос: ${mergedLines} из ${eligibleLines} строк — дозаполните матрицу.`
          : `В матрицу перенесено ${mergedLines} строк (${session?.lines.length ?? 0} в корзине).`
        : 'Не удалось сопоставить SKU с артикулами матрицы.',
  };

  if (input.persistJournal !== false) {
    const journal = await appendShopWorkingOrderMergeJournal({
      result,
      buyerId: input.buyerId,
    });
    result.journalId = journal.id;
  }

  return result;
}
