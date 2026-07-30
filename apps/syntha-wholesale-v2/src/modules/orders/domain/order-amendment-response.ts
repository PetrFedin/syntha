import type { OrganisationId } from '@/modules/organisations';

import {
  calculateOrderLine,
  calculateOrderTotals,
  orderLineId,
  submittedOrderSnapshotId,
  type OrderLine,
  type OrderLineId,
  type OrderSizeQuantity,
  type OrderTotals,
  type SubmittedOrderSnapshot,
  type SubmittedOrderSnapshotId,
} from './order';
import {
  orderReviewId,
  type OrderReview,
  type OrderReviewId,
  type ProposedOrderLineChange,
} from './order-review';

export type OrderAmendmentResponseId = string & {
  readonly __brand: 'OrderAmendmentResponseId';
};
export type RevisedOrderVersionId = string & {
  readonly __brand: 'RevisedOrderVersionId';
};
export type OrderAmendmentDecision = 'ACCEPTED' | 'COUNTERED' | 'REJECTED';

export interface OrderAmendmentResponse {
  readonly id: OrderAmendmentResponseId;
  readonly orderReviewId: OrderReviewId;
  readonly submittedOrderSnapshotId: SubmittedOrderSnapshotId;
  readonly orderId: SubmittedOrderSnapshot['orderId'];
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly decision: OrderAmendmentDecision;
  readonly reason?: string;
  readonly proposedLineChanges: readonly ProposedOrderLineChange[];
  readonly revisedOrderVersionId?: RevisedOrderVersionId;
  readonly respondedByCredentialId: string;
  readonly respondedAt: string;
  readonly version: number;
}

export interface RevisedOrderVersion {
  readonly id: RevisedOrderVersionId;
  readonly orderAmendmentResponseId: OrderAmendmentResponseId;
  readonly orderReviewId: OrderReviewId;
  readonly submittedOrderSnapshotId: SubmittedOrderSnapshotId;
  readonly orderId: SubmittedOrderSnapshot['orderId'];
  readonly sourceOrderVersion: number;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly revisionKind: 'ACCEPTED' | 'COUNTERED';
  readonly currency: string;
  readonly lines: readonly OrderLine[];
  readonly totals: OrderTotals;
  readonly createdByCredentialId: string;
  readonly createdAt: string;
}

export class OrderAmendmentResponseDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderAmendmentResponseDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new OrderAmendmentResponseDomainError(`${label} must not be empty`);
  }
  return normalized;
}

function safeInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new OrderAmendmentResponseDomainError(
      `${label} must be a non-negative safe integer`,
    );
  }
  return value;
}

function basisPoints(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new OrderAmendmentResponseDomainError(
      `${label} must be an integer from 0 through 10000`,
    );
  }
  return value;
}

export function orderAmendmentResponseId(value: string): OrderAmendmentResponseId {
  return requiredText(value, 'Order amendment response id') as OrderAmendmentResponseId;
}

export function revisedOrderVersionId(value: string): RevisedOrderVersionId {
  return requiredText(value, 'Revised Order version id') as RevisedOrderVersionId;
}

function cloneSizeQuantities(
  sizeQuantities: readonly OrderSizeQuantity[],
): readonly OrderSizeQuantity[] {
  return Object.freeze(
    sizeQuantities.map((entry) => Object.freeze({ ...entry })),
  );
}

function cloneLine(line: OrderLine): OrderLine {
  return Object.freeze({
    ...line,
    sizeQuantities: cloneSizeQuantities(line.sizeQuantities),
    totals: Object.freeze({ ...line.totals }),
  });
}

