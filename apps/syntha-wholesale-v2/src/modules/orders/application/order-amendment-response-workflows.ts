import {
  lifecycleCreateCommand,
  type LifecycleCreateCommandName,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import {
  acceptOrderAmendment,
  counterOrderAmendment,
  orderAmendmentResponseId,
  rejectOrderAmendment,
  revisedOrderVersionId,
  type OrderAmendmentResponse,
  type OrderAmendmentResponseId,
  type RevisedOrderVersion,
  type RevisedOrderVersionId,
} from '../domain/order-amendment-response';
import {
  orderReviewId,
  type OrderReview,
  type ProposedOrderLineChange,
} from '../domain/order-review';
import {
  submittedOrderSnapshotId,
  type SubmittedOrderSnapshot,
} from '../domain/order';
import type {
  OrderAmendmentResponseAuditAction,
  OrderAmendmentResponseAuditRecord,
  OrderAmendmentResponseEventName,
  OrderAmendmentResponseOutboxEvent,
  OrderAmendmentResponseRepository,
} from './order-amendment-response-repository';
import type { OrderRepository } from './order-repository';
import type { OrderReviewRepository } from './order-review-repository';
import type { OrderClock, OrderIdGenerator } from './order-workflows';

export class OrderAmendmentResponseNotFound extends Error {
  constructor(id: string) {
    super(`Order amendment response ${id} was not found`);
    this.name = 'OrderAmendmentResponseNotFound';
  }
}

export class OrderAmendmentResponseAlreadyExists extends Error {
  constructor(reviewId: string) {
    super(`Order amendment response already exists for review ${reviewId}`);
    this.name = 'OrderAmendmentResponseAlreadyExists';
  }
}

export class OrderAmendmentResponseSourceNotFound extends Error {
  constructor(reviewId: string) {
    super(`Amendment-requested Order review ${reviewId} was not found for the buyer`);
    this.name = 'OrderAmendmentResponseSourceNotFound';
  }
}

export class OrderAmendmentResponseVersionConflict extends Error {
  constructor(reviewId: string) {
    super(`Order review ${reviewId} was modified before the buyer response`);
    this.name = 'OrderAmendmentResponseVersionConflict';
  }
}

export class RevisedOrderVersionNotFound extends Error {
  constructor(id: string) {
    super(`Revised Order version ${id} was not found`);
    this.name = 'RevisedOrderVersionNotFound';
  }
}

function audit(input: {
  readonly ids: OrderIdGenerator;
  readonly response: OrderAmendmentResponse;
  readonly action: OrderAmendmentResponseAuditAction;
  readonly actorCredentialId: string;
  readonly expectedReviewVersion: number;
  readonly occurredAt: Date;
}): OrderAmendmentResponseAuditRecord {
  return Object.freeze({
    id: input.ids.next('order-amendment-response-audit'),
    buyerOrganisationId: input.response.buyerOrganisationId,
    sellerOrganisationId: input.response.sellerOrganisationId,
    orderId: input.response.orderId,
    submittedOrderSnapshotId: input.response.submittedOrderSnapshotId,
    orderReviewId: input.response.orderReviewId,
    orderAmendmentResponseId: input.response.id,
    action: input.action,
    actorCredentialId: input.actorCredentialId.trim(),
    expectedReviewVersion: input.expectedReviewVersion,
    resultingResponseVersion: input.response.version,
    occurredAt: input.occurredAt.toISOString(),
  });
}

function event(input: {
  readonly ids: OrderIdGenerator;
  readonly response: OrderAmendmentResponse;
  readonly eventName: OrderAmendmentResponseEventName;
  readonly occurredAt: Date;
}): OrderAmendmentResponseOutboxEvent {
  return Object.freeze({
    id: input.ids.next('order-amendment-response-event'),
    buyerOrganisationId: input.response.buyerOrganisationId,
    sellerOrganisationId: input.response.sellerOrganisationId,
    aggregateId: input.response.id,
    aggregateVersion: input.response.version,
    eventName: input.eventName,
    payload: Object.freeze({
      orderReviewId: input.response.orderReviewId,
      submittedOrderSnapshotId: input.response.submittedOrderSnapshotId,
      decision: input.response.decision,
      revisedOrderVersionId: input.response.revisedOrderVersionId ?? null,
    }),
    occurredAt: input.occurredAt.toISOString(),
  });
}

async function requireBuyerSource(input: {
  readonly orderRepository: OrderRepository;
  readonly reviewRepository: OrderReviewRepository;
  readonly responseRepository: OrderAmendmentResponseRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly reviewId: string;
  readonly expectedReviewVersion: number;
}): Promise<{
  readonly review: OrderReview;
  readonly snapshot: SubmittedOrderSnapshot;
}> {
  const review = await input.reviewRepository.findReviewForBuyer(
    input.buyerOrganisationId,
    orderReviewId(input.reviewId),
  );
  if (!review || review.status !== 'AMENDMENT_REQUESTED' || !review.amendmentRequest) {
    throw new OrderAmendmentResponseSourceNotFound(input.reviewId);
  }
  if (review.version !== input.expectedReviewVersion) {
    throw new OrderAmendmentResponseVersionConflict(input.reviewId);
  }
  const existing = await input.responseRepository.findResponseByReviewForBuyer(
    input.buyerOrganisationId,
    review.id,
  );
  if (existing) throw new OrderAmendmentResponseAlreadyExists(input.reviewId);
  const snapshot = await input.orderRepository.findSubmittedSnapshotForBuyer(
    input.buyerOrganisationId,
    submittedOrderSnapshotId(review.submittedOrderSnapshotId),
  );
  if (!snapshot) throw new OrderAmendmentResponseSourceNotFound(input.reviewId);
  return Object.freeze({ review, snapshot });
}

async function respond(input: {
  readonly orderRepository: OrderRepository;
  readonly reviewRepository: OrderReviewRepository;
  readonly responseRepository: OrderAmendmentResponseRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly reviewId: string;
  readonly expectedReviewVersion: number;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
  readonly commandName: LifecycleCreateCommandName;
  readonly action: OrderAmendmentResponseAuditAction;
  readonly eventName: OrderAmendmentResponseEventName;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly build: (source: {
    readonly review: OrderReview;
    readonly snapshot: SubmittedOrderSnapshot;
    readonly responseId: string;
    readonly revisedVersionId: string;
    readonly now: Date;
  }) => {
    readonly response: OrderAmendmentResponse;
    readonly revised: RevisedOrderVersion | null;
  };
}): Promise<LifecycleCreateResult<OrderAmendmentResponse>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.buyerOrganisationId,
    commandName: input.commandName,
    idempotencyKey: input.idempotencyKey,
    payload: {
      reviewId: input.reviewId.trim(),
      expectedReviewVersion: input.expectedReviewVersion,
      ...input.payload,
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.responseRepository.findCreateReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  const source = await requireBuyerSource(input);
  const built = input.build({
    ...source,
    responseId: input.ids.next('order-amendment-response'),
    revisedVersionId: input.ids.next('revised-order-version'),
    now,
  });
  return input.responseRepository.createResponse(
    built.response,
    built.revised,
    audit({
      ids: input.ids,
      response: built.response,
      action: input.action,
      actorCredentialId: input.actorCredentialId,
      expectedReviewVersion: input.expectedReviewVersion,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      response: built.response,
      eventName: input.eventName,
      occurredAt: now,
    }),
    command,
  );
}

export async function acceptOrderAmendmentUseCase(input: {
  readonly orderRepository: OrderRepository;
  readonly reviewRepository: OrderReviewRepository;
  readonly responseRepository: OrderAmendmentResponseRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly reviewId: string;
  readonly expectedReviewVersion: number;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<OrderAmendmentResponse>> {
  return respond({
    ...input,
    commandName: 'ACCEPT_ORDER_AMENDMENT',
    action: 'ORDER_AMENDMENT_ACCEPTED',
    eventName: 'ORDER_AMENDMENT_ACCEPTED',
    payload: {},
    build: ({ review, snapshot, responseId, revisedVersionId, now }) => {
      const built = acceptOrderAmendment({
        responseId,
        revisedVersionId,
        review,
        snapshot,
        actorCredentialId: input.actorCredentialId,
        now,
      });
      return Object.freeze({ response: built.response, revised: built.revised });
    },
  });
}

export async function counterOrderAmendmentUseCase(input: {
  readonly orderRepository: OrderRepository;
  readonly reviewRepository: OrderReviewRepository;
  readonly responseRepository: OrderAmendmentResponseRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly reviewId: string;
  readonly expectedReviewVersion: number;
  readonly reason: string;
  readonly lineChanges: readonly ProposedOrderLineChange[];
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<OrderAmendmentResponse>> {
  return respond({
    ...input,
    commandName: 'COUNTER_ORDER_AMENDMENT',
    action: 'ORDER_AMENDMENT_COUNTERED',
    eventName: 'ORDER_AMENDMENT_COUNTERED',
    payload: { reason: input.reason.trim(), lineChanges: input.lineChanges },
    build: ({ review, snapshot, responseId, revisedVersionId, now }) => {
      const built = counterOrderAmendment({
        responseId,
        revisedVersionId,
        review,
        snapshot,
        reason: input.reason,
        lineChanges: input.lineChanges,
        actorCredentialId: input.actorCredentialId,
        now,
      });
      return Object.freeze({ response: built.response, revised: built.revised });
    },
  });
}

export async function rejectOrderAmendmentUseCase(input: {
  readonly orderRepository: OrderRepository;
  readonly reviewRepository: OrderReviewRepository;
  readonly responseRepository: OrderAmendmentResponseRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly buyerOrganisationId: OrganisationId;
  readonly reviewId: string;
  readonly expectedReviewVersion: number;
  readonly reason: string;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<OrderAmendmentResponse>> {
  return respond({
    ...input,
    commandName: 'REJECT_ORDER_AMENDMENT',
    action: 'ORDER_AMENDMENT_REJECTED',
    eventName: 'ORDER_AMENDMENT_REJECTED',
    payload: { reason: input.reason.trim() },
    build: ({ review, snapshot, responseId, now }) =>
      Object.freeze({
        response: rejectOrderAmendment({
          responseId,
          review,
          snapshot,
          reason: input.reason,
          actorCredentialId: input.actorCredentialId,
          now,
        }),
        revised: null,
      }),
  });
}

export async function getOrderAmendmentResponseForBuyer(input: {
  readonly repository: OrderAmendmentResponseRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly responseId: string;
}): Promise<OrderAmendmentResponse> {
  const response = await input.repository.findResponseForBuyer(
    input.buyerOrganisationId,
    orderAmendmentResponseId(input.responseId),
  );
  if (!response) throw new OrderAmendmentResponseNotFound(input.responseId);
  return response;
}

export async function getOrderAmendmentResponseForSeller(input: {
  readonly repository: OrderAmendmentResponseRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly responseId: string;
}): Promise<OrderAmendmentResponse> {
  const response = await input.repository.findResponseForSeller(
    input.sellerOrganisationId,
    orderAmendmentResponseId(input.responseId),
  );
  if (!response) throw new OrderAmendmentResponseNotFound(input.responseId);
  return response;
}

export async function getRevisedOrderForBuyer(input: {
  readonly repository: OrderAmendmentResponseRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly versionId: string;
}): Promise<RevisedOrderVersion> {
  const revised = await input.repository.findRevisedForBuyer(
    input.buyerOrganisationId,
    revisedOrderVersionId(input.versionId),
  );
  if (!revised) throw new RevisedOrderVersionNotFound(input.versionId);
  return revised;
}

export async function getRevisedOrderForSeller(input: {
  readonly repository: OrderAmendmentResponseRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly versionId: string;
}): Promise<RevisedOrderVersion> {
  const revised = await input.repository.findRevisedForSeller(
    input.sellerOrganisationId,
    revisedOrderVersionId(input.versionId),
  );
  if (!revised) throw new RevisedOrderVersionNotFound(input.versionId);
  return revised;
}
