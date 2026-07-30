import type { OrganisationId } from '@/modules/organisations';

import {
  orderLineId,
  submittedOrderSnapshotId,
  type OrderLine,
  type OrderLineId,
  type OrderSizeQuantity,
  type OrderTotals,
  type SubmittedOrderSnapshotId,
} from './order';
import {
  orderAmendmentResponseId,
  revisedOrderVersionId,
  type OrderAmendmentResponseId,
  type RevisedOrderVersion,
  type RevisedOrderVersionId,
} from './order-amendment-response';
import type { OrderApproval, ProposedOrderLineChange } from './order-review';

export type RevisedOrderReviewId = string & {
  readonly __brand: 'RevisedOrderReviewId';
};
export type RevisedConfirmedOrderVersionId = string & {
  readonly __brand: 'RevisedConfirmedOrderVersionId';
};
export type RevisedOrderReviewStatus =
  | 'PENDING'
  | 'AMENDMENT_REQUESTED'
  | 'APPROVED'
  | 'CONFIRMED';

export interface RevisedOrderAmendmentRequest {
  readonly reason: string;
  readonly lineChanges: readonly ProposedOrderLineChange[];
  readonly requestedByCredentialId: string;
  readonly requestedAt: string;
}

export interface RevisedOrderReview {
  readonly id: RevisedOrderReviewId;
  readonly revisedOrderVersionId: RevisedOrderVersionId;
  readonly orderAmendmentResponseId: OrderAmendmentResponseId;
  readonly submittedOrderSnapshotId: SubmittedOrderSnapshotId;
  readonly orderId: RevisedOrderVersion['orderId'];
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly status: RevisedOrderReviewStatus;
  readonly amendmentRequest?: RevisedOrderAmendmentRequest;
  readonly approval?: OrderApproval;
  readonly confirmedOrderVersionId?: RevisedConfirmedOrderVersionId;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface RevisedConfirmedOrderVersion {
  readonly id: RevisedConfirmedOrderVersionId;
  readonly revisedOrderReviewId: RevisedOrderReviewId;
  readonly revisedOrderVersionId: RevisedOrderVersionId;
  readonly orderAmendmentResponseId: OrderAmendmentResponseId;
  readonly submittedOrderSnapshotId: SubmittedOrderSnapshotId;
  readonly orderId: RevisedOrderVersion['orderId'];
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

export class RevisedOrderReviewDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RevisedOrderReviewDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new RevisedOrderReviewDomainError(`${label} must not be empty`);
  return normalized;
}

function safeInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RevisedOrderReviewDomainError(
      `${label} must be a non-negative safe integer`,
    );
  }
  return value;
}

