import type { OrganisationId } from '@/modules/organisations';
import type { CampaignId } from '@/modules/campaigns';

export type CollectionId = string & { readonly __brand: 'CollectionId' };
export type CollectionStatus = 'DRAFT' | 'READY' | 'PUBLISHED' | 'ARCHIVED';

export interface Collection {
  readonly id: CollectionId;
  readonly organisationId: OrganisationId;
  readonly campaignId: CampaignId;
  readonly code: string;
  readonly name: string;
  readonly currency: string;
  readonly status: CollectionStatus;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export class CollectionDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CollectionDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new CollectionDomainError(`${label} must not be empty`);
  return normalized;
}

export function collectionId(value: string): CollectionId {
  return requiredText(value, 'Collection id') as CollectionId;
}

function currencyCode(value: string): string {
  const normalized = requiredText(value, 'Currency').toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new CollectionDomainError('Currency must be a three-letter ISO code');
  }
  return normalized;
}

export function createCollection(input: {
  readonly id: string;
  readonly organisationId: OrganisationId;
  readonly campaignId: CampaignId;
  readonly code: string;
  readonly name: string;
  readonly currency: string;
  readonly ownerCredentialId: string;
  readonly now: Date;
}): Collection {
  const timestamp = input.now.toISOString();
  return Object.freeze({
    id: collectionId(input.id),
    organisationId: input.organisationId,
    campaignId: input.campaignId,
    code: requiredText(input.code, 'Collection code').toUpperCase(),
    name: requiredText(input.name, 'Collection name'),
    currency: currencyCode(input.currency),
    status: 'DRAFT' as const,
    ownerCredentialId: requiredText(input.ownerCredentialId, 'Owner credential id'),
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  });
}

const transitions: Readonly<Record<CollectionStatus, readonly CollectionStatus[]>> = Object.freeze({
  DRAFT: ['READY', 'ARCHIVED'],
  READY: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: [],
});

export function reviseCollection(
  collection: Collection,
  input: {
    readonly name?: string;
    readonly currency?: string;
    readonly status?: CollectionStatus;
    readonly now: Date;
  },
): Collection {
  const status = input.status ?? collection.status;
  if (status !== collection.status && !transitions[collection.status].includes(status)) {
    throw new CollectionDomainError(
      `Collection transition ${collection.status} -> ${status} is not allowed`,
    );
  }
  return Object.freeze({
    ...collection,
    name: input.name === undefined ? collection.name : requiredText(input.name, 'Collection name'),
    currency: input.currency === undefined ? collection.currency : currencyCode(input.currency),
    status,
    updatedAt: input.now.toISOString(),
    version: collection.version + 1,
  });
}