function validateSource(
  review: OrderReview,
  snapshot: SubmittedOrderSnapshot,
): NonNullable<OrderReview['amendmentRequest']> {
  if (review.status !== 'AMENDMENT_REQUESTED' || !review.amendmentRequest) {
    throw new OrderAmendmentResponseDomainError(
      'Buyer response requires an amendment-requested Order review',
    );
  }
  if (review.submittedOrderSnapshotId !== snapshot.id) {
    throw new OrderAmendmentResponseDomainError(
      'Order review source snapshot does not match the submitted Order',
    );
  }
  if (
    review.buyerOrganisationId !== snapshot.buyerOrganisationId ||
    review.sellerOrganisationId !== snapshot.sellerOrganisationId ||
    review.orderId !== snapshot.orderId
  ) {
    throw new OrderAmendmentResponseDomainError(
      'Order review commercial lineage does not match the submitted Order',
    );
  }
  return review.amendmentRequest;
}

function normalizeChanges(
  snapshot: SubmittedOrderSnapshot,
  lineChanges: readonly ProposedOrderLineChange[],
): readonly ProposedOrderLineChange[] {
  if (lineChanges.length === 0) {
    throw new OrderAmendmentResponseDomainError(
      'A revised Order requires at least one proposed line change',
    );
  }
  const seenLines = new Set<OrderLineId>();
  return Object.freeze(
    lineChanges.map((change) => {
      const lineId = orderLineId(change.lineId);
      if (seenLines.has(lineId)) {
        throw new OrderAmendmentResponseDomainError(
          `Duplicate revised Order line: ${lineId}`,
        );
      }
      seenLines.add(lineId);
      const sourceLine = snapshot.lines.find((line) => line.id === lineId);
      if (!sourceLine) {
        throw new OrderAmendmentResponseDomainError(
          `Revised Order line ${lineId} is not in the submitted Order`,
        );
      }
      const seenSizes = new Set<string>();
      const sizeQuantities = change.sizeQuantities
        ? Object.freeze(
            change.sizeQuantities.map((entry) => {
              const size = requiredText(entry.size, 'Revised Order size').toUpperCase();
              if (seenSizes.has(size)) {
                throw new OrderAmendmentResponseDomainError(
                  `Duplicate revised size ${size} for line ${lineId}`,
                );
              }
              seenSizes.add(size);
              if (!sourceLine.sizeQuantities.some((candidate) => candidate.size === size)) {
                throw new OrderAmendmentResponseDomainError(
                  `Revised size ${size} is not in submitted line ${lineId}`,
                );
              }
              return Object.freeze({
                size,
                quantity: safeInteger(
                  entry.quantity,
                  `Revised quantity for ${lineId}/${size}`,
                ),
              });
            }),
          )
        : undefined;
      const normalized = Object.freeze({
        lineId,
        ...(sizeQuantities ? { sizeQuantities } : {}),
        ...(change.unitPriceMinor !== undefined
          ? {
              unitPriceMinor: safeInteger(
                change.unitPriceMinor,
                `Revised unit price for ${lineId}`,
              ),
            }
          : {}),
        ...(change.discountBasisPoints !== undefined
          ? {
              discountBasisPoints: basisPoints(
                change.discountBasisPoints,
                `Revised discount basis points for ${lineId}`,
              ),
            }
          : {}),
        ...(change.taxBasisPoints !== undefined
          ? {
              taxBasisPoints: basisPoints(
                change.taxBasisPoints,
                `Revised tax basis points for ${lineId}`,
              ),
            }
          : {}),
        ...(change.note !== undefined
          ? { note: requiredText(change.note, `Revised note for ${lineId}`) }
          : {}),
      });
      if (
        !normalized.sizeQuantities &&
        normalized.unitPriceMinor === undefined &&
        normalized.discountBasisPoints === undefined &&
        normalized.taxBasisPoints === undefined &&
        normalized.note === undefined
      ) {
        throw new OrderAmendmentResponseDomainError(
          `Revised Order line ${lineId} has no proposed changes`,
        );
      }
      return normalized;
    }),
  );
}

