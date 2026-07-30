import type {
  LifecycleCreateCommand,
  LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type { OrderId, SubmittedOrderSnapshotId } from '../domain/order';
import type {
  ConfirmedOrderVersion,
  ConfirmedOrderVersionId,
  OrderReview,
  OrderReviewId,
} from '../domain/order-review';

export type OrderReviewAuditAction =
  | 'ORDER_APPROVED'
  | 'ORDER_AMENDMENT_REQUESTED'
  | 'ORDER_CONFIRMED';

export interface OrderReviewAuditRecord {
  readonly id: string;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly orderId: OrderId;
  readonly submittedOrderSnapshotId: SubmittedOrderSnapshotId;
  readonly orderReviewId: OrderReviewId;
  readonly action: OrderReviewAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number;
  readonly resultingVersion: number;
  readonly occurredAt: string;
}

export type OrderReviewEventName =
  | 'ORDER_APPROVED'
  | 'ORDER_AMENDMENT_REQUESTED'
  | 'ORDER_CONFIRMED';

export interface OrderReviewOutboxEvent {
  readonly id: string;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly aggregateId: OrderReviewId;
  readonly aggregateVersion: number;
  readonly eventName: OrderReviewEventName;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: string;
}

export interface OrderReviewRepository {
  findReviewForSeller(
    sellerOrganisationId: OrganisationId,
    reviewId: OrderReviewId,
  ): Promise<OrderReview | null>;
  findReviewBySnapshotForSeller(
    sellerOrganisationId: OrganisationId,
    snapshotId: SubmittedOrderSnapshotId,
  ): Promise<OrderReview | null>;
  findReviewForBuyer(
    buyerOrganisationId: OrganisationId,
    reviewId: OrderReviewId,
  ): Promise<OrderReview | null>;
  listReviewsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly OrderReview[]>;
  listReviewsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly OrderReview[]>;
  findDecisionReplay(command: LifecycleCreateCommand): Promise<OrderReview | null>;
  createDecision(
    review: OrderReview,
    audit: OrderReviewAuditRecord,
    event: OrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<OrderReview>>;
  findConfirmationReplay(
    command: LifecycleCreateCommand,
  ): Promise<ConfirmedOrderVersion | null>;
  confirm(
    review: OrderReview,
    confirmed: ConfirmedOrderVersion,
    expectedVersion: number,
    audit: OrderReviewAuditRecord,
    event: OrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<ConfirmedOrderVersion>>;
  findConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: ConfirmedOrderVersionId,
  ): Promise<ConfirmedOrderVersion | null>;
  findConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
    versionId: ConfirmedOrderVersionId,
  ): Promise<ConfirmedOrderVersion | null>;
  listConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly ConfirmedOrderVersion[]>;
  listConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly ConfirmedOrderVersion[]>;
}
