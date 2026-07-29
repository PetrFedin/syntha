import type {
  LifecycleCreateCommand,
  LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';
import type { SelectionId, ShowroomAccessGrantId } from '@/modules/selection';
import type { ShowroomSnapshotId } from '@/modules/showroom';

import type {
  CommercialOrder,
  OrderId,
  SubmittedOrderSnapshot,
  SubmittedOrderSnapshotId,
} from '../domain/order';

export type OrderAuditAction =
  | 'DRAFT_CREATED'
  | 'LINE_QUANTITY_CHANGED'
  | 'LINE_TERMS_CHANGED'
  | 'ORDER_SUBMITTED';

export interface OrderAuditRecord {
  readonly id: string;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly selectionId: SelectionId;
  readonly showroomAccessGrantId: ShowroomAccessGrantId;
  readonly showroomSnapshotId: ShowroomSnapshotId;
  readonly orderId: OrderId;
  readonly action: OrderAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly resultingVersion: number;
  readonly occurredAt: string;
}

export type OrderEventName =
  | 'ORDER_DRAFT_CREATED'
  | 'ORDER_LINE_QUANTITY_CHANGED'
  | 'ORDER_LINE_TERMS_CHANGED'
  | 'ORDER_SUBMITTED';

export interface OrderOutboxEvent {
  readonly id: string;
  readonly buyerOrganisationId: OrganisationId;
  readonly sellerOrganisationId: OrganisationId;
  readonly aggregateId: OrderId;
  readonly aggregateVersion: number;
  readonly eventName: OrderEventName;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: string;
}

export interface OrderRepository {
  findOrder(
    buyerOrganisationId: OrganisationId,
    orderId: OrderId,
  ): Promise<CommercialOrder | null>;
  findOrderBySelection(
    buyerOrganisationId: OrganisationId,
    selectionId: SelectionId,
  ): Promise<CommercialOrder | null>;
  listBuyerOrders(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly CommercialOrder[]>;
  findCreateReplay(command: LifecycleCreateCommand): Promise<CommercialOrder | null>;
  createOrder(
    order: CommercialOrder,
    audit: OrderAuditRecord,
    event: OrderOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<CommercialOrder>>;
  updateOrder(
    order: CommercialOrder,
    expectedVersion: number,
    audit: OrderAuditRecord,
    event: OrderOutboxEvent,
  ): Promise<boolean>;
  findSubmitReplay(
    command: LifecycleCreateCommand,
  ): Promise<SubmittedOrderSnapshot | null>;
  submitOrder(
    order: CommercialOrder,
    snapshot: SubmittedOrderSnapshot,
    expectedVersion: number,
    audit: OrderAuditRecord,
    event: OrderOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<SubmittedOrderSnapshot>>;
  findSubmittedSnapshotForBuyer(
    buyerOrganisationId: OrganisationId,
    snapshotId: SubmittedOrderSnapshotId,
  ): Promise<SubmittedOrderSnapshot | null>;
  findSubmittedSnapshotForSeller(
    sellerOrganisationId: OrganisationId,
    snapshotId: SubmittedOrderSnapshotId,
  ): Promise<SubmittedOrderSnapshot | null>;
  listSubmittedSnapshotsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly SubmittedOrderSnapshot[]>;
  listSubmittedSnapshotsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly SubmittedOrderSnapshot[]>;
}