function applyLineChange(
  line: OrderLine,
  change: ProposedOrderLineChange | undefined,
  now: string,
): OrderLine {
  if (!change) return cloneLine(line);
  const changedQuantities = new Map(
    (change.sizeQuantities ?? []).map((entry) => [entry.size, entry.quantity]),
  );
  const sizeQuantities = Object.freeze(
    line.sizeQuantities.map((entry) =>
      Object.freeze({
        size: entry.size,
        quantity: changedQuantities.has(entry.size)
          ? changedQuantities.get(entry.size)!
          : entry.quantity,
      }),
    ),
  );
  const totalQuantity = sizeQuantities.reduce(
    (sum, entry) => sum + entry.quantity,
    0,
  );
  if (!Number.isSafeInteger(totalQuantity)) {
    throw new OrderAmendmentResponseDomainError(
      `Revised total quantity for ${line.id} exceeds safe integer range`,
    );
  }
  const unitPriceMinor = change.unitPriceMinor ?? line.unitPriceMinor;
  const discountBasisPoints =
    change.discountBasisPoints ?? line.discountBasisPoints;
  const taxBasisPoints = change.taxBasisPoints ?? line.taxBasisPoints;
  const totals = calculateOrderLine({
    quantity: totalQuantity,
    unitPriceMinor,
    discountBasisPoints,
    taxBasisPoints,
  });
  return Object.freeze({
    ...line,
    sizeQuantities,
    totalQuantity,
    unitPriceMinor,
    discountBasisPoints,
    taxBasisPoints,
    totals,
    note: change.note ?? line.note,
    updatedAt: now,
  });
}

function buildRevision(input: {
  readonly id: string;
  readonly responseId: OrderAmendmentResponseId;
  readonly review: OrderReview;
  readonly snapshot: SubmittedOrderSnapshot;
  readonly revisionKind: 'ACCEPTED' | 'COUNTERED';
  readonly lineChanges: readonly ProposedOrderLineChange[];
  readonly actorCredentialId: string;
  readonly now: Date;
}): RevisedOrderVersion {
  const normalizedChanges = normalizeChanges(input.snapshot, input.lineChanges);
  const changesByLine = new Map(
    normalizedChanges.map((change) => [change.lineId, change]),
  );
  const timestamp = input.now.toISOString();
  const lines = Object.freeze(
    input.snapshot.lines.map((line) =>
      applyLineChange(line, changesByLine.get(line.id), timestamp),
    ),
  );
  return Object.freeze({
    id: revisedOrderVersionId(input.id),
    orderAmendmentResponseId: input.responseId,
    orderReviewId: orderReviewId(input.review.id),
    submittedOrderSnapshotId: submittedOrderSnapshotId(input.snapshot.id),
    orderId: input.snapshot.orderId,
    sourceOrderVersion: input.snapshot.orderVersion,
    buyerOrganisationId: input.snapshot.buyerOrganisationId,
    sellerOrganisationId: input.snapshot.sellerOrganisationId,
    revisionKind: input.revisionKind,
    currency: input.snapshot.currency,
    lines,
    totals: calculateOrderTotals(lines),
    createdByCredentialId: requiredText(
      input.actorCredentialId,
      'Revised Order creator credential id',
    ),
    createdAt: timestamp,
  });
}

function createResponse(input: {
  readonly id: string;
  readonly review: OrderReview;
  readonly snapshot: SubmittedOrderSnapshot;
  readonly decision: OrderAmendmentDecision;
  readonly reason?: string;
  readonly lineChanges: readonly ProposedOrderLineChange[];
  readonly revisedOrderVersionId?: RevisedOrderVersionId;
  readonly actorCredentialId: string;
  readonly now: Date;
}): OrderAmendmentResponse {
  return Object.freeze({
    id: orderAmendmentResponseId(input.id),
    orderReviewId: orderReviewId(input.review.id),
    submittedOrderSnapshotId: submittedOrderSnapshotId(input.snapshot.id),
    orderId: input.snapshot.orderId,
    buyerOrganisationId: input.snapshot.buyerOrganisationId,
    sellerOrganisationId: input.snapshot.sellerOrganisationId,
    decision: input.decision,
    ...(input.reason ? { reason: requiredText(input.reason, 'Buyer response reason') } : {}),
    proposedLineChanges: Object.freeze(
      input.lineChanges.map((change) =>
        Object.freeze({
          ...change,
          ...(change.sizeQuantities
            ? { sizeQuantities: cloneSizeQuantities(change.sizeQuantities) }
            : {}),
        }),
      ),
    ),
    ...(input.revisedOrderVersionId
      ? { revisedOrderVersionId: input.revisedOrderVersionId }
      : {}),
    respondedByCredentialId: requiredText(
      input.actorCredentialId,
      'Buyer responder credential id',
    ),
    respondedAt: input.now.toISOString(),
    version: 1,
  });
}

