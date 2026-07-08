import 'server-only';

import { resolveWorkshop2RetailerBuyerIds } from '@/lib/b2b/workshop2-retailer-buyer-bridge';
import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { workshop2B2bAmendmentStatusLabelRu } from '@/lib/production/workshop2-b2b-amendment';
import { getPendingWorkshop2B2bAmendment } from '@/lib/server/workshop2-b2b-amendment-repository';
import { listWorkshop2B2bOrdersForCollection } from '@/lib/server/workshop2-b2b-orders-repository';
import { workshop2RetailerIdFromOrder } from '@/lib/server/workshop2-retailer-tier-label';

export type BrandCoRegistryPendingAmendmentRow = {
  orderId: string;
  amendmentId: string;
  collectionId: string;
  retailerId: string | null;
  noteRu: string;
  statusLabelRu: string;
  createdAt: string;
};

function filterOrdersByPartner(
  orders: Workshop2B2bOrderRecord[],
  partner: string
): Workshop2B2bOrderRecord[] {
  const pid = partner.trim();
  if (!pid || pid === 'all') return orders;
  const buyerIds = resolveWorkshop2RetailerBuyerIds(pid);
  if (!buyerIds.length) {
    return orders.filter((o) => o.buyerId === pid || o.repId === pid);
  }
  const set = new Set(buyerIds);
  return orders.filter((o) => (o.buyerId && set.has(o.buyerId)) || (o.repId && set.has(o.repId)));
}

/** Pending amend rows for brand CO registry (PG/file orders + in-memory amendments). */
export async function listBrandCoRegistryPendingAmendments(input: {
  collectionId: string;
  partner?: string;
}): Promise<BrandCoRegistryPendingAmendmentRow[]> {
  const collectionId = input.collectionId.trim() || 'SS27';
  const partner = input.partner?.trim() || 'all';
  const orders = filterOrdersByPartner(
    await listWorkshop2B2bOrdersForCollection(collectionId),
    partner
  );

  const rows: BrandCoRegistryPendingAmendmentRow[] = [];
  for (const order of orders) {
    const pending = await getPendingWorkshop2B2bAmendment(order.id);
    if (!pending) continue;
    rows.push({
      orderId: order.id,
      amendmentId: pending.id,
      collectionId: order.collectionId ?? collectionId,
      retailerId: workshop2RetailerIdFromOrder(order),
      noteRu: pending.noteRu,
      statusLabelRu: workshop2B2bAmendmentStatusLabelRu(pending.status),
      createdAt: pending.createdAt,
    });
  }

  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
