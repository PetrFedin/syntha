import 'server-only';

import {
  shopReplenishmentMatrixPrefillHref,
  sumReplenishmentAtpQty,
  type ShopReplenishmentAtpLine,
} from '@/lib/b2b/shop-replenishment-matrix-prefill';
import { applyShopReplenishmentMatrixLines } from '@/lib/server/shop-replenishment-matrix-apply-server';
import { getShopReplenishmentStockAtpRows } from '@/lib/server/shop-replenishment-stock-atp-server';
import { getShopReplenishmentSuggest } from '@/lib/server/shop-replenishment-suggest-server';

export type ShopReplenishmentAllocateResult = {
  ok: boolean;
  buyerId: string;
  collectionId: string;
  atpSource: string;
  atpLines: ShopReplenishmentAtpLine[];
  atpQtyTotal: number;
  applied: number;
  lineCount: number;
  sessionId: string;
  matrixHref: string;
  messageRu: string;
};

/** WMS ATP feed → matrix cart + deep-link prefill (Wave TV). */
export async function allocateShopReplenishmentFromWmsAtp(input: {
  buyerId: string;
  collectionId: string;
  orderId?: string;
  sessionId?: string;
}): Promise<ShopReplenishmentAllocateResult> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const collectionId = input.collectionId.trim() || 'SS27';
  const orderId = input.orderId?.trim() ?? '';

  const [atpResult, suggest] = await Promise.all([
    getShopReplenishmentStockAtpRows({ shopId: buyerId, collectionId, limit: 24 }),
    getShopReplenishmentSuggest({ shopId: buyerId, collectionId, limit: 12 }),
  ]);

  const atpBySku = new Map(atpResult.rows.map((row) => [row.sku.trim(), row.atp]));
  const reorderRows = suggest.rows.filter(
    (row) => row.action === 'reorder' && row.suggestedQty > 0
  );

  const atpLines: ShopReplenishmentAtpLine[] = reorderRows.map((row) => ({
    sku: row.sku,
    atpQty: atpBySku.get(row.sku.trim()) ?? row.currentStock ?? 0,
    suggestedQty: row.suggestedQty,
  }));

  const atpQtyTotal = sumReplenishmentAtpQty(atpLines);

  const apply = await applyShopReplenishmentMatrixLines({
    buyerId,
    collectionId,
    orderId,
    sessionId: input.sessionId,
  });

  const matrixHref = shopReplenishmentMatrixPrefillHref(collectionId, orderId || undefined, {
    appliedLines: apply.applied,
    atpQtyTotal,
    buyerId,
  });

  return {
    ok: apply.ok,
    buyerId,
    collectionId,
    atpSource: atpResult.source,
    atpLines,
    atpQtyTotal,
    applied: apply.applied,
    lineCount: apply.lineCount,
    sessionId: apply.sessionId,
    matrixHref: apply.ok ? matrixHref : apply.matrixHref,
    messageRu:
      apply.ok && apply.applied > 0
        ? `${apply.applied} SKU · ATP ${atpQtyTotal} → матрица (${atpResult.source === 'pg+wms' || atpResult.source === 'wms' ? 'WMS' : 'PG'}).`
        : apply.messageRu,
  };
}
