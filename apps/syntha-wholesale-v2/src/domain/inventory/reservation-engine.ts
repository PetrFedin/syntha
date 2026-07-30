import {
  calculateInventoryPosition,
  createInventoryMovement,
  type InventoryMovement,
} from './inventory-ledger';

export const RESERVATION_STATUSES = [
  'active',
  'partially_released',
  'released',
  'expired',
  'converted',
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const RESERVATION_PRIORITIES = [
  'low',
  'normal',
  'high',
  'critical',
] as const;

export type ReservationPriority = (typeof RESERVATION_PRIORITIES)[number];

export interface InventoryReservation {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly referenceType: string;
  readonly referenceId: string;
  readonly requestedQuantity: number;
  readonly reservedQuantity: number;
  readonly releasedQuantity: number;
  readonly status: ReservationStatus;
  readonly priority: ReservationPriority;
  readonly createdAt: string;
  readonly expiresAt?: string;
  readonly createdBy?: string;
}

export interface ReservationRequest {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly referenceType: string;
  readonly referenceId: string;
  readonly quantity: number;
  readonly priority?: ReservationPriority;
  readonly createdAt: string;
  readonly expiresAt?: string;
  readonly createdBy?: string;
  readonly allowPartial?: boolean;
}

export interface ReservationResult {
  readonly reservation: InventoryReservation;
  readonly movement: InventoryMovement;
  readonly unfulfilledQuantity: number;
}

function assertPositiveInteger(quantity: number, field: string): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`${field} must be a positive integer.`);
  }
}

function assertValidExpiration(createdAt: string, expiresAt?: string): void {
  if (!expiresAt) {
    return;
  }

  const created = Date.parse(createdAt);
  const expires = Date.parse(expiresAt);

  if (Number.isNaN(created) || Number.isNaN(expires)) {
    throw new Error('Reservation dates must be valid ISO date strings.');
  }

  if (expires <= created) {
    throw new Error('Reservation expiration must be after creation time.');
  }
}

export function createReservation(
  request: ReservationRequest,
  ledger: readonly InventoryMovement[],
): ReservationResult {
  assertPositiveInteger(request.quantity, 'Reservation quantity');
  assertValidExpiration(request.createdAt, request.expiresAt);

  const position = calculateInventoryPosition(ledger);
  const reservedQuantity = request.allowPartial
    ? Math.min(request.quantity, position.available)
    : request.quantity;

  if (!request.allowPartial && request.quantity > position.available) {
    throw new Error(
      `Insufficient available inventory: requested ${request.quantity}, available ${position.available}.`,
    );
  }

  if (reservedQuantity <= 0) {
    throw new Error('No inventory is available for reservation.');
  }

  const movement = createInventoryMovement({
    id: `${request.id}:reserve`,
    organizationId: request.organizationId,
    warehouseId: request.warehouseId,
    skuId: request.skuId,
    type: 'reservation',
    quantity: reservedQuantity,
    referenceType: request.referenceType,
    referenceId: request.referenceId,
    occurredAt: request.createdAt,
    recordedAt: request.createdAt,
    actorId: request.createdBy,
  });

  return Object.freeze({
    reservation: Object.freeze({
      id: request.id,
      organizationId: request.organizationId,
      warehouseId: request.warehouseId,
      skuId: request.skuId,
      referenceType: request.referenceType,
      referenceId: request.referenceId,
      requestedQuantity: request.quantity,
      reservedQuantity,
      releasedQuantity: 0,
      status: 'active',
      priority: request.priority ?? 'normal',
      createdAt: request.createdAt,
      expiresAt: request.expiresAt,
      createdBy: request.createdBy,
    }),
    movement,
    unfulfilledQuantity: request.quantity - reservedQuantity,
  });
}

export function releaseReservation(
  reservation: InventoryReservation,
  quantity: number,
  releasedAt: string,
  actorId?: string,
  reason?: string,
): {
  readonly reservation: InventoryReservation;
  readonly movement: InventoryMovement;
} {
  assertPositiveInteger(quantity, 'Release quantity');

  const remaining = reservation.reservedQuantity - reservation.releasedQuantity;

  if (reservation.status !== 'active' && reservation.status !== 'partially_released') {
    throw new Error(`Reservation "${reservation.id}" is not releasable from status "${reservation.status}".`);
  }

  if (quantity > remaining) {
    throw new Error(
      `Release quantity ${quantity} exceeds remaining reservation quantity ${remaining}.`,
    );
  }

  const releasedQuantity = reservation.releasedQuantity + quantity;
  const status: ReservationStatus =
    releasedQuantity === reservation.reservedQuantity ? 'released' : 'partially_released';

  return Object.freeze({
    reservation: Object.freeze({
      ...reservation,
      releasedQuantity,
      status,
    }),
    movement: createInventoryMovement({
      id: `${reservation.id}:release:${releasedQuantity}`,
      organizationId: reservation.organizationId,
      warehouseId: reservation.warehouseId,
      skuId: reservation.skuId,
      type: 'release',
      quantity,
      referenceType: reservation.referenceType,
      referenceId: reservation.referenceId,
      reason,
      occurredAt: releasedAt,
      recordedAt: releasedAt,
      actorId,
    }),
  });
}

export function expireReservation(
  reservation: InventoryReservation,
  expiredAt: string,
): {
  readonly reservation: InventoryReservation;
  readonly movement?: InventoryMovement;
} {
  if (!reservation.expiresAt) {
    throw new Error(`Reservation "${reservation.id}" has no expiration time.`);
  }

  if (Date.parse(expiredAt) < Date.parse(reservation.expiresAt)) {
    throw new Error(`Reservation "${reservation.id}" has not expired yet.`);
  }

  const remaining = reservation.reservedQuantity - reservation.releasedQuantity;

  if (remaining === 0) {
    return Object.freeze({
      reservation: Object.freeze({ ...reservation, status: 'expired' }),
    });
  }

  return Object.freeze({
    reservation: Object.freeze({
      ...reservation,
      releasedQuantity: reservation.reservedQuantity,
      status: 'expired',
    }),
    movement: createInventoryMovement({
      id: `${reservation.id}:expire`,
      organizationId: reservation.organizationId,
      warehouseId: reservation.warehouseId,
      skuId: reservation.skuId,
      type: 'release',
      quantity: remaining,
      referenceType: reservation.referenceType,
      referenceId: reservation.referenceId,
      reason: 'Reservation expired',
      occurredAt: expiredAt,
      recordedAt: expiredAt,
    }),
  });
}
