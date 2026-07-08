import {
  getOperationalLineItemsForOrderAsync,
  getSnapshotLineItemsForOrder,
  listB2BOrdersForOperationalUiServerAsync,
} from '@/lib/order/b2b-orders-list-read-model.server';
import type { B2BOrder } from '@/lib/types';
import type { PlatformRole } from '@/lib/rbac';
import { initialOrderItems, mockOrderDetailJoors } from '@/lib/order-data';
import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';
import {
  toOperationalOrderDetailDto,
  toOperationalOrderListRowDto,
} from '@/lib/order/operational-order-dto';
import { getOperationalNotesRecord } from '@/lib/order/b2b-operational-notes-persistence.file';
import { getOperationalStatusRecord } from '@/lib/order/b2b-operational-status-persistence.file';
import { getIntegrationMetaForOperationalUi } from '@/lib/integrations/spine/integration-meta-read.server';
import { getImportedLineItemsForOperationalUi } from '@/lib/integrations/spine/imported-orders-read.server';
import { resolveSpineImportedOperationalOrderAsync } from '@/lib/integrations/spine/operational-order-resolve.server';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';

const ACTOR_HEADER = 'x-syntha-api-actor-role';

/** Роль из `x-syntha-api-actor-role` (Playwright / e2e `b2b-v1-api-headers`). */
export function getOperationalApiActorRole(req: Request): PlatformRole | undefined {
  const raw = req.headers.get(ACTOR_HEADER)?.trim().toLowerCase();
  if (raw === 'brand') return 'brand';
  if (raw === 'shop' || raw === 'retailer' || raw === 'buyer') return 'retailer';
  return undefined;
}

function actorRoleFromHeader(req: Request): PlatformRole | undefined {
  return getOperationalApiActorRole(req);
}

/** Список заказов с учётом optional tenant header (см. e2e `b2b-v1-api-headers`). */
export async function operationalOrdersForRequest(req: Request): Promise<B2BOrder[]> {
  const role = actorRoleFromHeader(req);
  if (role) return listB2BOrdersForOperationalUiServerAsync({ actorRole: role });
  return listB2BOrdersForOperationalUiServerAsync();
}

export async function findOperationalOrderForRequest(
  req: Request,
  orderId: string
): Promise<B2BOrder | null> {
  if (isIntegrationImportedWholesaleOrderId(orderId)) {
    return resolveSpineImportedOperationalOrderAsync(orderId);
  }
  const rows = await operationalOrdersForRequest(req);
  return rows.find((o) => o.order === orderId) ?? null;
}

/** Демо-линии для detail DTO (совпадают с экраном карточки заказа в demo). */
export function demoOperationalDetailLineItems(): B2BOrderLineItem[] {
  return initialOrderItems.map((p) => ({
    productId: p.id,
    size: 'M',
    quantity: p.orderedQuantity,
    price: p.price,
    currency: 'RUB',
  }));
}

/** Подмешивает статус из `b2b-operational-status.json` (PATCH брендом). */
async function applyOperationalOverlaysAsync<
  T extends { wholesaleOrderId: string; status: string; integration?: unknown },
>(dto: T): Promise<T> {
  let next = dto;
  const statusRec = getOperationalStatusRecord(dto.wholesaleOrderId);
  if (statusRec) next = { ...next, status: statusRec.status };
  const integration = await getIntegrationMetaForOperationalUi(dto.wholesaleOrderId);
  if (integration) next = { ...next, integration };
  return next;
}

export async function toV1DetailDto(order: B2BOrder) {
  const saved = getOperationalNotesRecord(order.order);
  const orderNotes = saved !== undefined ? saved.note : mockOrderDetailJoors.orderNotes;
  const internalNotes = saved?.internalNote;
  const lineItems =
    (await getImportedLineItemsForOperationalUi(order.order)) ??
    (await getOperationalLineItemsForOrderAsync(order.order)) ??
    getSnapshotLineItemsForOrder(order.order) ??
    demoOperationalDetailLineItems();
  return applyOperationalOverlaysAsync(
    toOperationalOrderDetailDto(order, lineItems, orderNotes, internalNotes)
  );
}

export async function toV1ListDto(orders: B2BOrder[]) {
  return Promise.all(
    orders.map(async (o) => applyOperationalOverlaysAsync(toOperationalOrderListRowDto(o)))
  );
}
