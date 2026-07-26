export const INVENTORY_MOVEMENT_TYPES = [
  'receipt',
  'reservation',
  'release',
  'allocation',
  'deallocation',
  'shipment',
  'return',
  'transfer_in',
  'transfer_out',
  'adjustment',
  'write_off',
] as const;

export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPES)[number];

export interface InventoryMovement {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly type: InventoryMovementType;
  readonly quantity: number;
  readonly referenceType?: string;
  readonly referenceId?: string;
  readonly reason?: string;
  readonly occurredAt: string;
  readonly recordedAt: string;
  readonly actorId?: string;
}

export interface InventoryPosition {
  readonly onHand: number;
  readonly reserved: number;
  readonly allocated: number;
  readonly committed: number;
  readonly available: number;
}

const ON_HAND_EFFECT: Record<InventoryMovementType, number> = {
  receipt: 1,
  reservation: 0,
  release: 0,
  allocation: 0,
  deallocation: 0,
  shipment: -1,
  return: 1,
  transfer_in: 1,
  transfer_out: -1,
  adjustment: 1,
  write_off: -1,
};

const RESERVED_EFFECT: Record<InventoryMovementType, number> = {
  receipt: 0,
  reservation: 1,
  release: -1,
  allocation: 0,
  deallocation: 0,
  shipment: 0,
  return: 0,
  transfer_in: 0,
  transfer_out: 0,
  adjustment: 0,
  write_off: 0,
};

const ALLOCATED_EFFECT: Record<InventoryMovementType, number> = {
  receipt: 0,
  reservation: 0,
  release: 0,
  allocation: 1,
  deallocation: -1,
  shipment: -1,
  return: 0,
  transfer_in: 0,
  transfer_out: 0,
  adjustment: 0,
  write_off: 0,
};

export function assertInventoryQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Inventory movement quantity must be a positive integer.');
  }
}

function assertIsoDate(value: string, field: string): void {
  if (!value.trim() || Number.isNaN(Date.parse(value))) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
}

export function createInventoryMovement(
  movement: InventoryMovement,
): InventoryMovement {
  assertInventoryQuantity(movement.quantity);

  if (!movement.id.trim()) {
    throw new Error('Inventory movement id is required.');
  }

  if (!movement.organizationId.trim()) {
    throw new Error('Organization id is required.');
  }

  if (!movement.warehouseId.trim()) {
    throw new Error('Warehouse id is required.');
  }

  if (!movement.skuId.trim()) {
    throw new Error('SKU id is required.');
  }

  assertIsoDate(movement.occurredAt, 'Occurred at');
  assertIsoDate(movement.recordedAt, 'Recorded at');

  return Object.freeze({ ...movement });
}

export function calculateInventoryPosition(
  movements: readonly InventoryMovement[],
): InventoryPosition {
  let onHand = 0;
  let reserved = 0;
  let allocated = 0;

  for (const movement of movements) {
    assertInventoryQuantity(movement.quantity);
    onHand += movement.quantity * ON_HAND_EFFECT[movement.type];
    reserved += movement.quantity * RESERVED_EFFECT[movement.type];
    allocated += movement.quantity * ALLOCATED_EFFECT[movement.type];

    if (onHand < 0) {
      throw new Error(`Inventory on hand cannot become negative after movement "${movement.id}".`);
    }

    if (reserved < 0) {
      throw new Error(`Reserved inventory cannot become negative after movement "${movement.id}".`);
    }

    if (allocated < 0) {
      throw new Error(`Allocated inventory cannot become negative after movement "${movement.id}".`);
    }

    if (reserved + allocated > onHand) {
      throw new Error(`Committed inventory exceeds on-hand inventory after movement "${movement.id}".`);
    }
  }

  const committed = reserved + allocated;

  return Object.freeze({
    onHand,
    reserved,
    allocated,
    committed,
    available: onHand - committed,
  });
}

export function filterInventoryLedger(
  movements: readonly InventoryMovement[],
  criteria: {
    readonly organizationId: string;
    readonly warehouseId: string;
    readonly skuId: string;
  },
): readonly InventoryMovement[] {
  return movements.filter(
    (movement) =>
      movement.organizationId === criteria.organizationId &&
      movement.warehouseId === criteria.warehouseId &&
      movement.skuId === criteria.skuId,
  );
}
