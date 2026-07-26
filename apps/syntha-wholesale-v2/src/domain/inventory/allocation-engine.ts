import {
  calculateInventoryPosition,
  createInventoryMovement,
  type InventoryMovement,
} from './inventory-ledger';

export const ALLOCATION_STRATEGIES = [
  'fewest_shipments',
  'lowest_cost',
  'highest_service_level',
  'fifo',
] as const;

export type AllocationStrategy = (typeof ALLOCATION_STRATEGIES)[number];

export interface AllocationSource {
  readonly warehouseId: string;
  readonly movements: readonly InventoryMovement[];
  readonly shippingCostMinor?: number;
  readonly serviceLevelScore?: number;
  readonly priority?: number;
}

export interface AllocationRequest {
  readonly id: string;
  readonly organizationId: string;
  readonly skuId: string;
  readonly quantity: number;
  readonly referenceType: string;
  readonly referenceId: string;
  readonly occurredAt: string;
  readonly strategy?: AllocationStrategy;
  readonly allowPartial?: boolean;
  readonly actorId?: string;
}

export interface AllocationLine {
  readonly warehouseId: string;
  readonly quantity: number;
  readonly shippingCostMinor: number;
  readonly serviceLevelScore: number;
  readonly movement: InventoryMovement;
}

export interface AllocationPlan {
  readonly id: string;
  readonly requestedQuantity: number;
  readonly allocatedQuantity: number;
  readonly unfulfilledQuantity: number;
  readonly strategy: AllocationStrategy;
  readonly lines: readonly AllocationLine[];
  readonly totalShippingCostMinor: number;
}

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer.`);
  }
}

function availableQuantity(source: AllocationSource): number {
  return calculateInventoryPosition(source.movements).available;
}

function compareSources(
  strategy: AllocationStrategy,
): (left: AllocationSource, right: AllocationSource) => number {
  switch (strategy) {
    case 'lowest_cost':
      return (left, right) =>
        (left.shippingCostMinor ?? 0) - (right.shippingCostMinor ?? 0) ||
        (right.priority ?? 0) - (left.priority ?? 0) ||
        right.movements.length - left.movements.length;
    case 'highest_service_level':
      return (left, right) =>
        (right.serviceLevelScore ?? 0) - (left.serviceLevelScore ?? 0) ||
        (right.priority ?? 0) - (left.priority ?? 0) ||
        (left.shippingCostMinor ?? 0) - (right.shippingCostMinor ?? 0);
    case 'fifo':
      return (left, right) => {
        const leftDate = left.movements[0]?.occurredAt ?? '';
        const rightDate = right.movements[0]?.occurredAt ?? '';
        return leftDate.localeCompare(rightDate);
      };
    case 'fewest_shipments':
    default:
      return (left, right) =>
        availableQuantity(right) - availableQuantity(left) ||
        (right.priority ?? 0) - (left.priority ?? 0) ||
        (left.shippingCostMinor ?? 0) - (right.shippingCostMinor ?? 0);
  }
}

export function createAllocationPlan(
  request: AllocationRequest,
  sources: readonly AllocationSource[],
): AllocationPlan {
  assertPositiveInteger(request.quantity, 'Allocation quantity');

  if (!request.id.trim()) {
    throw new Error('Allocation id is required.');
  }

  const strategy = request.strategy ?? 'fewest_shipments';
  const eligibleSources = sources
    .filter((source) => availableQuantity(source) > 0)
    .slice()
    .sort(compareSources(strategy));

  const totalAvailable = eligibleSources.reduce(
    (sum, source) => sum + availableQuantity(source),
    0,
  );

  if (!request.allowPartial && totalAvailable < request.quantity) {
    throw new Error(
      `Insufficient inventory for allocation: requested ${request.quantity}, available ${totalAvailable}.`,
    );
  }

  let remaining = Math.min(request.quantity, totalAvailable);
  const lines: AllocationLine[] = [];

  for (const source of eligibleSources) {
    if (remaining === 0) {
      break;
    }

    const quantity = Math.min(remaining, availableQuantity(source));
    const movement = createInventoryMovement({
      id: `${request.id}:allocate:${source.warehouseId}`,
      organizationId: request.organizationId,
      warehouseId: source.warehouseId,
      skuId: request.skuId,
      type: 'allocation',
      quantity,
      referenceType: request.referenceType,
      referenceId: request.referenceId,
      occurredAt: request.occurredAt,
      recordedAt: request.occurredAt,
      actorId: request.actorId,
    });

    lines.push(
      Object.freeze({
        warehouseId: source.warehouseId,
        quantity,
        shippingCostMinor: source.shippingCostMinor ?? 0,
        serviceLevelScore: source.serviceLevelScore ?? 0,
        movement,
      }),
    );

    remaining -= quantity;
  }

  const allocatedQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  if (allocatedQuantity === 0) {
    throw new Error('No inventory is available for allocation.');
  }

  return Object.freeze({
    id: request.id,
    requestedQuantity: request.quantity,
    allocatedQuantity,
    unfulfilledQuantity: request.quantity - allocatedQuantity,
    strategy,
    lines: Object.freeze(lines),
    totalShippingCostMinor: lines.reduce(
      (sum, line) => sum + line.shippingCostMinor,
      0,
    ),
  });
}

export function deallocatePlan(
  plan: AllocationPlan,
  occurredAt: string,
  actorId?: string,
  reason?: string,
): readonly InventoryMovement[] {
  return Object.freeze(
    plan.lines.map((line) =>
      createInventoryMovement({
        id: `${plan.id}:deallocate:${line.warehouseId}`,
        organizationId: line.movement.organizationId,
        warehouseId: line.warehouseId,
        skuId: line.movement.skuId,
        type: 'deallocation',
        quantity: line.quantity,
        referenceType: line.movement.referenceType,
        referenceId: line.movement.referenceId,
        occurredAt,
        recordedAt: occurredAt,
        actorId,
        reason,
      }),
    ),
  );
}
