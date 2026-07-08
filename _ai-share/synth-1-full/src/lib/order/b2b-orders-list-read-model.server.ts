/**
 * Серверный read-model operational B2B: база из снимка `data/b2b-orders.snapshot.json`
 * (или `B2B_ORDERS_SNAPSHOT_FILE`), затем тот же оверлей оплат, что и в UI-сиде.
 *
 * Клиентский fallback (`b2b-orders-list-read-model.ts`) по-прежнему использует только сид —
 * пока страницы не переведены на fetch/API целиком.
 */
import 'server-only';

import { applyOrderPaymentsOverlay } from '@/lib/b2b/partner-finance-rollup';
import { mockB2BOrders } from '@/lib/order-data';
import { loadB2BOrderSnapshotOrNull } from '@/lib/order/b2b-order-persistence.file';
import { filterB2BOrdersByOperationalActor } from '@/lib/order/b2b-orders-read-model-shared';
import { listImportedOrdersAsB2B } from '@/lib/integrations/spine/imported-orders-persistence';
import { listImportedOrdersForOperationalUi } from '@/lib/integrations/spine/imported-orders-read.server';
import {
  mergeOperationalOrderLists,
  stripSpineImportedFromSnapshot,
} from '@/lib/integrations/spine/spine-operational-merge';
import {
  mapWorkshop2B2bOrderLinesToOperational,
  mergeOperationalB2bOrderLists,
} from '@/lib/order/workshop2-b2b-order-operational-mapper';
import {
  getWorkshop2B2bOrder,
  listWorkshop2B2bOrdersAll,
} from '@/lib/server/workshop2-b2b-orders-repository';
import { isPlatformCoreSpinePgPrimary } from '@/lib/server/platform-core-spine-pg.server';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';
import type { B2BOrder } from '@/lib/types';
import type { PlatformRole } from '@/lib/rbac';

export function getB2BOrdersBaseForOperationalApi(): B2BOrder[] {
  if (isPlatformCoreSpinePgPrimary()) return [];
  const snap = loadB2BOrderSnapshotOrNull();
  if (snap?.orders?.length) return snap.orders;
  return mockB2BOrders;
}

function mergeImportedOrders(base: B2BOrder[]): B2BOrder[] {
  const nativeOnly = stripSpineImportedFromSnapshot(base);
  return mergeOperationalOrderLists(nativeOnly, listImportedOrdersAsB2B());
}

export function listB2BOrdersForOperationalUiServer(options?: {
  actorRole?: PlatformRole | null;
  actorId?: string;
}): B2BOrder[] {
  const base = mergeImportedOrders(getB2BOrdersBaseForOperationalApi());
  const withPayment = applyOrderPaymentsOverlay(base);
  return filterB2BOrdersByOperationalActor(withPayment, options);
}

/** PG-primary: INT-* из PG, native W2 из workshop2_b2b_orders; snapshot/mock — только без pg-primary. */
export async function listB2BOrdersForOperationalUiServerAsync(options?: {
  actorRole?: PlatformRole | null;
  actorId?: string;
}): Promise<B2BOrder[]> {
  const pgPrimary = isPlatformCoreSpinePgPrimary();
  const snapshotBase = pgPrimary
    ? []
    : stripSpineImportedFromSnapshot(getB2BOrdersBaseForOperationalApi());
  const imported = await listImportedOrdersForOperationalUi();

  let nativeMerged = snapshotBase;
  if (isWorkshop2PostgresEnabled()) {
    const pgNative = await listWorkshop2B2bOrdersAll();
    nativeMerged = pgPrimary
      ? mergeOperationalB2bOrderLists([], pgNative)
      : mergeOperationalB2bOrderLists(snapshotBase, pgNative);
  } else if (pgPrimary) {
    nativeMerged = [];
  }

  const base = mergeOperationalOrderLists(nativeMerged, imported);
  const withPayment = applyOrderPaymentsOverlay(base);
  return filterB2BOrdersByOperationalActor(withPayment, options);
}

/**
 * Строки заказа из снимка `lineItemsByOrderId` (ключ = `B2BOrder.order`).
 * Если в JSON нет блока или пустой массив — `undefined` (caller использует демо-линии).
 */
export function getSnapshotLineItemsForOrder(orderId: string): B2BOrderLineItem[] | undefined {
  const snap = loadB2BOrderSnapshotOrNull();
  const raw = snap?.lineItemsByOrderId?.[orderId];
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  return raw as B2BOrderLineItem[];
}

/** PG-native line items for operational detail (async). */
export async function getOperationalLineItemsForOrderAsync(
  orderId: string
): Promise<B2BOrderLineItem[] | undefined> {
  if (isWorkshop2PostgresEnabled()) {
    const order = await getWorkshop2B2bOrder(orderId);
    if (order?.lines?.length) {
      return mapWorkshop2B2bOrderLinesToOperational(order);
    }
  }
  if (isPlatformCoreSpinePgPrimary()) return undefined;
  return getSnapshotLineItemsForOrder(orderId);
}
