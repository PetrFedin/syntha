import {
  lifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import {
  revisedOrderVersionId,
  type RevisedOrderVersion,
} from '../domain/order-amendment-response';
import type { ProposedOrderLineChange } from '../domain/order-review';
import {
  approveRevisedOrder,
  confirmRevisedOrder,
  createRevisedOrderReview,
  requestRevisedOrderAmendment,
  revisedConfirmedOrderVersionId,
  revisedOrderReviewId,
  type RevisedConfirmedOrderVersion,
  type RevisedOrderReview,
} from '../domain/revised-order-review';
import type { OrderAmendmentResponseRepository } from './order-amendment-response-repository';
import type { OrderClock, OrderIdGenerator } from './order-workflows';
import type {
  RevisedOrderReviewAuditAction,
  RevisedOrderReviewAuditRecord,
  RevisedOrderReviewEventName,
  RevisedOrderReviewOutboxEvent,
  RevisedOrderReviewRepository,
} from './revised-order-review-repository';

export class RevisedOrderReviewNotFound extends Error {
  constructor(id: string) {
    super(`Revised Order review ${id} was not found`);
    this.name = 'RevisedOrderReviewNotFound';
  }
}

export class RevisedOrderReviewAlreadyExists extends Error {
  constructor(versionId: string) {
    super(`Revised Order review already exists for version ${versionId}`);
    this.name = 'RevisedOrderReviewAlreadyExists';
  }
}

export class RevisedOrderReviewVersionConflict extends Error {
  constructor(id: string) {
    super(`Revised Order review ${id} was modified by another operation`);
    this.name = 'RevisedOrderReviewVersionConflict';
  }
}

export class RevisedOrderReviewSourceNotFound extends Error {
  constructor(versionId: string) {
    super(`Revised Order version ${versionId} was not found for the seller`);
    this.name = 'RevisedOrderReviewSourceNotFound';
  }
}

export class RevisedConfirmedOrderVersionNotFound extends Error {
  constructor(id: string) {
    super(`Revised confirmed Order version ${id} was not found`);
    this.name = 'RevisedConfirmedOrderVersionNotFound';
  }
}

function audit(input: {
  readonly ids: OrderIdGenerator;
  readonly review: RevisedOrderReview;
  readonly action: RevisedOrderReviewAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number;
  readonly occurredAt: Date;
}): RevisedOrderReviewAuditRecord {
  return Object.freeze({
    id: input.ids.next('revised-order-review-audit'),
    buyerOrganisationId: input.review.buyerOrganisationId,
    sellerOrganisationId: input.review.sellerOrganisationId,
    orderId: input.review.orderId,
    submittedOrderSnapshotId: input.review.submittedOrderSnapshotId,
    orderAmendmentResponseId: input.review.orderAmendmentResponseId,
    revisedOrderVersionId: input.review.revisedOrderVersionId,
    revisedOrderReviewId: input.review.id,
    action: input.action,
    actorCredentialId: input.actorCredentialId.trim(),
    expectedVersion: input.expectedVersion,
    resultingVersion: input.review.version,
    occurredAt: input.occurredAt.toISOString(),
  });
}

function event(input: {
  readonly ids: OrderIdGenerator;
  readonly review: RevisedOrderReview;
  readonly eventName: RevisedOrderReviewEventName;
  readonly payload?: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: Date;
}): RevisedOrderReviewOutboxEvent {
  return Object.freeze({
    id: input.ids.next('revised-order-review-event'),
    buyerOrganisationId: input.review.buyerOrganisationId,
    sellerOrganisationId: input.review.sellerOrganisationId,
    aggregateId: input.review.id,
    aggregateVersion: input.review.version,
    eventName: input.eventName,
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    occurredAt: input.occurredAt.toISOString(),
  });
}

async function requireSellerRevised(input: {
  readonly responseRepository: OrderAmendmentResponseRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly versionId: string;
}): Promise<RevisedOrderVersion> {
  const revised = await input.responseRepository.findRevisedForSeller(
    input.sellerOrganisationId,
    revisedOrderVersionId(input.versionId),
  );
  if (!revised) throw new RevisedOrderReviewSourceNotFound(input.versionId);
  return revised;
}

async function requireNewReview(input: {
  readonly reviewRepository: RevisedOrderReviewRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly versionId: string;
  readonly expectedVersion: number;
}): Promise<void> {
  if (input.expectedVersion !== 0) {
    throw new RevisedOrderReviewVersionConflict(input.versionId);
  }
  const existing = await input.reviewRepository.findReviewByVersionForSeller(
    input.sellerOrganisationId,
    revisedOrderVersionId(input.versionId),
  );
  if (existing) throw new RevisedOrderReviewAlreadyExists(input.versionId);
}

export async function approveRevisedOrderUseCase(input: {
  readonly responseRepository: OrderAmendmentResponseRepository;
  readonly reviewRepository: RevisedOrderReviewRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly sellerOrganisationId: OrganisationId;
  readonly versionId: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<RevisedOrderReview>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.sellerOrganisationId,
    commandName: 'APPROVE_REVISED_ORDER',
    idempotencyKey: input.idempotencyKey,
    payload: {
      versionId: input.versionId.trim(),
      expectedVersion: input.expectedVersion,
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.reviewRepository.findDecisionReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  await requireNewReview(input);
  const revised = await requireSellerRevised(input);
  const review = approveRevisedOrder(
    createRevisedOrderReview({
      id: input.ids.next('revised-order-review'),
      revised,
      ownerCredentialId: input.actorCredentialId,
      now,
    }),
    revised,
    { actorCredentialId: input.actorCredentialId, now },
  );
  return input.reviewRepository.createDecision(
    review,
    audit({
      ids: input.ids,
      review,
      action: 'REVISED_ORDER_APPROVED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      review,
      eventName: 'REVISED_ORDER_APPROVED',
      payload: { revisedOrderVersionId: revised.id },
      occurredAt: now,
    }),
    command,
  );
}

export async function requestRevisedOrderAmendmentUseCase(input: {
  readonly responseRepository: OrderAmendmentResponseRepository;
  readonly reviewRepository: RevisedOrderReviewRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly sellerOrganisationId: OrganisationId;
  readonly versionId: string;
  readonly expectedVersion: number;
  readonly reason: string;
  readonly lineChanges: readonly ProposedOrderLineChange[];
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<RevisedOrderReview>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.sellerOrganisationId,
    commandName: 'REQUEST_REVISED_ORDER_AMENDMENT',
    idempotencyKey: input.idempotencyKey,
    payload: {
      versionId: input.versionId.trim(),
      expectedVersion: input.expectedVersion,
      reason: input.reason.trim(),
      lineChanges: input.lineChanges,
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.reviewRepository.findDecisionReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  await requireNewReview(input);
  const revised = await requireSellerRevised(input);
  const review = requestRevisedOrderAmendment(
    createRevisedOrderReview({
      id: input.ids.next('revised-order-review'),
      revised,
      ownerCredentialId: input.actorCredentialId,
      now,
    }),
    revised,
    {
      reason: input.reason,
      lineChanges: input.lineChanges,
      actorCredentialId: input.actorCredentialId,
      now,
    },
  );
  return input.reviewRepository.createDecision(
    review,
    audit({
      ids: input.ids,
      review,
      action: 'REVISED_ORDER_AMENDMENT_REQUESTED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      review,
      eventName: 'REVISED_ORDER_AMENDMENT_REQUESTED',
      payload: {
        revisedOrderVersionId: revised.id,
        changedLineCount: review.amendmentRequest?.lineChanges.length ?? 0,
      },
      occurredAt: now,
    }),
    command,
  );
}

export async function confirmApprovedRevisedOrderUseCase(input: {
  readonly responseRepository: OrderAmendmentResponseRepository;
  readonly reviewRepository: RevisedOrderReviewRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly sellerOrganisationId: OrganisationId;
  readonly reviewId: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<RevisedConfirmedOrderVersion>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.sellerOrganisationId,
    commandName: 'CONFIRM_REVISED_ORDER',
    idempotencyKey: input.idempotencyKey,
    payload: {
      reviewId: input.reviewId.trim(),
      expectedVersion: input.expectedVersion,
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.reviewRepository.findConfirmationReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  const current = await input.reviewRepository.findReviewForSeller(
    input.sellerOrganisationId,
    revisedOrderReviewId(input.reviewId),
  );
  if (!current) throw new RevisedOrderReviewNotFound(input.reviewId);
  if (current.version !== input.expectedVersion) {
    throw new RevisedOrderReviewVersionConflict(input.reviewId);
  }
  const revised = await requireSellerRevised({
    responseRepository: input.responseRepository,
    sellerOrganisationId: input.sellerOrganisationId,
    versionId: current.revisedOrderVersionId,
  });
  const result = confirmRevisedOrder(current, revised, {
    confirmedVersionId: input.ids.next('revised-confirmed-order-version'),
    actorCredentialId: input.actorCredentialId,
    now,
  });
  return input.reviewRepository.confirm(
    result.review,
    result.confirmed,
    input.expectedVersion,
    audit({
      ids: input.ids,
      review: result.review,
      action: 'REVISED_ORDER_CONFIRMED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      review: result.review,
      eventName: 'REVISED_ORDER_CONFIRMED',
      payload: {
        confirmedOrderVersionId: result.confirmed.id,
        revisedOrderVersionId: result.confirmed.revisedOrderVersionId,
        totalMinor: result.confirmed.totals.totalMinor,
      },
      occurredAt: now,
    }),
    command,
  );
}

export async function getRevisedOrderReviewForSeller(input: {
  readonly repository: RevisedOrderReviewRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly reviewId: string;
}): Promise<RevisedOrderReview> {
  const review = await input.repository.findReviewForSeller(
    input.sellerOrganisationId,
    revisedOrderReviewId(input.reviewId),
  );
  if (!review) throw new RevisedOrderReviewNotFound(input.reviewId);
  return review;
}

export async function getRevisedOrderReviewForBuyer(input: {
  readonly repository: RevisedOrderReviewRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly reviewId: string;
}): Promise<RevisedOrderReview> {
  const review = await input.repository.findReviewForBuyer(
    input.buyerOrganisationId,
    revisedOrderReviewId(input.reviewId),
  );
  if (!review) throw new RevisedOrderReviewNotFound(input.reviewId);
  return review;
}

export async function getRevisedConfirmedOrderForSeller(input: {
  readonly repository: RevisedOrderReviewRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly versionId: string;
}): Promise<RevisedConfirmedOrderVersion> {
  const confirmed = await input.repository.findConfirmedForSeller(
    input.sellerOrganisationId,
    revisedConfirmedOrderVersionId(input.versionId),
  );
  if (!confirmed) throw new RevisedConfirmedOrderVersionNotFound(input.versionId);
  return confirmed;
}

export async function getRevisedConfirmedOrderForBuyer(input: {
  readonly repository: RevisedOrderReviewRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly versionId: string;
}): Promise<RevisedConfirmedOrderVersion> {
  const confirmed = await input.repository.findConfirmedForBuyer(
    input.buyerOrganisationId,
    revisedConfirmedOrderVersionId(input.versionId),
  );
  if (!confirmed) throw new RevisedConfirmedOrderVersionNotFound(input.versionId);
  return confirmed;
}
