import 'server-only';

import {
  listWorkshop2B2bOrdersAll,
  listWorkshop2B2bOrdersForCollection,
} from '@/lib/server/workshop2-b2b-orders-repository';
import { resolveWorkshop2RetailerBuyerIds } from '@/lib/b2b/workshop2-retailer-buyer-bridge';
import { shopCoreBuyerLabelRu } from '@/lib/order/shop-core-buyer-context';
import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
import {
  workshop2RetailerIdFromOrder,
  workshop2RetailerTierLabelRu,
} from '@/lib/server/workshop2-retailer-tier-label';

export type Workshop2RetailerB2bSummary = {
  retailerId: string;
  displayNameRu: string;
  orderCount: number;
  totalRub: number;
  lastOrderId?: string;
  lastUpdatedAt?: string;
  tierLabelRu: string;
};

const SEED_RETAILER_IDS = ['shop1', 'shop2', 'shop3'] as const;

function retailerDisplayNameRuFromOrders(
  retailerId: string,
  matched: Workshop2B2bOrderRecord[]
): string {
  for (const order of matched) {
    const meta = order.metadata as Record<string, unknown> | undefined;
    const fromMeta =
      typeof meta?.partnerDisplayNameRu === 'string'
        ? meta.partnerDisplayNameRu.trim()
        : typeof meta?.buyerDisplayNameRu === 'string'
          ? meta.buyerDisplayNameRu.trim()
          : '';
    if (fromMeta) return fromMeta;
  }
  return shopCoreBuyerLabelRu(retailerId);
}

function orderMatchesBuyerIds(
  order: { buyerId?: string; repId?: string },
  buyerIds: string[]
): boolean {
  const set = new Set(buyerIds);
  return Boolean(
    (order.buyerId && set.has(order.buyerId)) || (order.repId && set.has(order.repId))
  );
}

function aggregateRetailerOrders(
  retailerId: string,
  sorted: Awaited<ReturnType<typeof listWorkshop2B2bOrdersAll>>
): Workshop2RetailerB2bSummary {
  const buyerIds = resolveWorkshop2RetailerBuyerIds(retailerId);
  const matched = sorted.filter((o) => orderMatchesBuyerIds(o, buyerIds));
  if (!matched.length) {
    return {
      retailerId,
      displayNameRu: shopCoreBuyerLabelRu(retailerId),
      orderCount: 0,
      totalRub: 0,
      tierLabelRu: workshop2RetailerTierLabelRu(undefined, 0),
    };
  }
  return {
    retailerId,
    displayNameRu: retailerDisplayNameRuFromOrders(retailerId, matched),
    orderCount: matched.length,
    totalRub: matched.reduce((sum, o) => sum + (o.totalRub ?? 0), 0),
    lastOrderId: matched[0]?.id,
    lastUpdatedAt: matched[0]?.updatedAt,
    tierLabelRu: workshop2RetailerTierLabelRu(matched[0]?.tier, matched.length),
  };
}

/** CRM: агрегаты W2 B2B заказов по карточкам ритейлеров (PG tier + multi-buyer). */
export async function summarizeWorkshop2B2bOrdersByRetailer(
  collectionId?: string
): Promise<Workshop2RetailerB2bSummary[]> {
  const cid = collectionId?.trim();
  const orders = cid ? await listWorkshop2B2bOrdersForCollection(cid) : await listWorkshop2B2bOrdersAll();
  const sorted = [...orders].sort(
    (a, b) => Date.parse(b.updatedAt ?? '') - Date.parse(a.updatedAt ?? '')
  );

  const retailerIds = new Set<string>(SEED_RETAILER_IDS);
  for (const order of sorted) {
    const rid = workshop2RetailerIdFromOrder(order);
    if (rid) retailerIds.add(rid);
  }

  return [...retailerIds]
    .map((retailerId) => aggregateRetailerOrders(retailerId, sorted))
    .filter((row) => row.orderCount > 0)
    .sort((a, b) => b.orderCount - a.orderCount);
}
