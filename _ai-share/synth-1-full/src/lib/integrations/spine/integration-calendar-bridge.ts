/**
 * Wave E2 · spine delivery windows → B2B calendar events.
 */
import 'server-only';

import type { Workshop2B2bCalendarEvent } from '@/lib/production/workshop2-b2b-campaign-hub';
import { listImportedOrdersAsB2B, patchImportedOrderFields } from './imported-orders-persistence';
import {
  getDeliveryWindow,
  listDeliveryWindowsForCollection,
  upsertDeliveryWindow,
  type DeliveryWindowRecord,
} from './delivery-window-persistence.file';
import {
  formatWholesaleOrderDisplayId,
  isIntegrationImportedWholesaleOrderId,
} from './integration-ui-utils';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

function parseDateLabel(label: string): { startAt: string; endAt: string } | null {
  const raw = label.trim();
  if (!raw || raw === '—') return null;
  const iso = /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : null;
  if (!iso) {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    const fallback = d.toISOString().slice(0, 10);
    return { startAt: `${fallback}T09:00:00.000Z`, endAt: `${fallback}T18:00:00.000Z` };
  }
  return { startAt: `${iso}T09:00:00.000Z`, endAt: `${iso}T18:00:00.000Z` };
}

export function buildSpineDeliveryCalendarEvent(
  record: DeliveryWindowRecord
): Workshop2B2bCalendarEvent {
  const orderLabel = formatWholesaleOrderDisplayId(record.wholesaleOrderId);
  return {
    id: `b2b-spine-delivery-${record.wholesaleOrderId}`,
    collectionId: record.collectionId,
    b2bOrderId: record.wholesaleOrderId,
    source: 'b2b',
    title: `Окно поставки · ${record.label} · ${orderLabel}`,
    startAt: record.startAt,
    endAt: record.endAt,
    kind: 'delivery_window',
  };
}

export function listSpineCalendarEvents(input: {
  collectionId: string;
  orderId?: string;
}): Workshop2B2bCalendarEvent[] {
  const events: Workshop2B2bCalendarEvent[] = [];
  const cid = input.collectionId.trim();
  const orderFilter = input.orderId?.trim();

  for (const rec of listDeliveryWindowsForCollection(cid)) {
    if (orderFilter && rec.wholesaleOrderId !== orderFilter) continue;
    events.push(buildSpineDeliveryCalendarEvent(rec));
  }

  for (const order of listImportedOrdersAsB2B()) {
    if (!isIntegrationImportedWholesaleOrderId(order.order)) continue;
    if (orderFilter && order.order !== orderFilter) continue;
    if (getDeliveryWindow(order.order)) continue;
    const parsed = parseDateLabel(order.deliveryDate ?? '');
    if (!parsed) continue;
    events.push({
      id: `b2b-spine-import-delivery-${order.order}`,
      collectionId: cid,
      b2bOrderId: order.order,
      source: 'b2b',
      title: `Окно поставки · ${order.deliveryDate} · ${formatWholesaleOrderDisplayId(order.order)}`,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      kind: 'delivery_window',
    });
  }

  return events;
}

export function syncDeliveryWindowForOrder(input: {
  wholesaleOrderId: string;
  collectionId?: string;
  label: string;
  sourcePlatform?: DeliveryWindowRecord['sourcePlatform'];
}): DeliveryWindowRecord | null {
  const parsed = parseDateLabel(input.label);
  if (!parsed) return null;
  const record = upsertDeliveryWindow({
    wholesaleOrderId: input.wholesaleOrderId.trim(),
    collectionId: input.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId,
    label: input.label.trim(),
    startAt: parsed.startAt,
    endAt: parsed.endAt,
    sourcePlatform: input.sourcePlatform,
    updatedAt: new Date().toISOString(),
  });
  patchImportedOrderFields(input.wholesaleOrderId.trim(), { deliveryDate: input.label.trim() });
  return record;
}
