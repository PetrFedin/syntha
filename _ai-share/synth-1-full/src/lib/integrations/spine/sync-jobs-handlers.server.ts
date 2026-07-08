/**
 * Real sync-job handlers — upstream fetch, spine import, tracking pull (ADR-002).
 */
import 'server-only';

import { getJoorConfigFromEnv } from '@/lib/b2b/integrations/archive/joor-api';
import { joorFetchOrders } from '@/lib/b2b/integrations/archive/joor-orders';
import { getNuOrderConfigFromEnv } from '@/lib/b2b/integrations/archive/nuorder-client';
import { nuorderFetchOrders } from '@/lib/b2b/integrations/archive/nuorder-orders';
import { toSpineImportOrderPayloadList } from './spine-import-payload.utils';
import { importWholesaleOrdersBatch } from './order-import.service';
import { isWholesaleImportPlatform, type IntegrationPlatform } from './integration-platform';
import {
  getImportedOrderRecord,
  listImportedOrdersAsB2B,
  listImportedOrdersForPlatform,
} from './imported-orders-persistence.file';
import { autoPullInboundShipmentTracking } from './spine-auto-inbound-tracking.service';
import { importVendorPoForHandoff } from './apparel-magic-vendor-po.service';
import { getVendorPoByOrderId, listVendorPoRecords } from './vendor-po-persistence.file';
import { listCentricRfqRecords } from './centric-rfq-persistence.file';
import { syncAims360Allocation } from './aims360-allocation.service';
import { syncAims360Wip } from './order-tracking.service';
import { listOrderTrackingShipments } from './order-tracking-persistence.file';
import { listAllocationQueue } from './allocation-queue-persistence.file';
import { listProductionWipRecords } from './production-wip-persistence.file';
import {
  ensureSpineOperationalStoreReady,
  SPINE_ALLOCATION_SCOPES,
  SPINE_HUB_MINIMAL_SCOPES,
  SPINE_PROCUREMENT_SCOPES,
  SPINE_WIP_WRITE_SCOPES,
} from './spine-operational-store';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import type { IntegrationSyncJob } from './sync-jobs-persistence.file';
import type { SyncJobDispatchOutcome } from './sync-jobs-worker.service';

function wholesaleOrderIdsForPlatform(platform: string): string[] {
  const plat = platform.trim().toLowerCase();
  const fromMirror = listImportedOrdersForPlatform(plat)
    .map((row) => String(row.wholesaleOrderId ?? '').trim())
    .filter(Boolean);
  if (fromMirror.length > 0) return fromMirror;

  const prefix = `int-${plat}`;
  return listImportedOrdersAsB2B()
    .map((o) => o.order)
    .filter((id) => id.toLowerCase().includes(prefix));
}

async function runOrdersImportJob(platform: string): Promise<SyncJobDispatchOutcome> {
  const plat = platform.trim().toLowerCase();

  if (plat === 'joor') {
    const config = getJoorConfigFromEnv();
    if (config?.accessToken) {
      try {
        const upstream = await joorFetchOrders(config, { limit: 20 });
        if (upstream.length === 0) return { resultCount: 0 };
        const payloads = toSpineImportOrderPayloadList(
          upstream.map((o) => ({
            id: o.id,
            ...(o.raw ? (o.raw as Record<string, unknown>) : {}),
          }))
        );
        const results = importWholesaleOrdersBatch({ platform: 'joor', orders: payloads });
        const created = results.filter((r) => r.created).length;
        const touched = results.filter((r) => r.wholesaleOrderId).length;
        return { resultCount: created > 0 ? created : touched };
      } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
      }
    }
  }

  if (plat === 'nuorder') {
    const config = getNuOrderConfigFromEnv();
    if (config?.oauthToken) {
      try {
        const upstream = await nuorderFetchOrders(config, { limit: 20 });
        if (upstream.length > 0) {
          const payloads = toSpineImportOrderPayloadList(
            upstream.map((o) => ({
              id: o.id,
              ...(o.raw ? (o.raw as Record<string, unknown>) : {}),
            }))
          );
          const results = importWholesaleOrdersBatch({ platform: 'nuorder', orders: payloads });
          const created = results.filter((r) => r.created).length;
          const touched = results.filter((r) => r.wholesaleOrderId).length;
          return { resultCount: created > 0 ? created : touched };
        }
      } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
      }
    }
  }

  if (!isWholesaleImportPlatform(plat as IntegrationPlatform)) {
    return { resultCount: 0 };
  }

  const mirror = listImportedOrdersForPlatform(plat);
  if (mirror.length === 0) {
    if (plat === 'joor' && !getJoorConfigFromEnv()) {
      return { error: 'JOOR: канал не настроен' };
    }
    if (plat === 'nuorder' && !getNuOrderConfigFromEnv()) {
      return { error: 'NuOrder: канал не настроен' };
    }
    return { resultCount: 0 };
  }

  const results = importWholesaleOrdersBatch({
    platform: plat as IntegrationPlatform,
    orders: mirror,
  });
  return { resultCount: results.filter((r) => r.wholesaleOrderId).length };
}