function basisPoints(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new RevisedOrderReviewDomainError(
      `${label} must be an integer from 0 through 10000`,
    );
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

export function revisedOrderReviewId(value: string): RevisedOrderReviewId {
  return requiredText(value, 'Revised Order review id') as RevisedOrderReviewId;
}

export function revisedConfirmedOrderVersionId(
  value: string,
): RevisedConfirmedOrderVersionId {
  return requiredText(
    value,
    'Revised confirmed Order version id',
  ) as RevisedConfirmedOrderVersionId;
}

export function createRevisedOrderReview(input: {
  readonly id: string;
  readonly revised: RevisedOrderVersion;
  readonly ownerCredentialId: string;
  readonly now: Date;
}): RevisedOrderReview {
  const timestamp = input.now.toISOString();
  return Object.freeze({
    id: revisedOrderReviewId(input.id),
    revisedOrderVersionId: revisedOrderVersionId(input.revised.id),
    orderAmendmentResponseId: orderAmendmentResponseId(
      input.revised.orderAmendmentResponseId,
    ),
    submittedOrderSnapshotId: submittedOrderSnapshotId(
      input.revised.submittedOrderSnapshotId,
    ),
    orderId: input.revised.orderId,
    buyerOrganisationId: input.revised.buyerOrganisationId,
    sellerOrganisationId: input.revised.sellerOrganisationId,
    status: 'PENDING' as const,
    ownerCredentialId: requiredText(
      input.ownerCredentialId,
      'Revised Order review owner credential id',
    ),
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  });
}

function assertPending(review: RevisedOrderReview): void {
  if (review.status !== 'PENDING') {
    throw new RevisedOrderReviewDomainError(
      'Only a pending Revised Order review can receive a decision',
    );
  }
}

function assertSource(
  review: RevisedOrderReview,
  revised: RevisedOrderVersion,
): void {
  if (
    review.revisedOrderVersionId !== revised.id ||
    review.orderAmendmentResponseId !== revised.orderAmendmentResponseId ||
    review.submittedOrderSnapshotId !== revised.submittedOrderSnapshotId ||
    review.orderId !== revised.orderId ||
    review.buyerOrganisationId !== revised.buyerOrganisationId ||
    review.sellerOrganisationId !== revised.sellerOrganisationId
  ) {
    throw new RevisedOrderReviewDomainError(
      'Revised Order review source lineage does not match',
    );
  }
}

function validateLineChanges(
  revised: RevisedOrderVersion,
  lineChanges: readonly ProposedOrderLineChange[],
): readonly ProposedOrderLineChange[] {
  if (lineChanges.length === 0) {
    throw new RevisedOrderReviewDomainError(
      'Revised Order amendment requires at least one line change',
    );
  }
  const seenLines = new Set<OrderLineId>();
  return Object.freeze(
    lineChanges.map((change) => {
      const lineId = orderLineId(change.lineId);
      if (seenLines.has(lineId)) {
        throw new RevisedOrderReviewDomainError(
          `Duplicate Revised Order amendment line: ${lineId}`,
        );
      }
      seenLines.add(lineId);
      const source = revised.lines.find((line) => line.id === lineId);
      if (!source) {
        throw new RevisedOrderReviewDomainError(
          `Amendment line ${lineId} is not in the Revised Order`,
        );
      }
      const seenSizes = new Set<string>();
      const sizeQuantities = change.sizeQuantities
        ? Object.freeze(
            change.sizeQuantities.map((entry) => {
              const size = requiredText(
                entry.size,
                'Revised Order amendment size',
              ).toUpperCase();
              if (seenSizes.has(size)) {
                throw new RevisedOrderReviewDomainError(
                  `Duplicate amendment size ${size} for line ${lineId}`,
                );
              }
              seenSizes.add(size);
              if (!source.sizeQuantities.some((candidate) => candidate.size === size)) {
                throw new RevisedOrderReviewDomainError(
                  `Amendment size ${size} is not in Revised Order line ${lineId}`,
                );
              }
              return Object.freeze({
                size,
                quantity: safeInteger(
                  entry.quantity,
                  `Revised Order amendment quantity for ${size}`,
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
                'Revised Order amendment unit price',
              ),
            }
          : {}),
        ...(change.discountBasisPoints !== undefined
          ? {
              discountBasisPoints: basisPoints(
                change.discountBasisPoints,
                'Revised Order amendment discount basis points',
              ),
            }
          : {}),
        ...(change.taxBasisPoints !== undefined
          ? {
              taxBasisPoints: basisPoints(
                change.taxBasisPoints,
                'Revised Order amendment tax basis points',
              ),
            }
          : {}),
        ...(change.note !== undefined
          ? {
              note: requiredText(
                change.note,
                'Revised Order amendment note',
              ),
            }
          : {}),
      });
      if (
        !normalized.sizeQuantities &&
        normalized.unitPriceMinor === undefined &&
        normalized.discountBasisPoints === undefined &&
        normalized.taxBasisPoints === undefined &&
        normalized.note === undefined
      ) {
        throw new RevisedOrderReviewDomainError(
          `Revised Order amendment line ${lineId} has no changes`,
        );
      }
      return normalized;
    }),
  );
}

export function requestRevisedOrderAmendment(
  review: RevisedOrderReview,
  revised: RevisedOrderVersion,
  input: {
    readonly reason: string;
    readonly lineChanges: readonly ProposedOrderLineChange[];
    readonly actorCredentialId: string;
    readonly now: Date;
  },
): RevisedOrderReview {
  assertPending(review);
  assertSource(review, revised);
  const timestamp = input.now.toISOString();
  return Object.freeze({
    ...review,
    status: 'AMENDMENT_REQUESTED' as const,
    amendmentRequest: Object.freeze({
      reason: requiredText(input.reason, 'Revised Order amendment reason'),
      lineChanges: validateLineChanges(revised, input.lineChanges),
      requestedByCredentialId: requiredText(
        input.actorCredentialId,
        'Revised Order amendment requester credential id',
      ),
      requestedAt: timestamp,
    }),
    updatedAt: timestamp,
    version: review.version + 1,
  });
}

export function approveRevisedOrder(
  review: RevisedOrderReview,
  revised: RevisedOrderVersion,
  input: { readonly actorCredentialId: string; readonly now: Date },
): RevisedOrderReview {
  assertPending(review);
  assertSource(review, revised);
  const timestamp = input.now.toISOString();
  return Object.freeze({
    ...review,
    status: 'APPROVED' as const,
    approval: Object.freeze({
      approvedByCredentialId: requiredText(
        input.actorCredentialId,
        'Revised Order approver credential id',
      ),
      approvedAt: timestamp,
    }),
    updatedAt: timestamp,
    version: review.version + 1,
  });
}

export function confirmRevisedOrder(
  review: RevisedOrderReview,
  revised: RevisedOrderVersion,
  input: {
    readonly confirmedVersionId: string;
    readonly actorCredentialId: string;
    readonly now: Date;
  },
): {
  readonly review: RevisedOrderReview;
  readonly confirmed: RevisedConfirmedOrderVersion;
} {
  if (review.status !== 'APPROVED' || !review.approval) {
    throw new RevisedOrderReviewDomainError(
      'Revised Order confirmation requires an approved review',
    );
  }
  assertSource(review, revised);
  const confirmedAt = input.now.toISOString();
  const id = revisedConfirmedOrderVersionId(input.confirmedVersionId);
  const changed = Object.freeze({
    ...review,
    status: 'CONFIRMED' as const,
    confirmedOrderVersionId: id,
    updatedAt: confirmedAt,
    version: review.version + 1,
  });
  const confirmed = Object.freeze({
    id,
    revisedOrderReviewId: review.id,
    revisedOrderVersionId: revised.id,
    orderAmendmentResponseId: revised.orderAmendmentResponseId,
    submittedOrderSnapshotId: revised.submittedOrderSnapshotId,
    orderId: revised.orderId,
    sourceOrderVersion: revised.sourceOrderVersion,
    buyerOrganisationId: revised.buyerOrganisationId,
    sellerOrganisationId: revised.sellerOrganisationId,
    currency: revised.currency,
    lines: Object.freeze(revised.lines.map(cloneLine)),
    totals: Object.freeze({ ...revised.totals }),
    approvedByCredentialId: review.approval.approvedByCredentialId,
    approvedAt: review.approval.approvedAt,
    confirmedByCredentialId: requiredText(
      input.actorCredentialId,
      'Revised Order confirmer credential id',
    ),
    confirmedAt,
  });
  return Object.freeze({ review: changed, confirmed });
}
