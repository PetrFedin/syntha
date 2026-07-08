/**
 * Wave D6 · AIMS360 allocation sync + OTS enrichment (pillar 3).
 */
import 'server-only';

import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import {
  getAllocationQueue,
  upsertAllocationQueue,
  type AllocationLine,
  type AllocationQueueRecord,
} from './allocation-queue-persistence.file';
import { getMatrixInventoryForPlatform } from './inventory-adapters';

export function buildAllocationLinesFromOrderItems(items: B2BOrderLineItem[]): AllocationLine[] {
  return items.map((line) => {
    const sku = line.productId?.trim() || 'unknown';
    const qty = line.quantity ?? 1;
    return {
      sku,
      qtyOrdered: qty,
      qtyAllocated: 0,
      locationId: 'flagship-001',
      locationLabel: 'Flagship · Tverskaya',
    };
  });
}

export function enqueueAllocationForOrder(input: {
  wholesaleOrderId: string;
  collectionId?: string;
  lines: B2BOrderLineItem[];
}): AllocationQueueRecord {
  const lines = buildAllocationLinesFromOrderItems(input.lines);
  return upsertAllocationQueue({
    wholesaleOrderId: input.wholesaleOrderId.trim(),
    collectionId: input.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId,
    status: 'queued',
    platform: 'aims360',
    lines,
    updatedAt: new Date().toISOString(),
  });
}

export async function syncAims360Allocation(input: {
  wholesaleOrderId: string;
  organizationId?: string;
  locations?: Array<{ locationId: string; locationLabel: string; sku: string; qty: number }>;
}): Promise<AllocationQueueRecord> {
  const org = input.organizationId?.trim() || 'org-brand-001';
  const id = input.wholesaleOrderId.trim();
  const existing =
    getAllocationQueue(id) ??
    upsertAllocationQueue({
      wholesaleOrderId: id,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      status: 'queued',
      platform: 'aims360',
      lines: [],
      updatedAt: new Date().toISOString(),
    });

  const lines: AllocationLine[] = input.locations?.length
    ? existing.lines.map((line) => {
        const hit = input.locations!.find((l) => l.sku === line.sku);
        if (!hit) return line;
        return {
          ...line,
          qtyAllocated: hit.qty,
          locationId: hit.locationId,
          locationLabel: hit.locationLabel,
        };
      })
    : existing.lines.length > 0
      ? existing.lines.map((line) => ({
          ...line,
          qtyAllocated: line.qtyOrdered,
          locationId: 'flagship-001',
          locationLabel: 'Flagship · Tverskaya',
        }))
      : getMatrixInventoryForPlatform('aims360').map((cell) => ({
          sku: cell.sku,
          qtyOrdered: 0,
          qtyAllocated: Math.min(cell.openToSell ?? cell.ats, 120),
          locationId: 'dep-002',
          locationLabel: 'Dep. Store · Aviapark',
        }));

  const allAllocated = lines.every((l) => l.qtyAllocated >= l.qtyOrdered || l.qtyOrdered === 0);
  const record = upsertAllocationQueue({
    wholesaleOrderId: id,
    collectionId: existing.collectionId,
    status: allAllocated
      ? 'allocated'
      : lines.some((l) => l.qtyAllocated > 0)
        ? 'partial'
        : 'in_progress',
    platform: 'aims360',
    lines,
    updatedAt: new Date().toISOString(),
  });

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: workshop2B2bOrderContextId(id),
    message: `AIMS360 allocation · ${record.status} · ${lines.length} SKU.`,
  });

  bumpPlatformCoreChainStatus([id]);
  return record;
}

export function computeOpenToSellForSku(sku: string): number | undefined {
  const cell = getMatrixInventoryForPlatform('aims360', sku)[0];
  return cell?.openToSell;
}
