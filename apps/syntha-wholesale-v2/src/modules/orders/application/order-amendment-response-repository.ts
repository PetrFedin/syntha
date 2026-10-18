import type {
  LifecycleCreateCommand,
  LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type { OrderId, SubmittedOrderSnapshotId } from '../domain/order';
import type {
  OrderAmendmentResponse,
  OrderAmendmentResponseId,
  RevisedOrderVersion,
  RevisedOrderVersionId,
} from '../domain/order-amendment-response';
import type { OrderReviewId } from '../domain/order-review';

export type OrderAmendmentResponseAuditAction =
  | 'ORDER_AMENDMENT_ACCEPTED'
  | 'ORDER_AMENDMENT_COUNTERED'
  | 'ORDER_AMENDMENT_REJECTED';

export interface OrderAmendmentResponseAuditRecord {
  readonly id: string;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly orderId: OrderId;
  readonly submittedOrderSnapshotId: SubmittedOrderSnapshotId;
  readonly orderReviewId: OrderReviewId;
  readonly orderAmendmentResponseId: OrderAmendmentResponseId;
  readonly action: OrderAmendmentResponseAuditAction;
  readonly actorCredentialId: string;
  readonly expectedReviewVersion: number;
  readonly resultingResponseVersion: number;
  readonly occurredAt: string;
}

export type OrderAmendmentResponseEventName =
  | 'ORDER_AMENDMENT_ACCEPTED'
  | 'ORDER_AMENDMENT_COUNTERED'
  | 'ORDER_AMENDMENT_REJECTED';

export interface OrderAmendmentResponseOutboxEvent {
  readonly id: string;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly aggregateId: OrderAmendmentResponseId;
  readonly aggregateVersion: number;
  readonly eventName: OrderAmendmentResponseEventName;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: string;
}

export interface OrderAmendmentResponseRepository {
  findCreateReplay(
    command: LifecycleCreateCommand,
  ): Promise<OrderAmendmentResponse | null>;
  findResponseForBuyer(
    buyerOrganisationId: OrganisationId,
    responseId: OrderAmendmentResponseId,
  ): Promise<OrderAmendmentResponse | null>;
  findResponseForSeller(
    sellerOrganisationId: OrganisationId,
    responseId: OrderAmendmentResponseId,
  ): Promise<OrderAmendmentResponse | null>;
  findResponseByReviewForBuyer(
    buyerOrganisationId: OrganisationId,
    reviewId: OrderReviewId,
  ): Promise<OrderAmendmentResponse | null>;
  findResponseByReviewForSeller(
    sellerOrganisationId: OrganisationId,
    reviewId: OrderReviewId,
  ): Promise<OrderAmendmentResponse | null>;
  createResponse(
    response: OrderAmendmentResponse,
    revised: RevisedOrderVersion | null,
    audit: OrderAmendmentResponseAuditRecord,
    event: OrderAmendmentResponseOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<OrderAmendmentResponse>>;
  findRevisedForBuyer(
    buyerOrganisationId: OrganisationId,
    versionId: RevisedOrderVersionId,
  ): Promise<RevisedOrderVersion | null>;
  findRevisedForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: RevisedOrderVersionId,
  ): Promise<RevisedOrderVersion | null>;
  listResponsesForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly OrderAmendmentResponse[]>;
  listResponsesForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly OrderAmendmentResponse[]>;
  listRevisedForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderVersion[]>;
  listRevisedForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderVersion[]>;
}
