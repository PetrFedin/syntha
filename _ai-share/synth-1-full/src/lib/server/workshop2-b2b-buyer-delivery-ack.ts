import 'server-only';

import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
import {
  getWorkshop2B2bOrder,
  putWorkshop2B2bOrder,
} from '@/lib/server/workshop2-b2b-orders-repository';

export type Workshop2BuyerDeliveryBulkAckResult = {
  ok: boolean;
  acknowledged: string[];
  skipped: string[];
  errors: Array<{ orderId: string; messageRu: string }>;
};

export async function acknowledgeWorkshop2B2bBuyerDelivery(input: {
  orderId: string;
  actor?: string;
}): Promise<
  | { ok: true; order: Workshop2B2bOrderRecord; acknowledgedAt: string }
  | { ok: false; code: 'not_found' | 'invalid_status' | 'already_ack'; messageRu: string }
> {
  const orderId = input.orderId.trim();
  const existing = await getWorkshop2B2bOrder(orderId);
  if (!existing) {
    return { ok: false, code: 'not_found', messageRu: 'B2B заказ не найден.' };
  }
  if (existing.status !== 'shipped') {
    return {
      ok: false,
      code: 'invalid_status',
      messageRu: 'Подтверждение получения доступно только для отгруженных заказов (shipped).',
    };
  }
  if (existing.buyerDeliveryAcknowledgedAt) {
    return {
      ok: false,
      code: 'already_ack',
      messageRu: 'Получение уже подтверждено магазином.',
    };
  }
  const acknowledgedAt = new Date().toISOString();
  const next: Workshop2B2bOrderRecord = {
    ...existing,
    buyerDeliveryAcknowledgedAt: acknowledgedAt,
    updatedAt: acknowledgedAt,
  };
  await putWorkshop2B2bOrder(next);
  const { bumpPlatformCoreChainStatus } =
    await import('@/lib/server/platform-core-chain-status-hub');
  bumpPlatformCoreChainStatus([orderId]);
  const { bumpPlatformCoreB2bRegistry } =
    await import('@/lib/server/platform-core-b2b-registry-hub');
  bumpPlatformCoreB2bRegistry('b2b.order.delivery_acknowledged');
  return { ok: true, order: next, acknowledgedAt };
}

export async function bulkAcknowledgeWorkshop2B2bBuyerDelivery(input: {
  orderIds: string[];
  actor?: string;
  maxItems?: number;
}): Promise<Workshop2BuyerDeliveryBulkAckResult> {
  const max = Math.min(input.maxItems ?? 16, 32);
  const ids = [...new Set(input.orderIds.map((id) => id.trim()).filter(Boolean))].slice(0, max);
  const acknowledged: string[] = [];
  const skipped: string[] = [];
  const errors: Array<{ orderId: string; messageRu: string }> = [];

  for (const orderId of ids) {
    const result = await acknowledgeWorkshop2B2bBuyerDelivery({
      orderId,
      actor: input.actor,
    });
    if (result.ok) {
      acknowledged.push(orderId);
      continue;
    }
    if (result.code === 'already_ack') {
      skipped.push(orderId);
      continue;
    }
    errors.push({ orderId, messageRu: result.messageRu });
  }

  return {
    ok: acknowledged.length > 0 || skipped.length > 0,
    acknowledged,
    skipped,
    errors,
  };
}
