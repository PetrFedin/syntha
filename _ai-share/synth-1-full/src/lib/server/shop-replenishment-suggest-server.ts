import 'server-only';

import type { ReplenishmentRecommendation } from '@/lib/b2b/replenishment-recommendations';
import { listWorkshop2B2bOrdersForCollection } from '@/lib/server/workshop2-b2b-orders-repository';
import { getShopReplenishmentStockAtpRows } from '@/lib/server/shop-replenishment-stock-atp-server';

function urgencyFromAtp(atp: number, suggestedQty: number): ReplenishmentRecommendation['urgency'] {
  if (atp <= 2 && suggestedQty > 0) return 'high';
  if (atp <= 5 && suggestedQty > 0) return 'medium';
  return 'low';
}

/** Spine + ATP rows → replenishment suggest (no lib/products random). */
export async function getShopReplenishmentSuggest(input: {
  shopId: string;
  collectionId?: string;
  limit?: number;
}): Promise<{
  rows: ReplenishmentRecommendation[];
  source: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const shopId = input.shopId.trim() || 'shop1';
  const collectionId = input.collectionId?.trim() || 'SS27';
  const limit = Math.min(Math.max(input.limit ?? 6, 1), 24);

  const [orders, atpResult] = await Promise.all([
    listWorkshop2B2bOrdersForCollection(collectionId),
    getShopReplenishmentStockAtpRows({ shopId, collectionId, limit: 48 }),
  ]);

  const atpBySku = new Map(atpResult.rows.map((row) => [row.sku.trim(), row]));
  const seen = new Set<string>();
  const rows: ReplenishmentRecommendation[] = [];

  const buyerOrders = orders
    .filter((o) => (o.buyerId?.trim() || shopId) === shopId)
    .filter((o) => ['submitted', 'confirmed', 'allocated', 'shipped'].includes(o.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  for (const order of buyerOrders) {
    for (const line of order.lines) {
      const sku = line.articleId?.trim() || order.articleId?.trim();
      if (!sku || seen.has(sku)) continue;
      seen.add(sku);

      const previousQty = Math.max(0, line.qty ?? 0);
      const atpRow = atpBySku.get(sku);
      const currentStock = atpRow?.atp ?? atpRow?.onHand ?? 0;
      const soldQty = Math.max(0, previousQty - currentStock);
      const sellThroughRate =
        previousQty > 0 ? Math.min(1, soldQty / previousQty) : 0;
      const reorder = currentStock < Math.max(3, Math.ceil(previousQty * 0.25));
      const suggestedQty = reorder
        ? Math.max(1, Math.ceil(previousQty * (sellThroughRate >= 0.7 ? 1.2 : 1)))
        : 0;
      const action: 'reorder' | 'skip' = reorder ? 'reorder' : 'skip';

      rows.push({
        sku,
        productId: sku,
        productName: atpRow?.name?.trim() || sku,
        brand: collectionId,
        orderId: order.id,
        previousQty,
        soldQty,
        sellThroughRate,
        suggestedQty,
        currentStock,
        action,
        reason:
          action === 'reorder'
            ? `ATP ${currentStock} · прошлый заказ ${previousQty} шт.`
            : `Остаток ${currentStock} шт. — дозаказ не требуется`,
        urgency: urgencyFromAtp(currentStock, suggestedQty),
      });

      if (rows.length >= limit) break;
    }
    if (rows.length >= limit) break;
  }

  return { rows, source: atpResult.source };
}
