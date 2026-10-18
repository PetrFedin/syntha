import {
  calculateInventoryPosition,
  type InventoryMovement,
} from './inventory-ledger';

export const SUPPLY_EVENT_TYPES = [
  'purchase_order',
  'production_order',
  'transfer_in',
  'return_expected',
] as const;

export type SupplyEventType = (typeof SUPPLY_EVENT_TYPES)[number];

export const DEMAND_EVENT_TYPES = [
  'sales_order',
  'transfer_out',
  'forecast',
  'safety_stock',
] as const;

export type DemandEventType = (typeof DEMAND_EVENT_TYPES)[number];

export interface FutureSupplyEvent {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly type: SupplyEventType;
  readonly quantity: number;
  readonly expectedAt: string;
  readonly confidence?: number;
}

export interface FutureDemandEvent {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly type: DemandEventType;
  readonly quantity: number;
  readonly requiredAt: string;
  readonly priority?: number;
}

export interface AtpRequest {
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly asOf: string;
  readonly horizonEnd: string;
  readonly safetyStock?: number;
  readonly minimumSupplyConfidence?: number;
}

export interface AtpBucket {
  readonly date: string;
  readonly openingAvailable: number;
  readonly incomingSupply: number;
  readonly outgoingDemand: number;
  readonly safetyStock: number;
  readonly availableToPromise: number;
  readonly shortage: number;
}

export interface AtpProjection {
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly asOf: string;
  readonly horizonEnd: string;
  readonly currentOnHand: number;
  readonly currentCommitted: number;
  readonly currentAvailable: number;
  readonly firstShortageDate?: string;
  readonly minimumAtp: number;
  readonly buckets: readonly AtpBucket[];
}

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer.`);
  }
}

function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }
}

function parseDate(value: string, field: string): number {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return parsed;
}

function dateKey(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function matchesScope(
  event: {
    readonly organizationId: string;
    readonly warehouseId: string;
    readonly skuId: string;
  },
  request: AtpRequest,
): boolean {
  return (
    event.organizationId === request.organizationId &&
    event.warehouseId === request.warehouseId &&
    event.skuId === request.skuId
  );
}

export function calculateAvailableToPromise(
  request: AtpRequest,
  ledger: readonly InventoryMovement[],
  futureSupply: readonly FutureSupplyEvent[] = [],
  futureDemand: readonly FutureDemandEvent[] = [],
): AtpProjection {
  const asOfTimestamp = parseDate(request.asOf, 'ATP as-of date');
  const horizonTimestamp = parseDate(request.horizonEnd, 'ATP horizon end');

  if (horizonTimestamp < asOfTimestamp) {
    throw new Error('ATP horizon end must be on or after the as-of date.');
  }

  const safetyStock = request.safetyStock ?? 0;
  assertNonNegativeInteger(safetyStock, 'Safety stock');

  const minimumSupplyConfidence = request.minimumSupplyConfidence ?? 0;
  if (
    !Number.isFinite(minimumSupplyConfidence) ||
    minimumSupplyConfidence < 0 ||
    minimumSupplyConfidence > 1
  ) {
    throw new Error('Minimum supply confidence must be between 0 and 1.');
  }

  const currentLedger = ledger.filter(
    (movement) =>
      matchesScope(movement, request) &&
      parseDate(movement.occurredAt, 'Movement occurred at') <= asOfTimestamp,
  );
  const currentPosition = calculateInventoryPosition(currentLedger);

  const supplyByDate = new Map<string, number>();
  for (const event of futureSupply) {
    if (!matchesScope(event, request)) {
      continue;
    }
    assertPositiveInteger(event.quantity, 'Supply quantity');
    const timestamp = parseDate(event.expectedAt, 'Supply expected at');
    if (timestamp <= asOfTimestamp || timestamp > horizonTimestamp) {
      continue;
    }
    const confidence = event.confidence ?? 1;
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      throw new Error(`Supply event "${event.id}" confidence must be between 0 and 1.`);
    }
    if (confidence < minimumSupplyConfidence) {
      continue;
    }
    const key = dateKey(event.expectedAt);
    supplyByDate.set(key, (supplyByDate.get(key) ?? 0) + event.quantity);
  }

  const demandByDate = new Map<string, number>();
  for (const event of futureDemand) {
    if (!matchesScope(event, request)) {
      continue;
    }
    assertPositiveInteger(event.quantity, 'Demand quantity');
    const timestamp = parseDate(event.requiredAt, 'Demand required at');
    if (timestamp <= asOfTimestamp || timestamp > horizonTimestamp) {
      continue;
    }
    const key = dateKey(event.requiredAt);
    demandByDate.set(key, (demandByDate.get(key) ?? 0) + event.quantity);
  }

  const dates = Array.from(
    new Set([...supplyByDate.keys(), ...demandByDate.keys()]),
  ).sort();

  let runningAvailable = currentPosition.available;
  let firstShortageDate: string | undefined;
  let minimumAtp = runningAvailable - safetyStock;
  const buckets: AtpBucket[] = [];

  for (const date of dates) {
    const openingAvailable = runningAvailable;
    const incomingSupply = supplyByDate.get(date) ?? 0;
    const outgoingDemand = demandByDate.get(date) ?? 0;
    runningAvailable += incomingSupply - outgoingDemand;
    const availableToPromise = runningAvailable - safetyStock;
    const shortage = Math.max(0, -availableToPromise);

    if (shortage > 0 && !firstShortageDate) {
      firstShortageDate = date;
    }
    minimumAtp = Math.min(minimumAtp, availableToPromise);

    buckets.push(
      Object.freeze({
        date,
        openingAvailable,
        incomingSupply,
        outgoingDemand,
        safetyStock,
        availableToPromise,
        shortage,
      }),
    );
  }

  return Object.freeze({
    organizationId: request.organizationId,
    warehouseId: request.warehouseId,
    skuId: request.skuId,
    asOf: request.asOf,
    horizonEnd: request.horizonEnd,
    currentOnHand: currentPosition.onHand,
    currentCommitted: currentPosition.committed,
    currentAvailable: currentPosition.available,
    firstShortageDate,
    minimumAtp,
    buckets: Object.freeze(buckets),
  });
}
