import type { OrganisationId } from '@/modules/organisations';

import {
  orderLineId,
  submittedOrderSnapshotId,
  type OrderLine,
  type OrderLineId,
  type OrderSizeQuantity,
  type OrderTotals,
  type SubmittedOrderSnapshot,
  type SubmittedOrderSnapshotId,
} from './order';

export type OrderReviewId = string & { readonly __brand: 'OrderReviewId' };
export type ConfirmedOrderVersionId = string & {
  readonly __brand: 'ConfirmedOrderVersionId';
};
export type OrderReviewStatus =
  | 'PENDING'
  | 'AMENDMENT_REQUESTED'
  | 'APPROVED'
  | 'CONFIRMED';

export interface ProposedOrderLineChange {
  readonly lineId: OrderLineId;
  readonly sizeQuantities?: readonly OrderSizeQuantity[];
  readonly unitPriceMinor?: number;
  readonly discountBasisPoints?: number;
  readonly taxBasisPoints?: number;
  readonly note?: string;
}

export interface OrderAmendmentRequest {
  readonly reason: string;
  readonly lineChanges: readonly ProposedOrderLineChange[];
  readonly requestedByCredentialId: string;
  readonly requestedAt: string;
}

export interface OrderApproval {
  readonly approvedByCredentialId: string;
  readonly approvedAt: string;
}

export interface OrderReview {
  readonly id: OrderReviewId;
  readonly submittedOrderSnapshotId: SubmittedOrderSnapshotId;
  readonly orderId: SubmittedOrderSnapshot['orderId'];
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly status: OrderReviewStatus;
  readonly amendmentRequest?: OrderAmendmentRequest;
  readonly approval?: OrderApproval;
  readonly confirmedOrderVersionId?: ConfirmedOrderVersionId;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface ConfirmedOrderVersion {
  readonly id: ConfirmedOrderVersionId;
  readonly orderReviewId: OrderReviewId;
  readonly submittedOrderSnapshotId: SubmittedOrderSnapshotId;
  readonly orderId: SubmittedOrderSnapshot['orderId'];
  readonly sourceOrderVersion: number;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly currency: string;
  readonly lines: readonly OrderLine[];
  readonly totals: OrderTotals;
  readonly approvedByCredentialId: string;
  readonly approvedAt: string;
  readonly confirmedByCredentialId: string;
  readonly confirmedAt: string;
}

export class OrderReviewDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderReviewDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new OrderReviewDomainError(`${label} must not be empty`);
  return normalized;
}

function safeInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new OrderReviewDomainError(`${label} must be a non-negative safe integer`);
  }
  return value;
}

function basisPoints(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new OrderReviewDomainError(`${label} must be an integer from 0 through 10000`);
  }
  return value;
}

function cloneLine(line: OrderLine): OrderLine {
  return Object.freeze({
    ...line,
    sizeQuantities: Object.freeze(
      line.sizeQuantities.map((entry) => Object.freeze({ ...entry })),
    ),
    totals: Object.freeze({ ...line.totals }),
  });
}

export function orderReviewId(value: string): OrderReviewId {
  return requiredText(value, 'Order review id') as OrderReviewId;
}

export function confirmedOrderVersionId(value: string): ConfirmedOrderVersionId {
  return requiredText(value, 'Confirmed order version id') as ConfirmedOrderVersionId;
}

export function createOrderReview(input: {
  readonly id: string;
  readonly snapshot: SubmittedOrderSnapshot;
  readonly ownerCredentialId: string;
  readonly now: Date;
}): OrderReview {
  const timestamp = input.now.toISOString();
  return Object.freeze({
    id: orderReviewId(input.id),
    submittedOrderSnapshotId: submittedOrderSnapshotId(input.snapshot.id),
    orderId: input.snapshot.orderId,
    buyerOrganisationId: input.snapshot.buyerOrganisationId,
    sellerOrganisationId: input.snapshot.sellerOrganisationId,
    status: 'PENDING' as const,
    ownerCredentialId: requiredText(input.ownerCredentialId, 'Review owner credential id'),
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  });
}

function assertPending(review: OrderReview): void {
  if (review.status !== 'PENDING') {
    throw new OrderReviewDomainError('Only a pending Order review can receive a decision');
  }
}

