import type { AtpProjection } from './available-to-promise';

export interface SupplyPlanningPolicy {
  readonly leadTimeDays: number;
  readonly reviewPeriodDays?: number;
  readonly safetyStock: number;
  readonly targetCoverDays?: number;
  readonly minimumOrderQuantity?: number;
  readonly orderMultiple?: number;
  readonly maximumOrderQuantity?: number;
}

export interface DemandRate {
  readonly averageDailyDemand: number;
  readonly demandStandardDeviation?: number;
}

export interface SupplyPlanningRequest {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly planningDate: string;
  readonly policy: SupplyPlanningPolicy;
  readonly demandRate: DemandRate;
  readonly atp: AtpProjection;
}

export interface SupplyPlanRecommendation {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly planningDate: string;
  readonly reorderPoint: number;
  readonly projectedPositionAtReceipt: number;
  readonly netRequirement: number;
  readonly recommendedOrderQuantity: number;
  readonly orderByDate?: string;
  readonly expectedReceiptDate?: string;
  readonly shortageDate?: string;
  readonly urgency: 'none' | 'planned' | 'urgent' | 'overdue';
  readonly reasons: readonly string[];
}

function assertNonNegativeNumber(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite non-negative number.`);
  }
}

function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }
}

function parseDate(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp);
}

function addUtcDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function subtractUtcDays(date: Date, days: number): Date {
  return addUtcDays(date, -days);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function roundUpToMultiple(quantity: number, multiple: number): number {
  if (quantity <= 0) {
    return 0;
  }
  return Math.ceil(quantity / multiple) * multiple;
}

function constrainOrderQuantity(
  requirement: number,
  policy: SupplyPlanningPolicy,
): number {
  if (requirement <= 0) {
    return 0;
  }

  const minimumOrderQuantity = policy.minimumOrderQuantity ?? 1;
  const orderMultiple = policy.orderMultiple ?? 1;
  let quantity = Math.max(requirement, minimumOrderQuantity);
  quantity = roundUpToMultiple(quantity, orderMultiple);

  if (policy.maximumOrderQuantity !== undefined) {
    quantity = Math.min(quantity, policy.maximumOrderQuantity);
  }

  return Math.ceil(quantity);
}

function availableAtOrBefore(atp: AtpProjection, date: string): number {
  let available = atp.currentAvailable;
  for (const bucket of atp.buckets) {
    if (bucket.date > date) {
      break;
    }
    available = bucket.availableToPromise + bucket.safetyStock;
  }
  return available;
}

export function createSupplyPlanRecommendation(
  request: SupplyPlanningRequest,
): SupplyPlanRecommendation {
  if (!request.id.trim()) {
    throw new Error('Supply planning request id is required.');
  }

  if (
    request.organizationId !== request.atp.organizationId ||
    request.warehouseId !== request.atp.warehouseId ||
    request.skuId !== request.atp.skuId
  ) {
    throw new Error('Supply planning request scope must match the ATP projection scope.');
  }

  const planningDate = parseDate(request.planningDate, 'Planning date');
  assertNonNegativeInteger(request.policy.leadTimeDays, 'Lead time days');
  assertNonNegativeInteger(request.policy.reviewPeriodDays ?? 0, 'Review period days');
  assertNonNegativeInteger(request.policy.safetyStock, 'Safety stock');
  assertNonNegativeNumber(request.demandRate.averageDailyDemand, 'Average daily demand');
  assertNonNegativeNumber(
    request.demandRate.demandStandardDeviation ?? 0,
    'Demand standard deviation',
  );

  if (request.policy.targetCoverDays !== undefined) {
    assertNonNegativeInteger(request.policy.targetCoverDays, 'Target cover days');
  }
  if (request.policy.minimumOrderQuantity !== undefined) {
    assertNonNegativeInteger(request.policy.minimumOrderQuantity, 'Minimum order quantity');
  }
  if (request.policy.orderMultiple !== undefined) {
    if (!Number.isInteger(request.policy.orderMultiple) || request.policy.orderMultiple <= 0) {
      throw new Error('Order multiple must be a positive integer.');
    }
  }
  if (request.policy.maximumOrderQuantity !== undefined) {
    if (
      !Number.isInteger(request.policy.maximumOrderQuantity) ||
      request.policy.maximumOrderQuantity <= 0
    ) {
      throw new Error('Maximum order quantity must be a positive integer.');
    }
  }

  const protectionPeriodDays =
    request.policy.leadTimeDays + (request.policy.reviewPeriodDays ?? 0);
  const reorderPoint = Math.ceil(
    request.demandRate.averageDailyDemand * protectionPeriodDays +
      request.policy.safetyStock,
  );

  const expectedReceiptDateObject = addUtcDays(
    planningDate,
    request.policy.leadTimeDays,
  );
  const expectedReceiptDate = isoDate(expectedReceiptDateObject);
  const projectedPositionAtReceipt = availableAtOrBefore(
    request.atp,
    expectedReceiptDate,
  );

  const targetCoverDays =
    request.policy.targetCoverDays ?? protectionPeriodDays;
  const targetStock = Math.ceil(
    request.demandRate.averageDailyDemand * targetCoverDays +
      request.policy.safetyStock,
  );
  const netRequirement = Math.max(0, targetStock - projectedPositionAtReceipt);
  const recommendedOrderQuantity = constrainOrderQuantity(
    netRequirement,
    request.policy,
  );

  const shortageDate = request.atp.firstShortageDate;
  let orderByDate: string | undefined;
  let urgency: SupplyPlanRecommendation['urgency'] = 'none';
  const reasons: string[] = [];

  if (shortageDate) {
    const shortageDateObject = parseDate(shortageDate, 'ATP shortage date');
    orderByDate = isoDate(
      subtractUtcDays(shortageDateObject, request.policy.leadTimeDays),
    );

    if (shortageDateObject.getTime() <= planningDate.getTime()) {
      urgency = 'overdue';
      reasons.push('ATP indicates an existing shortage.');
    } else if (Date.parse(orderByDate) <= planningDate.getTime()) {
      urgency = 'urgent';
      reasons.push('An order must be placed immediately to cover the projected shortage.');
    } else {
      urgency = 'planned';
      reasons.push('A future ATP shortage requires a planned replenishment order.');
    }
  } else if (projectedPositionAtReceipt < reorderPoint) {
    orderByDate = isoDate(planningDate);
    urgency = 'urgent';
    reasons.push('Projected inventory at receipt is below the reorder point.');
  }

  if (recommendedOrderQuantity > 0) {
    reasons.push(
      `Recommended quantity restores projected stock to the target coverage level of ${targetCoverDays} days.`,
    );
  } else {
    reasons.push('No replenishment is currently required under the active policy.');
  }

  if (
    request.policy.maximumOrderQuantity !== undefined &&
    recommendedOrderQuantity === request.policy.maximumOrderQuantity &&
    recommendedOrderQuantity < netRequirement
  ) {
    reasons.push('The recommendation is capped by the maximum order quantity.');
  }

  return Object.freeze({
    id: request.id,
    organizationId: request.organizationId,
    warehouseId: request.warehouseId,
    skuId: request.skuId,
    planningDate: isoDate(planningDate),
    reorderPoint,
    projectedPositionAtReceipt,
    netRequirement,
    recommendedOrderQuantity,
    orderByDate,
    expectedReceiptDate:
      recommendedOrderQuantity > 0 ? expectedReceiptDate : undefined,
    shortageDate,
    urgency,
    reasons: Object.freeze(reasons),
  });
}
