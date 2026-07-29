import type {
  LifecycleCreateCommand,
  LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';
import type { ShowroomId } from '@/modules/showroom';

import type {
  Selection,
  SelectionId,
  ShowroomAccessGrant,
  ShowroomAccessGrantId,
} from '../domain/selection';

export type SelectionAuditAction =
  | 'ACCESS_GRANTED'
  | 'ACCESS_REVOKED'
  | 'SELECTION_CREATED'
  | 'ITEM_ADDED'
  | 'BUDGET_CHANGED'
  | 'SIZE_CURVE_CHANGED'
  | 'MARKED_READY'
  | 'ARCHIVED';

export interface SelectionAuditRecord {
  readonly id: string;
  readonly sellerOrganisationId: OrganisationId;
  readonly buyerOrganisationId: OrganisationId;
  readonly showroomId: ShowroomId;
  readonly accessGrantId: ShowroomAccessGrantId;
  readonly selectionId: SelectionId | null;
  readonly action: SelectionAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly resultingVersion: number;
  readonly occurredAt: string;
}

export type SelectionEventName =
  | 'SHOWROOM_ACCESS_GRANTED'
  | 'SHOWROOM_ACCESS_REVOKED'
  | 'SELECTION_CREATED'
  | 'SELECTION_ITEM_ADDED'
  | 'SELECTION_BUDGET_CHANGED'
  | 'SELECTION_SIZE_CURVE_CHANGED'
  | 'SELECTION_READY'
  | 'SELECTION_ARCHIVED';

export interface SelectionOutboxEvent {
  readonly id: string;
  readonly sellerOrganisationId: OrganisationId;
  readonly buyerOrganisationId: OrganisationId;
  readonly aggregateType: 'SHOWROOM_ACCESS' | 'SELECTION';
  readonly aggregateId: string;
  readonly aggregateVersion: number;
  readonly eventName: SelectionEventName;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: string;
}

export interface SelectionRepository {
  findActiveGrant(
    sellerOrganisationId: OrganisationId,
    showroomId: ShowroomId,
    buyerOrganisationId: OrganisationId,
  ): Promise<ShowroomAccessGrant | null>;
  findGrantForSeller(
    sellerOrganisationId: OrganisationId,
    grantId: ShowroomAccessGrantId,
  ): Promise<ShowroomAccessGrant | null>;
  findGrantForBuyer(
    buyerOrganisationId: OrganisationId,
    grantId: ShowroomAccessGrantId,
  ): Promise<ShowroomAccessGrant | null>;
  listGrantsForBuyer(buyerOrganisationId: OrganisationId): Promise<readonly ShowroomAccessGrant[]>;
  findGrantReplay(command: LifecycleCreateCommand): Promise<ShowroomAccessGrant | null>;
  createGrant(
    grant: ShowroomAccessGrant,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<ShowroomAccessGrant>>;
  updateGrant(
    grant: ShowroomAccessGrant,
    expectedVersion: number,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
  ): Promise<boolean>;

  findSelection(
    buyerOrganisationId: OrganisationId,
    selectionId: SelectionId,
  ): Promise<Selection | null>;
  findSelectionByGrant(
    buyerOrganisationId: OrganisationId,
    grantId: ShowroomAccessGrantId,
  ): Promise<Selection | null>;
  listSelections(buyerOrganisationId: OrganisationId): Promise<readonly Selection[]>;
  findSelectionReplay(command: LifecycleCreateCommand): Promise<Selection | null>;
  createSelection(
    selection: Selection,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<Selection>>;
  updateSelection(
    selection: Selection,
    expectedVersion: number,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
  ): Promise<boolean>;
}
