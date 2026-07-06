/**
 * GET /api/brand/b2b/orders — список W2 B2B заказов по collectionId (Wave 24).
 */
import { NextRequest, NextResponse } from 'next/server';
import { resolveWorkshop2RetailerBuyerIds } from '@/lib/b2b/workshop2-retailer-buyer-bridge';
import { listWorkshop2B2bOrdersForCollection } from '@/lib/server/workshop2-b2b-orders-repository';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { workshop2RetailerIdFromOrder } from '@/lib/server/workshop2-retailer-tier-label';
import { workshop2B2bOrderContextId } from '@/lib/production/workshop2-b2b-order-lifecycle';
import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';

function uniquePartnerIds(orders: Workshop2B2bOrderRecord[]): string[] {
  const ids = new Set<string>();
  for (const order of orders) {
    const retailerId = workshop2RetailerIdFromOrder(order);
    if (retailerId) ids.add(retailerId);
  }
  return [...ids].sort();
}

function filterOrdersByPartner(
  orders: Workshop2B2bOrderRecord[],
  partner: string
): Workshop2B2bOrderRecord[] {
  const pid = partner.trim();
  if (!pid || pid === 'all') return orders;
  const buyerIds = resolveWorkshop2RetailerBuyerIds(pid);
  if (!buyerIds.length) return orders.filter((o) => o.buyerId === pid || o.repId === pid);
  const set = new Set(buyerIds);
  return orders.filter(
    (o) => (o.buyerId && set.has(o.buyerId)) || (o.repId && set.has(o.repId))
  );
}

export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? 'SS27';
  const partner =
    req.nextUrl.searchParams.get('partner')?.trim() ||
    req.nextUrl.searchParams.get('buyerId')?.trim() ||
    'all';
  const allOrders = await listWorkshop2B2bOrdersForCollection(collectionId);
  const orders = filterOrdersByPartner(allOrders, partner);
  const partnerIds = uniquePartnerIds(allOrders);
  const storageMode = isWorkshop2PostgresEnabled() ? 'pg' : 'file';

  return NextResponse.json({
    ok: true,
    collectionId,
    partner,
    partnerIds,
    storageMode,
    orders: orders.map((o) => ({
      ...o,
      w2Href:
        o.collectionId && o.articleId
          ? `/brand/production/workshop2/${encodeURIComponent(o.collectionId)}/${encodeURIComponent(o.articleId)}`
          : null,
      chatHref: `/brand/messages?contextType=b2b_order&contextId=${encodeURIComponent(workshop2B2bOrderContextId(o.id))}`,
    })),
    messageRu: `${orders.length} заказ(ов) по коллекции ${collectionId}${partner !== 'all' ? ` · ${partner}` : ''}.`,
  });
}
