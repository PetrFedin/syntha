import 'server-only';

import { syncSynthaPgTracking } from '@/lib/integrations/spine/order-tracking.service';
import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import {
  findWorkshop2LogisticsShipmentBySampleOrderId,
  upsertWorkshop2LogisticsShipment,
  type Workshop2LogisticsShipment,
} from '@/lib/server/workshop2-logistics-repository';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';
import { isPlatformCorePgLogisticsWholesaleOrderId } from '@/lib/platform-core-spine-active-order-fallback';

export type Workshop2B2bLogisticsTrackingSnapshot = {
  orderId: string;
  trackingNumber: string | null;
  carrier: string | null;
  status: string | null;
  source: 'pg_logistics' | 'spine_mirror' | 'none';
};

export async function resolveWorkshop2B2bLogisticsTracking(
  orderId: string
): Promise<Workshop2B2bLogisticsTrackingSnapshot> {
  const id = orderId.trim();
  if (!id) {
    return { orderId: id, trackingNumber: null, carrier: null, status: null, source: 'none' };
  }

  const pgShipment = await findWorkshop2LogisticsShipmentBySampleOrderId(id);
  if (pgShipment?.trackingNumber?.trim()) {
    return {
      orderId: id,
      trackingNumber: pgShipment.trackingNumber.trim(),
      carrier: pgShipment.carrier?.trim() ?? null,
      status: pgShipment.status,
      source: 'pg_logistics',
    };
  }

  const { getOrderTracking } =
    await import('@/lib/integrations/spine/order-tracking-persistence.file');
  const spine = getOrderTracking(id);
  if (spine?.trackingNumber?.trim()) {
    return {
      orderId: id,
      trackingNumber: spine.trackingNumber.trim(),
      carrier: spine.carrier?.trim() ?? null,
      status: spine.status?.trim() ?? null,
      source: 'spine_mirror',
    };
  }

  return { orderId: id, trackingNumber: null, carrier: null, status: null, source: 'none' };
}

export async function syncWorkshop2B2bOrderLogisticsTracking(input: {
  orderId: string;
  trackingNumber: string;
  carrier?: string;
  actor?: string;
}): Promise<
  | { ok: true; shipment: Workshop2LogisticsShipment; trackingNumber: string }
  | { ok: false; error: string; messageRu: string }
> {
  const orderId = input.orderId.trim();
  const trackingNumber = input.trackingNumber.trim();
  if (!orderId || !isPlatformCorePgLogisticsWholesaleOrderId(orderId)) {
    return {
      ok: false,
      error: 'invalid_order_id',
      messageRu: 'Трек-номер доступен только для PG-заказов B2B-\\d+ и demo pin B2B-DEMO-*.',
    };
  }
  if (!trackingNumber) {
    return { ok: false, error: 'tracking_required', messageRu: 'Укажите трек-номер.' };
  }

  const order = await getWorkshop2B2bOrder(orderId);
  if (!order?.collectionId?.trim() || !order.articleId?.trim()) {
    return {
      ok: false,
      error: 'order_not_found',
      messageRu: 'Заказ не найден в PG или без collection/article.',
    };
  }

  const carrier = input.carrier?.trim() || 'Syntha Logistics';
  const upserted = await upsertWorkshop2LogisticsShipment({
    collectionId: order.collectionId.trim(),
    articleId: order.articleId.trim(),
    sampleOrderId: orderId,
    trackingNumber,
    carrier,
    status: 'in_transit',
    currentStep: 'transit',
    reason: `ТТН для оптового заказа ${orderId}`,
    actorRole: 'brand_logist',
    actorName: input.actor?.trim() || 'brand_logistics_api',
    syncSource: 'manual',
  });

  if ('error' in upserted) {
    return {
      ok: false,
      error: String(upserted.error),
      messageRu: 'Не удалось сохранить отгрузку в PG logistics.',
    };
  }

  syncSynthaPgTracking({
    wholesaleOrderId: orderId,
    trackingNumber,
    carrier,
    status: 'in_transit',
  });
  bumpPlatformCoreChainStatus([orderId]);

  return { ok: true, shipment: upserted, trackingNumber };
}
