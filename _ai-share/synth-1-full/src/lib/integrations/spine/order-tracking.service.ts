/**
 * Wave D1/D2 · unified order tracking read-model for shop + factory.
 */
import 'server-only';

import { getImportedOrderRecord } from './imported-orders-persistence';
import {
  getProductionWipByB2bOrderId,
  getProductionWipByPoId,
  productionWipSteps,
  PRODUCTION_WIP_STAGE_LABEL_RU,
  type ProductionWipStage,
  upsertProductionWip,
  type ProductionWipRecord,
} from './production-wip-persistence.file';
import {
  getOrderTracking,
  upsertOrderTracking,
  type OrderTrackingShipment,
} from './order-tracking-persistence.file';
import { workshop2B2bProductionHandoffPoId } from '@/lib/server/workshop2-b2b-production-handoff';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';

import { getDeliveryWindow } from './delivery-window-persistence.file';

import type { UnifiedOrderTracking } from './order-tracking.types';

export type { UnifiedOrderTracking } from './order-tracking.types';

function deliveryFromImported(
  wholesaleOrderId: string
): UnifiedOrderTracking['deliveryWindow'] | undefined {
  const persisted = getDeliveryWindow(wholesaleOrderId);
  if (persisted) {
    return { label: persisted.label, estimatedDelivery: persisted.startAt.slice(0, 10) };
  }
  const rec = getImportedOrderRecord(wholesaleOrderId);
  if (!rec) return undefined;
  const dd = rec.order.deliveryDate?.trim();
  if (!dd || dd === '—') return undefined;
  return { label: dd, estimatedDelivery: dd };
}

export function resolveUnifiedOrderTracking(wholesaleOrderId: string): UnifiedOrderTracking {
  const id = wholesaleOrderId.trim();
  const productionOrderId = workshop2B2bProductionHandoffPoId(id);
  const wip = getProductionWipByB2bOrderId(id) ?? getProductionWipByPoId(productionOrderId);
  const shipment = getOrderTracking(id);

  return {
    wholesaleOrderId: id,
    productionOrderId: wip ? wip.productionOrderId : productionOrderId,
    wip: wip
      ? {
          platform: wip.platform,
          poStage: wip.poStage,
          labelRu: PRODUCTION_WIP_STAGE_LABEL_RU[wip.poStage],
          steps: productionWipSteps(wip.poStage),
          updatedAt: wip.updatedAt,
        }
      : undefined,
    shipment,
    deliveryWindow: deliveryFromImported(id),
  };
}

export function syncAims360Wip(input: {
  productionOrderId: string;
  b2bOrderId: string;
  poStage: ProductionWipStage;
  qtyComplete?: number;
  qtyTotal?: number;
}): ProductionWipRecord {
  const record = upsertProductionWip({
    productionOrderId: input.productionOrderId.trim(),
    b2bOrderId: input.b2bOrderId.trim(),
    platform: 'aims360',
    poStage: input.poStage,
    qtyComplete: input.qtyComplete,
    qtyTotal: input.qtyTotal,
    updatedAt: new Date().toISOString(),
  });
  bumpPlatformCoreChainStatus([record.b2bOrderId]);
  return record;
}

export function syncZedonkTracking(input: {
  wholesaleOrderId: string;
  trackingNumber?: string;
  carrier?: string;
  status?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
}): OrderTrackingShipment {
  const shipment = upsertOrderTracking({
    wholesaleOrderId: input.wholesaleOrderId.trim(),
    platform: 'zedonk',
    trackingNumber: input.trackingNumber?.trim(),
    carrier: input.carrier?.trim(),
    status: input.status?.trim() ?? 'in_transit',
    shippedAt: input.shippedAt ?? new Date().toISOString(),
    estimatedDelivery: input.estimatedDelivery?.trim(),
    updatedAt: new Date().toISOString(),
  });
  bumpPlatformCoreChainStatus([shipment.wholesaleOrderId]);
  return shipment;
}

export function syncNuOrderTracking(input: {
  wholesaleOrderId: string;
  trackingNumber?: string;
  carrier?: string;
  status?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
}): OrderTrackingShipment {
  const shipment = upsertOrderTracking({
    wholesaleOrderId: input.wholesaleOrderId.trim(),
    platform: 'nuorder',
    trackingNumber: input.trackingNumber?.trim(),
    carrier: input.carrier?.trim(),
    status: input.status?.trim() ?? 'shipped',
    shippedAt: input.shippedAt ?? new Date().toISOString(),
    estimatedDelivery: input.estimatedDelivery?.trim(),
    updatedAt: new Date().toISOString(),
  });
  bumpPlatformCoreChainStatus([shipment.wholesaleOrderId]);
  return shipment;
}

export function syncJoorTracking(input: {
  wholesaleOrderId: string;
  trackingNumber?: string;
  carrier?: string;
  status?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
}): OrderTrackingShipment {
  const shipment = upsertOrderTracking({
    wholesaleOrderId: input.wholesaleOrderId.trim(),
    platform: 'joor',
    trackingNumber: input.trackingNumber?.trim(),
    carrier: input.carrier?.trim(),
    status: input.status?.trim() ?? 'shipped',
    shippedAt: input.shippedAt ?? new Date().toISOString(),
    estimatedDelivery: input.estimatedDelivery?.trim(),
    updatedAt: new Date().toISOString(),
  });
  bumpPlatformCoreChainStatus([shipment.wholesaleOrderId]);
  return shipment;
}

/** Native PG B2B order — spine mirror для shop tracking strip. */
export function syncSynthaPgTracking(input: {
  wholesaleOrderId: string;
  trackingNumber?: string;
  carrier?: string;
  status?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
}): OrderTrackingShipment {
  const shipment = upsertOrderTracking({
    wholesaleOrderId: input.wholesaleOrderId.trim(),
    platform: 'syntha',
    trackingNumber: input.trackingNumber?.trim(),
    carrier: input.carrier?.trim(),
    status: input.status?.trim() ?? 'in_transit',
    shippedAt: input.shippedAt ?? new Date().toISOString(),
    estimatedDelivery: input.estimatedDelivery?.trim(),
    updatedAt: new Date().toISOString(),
  });
  bumpPlatformCoreChainStatus([shipment.wholesaleOrderId]);
  return shipment;
}

/** Demo seed: advance WIP one stage for PO after handoff. */
export function advanceAims360WipDemo(
  productionOrderId: string,
  b2bOrderId: string
): ProductionWipRecord {
  const current = getProductionWipByPoId(productionOrderId);
  const stages: ProductionWipStage[] = ['cutting', 'sewing', 'qc', 'ready_to_ship', 'shipped'];
  const next = !current
    ? 'cutting'
    : stages[Math.min(stages.indexOf(current.poStage) + 1, stages.length - 1)];
  return syncAims360Wip({ productionOrderId, b2bOrderId, poStage: next });
}
