import type { OrganisationId } from '@/modules/organisations';
import type {
  Selection,
  SelectionId,
  SelectionItemId,
  ShowroomAccessGrantId,
} from '@/modules/selection';
import type { ShowroomId, ShowroomSnapshotId } from '@/modules/showroom';

export type OrderId = string & { readonly __brand: 'OrderId' };
export type OrderLineId = string & { readonly __brand: 'OrderLineId' };
export type SubmittedOrderSnapshotId = string & {
  readonly __brand: 'SubmittedOrderSnapshotId';
};
export type OrderStatus = 'DRAFT' | 'SUBMITTED' | 'CANCELLED';

export interface OrderSizeQuantity {
  readonly size: string;
  readonly quantity: number;
}

export interface OrderLineTotals {
  readonly grossMinor: number;
  readonly discountMinor: number;
  readonly netMinor: number;
  readonly taxMinor: number;
  readonly totalMinor: number;
}

export interface OrderLine {
  readonly id: OrderLineId;
  readonly selectionItemId: SelectionItemId;
  readonly productReference: string;
  readonly variantReference?: string;
  readonly sizeQuantities: readonly OrderSizeQuantity[];
  readonly totalQuantity: number;
  readonly unitPriceMinor: number;
  readonly discountBasisPoints: number;
  readonly taxBasisPoints: number;
  readonly totals: OrderLineTotals;
  readonly note: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OrderTotals {
  readonly quantity: number;
  readonly grossMinor: number;
  readonly discountMinor: number;
  readonly netMinor: number;
  readonly taxMinor: number;
  readonly totalMinor: number;
}

export interface CommercialOrder {
  readonly id: OrderId;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly selectionId: SelectionId;
  readonly showroomAccessGrantId: ShowroomAccessGrantId;
  readonly showroomId: ShowroomId;
  readonly showroomSnapshotId: ShowroomSnapshotId;
  readonly currency: string;
  readonly status: OrderStatus;
  readonly lines: readonly OrderLine[];
  readonly totals: OrderTotals;
  readonly ownerCredentialId: string;
  readonly submittedSnapshotId?: SubmittedOrderSnapshotId;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface SubmittedOrderSnapshot {
  readonly id: SubmittedOrderSnapshotId;
  readonly orderId: OrderId;
  readonly orderVersion: number;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly selectionId: SelectionId;
  readonly showroomAccessGrantId: ShowroomAccessGrantId;
  readonly showroomId: ShowroomId;
  readonly showroomSnapshotId: ShowroomSnapshotId;
  readonly currency: string;
  readonly lines: readonly OrderLine[];
  readonly totals: OrderTotals;
  readonly submittedByCredentialId: string;
  readonly submittedAt: string;
}

export class OrderDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new OrderDomainError(`${label} must not be empty`);
  return normalized;
}

function safeInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new OrderDomainError(`${label} must be a non-negative safe integer`);
  }
  return value;
}

function basisPoints(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new OrderDomainError(`${label} must be an integer from 0 through 10000`);
  }
  return value;
}

function toSafeNumber(value: bigint, label: string): number {
  if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new OrderDomainError(`${label} exceeds safe integer range`);
  }
  return Number(value);
}

function addSafe(values: readonly number[], label: string): number {
  return toSafeNumber(
    values.reduce((sum, value) => sum + BigInt(safeInteger(value, label)), 0n),
    label,
  );
}

function roundBasisPoints(amountMinor: number, points: number, label: string): number {
  const amount = BigInt(safeInteger(amountMinor, label));
  const normalizedPoints = BigInt(basisPoints(points, label));
  return toSafeNumber((amount * normalizedPoints + 5_000n) / 10_000n, label);
}

function normalizeSize(value: string): string {
  return requiredText(value, 'Order size').toUpperCase();
}

function freezeSizeQuantities(
  entries: readonly OrderSizeQuantity[],
): readonly OrderSizeQuantity[] {
  const seen = new Set<string>();
  return Object.freeze(
    entries.map((entry) => {
      const size = normalizeSize(entry.size);
      if (seen.has(size)) throw new OrderDomainError(`Duplicate order size: ${size}`);
      seen.add(size);
      return Object.freeze({
        size,
        quantity: safeInteger(entry.quantity, `Quantity for size ${size}`),
      });
    }),
  );
}

export function orderId(value: string): OrderId {
  return requiredText(value, 'Order id') as OrderId;
}

export function orderLineId(value: string): OrderLineId {
  return requiredText(value, 'Order line id') as OrderLineId;
}

export function submittedOrderSnapshotId(value: string): SubmittedOrderSnapshotId {
  return requiredText(value, 'Submitted order snapshot id') as SubmittedOrderSnapshotId;
}

