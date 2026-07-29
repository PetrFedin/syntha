import {
  getCollection,
  type CollectionRepository,
} from '@/modules/collections';
import {
  lifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import {
  archiveShowroom,
  createShowroom,
  publishShowroom,
  reviseShowroom,
  showroomId,
  type Showroom,
  type ShowroomPublicationSnapshot,
} from '../domain/showroom';
import type {
  ShowroomAuditAction,
  ShowroomAuditRecord,
  ShowroomPublishedEvent,
  ShowroomRepository,
} from './showroom-repository';

export interface ShowroomClock {
  now(): Date;
}

export interface ShowroomIdGenerator {
  next(prefix: string): string;
}

export class ShowroomAlreadyExists extends Error {
  constructor(code: string) {
    super(`Showroom with code ${code} already exists in the Collection`);
    this.name = 'ShowroomAlreadyExists';
  }
}

export class ShowroomNotFound extends Error {
  constructor(id: string) {
    super(`Showroom ${id} was not found`);
    this.name = 'ShowroomNotFound';
  }
}

export class ShowroomVersionConflict extends Error {
  constructor(id: string) {
    super(`Showroom ${id} was modified by another operation`);
    this.name = 'ShowroomVersionConflict';
  }
}

export class CollectionDoesNotAcceptShowrooms extends Error {
  constructor(id: string) {
    super(`Collection ${id} does not accept new Showrooms in its current status`);
    this.name = 'CollectionDoesNotAcceptShowrooms';
  }
}

export class CollectionNotReadyForShowroomPublication extends Error {
  constructor(id: string) {
    super(`Collection ${id} must be published before its Showroom can be published`);
    this.name = 'CollectionNotReadyForShowroomPublication';
  }
}

function audit(input: {
  readonly ids: ShowroomIdGenerator;
  readonly showroom: Showroom;
  readonly action: ShowroomAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly snapshotId?: string | null;
  readonly occurredAt: Date;
}): ShowroomAuditRecord {
  return Object.freeze({
    id: input.ids.next('audit'),
    organisationId: input.showroom.organisationId,
    showroomId: input.showroom.id,
    action: input.action,
    actorCredentialId: input.actorCredentialId,
    expectedVersion: input.expectedVersion,
    resultingVersion: input.showroom.version,
    snapshotId: input.snapshotId ?? null,
    occurredAt: input.occurredAt.toISOString(),
  });
}

function publishedEvent(input: {
  readonly ids: ShowroomIdGenerator;
  readonly showroom: Showroom;
  readonly snapshot: ShowroomPublicationSnapshot;
  readonly occurredAt: Date;
}): ShowroomPublishedEvent {
  return Object.freeze({
    id: input.ids.next('event'),
    organisationId: input.showroom.organisationId,
    aggregateId: input.showroom.id,
    aggregateVersion: input.showroom.version,
    eventName: 'SHOWROOM_PUBLISHED' as const,
    payload: Object.freeze({
      showroomId: input.showroom.id,
      snapshotId: input.snapshot.id,
      collectionId: input.showroom.collectionId,
      publishedByCredentialId: input.snapshot.publishedByCredentialId,
    }),
    occurredAt: input.occurredAt.toISOString(),
  });
}

export async function createShowroomUseCase(input: {
  readonly repository: ShowroomRepository;
  readonly collectionRepository: CollectionRepository;
  readonly clock: ShowroomClock;
  readonly ids: ShowroomIdGenerator;
  readonly organisationId: OrganisationId;
  readonly collectionId: string;
  readonly code: string;
  readonly title: string;
  readonly description?: string;
  readonly opensAt: Date;
  readonly closesAt: Date;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<Showroom>> {
  const now = input.clock.now();
  const code = input.code.trim().toUpperCase();
  const command = lifecycleCreateCommand({
    organisationId: input.organisationId,
    commandName: 'CREATE_SHOWROOM',
    idempotencyKey: input.idempotencyKey,
    payload: {
      collectionId: input.collectionId.trim(),
      code,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      opensAt: input.opensAt.toISOString(),
      closesAt: input.closesAt.toISOString(),
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });

  const replay = await input.repository.findCreateReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  const collection = await getCollection({
    repository: input.collectionRepository,
    organisationId: input.organisationId,
    id: input.collectionId,
  });
  if (collection.status === 'ARCHIVED') {
    throw new CollectionDoesNotAcceptShowrooms(collection.id);
  }
  if (await input.repository.findByCode(input.organisationId, collection.id, code)) {
    throw new ShowroomAlreadyExists(code);
  }

  const showroom = createShowroom({
    id: input.ids.next('showroom'),
    organisationId: input.organisationId,
    collectionId: collection.id,
    code,
    title: input.title,
    description: input.description,
    opensAt: input.opensAt,
    closesAt: input.closesAt,
    ownerCredentialId: input.actorCredentialId,
    now,
  });
  return input.repository.create(
    showroom,
    audit({
      ids: input.ids,
      showroom,
      action: 'CREATED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: null,
      occurredAt: now,
    }),
    command,
  );
}

export async function getShowroom(input: {
  readonly repository: ShowroomRepository;
  readonly organisationId: OrganisationId;
  readonly id: string;
}): Promise<Showroom> {
  const showroom = await input.repository.findById(input.organisationId, showroomId(input.id));
  if (!showroom) throw new ShowroomNotFound(input.id);
  return showroom;
}

export async function listCollectionShowrooms(input: {
  readonly repository: ShowroomRepository;
  readonly organisationId: OrganisationId;
  readonly collectionId: string;
}): Promise<readonly Showroom[]> {
  return input.repository.listByCollection(
    input.organisationId,
    input.collectionId as Showroom['collectionId'],
  );
}

export async function updateShowroomUseCase(input: {
  readonly repository: ShowroomRepository;
  readonly clock: ShowroomClock;
  readonly ids: ShowroomIdGenerator;
  readonly organisationId: OrganisationId;
  readonly id: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly title?: string;
  readonly description?: string;
  readonly opensAt?: Date;
  readonly closesAt?: Date;
}): Promise<Showroom> {
  const current = await getShowroom(input);
  if (current.version !== input.expectedVersion) {
    throw new ShowroomVersionConflict(input.id);
  }
  const now = input.clock.now();
  const changed = reviseShowroom(current, {
    title: input.title,
    description: input.description,
    opensAt: input.opensAt,
    closesAt: input.closesAt,
    now,
  });
  const updated = await input.repository.update(
    changed,
    input.expectedVersion,
    audit({
      ids: input.ids,
      showroom: changed,
      action: 'UPDATED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
  );
  if (!updated) throw new ShowroomVersionConflict(input.id);
  return changed;
}

export async function publishShowroomUseCase(input: {
  readonly repository: ShowroomRepository;
  readonly collectionRepository: CollectionRepository;
  readonly clock: ShowroomClock;
  readonly ids: ShowroomIdGenerator;
  readonly organisationId: OrganisationId;
  readonly id: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<ShowroomPublicationSnapshot>> {
  const now = input.clock.now();
  const command = lifecycleCreateCommand({
    organisationId: input.organisationId,
    commandName: 'PUBLISH_SHOWROOM',
    idempotencyKey: input.idempotencyKey,
    payload: {
      showroomId: input.id.trim(),
      expectedVersion: input.expectedVersion,
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });
  const replay = await input.repository.findPublishReplay(command);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  const current = await getShowroom(input);
  if (current.version !== input.expectedVersion) {
    throw new ShowroomVersionConflict(input.id);
  }
  const collection = await getCollection({
    repository: input.collectionRepository,
    organisationId: input.organisationId,
    id: current.collectionId,
  });
  if (collection.status !== 'PUBLISHED') {
    throw new CollectionNotReadyForShowroomPublication(collection.id);
  }

  const publication = publishShowroom(current, {
    snapshotId: input.ids.next('showroom-snapshot'),
    actorCredentialId: input.actorCredentialId,
    now,
  });
  return input.repository.publish(
    publication.showroom,
    publication.snapshot,
    input.expectedVersion,
    audit({
      ids: input.ids,
      showroom: publication.showroom,
      action: 'PUBLISHED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      snapshotId: publication.snapshot.id,
      occurredAt: now,
    }),
    publishedEvent({
      ids: input.ids,
      showroom: publication.showroom,
      snapshot: publication.snapshot,
      occurredAt: now,
    }),
    command,
  );
}

export async function archiveShowroomUseCase(input: {
  readonly repository: ShowroomRepository;
  readonly clock: ShowroomClock;
  readonly ids: ShowroomIdGenerator;
  readonly organisationId: OrganisationId;
  readonly id: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
}): Promise<Showroom> {
  const current = await getShowroom(input);
  if (current.version !== input.expectedVersion) {
    throw new ShowroomVersionConflict(input.id);
  }
  const now = input.clock.now();
  const changed = archiveShowroom(current, now);
  const updated = await input.repository.update(
    changed,
    input.expectedVersion,
    audit({
      ids: input.ids,
      showroom: changed,
      action: 'ARCHIVED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
  );
  if (!updated) throw new ShowroomVersionConflict(input.id);
  return changed;
}
