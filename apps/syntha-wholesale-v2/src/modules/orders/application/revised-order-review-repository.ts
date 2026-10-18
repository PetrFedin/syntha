import type {
  LifecycleCreateCommand,
  LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type { OrderId, SubmittedOrderSnapshotId } from '../domain/order';
import type {
  OrderAmendmentResponseId,
  RevisedOrderVersionId,
} from '../domain/order-amendment-response';
import type {
  RevisedConfirmedOrderVersion,
  RevisedConfirmedOrderVersionId,
  RevisedOrderReview,
  RevisedOrderReviewId,
} from '../domain/revised-order-review';

export type RevisedOrderReviewAuditAction =
  | 'REVISED_ORDER_APPROVED'
  | 'REVISED_ORDER_AMENDMENT_REQUESTED'
  | 'REVISED_ORDER_CONFIRMED';

export interface RevisedOrderReviewAuditRecord {
  readonly id: string;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly orderId: OrderId;
  readonly submittedOrderSnapshotId: SubmittedOrderSnapshotId;
  readonly orderAmendmentResponseId: OrderAmendmentResponseId;
  readonly revisedOrderVersionId: RevisedOrderVersionId;
  readonly revisedOrderReviewId: RevisedOrderReviewId;
  readonly action: RevisedOrderReviewAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number;
  readonly resultingVersion: number;
  readonly occurredAt: string;
}

export type RevisedOrderReviewEventName =
  | 'REVISED_ORDER_APPROVED'
  | 'REVISED_ORDER_AMENDMENT_REQUESTED'
  | 'REVISED_ORDER_CONFIRMED';

export interface RevisedOrderReviewOutboxEvent {
  readonly id: string;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly aggregateId: RevisedOrderReviewId;
  readonly aggregateVersion: number;
  readonly eventName: RevisedOrderReviewEventName;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: string;
}

export interface RevisedOrderReviewRepository {
  findReviewForSeller(
    sellerOrganisationId: OrganisationId,
    reviewId: RevisedOrderReviewId,
  ): Promise<RevisedOrderReview | null>;
  findReviewByVersionForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: RevisedOrderVersionId,
  ): Promise<RevisedOrderReview | null>;
  findReviewForBuyer(
    buyerOrganisationId: OrganisationId,
    reviewId: RevisedOrderReviewId,
  ): Promise<RevisedOrderReview | null>;
  listReviewsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderReview[]>;
  listReviewsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderReview[]>;
  findDecisionReplay(
    command: LifecycleCreateCommand,
  ): Promise<RevisedOrderReview | null>;
  createDecision(
    review: RevisedOrderReview,
    audit: RevisedOrderReviewAuditRecord,
    event: RevisedOrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<RevisedOrderReview>>;
  findConfirmationReplay(
    command: LifecycleCreateCommand,
  ): Promise<RevisedConfirmedOrderVersion | null>;
  confirm(
    review: RevisedOrderReview,
    confirmed: RevisedConfirmedOrderVersion,
    expectedVersion: number,
    audit: RevisedOrderReviewAuditRecord,
    event: RevisedOrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<RevisedConfirmedOrderVersion>>;
  findConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: RevisedConfirmedOrderVersionId,
  ): Promise<RevisedConfirmedOrderVersion | null>;
  findConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
    versionId: RevisedConfirmedOrderVersionId,
  ): Promise<RevisedConfirmedOrderVersion | null>;
  listConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedConfirmedOrderVersion[]>;
  listConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedConfirmedOrderVersion[]>;
}
