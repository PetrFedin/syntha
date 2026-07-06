import {
  workshop2B2bOrderStatusLabelRu,
  type Workshop2B2bOrderRecord,
  type Workshop2B2bOrderStatus,
} from '@/lib/production/workshop2-b2b-order-lifecycle';

export { workshop2B2bOrderStatusLabelRu };
import {
  isPlatformCoreEmptyChainCollection,
  PLATFORM_CORE_COLLECTION_PRESETS,
} from '@/lib/platform-core-hub-matrix';
import { shopCoreBuyerLabelRu } from '@/lib/order/shop-core-buyer-context';

import type { OperationalOrderIntegration } from '@/lib/integrations/spine/integration-external-ref.schema';

export type BrandB2bOrderListRow = {
  order: string;
  shop: string;
  retailerId?: string;
  status: string;
  amount: string;
  date: string;
  orderMode: 'buy_now' | 'pre_order';
  collectionId?: string;
  integration?: OperationalOrderIntegration;
};

const BUYER_LABELS: Record<string, string> = {
  shop1: 'Демо-магазин · Москва',
  shop2: 'Демо-магазин · Санкт-Петербург',
};

export function workshop2BuyerLabelRu(buyerId?: string): string {
  if (!buyerId) return '—';
  return BUYER_LABELS[buyerId] ?? shopCoreBuyerLabelRu(buyerId);
}

function workshop2RetailerIdFromOrderClient(order: Workshop2B2bOrderRecord): string | undefined {
  const rep = order.repId?.trim();
  if (rep && /^shop\d/i.test(rep)) return rep.toLowerCase();
  const buyer = order.buyerId?.trim();
  if (buyer === 'buyer-demo') return 'shop1';
  if (buyer && /^shop\d/i.test(buyer)) return buyer.toLowerCase();
  return rep || buyer || undefined;
}

export function workshop2B2bOrderToBrandListRow(
  order: Workshop2B2bOrderRecord
): BrandB2bOrderListRow {
  return {
    order: order.id,
    shop: workshop2BuyerLabelRu(order.buyerId),
    retailerId: workshop2RetailerIdFromOrderClient(order),
    status: workshop2B2bOrderStatusLabelRu(order.status),
    amount: `${order.totalRub.toLocaleString('ru-RU')} ₽`,
    date: order.createdAt.slice(0, 10),
    orderMode: order.tier === 'prebook' ? 'pre_order' : 'buy_now',
    collectionId: order.collectionId,
  };
}

/** Статусы W2, требующие действия бренда в core demo. */
export const BRAND_CORE_PENDING_W2_STATUSES: Workshop2B2bOrderStatus[] = ['submitted', 'confirmed'];

export function isBrandCorePendingW2Status(status: Workshop2B2bOrderStatus): boolean {
  return BRAND_CORE_PENDING_W2_STATUSES.includes(status);
}

export const BRAND_CORE_W2_COLLECTION_IDS = PLATFORM_CORE_COLLECTION_PRESETS.filter(
  (p) => p.available && !isPlatformCoreEmptyChainCollection(p.id)
).map((p) => p.id);