export function calculateOrderLine(input: {
  readonly quantity: number;
  readonly unitPriceMinor: number;
  readonly discountBasisPoints: number;
  readonly taxBasisPoints: number;
}): OrderLineTotals {
  const quantity = safeInteger(input.quantity, 'Order line quantity');
  const unitPriceMinor = safeInteger(input.unitPriceMinor, 'Order line unit price');
  const discount = basisPoints(input.discountBasisPoints, 'Discount basis points');
  const tax = basisPoints(input.taxBasisPoints, 'Tax basis points');
  const grossMinor = toSafeNumber(
    BigInt(quantity) * BigInt(unitPriceMinor),
    'Order line gross',
  );
  const discountMinor = roundBasisPoints(grossMinor, discount, 'Order line discount');
  const netMinor = grossMinor - discountMinor;
  const taxMinor = roundBasisPoints(netMinor, tax, 'Order line tax');
  const totalMinor = addSafe([netMinor, taxMinor], 'Order line total');
  return Object.freeze({
    grossMinor,
    discountMinor,
    netMinor,
    taxMinor,
    totalMinor,
  });
}

export function calculateOrderTotals(lines: readonly OrderLine[]): OrderTotals {
  return Object.freeze({
    quantity: addSafe(lines.map((line) => line.totalQuantity), 'Order quantity'),
    grossMinor: addSafe(lines.map((line) => line.totals.grossMinor), 'Order gross'),
    discountMinor: addSafe(
      lines.map((line) => line.totals.discountMinor),
      'Order discount',
    ),
    netMinor: addSafe(lines.map((line) => line.totals.netMinor), 'Order net'),
    taxMinor: addSafe(lines.map((line) => line.totals.taxMinor), 'Order tax'),
    totalMinor: addSafe(lines.map((line) => line.totals.totalMinor), 'Order total'),
  });
}

function recalculateLine(
  line: Omit<OrderLine, 'totalQuantity' | 'totals'>,
): OrderLine {
  const totalQuantity = addSafe(
    line.sizeQuantities.map((entry) => entry.quantity),
    'Order line quantity',
  );
  return Object.freeze({
    ...line,
    totalQuantity,
    totals: calculateOrderLine({
      quantity: totalQuantity,
      unitPriceMinor: line.unitPriceMinor,
      discountBasisPoints: line.discountBasisPoints,
      taxBasisPoints: line.taxBasisPoints,
    }),
  });
}

function withLines(
  order: CommercialOrder,
  lines: readonly OrderLine[],
  now: Date,
): CommercialOrder {
  const frozen = Object.freeze([...lines]);
  return Object.freeze({
    ...order,
    lines: frozen,
    totals: calculateOrderTotals(frozen),
    updatedAt: now.toISOString(),
    version: order.version + 1,
  });
}

function assertDraft(order: CommercialOrder): void {
  if (order.status !== 'DRAFT') {
    throw new OrderDomainError('Only a Draft Order can be changed');
  }
}