async function runTrackingSyncJob(platform: string): Promise<SyncJobDispatchOutcome> {
  await ensureSpineOperationalStoreReady([...SPINE_HUB_MINIMAL_SCOPES, 'tracking']);
  const plat = platform.trim().toLowerCase();
  const ids =
    plat === 'syntha'
      ? listImportedOrdersAsB2B().map((o) => o.order)
      : wholesaleOrderIdsForPlatform(plat);

  if (ids.length === 0) {
    return {
      resultCount: listOrderTrackingShipments().filter(
        (s) => s.platform === plat || plat === 'syntha'
      ).length,
    };
  }

  let pulled = 0;
  for (const wholesaleOrderId of ids.slice(0, 15)) {
    const result = await autoPullInboundShipmentTracking({
      wholesaleOrderId,
      trigger: 'manual',
    });
    if (result.pulled) pulled += 1;
  }
  return { resultCount: pulled };
}

async function runVendorPoImportJob(): Promise<SyncJobDispatchOutcome> {
  await ensureSpineOperationalStoreReady(SPINE_PROCUREMENT_SCOPES);
  const candidates = listImportedOrdersAsB2B()
    .map((o) => o.order)
    .slice(0, 20);
  let imported = 0;

  for (const b2bOrderId of candidates) {
    if (getVendorPoByOrderId(b2bOrderId)) continue;
    if (!getImportedOrderRecord(b2bOrderId)) continue;
    const productionOrderId =
      PLATFORM_CORE_DEMO.productionOrderId ??
      `PO-${b2bOrderId.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}`;
    const record = await importVendorPoForHandoff(b2bOrderId, productionOrderId);
    if (record) imported += 1;
  }

  return { resultCount: imported };
}

async function runAllocationSyncJob(): Promise<SyncJobDispatchOutcome> {
  await ensureSpineOperationalStoreReady(SPINE_ALLOCATION_SCOPES);
  const targets = wholesaleOrderIdsForPlatform('aims360');
  const orderIds =
    targets.length > 0
      ? targets.slice(0, 5)
      : listImportedOrdersAsB2B()
          .map((o) => o.order)
          .slice(0, 5);

  let synced = 0;
  for (const wholesaleOrderId of orderIds) {
    try {
      await syncAims360Allocation({ wholesaleOrderId });
      synced += 1;
    } catch {
      /* skip single order */
    }
  }
  return { resultCount: synced || listAllocationQueue(100).length };
}

async function runWipSyncJob(): Promise<SyncJobDispatchOutcome> {
  await ensureSpineOperationalStoreReady(SPINE_WIP_WRITE_SCOPES);
  let synced = 0;
  for (const b2bOrderId of listImportedOrdersAsB2B()
    .map((o) => o.order)
    .slice(0, 5)) {
    const productionOrderId =
      PLATFORM_CORE_DEMO.productionOrderId ??
      `PO-${b2bOrderId.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}`;
    try {
      syncAims360Wip({ productionOrderId, b2bOrderId, poStage: 'cutting' });
      synced += 1;
    } catch {
      /* skip */
    }
  }
  return { resultCount: synced || listProductionWipRecords().length };
}

export async function dispatchSyncJobKindAsync(
  job: IntegrationSyncJob
): Promise<SyncJobDispatchOutcome> {
  try {
    switch (job.kind) {
      case 'orders_import':
        return runOrdersImportJob(job.platform);
      case 'tracking_sync':
        return runTrackingSyncJob(job.platform);
      case 'vendor_po_import':
        return runVendorPoImportJob();
      case 'vendor_po_ack':
        return {
          resultCount: listVendorPoRecords().filter((v) => v.status === 'acknowledged').length,
        };
      case 'rfq_ack':
        return {
          resultCount: listCentricRfqRecords().filter((r) => r.status !== 'open').length,
        };
      case 'allocation_sync':
        return runAllocationSyncJob();
      case 'wip_sync':
        return runWipSyncJob();
      default:
        return { resultCount: 0 };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
