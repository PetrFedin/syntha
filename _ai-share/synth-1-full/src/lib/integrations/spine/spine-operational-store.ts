/**
 * PG → file hydrate for spine operational stores (ADR-002).
 * Scoped hydrate: hub/pillar paths load only imported_orders + allocation (~2 PG queries).
 */
import 'server-only';

import { upsertImportedOrder as upsertImportedOrderFile } from './imported-orders-persistence.file';
import { listSpineImportedOrdersFromPg } from './imported-orders-persistence.pg';
import { upsertIntegrationMetaForOrder } from './integration-meta-persistence.file';
import { upsertDeliveryWindow } from './delivery-window-persistence.file';
import { upsertOrderTracking } from './order-tracking-persistence.file';
import { replaceAllocationQueueSnapshot } from './allocation-queue-persistence.file';
import { replaceWorkingOrderVersionsSnapshot } from './working-order-persistence.file';
import { replaceProductionWipSnapshot } from './production-wip-persistence.file';
import { replaceWholesaleExportSnapshot } from './wholesale-export.service';
import { replaceSyncJobsSnapshot } from './sync-jobs-persistence.file';
import { replaceExternalRefsSnapshot } from './integration-external-refs-persistence.file';
import { replaceVendorPoSnapshot } from './vendor-po-persistence.file';
import { replaceCentricRfqSnapshot } from './centric-rfq-persistence.file';
import {
  isSpineOperationalPgEnabled,
  listAllocationFromPg,
  listDeliveryWindowsFromPg,
  listExternalRefsFromPg,
  listIntegrationMetaFromPg,
  listOrderTrackingFromPg,
  listProductionWipFromPg,
  listSyncJobsFromPg,
  listWholesaleExportFromPg,
  listWorkingOrderVersionsFromPg,
  listVendorPoFromPg,
  listCentricRfqFromPg,
} from './spine-operational-persistence.pg';
import {
  countAllocationQueueInFile,
  countExternalRefsInFile,
  countImportedOrdersInFile,
  countIntegrationMetaInFile,
  countSyncJobsInFile,
  countVendorPoInFile,
  countCentricRfqInFile,
  countProductionWipInFile,
  isSpineOperationalPgPrimary,
  shouldApplyPgSnapshot,
} from './spine-pg-hydrate-guards';

export type SpineOperationalScope =
  | 'imported_orders'
  | 'meta'
  | 'delivery'
  | 'tracking'
  | 'allocation'
  | 'working_orders'
  | 'wip'
  | 'export'
  | 'sync_jobs'
  | 'external_refs'
  | 'vendor_po'
  | 'centric_rfq';

export const SPINE_OPERATIONAL_ALL_SCOPES: SpineOperationalScope[] = [
  'imported_orders',
  'meta',
  'delivery',
  'tracking',
  'allocation',
  'working_orders',
  'wip',
  'export',
  'sync_jobs',
  'external_refs',
  'vendor_po',
  'centric_rfq',
];

/** Hub + pillar snapshot: order resolution without full spine PG sweep. */
export const SPINE_HUB_MINIMAL_SCOPES: SpineOperationalScope[] = ['imported_orders', 'allocation'];

/** Procurement / materials: vendor PO + Centric RFQ mirror (migration 029). */
export const SPINE_PROCUREMENT_SCOPES: SpineOperationalScope[] = [
  'imported_orders',
  'vendor_po',
  'centric_rfq',
];

/** Allocation queue read/write (post-confirm). */
export const SPINE_ALLOCATION_SCOPES: SpineOperationalScope[] = ['imported_orders', 'allocation'];

/** WIP + shipment tracking read-model. */
export const SPINE_TRACKING_READ_SCOPES: SpineOperationalScope[] = [
  'imported_orders',
  'tracking',
  'wip',
  'delivery',
];

/** Delivery window only. */
export const SPINE_DELIVERY_SCOPES: SpineOperationalScope[] = ['imported_orders', 'delivery'];

/** Working order + export read. */
export const SPINE_WORKING_ORDER_READ_SCOPES: SpineOperationalScope[] = [
  'imported_orders',
  'working_orders',
  'export',
];

/** WIP sync + optional tracking pull on shipped. */
export const SPINE_WIP_WRITE_SCOPES: SpineOperationalScope[] = [
  'imported_orders',
  'wip',
  'tracking',
];

/** Inbound shipment webhook. */
export const SPINE_SHIPMENT_WEBHOOK_SCOPES: SpineOperationalScope[] = [
  'imported_orders',
  'tracking',
];

const hydratedScopes = new Set<SpineOperationalScope>();
const hydratePromises = new Map<string, Promise<void>>();

function scopeKey(scopes: SpineOperationalScope[]): string {
  return scopes.slice().sort().join(',');
}

/** PG → file for requested scopes only (default: all). */
export async function ensureSpineOperationalStoreReady(
  scopes: SpineOperationalScope[] | 'all' = 'all'
): Promise<void> {
  if (!isSpineOperationalPgEnabled()) return;

  const target =
    scopes === 'all'
      ? SPINE_OPERATIONAL_ALL_SCOPES.filter((s) => !hydratedScopes.has(s))
      : scopes.filter((s) => !hydratedScopes.has(s));

  if (target.length === 0) return;

  const key = scopeKey(target);
  let promise = hydratePromises.get(key);
  if (!promise) {
    promise = hydrateScopesFromPg(target).finally(() => {
      hydratePromises.delete(key);
    });
    hydratePromises.set(key, promise);
  }
  await promise;
}

