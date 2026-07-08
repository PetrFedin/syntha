/**
 * Wave H · unified shipment webhook → spine tracking mirror (NuOrder/JOOR IN).
 */
import 'server-only';

import { importNuOrderShipmentInbound } from './nuorder-shipment-inbound.service';
import { importJoorShipmentInbound } from './joor-shipment-inbound.service';
import { patchImportedOrderStatus } from './imported-orders-persistence';
import { enqueueSyncJob } from './sync-jobs-persistence.file';

export type SpineShipmentWebhookBody = {
  platform?: string;
  provider?: string;
  wholesaleOrderId?: string;
  b2bOrderId?: string;
  externalOrderId?: string;
  order_id?: string;
  trackingNumber?: string;
  tracking_number?: string;
  carrier?: string;
  status?: string;
  shippedAt?: string;
  shipped_at?: string;
  estimatedDelivery?: string;
  estimated_delivery?: string;
};

export type SpineShipmentWebhookResult = {
  platform: 'nuorder' | 'joor';
  wholesaleOrderId: string;
  trackingNumber?: string;
  source: 'webhook';
};

function normalizePlatform(raw: string | undefined): 'nuorder' | 'joor' | null {
  const p = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (p === 'nuorder' || p === 'nu-order') return 'nuorder';
  if (p === 'joor') return 'joor';
  return null;
}

function mapShipment(body: SpineShipmentWebhookBody) {
  const trackingNumber =
    String(body.trackingNumber ?? body.tracking_number ?? '').trim() || undefined;
  if (!trackingNumber) return undefined;
  return {
    trackingNumber,
    carrier: body.carrier?.trim(),
    status: body.status?.trim(),
    shippedAt: body.shippedAt ?? body.shipped_at,
    estimatedDelivery: body.estimatedDelivery ?? body.estimated_delivery,
  };
}

export async function processSpineShipmentWebhook(
  body: SpineShipmentWebhookBody
): Promise<SpineShipmentWebhookResult | null> {
  const platform = normalizePlatform(body.platform ?? body.provider);
  if (!platform) return null;

  const wholesaleOrderId =
    String(body.wholesaleOrderId ?? body.b2bOrderId ?? '').trim() || undefined;
  const externalOrderId = String(body.externalOrderId ?? body.order_id ?? '').trim() || undefined;
  const shipment = mapShipment(body);

  if (platform === 'nuorder') {
    const result = await importNuOrderShipmentInbound({
      wholesaleOrderId,
      externalOrderId,
      shipment,
    });
    if (!result) return null;
    patchImportedOrderStatus(result.wholesaleOrderId, 'shipped');
    enqueueSyncJob({ platform: 'nuorder', kind: 'tracking_sync', resultCount: 1 });
    return {
      platform: 'nuorder',
      wholesaleOrderId: result.wholesaleOrderId,
      trackingNumber: result.shipment.trackingNumber,
      source: 'webhook',
    };
  }

  const result = await importJoorShipmentInbound({
    wholesaleOrderId,
    externalOrderId,
    shipment,
  });
  if (!result) return null;
  patchImportedOrderStatus(result.wholesaleOrderId, 'shipped');
  enqueueSyncJob({ platform: 'joor', kind: 'tracking_sync', resultCount: 1 });
  return {
    platform: 'joor',
    wholesaleOrderId: result.wholesaleOrderId,
    trackingNumber: result.shipment.trackingNumber,
    source: 'webhook',
  };
}