export function createOrderDraft(input: {
  readonly id: string;
  readonly selection: Selection;
  readonly lineIds: readonly string[];
  readonly ownerCredentialId: string;
  readonly now: Date;
}): CommercialOrder {
  if (input.selection.status !== 'READY') {
    throw new OrderDomainError('Order Draft requires a READY Selection');
  }
  if (input.selection.items.length === 0) {
    throw new OrderDomainError('Order Draft requires at least one Selection item');
  }
  if (input.lineIds.length !== input.selection.items.length) {
    throw new OrderDomainError('Every Selection item requires one Order line id');
  }
  const timestamp = input.now.toISOString();
  const lines = input.selection.items.map((item, index) => {
    const sizeQuantities = freezeSizeQuantities(
      item.sizeCurve.length > 0
        ? item.sizeCurve
        : [{ size: 'UNSIZED', quantity: item.quantityIntent }],
    );
    return recalculateLine({
      id: orderLineId(input.lineIds[index] ?? ''),
      selectionItemId: item.id,
      productReference: requiredText(item.productReference, 'Product reference'),
      variantReference: item.variantReference,
      sizeQuantities,
      unitPriceMinor: 0,
      discountBasisPoints: 0,
      taxBasisPoints: 0,
      note: item.note.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
  const frozenLines = Object.freeze(lines);
  return Object.freeze({
    id: orderId(input.id),
    buyerOrganisationId: input.selection.buyerOrganisationId,
    sellerOrganisationId: input.selection.sellerOrganisationId,
    selectionId: input.selection.id,
    showroomAccessGrantId: input.selection.showroomAccessGrantId,
    showroomId: input.selection.showroomId,
    showroomSnapshotId: input.selection.showroomSnapshotId,
    currency: requiredText(input.selection.currency, 'Order currency').toUpperCase(),
    status: 'DRAFT' as const,
    lines: frozenLines,
    totals: calculateOrderTotals(frozenLines),
    ownerCredentialId: requiredText(input.ownerCredentialId, 'Order owner credential id'),
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  });
}

export function setOrderLineQuantity(
  order: CommercialOrder,
  input: {
    readonly lineId: OrderLineId;
    readonly size: string;
    readonly quantity: number;
    readonly now: Date;
  },
): CommercialOrder {
  assertDraft(order);
  const lineIndex = order.lines.findIndex((line) => line.id === input.lineId);
  if (lineIndex < 0) throw new OrderDomainError('Order line not found');
  const line = order.lines[lineIndex];
  const size = normalizeSize(input.size);
  const sizeIndex = line.sizeQuantities.findIndex((entry) => entry.size === size);
  if (sizeIndex < 0) {
    throw new OrderDomainError('Order size must originate from the Selection');
  }
  const sizeQuantities = [...line.sizeQuantities];
  sizeQuantities[sizeIndex] = Object.freeze({
    size,
    quantity: safeInteger(input.quantity, `Quantity for size ${size}`),
  });
  const updatedLine = recalculateLine({
    ...line,
    sizeQuantities: Object.freeze(sizeQuantities),
    updatedAt: input.now.toISOString(),
  });
  const lines = [...order.lines];
  lines[lineIndex] = updatedLine;
  return withLines(order, lines, input.now);
}

export function setOrderLineCommercialTerms(
  order: CommercialOrder,
  input: {
    readonly lineId: OrderLineId;
    readonly unitPriceMinor: number;
    readonly discountBasisPoints: number;
    readonly taxBasisPoints: number;
    readonly now: Date;
  },
): CommercialOrder {
  assertDraft(order);
  const lineIndex = order.lines.findIndex((line) => line.id === input.lineId);
  if (lineIndex < 0) throw new OrderDomainError('Order line not found');
  const line = order.lines[lineIndex];
  const updatedLine = recalculateLine({
    ...line,
    unitPriceMinor: safeInteger(input.unitPriceMinor, 'Order line unit price'),
    discountBasisPoints: basisPoints(
      input.discountBasisPoints,
      'Discount basis points',
    ),
    taxBasisPoints: basisPoints(input.taxBasisPoints, 'Tax basis points'),
    updatedAt: input.now.toISOString(),
  });
  const lines = [...order.lines];
  lines[lineIndex] = updatedLine;
  return withLines(order, lines, input.now);
}

export function submitOrder(
  order: CommercialOrder,
  input: {
    readonly snapshotId: string;
    readonly actorCredentialId: string;
    readonly now: Date;
  },
): {
  readonly order: CommercialOrder;
  readonly snapshot: SubmittedOrderSnapshot;
} {
  assertDraft(order);
  const submittedLines = order.lines.filter((line) => line.totalQuantity > 0);
  if (submittedLines.length === 0) {
    throw new OrderDomainError('Submitted Order requires a positive quantity');
  }
  for (const line of submittedLines) {
    if (line.unitPriceMinor <= 0) {
      throw new OrderDomainError(
        `Ordered line ${line.productReference} requires a positive unit price`,
      );
    }
  }
  const lines = Object.freeze(submittedLines.map((line) => Object.freeze({ ...line })));
  const totals = calculateOrderTotals(lines);
  const snapshotId = submittedOrderSnapshotId(input.snapshotId);
  const submittedAt = input.now.toISOString();
  const changed: CommercialOrder = Object.freeze({
    ...order,
    status: 'SUBMITTED' as const,
    lines,
    totals,
    submittedSnapshotId: snapshotId,
    updatedAt: submittedAt,
    version: order.version + 1,
  });
  const snapshot: SubmittedOrderSnapshot = Object.freeze({
    id: snapshotId,
    orderId: changed.id,
    orderVersion: changed.version,
    buyerOrganisationId: changed.buyerOrganisationId,
    sellerOrganisationId: changed.sellerOrganisationId,
    selectionId: changed.selectionId,
    showroomAccessGrantId: changed.showroomAccessGrantId,
    showroomId: changed.showroomId,
    showroomSnapshotId: changed.showroomSnapshotId,
    currency: changed.currency,
    lines,
    totals,
    submittedByCredentialId: requiredText(
      input.actorCredentialId,
      'Order submit credential id',
    ),
    submittedAt,
  });
  return Object.freeze({ order: changed, snapshot });
}