async function hydrateScopesFromPg(scopes: SpineOperationalScope[]): Promise<void> {
  const needs = new Set(scopes);
  const fetches: Array<Promise<void>> = [];

  if (needs.has('imported_orders')) {
    fetches.push(
      listSpineImportedOrdersFromPg().then((orders) => {
        if (!isSpineOperationalPgPrimary()) {
          if (shouldApplyPgSnapshot(orders.length, countImportedOrdersInFile())) {
            for (const { record, externalKey } of orders) {
              upsertImportedOrderFile(record, externalKey);
            }
          }
        }
        hydratedScopes.add('imported_orders');
      })
    );
  }

  if (needs.has('meta')) {
    fetches.push(
      listIntegrationMetaFromPg().then((metaRows) => {
        if (shouldApplyPgSnapshot(metaRows.length, countIntegrationMetaInFile())) {
          for (const { wholesaleOrderId, meta } of metaRows) {
            upsertIntegrationMetaForOrder(wholesaleOrderId, meta);
          }
        }
        hydratedScopes.add('meta');
      })
    );
  }

  if (needs.has('delivery')) {
    fetches.push(
      listDeliveryWindowsFromPg().then((deliveryRows) => {
        if (shouldApplyPgSnapshot(deliveryRows.length, 0)) {
          for (const record of deliveryRows) {
            upsertDeliveryWindow(record);
          }
        }
        hydratedScopes.add('delivery');
      })
    );
  }

  if (needs.has('tracking')) {
    fetches.push(
      listOrderTrackingFromPg().then((trackingRows) => {
        if (shouldApplyPgSnapshot(trackingRows.length, 0)) {
          for (const shipment of trackingRows) {
            upsertOrderTracking(shipment);
          }
        }
        hydratedScopes.add('tracking');
      })
    );
  }

  if (needs.has('allocation')) {
    fetches.push(
      listAllocationFromPg().then((allocation) => {
        const allocationPgCount = Object.keys(allocation.byOrderId).length;
        if (shouldApplyPgSnapshot(allocationPgCount, countAllocationQueueInFile())) {
          replaceAllocationQueueSnapshot({
            schemaVersion: 1,
            byOrderId: allocation.byOrderId,
            queueOrder: allocation.queueOrder,
          });
        }
        hydratedScopes.add('allocation');
      })
    );
  }

  if (needs.has('working_orders')) {
    fetches.push(
      listWorkingOrderVersionsFromPg().then((workingOrders) => {
        const woPgCount = Object.keys(workingOrders).length;
        if (shouldApplyPgSnapshot(woPgCount, 0)) {
          replaceWorkingOrderVersionsSnapshot(workingOrders);
        }
        hydratedScopes.add('working_orders');
      })
    );
  }

  if (needs.has('wip')) {
    fetches.push(
      listProductionWipFromPg().then((productionWip) => {
        const wipPgCount = Object.keys(productionWip.byProductionOrderId ?? {}).length;
        if (shouldApplyPgSnapshot(wipPgCount, countProductionWipInFile())) {
          replaceProductionWipSnapshot(productionWip);
        }
        hydratedScopes.add('wip');
      })
    );
  }

  if (needs.has('export')) {
    fetches.push(
      listWholesaleExportFromPg().then((wholesaleExports) => {
        const exportPgCount = Object.keys(wholesaleExports).length;
        if (shouldApplyPgSnapshot(exportPgCount, 0)) {
          replaceWholesaleExportSnapshot(wholesaleExports);
        }
        hydratedScopes.add('export');
      })
    );
  }

  if (needs.has('sync_jobs')) {
    fetches.push(
      listSyncJobsFromPg().then((syncJobs) => {
        if (shouldApplyPgSnapshot(syncJobs.length, countSyncJobsInFile())) {
          replaceSyncJobsSnapshot(syncJobs);
        }
        hydratedScopes.add('sync_jobs');
      })
    );
  }

  if (needs.has('external_refs')) {
    fetches.push(
      listExternalRefsFromPg().then((externalRefs) => {
        if (shouldApplyPgSnapshot(externalRefs.length, countExternalRefsInFile())) {
          replaceExternalRefsSnapshot(externalRefs);
        }
        hydratedScopes.add('external_refs');
      })
    );
  }

  if (needs.has('vendor_po')) {
    fetches.push(
      listVendorPoFromPg().then((vendorPos) => {
        if (shouldApplyPgSnapshot(vendorPos.length, countVendorPoInFile())) {
          replaceVendorPoSnapshot(vendorPos);
        }
        hydratedScopes.add('vendor_po');
      })
    );
  }

  if (needs.has('centric_rfq')) {
    fetches.push(
      listCentricRfqFromPg().then((centricRfqs) => {
        if (shouldApplyPgSnapshot(centricRfqs.length, countCentricRfqInFile())) {
          replaceCentricRfqSnapshot(centricRfqs);
        }
        hydratedScopes.add('centric_rfq');
      })
    );
  }

  await Promise.all(fetches);
}

/** Orders file only — for import/confirm/handoff hot paths. */
export async function ensureSpineImportedOrdersStoreReady(): Promise<void> {
  await ensureSpineOperationalStoreReady(['imported_orders']);
}

export { isSpineOperationalPgEnabled } from './spine-operational-persistence.pg';
