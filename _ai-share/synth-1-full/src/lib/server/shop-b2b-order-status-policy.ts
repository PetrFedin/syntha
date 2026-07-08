import 'server-only';

import type { Workshop2B2bOrderStatus } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { normalizeShopCoreBuyerId } from '@/lib/order/shop-core-buyer-context';

/** Статусы, которые shop PATCH не может выставить — только brand API (confirm/handoff/logistics). */
export const SHOP_B2B_ORDER_BRAND_ONLY_STATUSES: readonly Workshop2B2bOrderStatus[] = [
  'confirmed',
  'allocated',
  'shipped',
];

export function isShopB2bOrderBrandOnlyStatus(status: Workshop2B2bOrderStatus): boolean {
  return (SHOP_B2B_ORDER_BRAND_ONLY_STATUSES as readonly string[]).includes(status);
}

export function assertShopB2bOrderStatusPatchAllowed(input: {
  targetStatus: Workshop2B2bOrderStatus;
  orderBuyerId?: string | null;
  sessionBuyerId: string;
}): { ok: true } | { ok: false; code: 'brand_only_status' | 'buyer_mismatch'; messageRu: string } {
  if (isShopB2bOrderBrandOnlyStatus(input.targetStatus)) {
    return {
      ok: false,
      code: 'brand_only_status',
      messageRu:
        'Подтверждение и передача в производство — только через API бренда (confirm-order / handoff).',
    };
  }

  const orderBuyer = input.orderBuyerId?.trim();
  const sessionBuyer = normalizeShopCoreBuyerId(input.sessionBuyerId);
  if (orderBuyer && orderBuyer !== sessionBuyer) {
    return {
      ok: false,
      code: 'buyer_mismatch',
      messageRu: 'Заказ принадлежит другому buyerId — PATCH запрещён.',
    };
  }

  return { ok: true };
}
