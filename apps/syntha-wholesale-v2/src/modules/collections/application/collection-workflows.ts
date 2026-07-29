import {
  CampaignNotFound,
  getCampaign,
  type CampaignIdGenerator,
  type CampaignRepository,
  type LifecycleAuditAction,
  type LifecycleAuditRecord,
} from '@/modules/campaigns';
import type { OrganisationId } from '@/modules/organisations';

import {
  createCollection,
  reviseCollection,
  type Collection,
  type CollectionStatus,
} from '../domain/collection';
import type { CollectionRepository } from './collection-repository';

export class CollectionAlreadyExists extends Error {
  constructor(code: string) {
    super(`Collection with code ${code} already exists in the campaign`);
    this.name = 'CollectionAlreadyExists';
  }
}

export class CollectionNotFound extends Error {
  constructor(id: string) {
    super(`Collection ${id} was not found`);
    this.name = 'CollectionNotFound';
  }
}

export class CollectionVersionConflict extends Error {
  constructor(id: string) {
    super(`Collection ${id} was modified by another operation`);
    this.name = 'CollectionVersionConflict';
  }
}

export class CampaignDoesNotAcceptCollections extends Error {
  constructor(id: string) {
    super(`Campaign ${id} does not accept new collections in its current status`);
    this.name = 'CampaignDoesNotAcceptCollections';
  }
}

function audit(input: {
  readonly ids: CampaignIdGenerator;
  readonly organisationId: OrganisationId;
  readonly collection: Collection;
  readonly action: LifecycleAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly occurredAt: Date;
}): LifecycleAuditRecord {
  return Object.freeze({
    id: input.ids.next('audit'),
    organisationId: input.organisationId,
    entityType: 'COLLECTION' as const,
    entityId: input.collection.id,
    action: input.action,
    actorCredentialId: input.actorCredentialId,
    expectedVersion: input.expectedVersion,
    resultingVersion: input.collection.version,
    occurredAt: input.occurredAt.toISOString(),
  });
}

export async function createCollectionUseCase(input: {
  readonly campaignRepository: CampaignRepository;
  readonly collectionRepository: CollectionRepository;
  readonly clock: { now(): Date };
  readonly ids: CampaignIdGenerator;
  readonly organisationId: OrganisationId;
  readonly campaignId: string;
  readonly code: string;
  readonly name: string;
  readonly currency: string;
  readonly actorCredentialId: string;
}): Promise<Collection> {
  const campaign = await getCampaign({
    repository: input.campaignRepository,
    organisationId: input.organisationId,
    id: input.campaignId,
  });
  if (campaign.status === 'CLOSED' || campaign.status === 'ARCHIVED') {
    throw new CampaignDoesNotAcceptCollections(campaign.id);
  }
  const code = input.code.trim().toUpperCase();
  if (
    await input.collectionRepository.findByCode(
      input.organisationId,
      campaign.id,
      code,
    )
  ) {
    throw new CollectionAlreadyExists(code);
  }
  const now = input.clock.now();
  const collection = createCollection({
    id: input.ids.next('collection'),
    organisationId: input.organisationId,
    campaignId: campaign.id,
    code,
    name: input.name,
    currency: input.currency,
    ownerCredentialId: input.actorCredentialId,
    now,
  });
  await input.collectionRepository.create(
    collection,
    audit({
      ids: input.ids,
      organisationId: input.organisationId,
      collection,
      action: 'CREATED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: null,
      occurredAt: now,
    }),
  );
  return collection;
}

export async function listCampaignCollections(input: {
  readonly repository: CollectionRepository;
  readonly organisationId: OrganisationId;
  readonly campaignId: string;
}): Promise<readonly Collection[]> {
  return input.repository.listByCampaign(
    input.organisationId,
    input.campaignId as Collection['campaignId'],
  );
}

export async function getCollection(input: {
  readonly repository: CollectionRepository;
  readonly organisationId: OrganisationId;
  readonly id: string;
}): Promise<Collection> {
  const collection = await input.repository.findById(
    input.organisationId,
    input.id as Collection['id'],
  );
  if (!collection) throw new CollectionNotFound(input.id);
  return collection;
}

export async function updateCollectionUseCase(input: {
  readonly repository: CollectionRepository;
  readonly clock: { now(): Date };
  readonly ids: CampaignIdGenerator;
  readonly organisationId: OrganisationId;
  readonly id: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly name?: string;
  readonly currency?: string;
  readonly status?: CollectionStatus;
}): Promise<Collection> {
  const current = await getCollection(input);
  if (current.version !== input.expectedVersion) {
    throw new CollectionVersionConflict(input.id);
  }
  const now = input.clock.now();
  const changed = reviseCollection(current, {
    name: input.name,
    currency: input.currency,
    status: input.status,
    now,
  });
  const action: LifecycleAuditAction =
    changed.status === current.status ? 'UPDATED' : 'STATUS_CHANGED';
  const updated = await input.repository.update(
    changed,
    input.expectedVersion,
    audit({
      ids: input.ids,
      organisationId: input.organisationId,
      collection: changed,
      action,
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
  );
  if (!updated) throw new CollectionVersionConflict(input.id);
  return changed;
}

export { CampaignNotFound };