function validateLineChanges(
  snapshot: SubmittedOrderSnapshot,
  lineChanges: readonly ProposedOrderLineChange[],
): readonly ProposedOrderLineChange[] {
  const seen = new Set<OrderLineId>();
  return Object.freeze(
    lineChanges.map((change) => {
      const lineId = orderLineId(change.lineId);
      if (seen.has(lineId)) {
        throw new OrderReviewDomainError(`Duplicate amendment line: ${lineId}`);
      }
      seen.add(lineId);
      const source = snapshot.lines.find((line) => line.id === lineId);
      if (!source) {
        throw new OrderReviewDomainError(`Amendment line ${lineId} is not in the submitted Order`);
      }
      const sizeQuantities = change.sizeQuantities
        ? Object.freeze(
            change.sizeQuantities.map((entry) => {
              const size = requiredText(entry.size, 'Amendment size').toUpperCase();
              if (!source.sizeQuantities.some((candidate) => candidate.size === size)) {
                throw new OrderReviewDomainError(
                  `Amendment size ${size} is not in submitted line ${lineId}`,
                );
              }
              return Object.freeze({
                size,
                quantity: safeInteger(entry.quantity, `Amendment quantity for ${size}`),
              });
            }),
          )
        : undefined;
      const hasChange =
        Boolean(sizeQuantities?.length) ||
        change.unitPriceMinor !== undefined ||
        change.discountBasisPoints !== undefined ||
        change.taxBasisPoints !== undefined ||
        change.note !== undefined;
      if (!hasChange) {
        throw new OrderReviewDomainError(`Amendment line ${lineId} has no proposed changes`);
      }
      return Object.freeze({
        lineId,
        ...(sizeQuantities ? { sizeQuantities } : {}),
        ...(change.unitPriceMinor !== undefined
          ? { unitPriceMinor: safeInteger(change.unitPriceMinor, 'Amendment unit price') }
          : {}),
        ...(change.discountBasisPoints !== undefined
          ? {
              discountBasisPoints: basisPoints(
                change.discountBasisPoints,
                'Amendment discount basis points',
              ),
            }
          : {}),
        ...(change.taxBasisPoints !== undefined
          ? { taxBasisPoints: basisPoints(change.taxBasisPoints, 'Amendment tax basis points') }
          : {}),
        ...(change.note !== undefined
          ? { note: requiredText(change.note, 'Amendment note') }
          : {}),
      });
    }),
  );
}

export function requestOrderAmendment(
  review: OrderReview,
  snapshot: SubmittedOrderSnapshot,
  input: {
    readonly reason: string;
    readonly lineChanges: readonly ProposedOrderLineChange[];
    readonly actorCredentialId: string;
    readonly now: Date;
  },
): OrderReview {
  assertPending(review);
  if (review.submittedOrderSnapshotId !== snapshot.id) {
    throw new OrderReviewDomainError('Order review source snapshot does not match');
  }
  const timestamp = input.now.toISOString();
  return Object.freeze({
    ...review,
    status: 'AMENDMENT_REQUESTED' as const,
    amendmentRequest: Object.freeze({
      reason: requiredText(input.reason, 'Amendment reason'),
      lineChanges: validateLineChanges(snapshot, input.lineChanges),
      requestedByCredentialId: requiredText(
        input.actorCredentialId,
        'Amendment requester credential id',
      ),
      requestedAt: timestamp,
    }),
    updatedAt: timestamp,
    version: review.version + 1,
  });
}

export function approveOrder(
  review: OrderReview,
  input: { readonly actorCredentialId: string; readonly now: Date },
): OrderReview {
  assertPending(review);
  const timestamp = input.now.toISOString();
  return Object.freeze({
    ...review,
    status: 'APPROVED' as const,
    approval: Object.freeze({
      approvedByCredentialId: requiredText(
        input.actorCredentialId,
        'Order approver credential id',
      ),
      approvedAt: timestamp,
    }),
    updatedAt: timestamp,
    version: review.version + 1,
  });
}

export function confirmOrder(
  review: OrderReview,
  snapshot: SubmittedOrderSnapshot,
  input: {
    readonly confirmedVersionId: string;
    readonly actorCredentialId: string;
    readonly now: Date;
  },
): { readonly review: OrderReview; readonly confirmed: ConfirmedOrderVersion } {
  if (review.status !== 'APPROVED' || !review.approval) {
    throw new OrderReviewDomainError('Order confirmation requires an approved review');
  }
  if (review.submittedOrderSnapshotId !== snapshot.id) {
    throw new OrderReviewDomainError('Order review source snapshot does not match');
  }
  const confirmedAt = input.now.toISOString();
  const id = confirmedOrderVersionId(input.confirmedVersionId);
  const changed = Object.freeze({
    ...review,
    status: 'CONFIRMED' as const,
    confirmedOrderVersionId: id,
    updatedAt: confirmedAt,
    version: review.version + 1,
  });
  const confirmed = Object.freeze({
    id,
    orderReviewId: review.id,
    submittedOrderSnapshotId: snapshot.id,
    orderId: snapshot.orderId,
    sourceOrderVersion: snapshot.orderVersion,
    buyerOrganisationId: snapshot.buyerOrganisationId,
    sellerOrganisationId: snapshot.sellerOrganisationId,
    currency: snapshot.currency,
    lines: Object.freeze(snapshot.lines.map(cloneLine)),
    totals: Object.freeze({ ...snapshot.totals }),
    approvedByCredentialId: review.approval.approvedByCredentialId,
    approvedAt: review.approval.approvedAt,
    confirmedByCredentialId: requiredText(
      input.actorCredentialId,
      'Order confirmer credential id',
    ),
    confirmedAt,
  });
  return Object.freeze({ review: changed, confirmed });
}
