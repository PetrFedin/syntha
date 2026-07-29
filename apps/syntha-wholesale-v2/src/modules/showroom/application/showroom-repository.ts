import type { CollectionId } from '@/modules/collections';
import type {
  LifecycleCreateCommand,
  LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type {
  Showroom,
  ShowroomId,
  ShowroomPublicationSnapshot,
} from '../domain/showroom';

export type ShowroomAuditAction = 'CREATED' | 'UPDATED' | 'PUBLISHED' | 'ARCHIVED';

export interface ShowroomAuditRecord {
  readonly id: string;
  readonly organisationId: OrganisationId;
  readonly showroomId: ShowroomId;
  readonly action: ShowroomAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly resultingVersion: number;
  readonly snapshotId: string | null;
  readonly occurredAt: string;
}

export interface ShowroomPublishedEvent {
  readonly id: string;
  readonly organisationId: OrganisationId;
  readonly aggregateId: ShowroomId;
  readonly aggregateVersion: number;
  readonly eventName: 'SHOWROOM_PUBLISHED';
  readonly payload: Readonly<{
    showroomId: ShowroomId;
    snapshotId: string;
    collectionId: CollectionId;
    publishedByCredentialId: string;
  }>;
  readonly occurredAt: string;
}

export interface ShowroomRepository {
  findById(organisationId: OrganisationId, id: ShowroomId): Promise<Showroom | null>;
  findByCode(
    organisationId: OrganisationId,
    collectionId: CollectionId,
    code: string,
  ): Promise<Showroom | null>;
  listByCollection(
    organisationId: OrganisationId,
    collectionId: CollectionId,
  ): Promise<readonly Showroom[]>;
  findPublicationSnapshot(
    organisationId: OrganisationId,
    showroomId: ShowroomId,
  ): Promise<ShowroomPublicationSnapshot | null>;
  findCreateReplay(command: LifecycleCreateCommand): Promise<Showroom | null>;
  create(
    showroom: Showroom,
    audit: ShowroomAuditRecord,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<Showroom>>;
  update(
    showroom: Showroom,
    expectedVersion: number,
    audit: ShowroomAuditRecord,
  ): Promise<boolean>;
  findPublishReplay(command: LifecycleCreateCommand): Promise<ShowroomPublicationSnapshot | null>;
  publish(
    showroom: Showroom,
    snapshot: ShowroomPublicationSnapshot,
    expectedVersion: number,
    audit: ShowroomAuditRecord,
    event: ShowroomPublishedEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<ShowroomPublicationSnapshot> | null>;
}
