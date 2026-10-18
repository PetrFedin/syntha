import {
  lifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import {
  approveOrder,
  confirmOrder,
  confirmedOrderVersionId,
  createOrderReview,
  orderReviewId,
  requestOrderAmendment,
  type ConfirmedOrderVersion,
  type OrderReview,
  type ProposedOrderLineChange,
} from '../domain/order-review';
import { submittedOrderSnapshotId, type SubmittedOrderSnapshot } from '../domain/order';
import type { OrderClock, OrderIdGenerator } from './order-workflows';
import type { OrderRepository } from './order-repository';
import type {
  OrderReviewAuditAction,
  OrderReviewAuditRecord,
  OrderReviewEventName,
  OrderReviewOutboxEvent,
  OrderReviewRepository,
} from './order-review-repository';

export class OrderReviewNotFound extends Error {
  constructor(id: string) {
    super(`Order review ${id} was not found`);
    this.name = 'OrderReviewNotFound';
  }
}

export class OrderReviewAlreadyExists extends Error {
  constructor(snapshotId: string) {
    super(`Order review already exists for submitted snapshot ${snapshotId}`);
    this.name = 'OrderReviewAlreadyExists';
  }
}

export class OrderReviewVersionConflict extends Error {
  constructor(id: string) {
    super(`Order review ${id} was modified by another operation`);
    this.name = 'OrderReviewVersionConflict';
  }
}

export class OrderReviewSourceNotFound extends Error {
  constructor(snapshotId: string) {
    super(`Submitted Order snapshot ${snapshotId} was not found for the seller`);
    this.name = 'OrderReviewSourceNotFound';
  }
}

export class ConfirmedOrderVersionNotFound extends Error {
  constructor(id: string) {
    super(`Confirmed Order version ${id} was not found`);
    this.name = 'ConfirmedOrderVersionNotFound';
  }
}

function audit(input: {
  readonly ids: OrderIdGenerator;
  readonly review: OrderReview;
  readonly action: OrderReviewAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number;
  readonly occurredAt: Date;
}): OrderReviewAuditRecord {
  return Object.freeze({
    id: input.ids.next('order-review-audit'),
    buyerOrganisationId: input.review.buyerOrganisationId,
    sellerOrganisationId: input.review.sellerOrganisationId,
    orderId: input.review.orderId,
    submittedOrderSnapshotId: input.review.submittedOrderSnapshotId,
    orderReviewId: input.review.id,
    action: input.action,
    actorCredentialId: input.actorCredentialId.trim(),
    expectedVersion: input.expectedVersion,
    resultingVersion: input.review.version,
    occurredAt: input.occurredAt.toISOString(),
  });
}

function event(input: {
  readonly ids: OrderIdGenerator;
  readonly review: OrderReview;
  readonly eventName: OrderReviewEventName;
  readonly payload?: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: Date;
}): OrderReviewOutboxEvent {
  return Object.freeze({
    id: input.ids.next('order-review-event'),
    buyerOrganisationId: input.review.buyerOrganisationId,
    sellerOrganisationId: input.review.sellerOrganisationId,
    aggregateId: input.review.id,
    aggregateVersion: input.review.version,
    eventName: input.eventName,
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    occurredAt: input.occurredAt.toISOString(),
  });
}

async function requireSellerSnapshot(input: {
  readonly orderRepository: OrderRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly snapshotId: string;
}): Promise<SubmittedOrderSnapshot> {
  const snapshot = await input.orderRepository.findSubmittedSnapshotForSeller(
    input.sellerOrganisationId,
    submittedOrderSnapshotId(input.snapshotId),
  );
  if (!snapshot) throw new OrderReviewSourceNotFound(input.snapshotId);
  return snapshot;
}

async function requireNewReview(input: {
  readonly reviewRepository: OrderReviewRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly snapshotId: string;
  readonly expectedVersion: number;
}): Promise<void> {
  if (input.expectedVersion !== 0) {
    throw new OrderReviewVersionConflict(input.snapshotId);
  }
  const existing = await input.reviewRepository.findReviewBySnapshotForSeller(
    input.sellerOrganisationId,
    submittedOrderSnapshotId(input.snapshotId),
  );
  if (existing) throw new OrderReviewAlreadyExists(input.snapshotId);
}

export async function approveSubmittedOrderUseCase(input: {
  readonly orderRepository: OrderRepository;
  readonly reviewRepository: OrderReviewRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly sellerOrganisationId: OrganisationId;
  readonly snapshotId: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<OrderReview>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.sellerOrganisationId,
    commandName: 'APPROVE_ORDER',
    idempotencyKey: input.idempotencyKey,
    payload: {
      snapshotId: input.snapshotId.trim(),
      expectedVersion: input.expectedVersion,
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.reviewRepository.findDecisionReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  await requireNewReview(input);
  const snapshot = await requireSellerSnapshot(input);
  const review = approveOrder(
    createOrderReview({
      id: input.ids.next('order-review'),
      snapshot,
      ownerCredentialId: input.actorCredentialId,
      now,
    }),
    { actorCredentialId: input.actorCredentialId, now },
  );
  return input.reviewRepository.createDecision(
    review,
    audit({
      ids: input.ids,
      review,
      action: 'ORDER_APPROVED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      review,
      eventName: 'ORDER_APPROVED',
      payload: { submittedOrderSnapshotId: snapshot.id },
      occurredAt: now,
    }),
    command,
  );
}

export async function requestOrderAmendmentUseCase(input: {
  readonly orderRepository: OrderRepository;
  readonly reviewRepository: OrderReviewRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly sellerOrganisationId: OrganisationId;
  readonly snapshotId: string;
  readonly expectedVersion: number;
  readonly reason: string;
  readonly lineChanges: readonly ProposedOrderLineChange[];
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<OrderReview>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.sellerOrganisationId,
    commandName: 'REQUEST_ORDER_AMENDMENT',
    idempotencyKey: input.idempotencyKey,
    payload: {
      snapshotId: input.snapshotId.trim(),
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
  const snapshot = await requireSellerSnapshot(input);
  const review = requestOrderAmendment(
    createOrderReview({
      id: input.ids.next('order-review'),
      snapshot,
      ownerCredentialId: input.actorCredentialId,
      now,
    }),
    snapshot,
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
      action: 'ORDER_AMENDMENT_REQUESTED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      review,
      eventName: 'ORDER_AMENDMENT_REQUESTED',
      payload: {
        submittedOrderSnapshotId: snapshot.id,
        changedLineCount: review.amendmentRequest?.lineChanges.length ?? 0,
      },
      occurredAt: now,
    }),
    command,
  );
}

export async function confirmApprovedOrderUseCase(input: {
  readonly orderRepository: OrderRepository;
  readonly reviewRepository: OrderReviewRepository;
  readonly clock: OrderClock;
  readonly ids: OrderIdGenerator;
  readonly sellerOrganisationId: OrganisationId;
  readonly reviewId: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<ConfirmedOrderVersion>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.sellerOrganisationId,
    commandName: 'CONFIRM_ORDER',
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
    orderReviewId(input.reviewId),
  );
  if (!current) throw new OrderReviewNotFound(input.reviewId);
  if (current.version !== input.expectedVersion) {
    throw new OrderReviewVersionConflict(input.reviewId);
  }
  const snapshot = await requireSellerSnapshot({
    orderRepository: input.orderRepository,
    sellerOrganisationId: input.sellerOrganisationId,
    snapshotId: current.submittedOrderSnapshotId,
  });
  const result = confirmOrder(current, snapshot, {
    confirmedVersionId: input.ids.next('confirmed-order-version'),
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
      action: 'ORDER_CONFIRMED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
    event({
      ids: input.ids,
      review: result.review,
      eventName: 'ORDER_CONFIRMED',
      payload: {
        confirmedOrderVersionId: result.confirmed.id,
        submittedOrderSnapshotId: result.confirmed.submittedOrderSnapshotId,
        totalMinor: result.confirmed.totals.totalMinor,
      },
      occurredAt: now,
    }),
    command,
  );
}

export async function getOrderReviewForSeller(input: {
  readonly repository: OrderReviewRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly reviewId: string;
}): Promise<OrderReview> {
  const review = await input.repository.findReviewForSeller(
    input.sellerOrganisationId,
    orderReviewId(input.reviewId),
  );
  if (!review) throw new OrderReviewNotFound(input.reviewId);
  return review;
}

export async function getOrderReviewForBuyer(input: {
  readonly repository: OrderReviewRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly reviewId: string;
}): Promise<OrderReview> {
  const review = await input.repository.findReviewForBuyer(
    input.buyerOrganisationId,
    orderReviewId(input.reviewId),
  );
  if (!review) throw new OrderReviewNotFound(input.reviewId);
  return review;
}

export async function listOrderReviewsForSeller(input: {
  readonly repository: OrderReviewRepository;
  readonly sellerOrganisationId: OrganisationId;
}): Promise<readonly OrderReview[]> {
  return input.repository.listReviewsForSeller(input.sellerOrganisationId);
}

export async function listOrderReviewsForBuyer(input: {
  readonly repository: OrderReviewRepository;
  readonly buyerOrganisationId: OrganisationId;
}): Promise<readonly OrderReview[]> {
  return input.repository.listReviewsForBuyer(input.buyerOrganisationId);
}

export async function getConfirmedOrderForSeller(input: {
  readonly repository: OrderReviewRepository;
  readonly sellerOrganisationId: OrganisationId;
  readonly versionId: string;
}): Promise<ConfirmedOrderVersion> {
  const confirmed = await input.repository.findConfirmedForSeller(
    input.sellerOrganisationId,
    confirmedOrderVersionId(input.versionId),
  );
  if (!confirmed) throw new ConfirmedOrderVersionNotFound(input.versionId);
  return confirmed;
}

export async function getConfirmedOrderForBuyer(input: {
  readonly repository: OrderReviewRepository;
  readonly buyerOrganisationId: OrganisationId;
  readonly versionId: string;
}): Promise<ConfirmedOrderVersion> {
  const confirmed = await input.repository.findConfirmedForBuyer(
    input.buyerOrganisationId,
    confirmedOrderVersionId(input.versionId),
  );
  if (!confirmed) throw new ConfirmedOrderVersionNotFound(input.versionId);
  return confirmed;
}

export async function listConfirmedOrdersForSeller(input: {
  readonly repository: OrderReviewRepository;
  readonly sellerOrganisationId: OrganisationId;
}): Promise<readonly ConfirmedOrderVersion[]> {
  return input.repository.listConfirmedForSeller(input.sellerOrganisationId);
}

export async function listConfirmedOrdersForBuyer(input: {
  readonly repository: OrderReviewRepository;
  readonly buyerOrganisationId: OrganisationId;
}): Promise<readonly ConfirmedOrderVersion[]> {
  return input.repository.listConfirmedForBuyer(input.buyerOrganisationId);
}
