/**
 * Server-side spine order resolution (mirrors useSpineActiveWholesaleOrderId).
 */
import 'server-only';

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  normalizeSpineFallbackOrderId,
  pickPreferredHandoffQueueOrderId,
  pickPreferredRegistryOrderId,
  resolveActiveWholesaleOrderId,
} from '@/lib/platform-core-spine-active-order-fallback';
import { listWorkshop2FactoryProductionHandoffQueue } from '@/lib/server/workshop2-b2b-production-handoff';
import { listWorkshop2B2bOrdersForCollection } from '@/lib/server/workshop2-b2b-orders-repository';
import { listAllocationQueue } from './allocation-queue-persistence.file';
import { listImportedOrdersAsB2B } from './imported-orders-persistence.file';
import { isIntegrationImportedWholesaleOrderId } from './integration-ui-utils';
import {
  ensureSpineImportedOrdersStoreReady,
  ensureSpineOperationalStoreReady,
} from './spine-operational-store';

export type SpineActiveOrderResolveFrom = 'w2_registry' | 'allocation' | 'operational' | 'handoff';

export async function resolveSpineActiveWholesaleOrderIdServer(input: {
  fallbackOrderId: string;
  factoryId: string;
  collectionId?: string;
  resolveFrom: readonly SpineActiveOrderResolveFrom[];
}): Promise<string> {
  const w2Fallback = normalizeSpineFallbackOrderId(input.fallbackOrderId);
  const resolveFromIncludesRegistry = input.resolveFrom.includes('w2_registry');

  if (isPlatformCoreMode() && w2Fallback.startsWith('B2B-DEMO-') && !resolveFromIncludesRegistry) {
    return w2Fallback;
  }

  let registryQueriedEmpty = false;
  let spineWholesaleOrderId: string | null = null;

  const needsSpineStores = input.resolveFrom.some(
    (source) => source === 'allocation' || source === 'operational' || source === 'handoff'
  );
  if (needsSpineStores) {
    await ensureSpineImportedOrdersStoreReady();
    await ensureSpineOperationalStoreReady();
  }

  for (const source of input.resolveFrom) {
    if (source === 'w2_registry') {
      const collectionId = input.collectionId?.trim();
      if (!collectionId) continue;
      const orders = await listWorkshop2B2bOrdersForCollection(collectionId);
      registryQueriedEmpty = orders.length === 0;
      const hit = pickPreferredRegistryOrderId(orders);
      if (hit) {
        spineWholesaleOrderId = hit;
        break;
      }
      continue;
    }
    if (source === 'handoff' && input.factoryId.trim()) {
      const queue = await listWorkshop2FactoryProductionHandoffQueue({
        factoryId: input.factoryId,
      });
      const hit = pickPreferredHandoffQueueOrderId(queue.items);
      if (hit) {
        spineWholesaleOrderId = hit;
        break;
      }
    }
    if (source === 'allocation') {
      for (const row of listAllocationQueue(50)) {
        const id = row.wholesaleOrderId?.trim();
        if (id && isIntegrationImportedWholesaleOrderId(id)) {
          spineWholesaleOrderId = id;
          break;
        }
      }
      if (spineWholesaleOrderId) break;
    }
    if (source === 'operational') {
      const hit = listImportedOrdersAsB2B().find((order) =>
        isIntegrationImportedWholesaleOrderId(order.order?.trim() ?? '')
      );
      const id = hit?.order?.trim();
      if (id) {
        spineWholesaleOrderId = id;
        break;
      }
    }
  }

  return resolveActiveWholesaleOrderId({
    spineWholesaleOrderId,
    fallbackOrderId: w2Fallback,
    registryQueriedEmpty,
    resolveFromIncludesRegistry,
  });
}