export function acceptOrderAmendment(input: {
  readonly responseId: string;
  readonly revisedVersionId: string;
  readonly review: OrderReview;
  readonly snapshot: SubmittedOrderSnapshot;
  readonly actorCredentialId: string;
  readonly now: Date;
}): {
  readonly response: OrderAmendmentResponse;
  readonly revised: RevisedOrderVersion;
} {
  const request = validateSource(input.review, input.snapshot);
  const responseId = orderAmendmentResponseId(input.responseId);
  const revised = buildRevision({
    id: input.revisedVersionId,
    responseId,
    review: input.review,
    snapshot: input.snapshot,
    revisionKind: 'ACCEPTED',
    lineChanges: request.lineChanges,
    actorCredentialId: input.actorCredentialId,
    now: input.now,
  });
  return Object.freeze({
    response: createResponse({
      id: responseId,
      review: input.review,
      snapshot: input.snapshot,
      decision: 'ACCEPTED',
      lineChanges: request.lineChanges,
      revisedOrderVersionId: revised.id,
      actorCredentialId: input.actorCredentialId,
      now: input.now,
    }),
    revised,
  });
}

export function counterOrderAmendment(input: {
  readonly responseId: string;
  readonly revisedVersionId: string;
  readonly review: OrderReview;
  readonly snapshot: SubmittedOrderSnapshot;
  readonly reason: string;
  readonly lineChanges: readonly ProposedOrderLineChange[];
  readonly actorCredentialId: string;
  readonly now: Date;
}): {
  readonly response: OrderAmendmentResponse;
  readonly revised: RevisedOrderVersion;
} {
  validateSource(input.review, input.snapshot);
  const reason = requiredText(input.reason, 'Counterproposal reason');
  const responseId = orderAmendmentResponseId(input.responseId);
  const normalizedChanges = normalizeChanges(input.snapshot, input.lineChanges);
  const revised = buildRevision({
    id: input.revisedVersionId,
    responseId,
    review: input.review,
    snapshot: input.snapshot,
    revisionKind: 'COUNTERED',
    lineChanges: normalizedChanges,
    actorCredentialId: input.actorCredentialId,
    now: input.now,
  });
  return Object.freeze({
    response: createResponse({
      id: responseId,
      review: input.review,
      snapshot: input.snapshot,
      decision: 'COUNTERED',
      reason,
      lineChanges: normalizedChanges,
      revisedOrderVersionId: revised.id,
      actorCredentialId: input.actorCredentialId,
      now: input.now,
    }),
    revised,
  });
}

export function rejectOrderAmendment(input: {
  readonly responseId: string;
  readonly review: OrderReview;
  readonly snapshot: SubmittedOrderSnapshot;
  readonly reason: string;
  readonly actorCredentialId: string;
  readonly now: Date;
}): OrderAmendmentResponse {
  validateSource(input.review, input.snapshot);
  return createResponse({
    id: input.responseId,
    review: input.review,
    snapshot: input.snapshot,
    decision: 'REJECTED',
    reason: requiredText(input.reason, 'Rejection reason'),
    lineChanges: Object.freeze([]),
    actorCredentialId: input.actorCredentialId,
    now: input.now,
  });
}
