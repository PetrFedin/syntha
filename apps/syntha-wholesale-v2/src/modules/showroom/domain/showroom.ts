import type { CollectionId } from '@/modules/collections';
import type { OrganisationId } from '@/modules/organisations';

export type ShowroomId = string & { readonly __brand: 'ShowroomId' };
export type ShowroomSnapshotId = string & { readonly __brand: 'ShowroomSnapshotId' };
export type ShowroomStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Showroom {
  readonly id: ShowroomId;
  readonly organisationId: OrganisationId;
  readonly collectionId: CollectionId;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly opensAt: string;
  readonly closesAt: string;
  readonly status: ShowroomStatus;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface ShowroomPublicationSnapshot {
  readonly id: ShowroomSnapshotId;
  readonly organisationId: OrganisationId;
  readonly showroomId: ShowroomId;
  readonly showroomVersion: number;
  readonly collectionId: CollectionId;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly opensAt: string;
  readonly closesAt: string;
  readonly publishedByCredentialId: string;
  readonly publishedAt: string;
}

export class ShowroomDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShowroomDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new ShowroomDomainError(`${label} must not be empty`);
  return normalized;
}

function normalizedDescription(value: string): string {
  const normalized = value.trim();
  if (normalized.length > 2_000) {
    throw new ShowroomDomainError('Showroom description must not exceed 2000 characters');
  }
  return normalized;
}

function assertWindow(opensAt: Date, closesAt: Date): void {
  if (Number.isNaN(opensAt.getTime()) || Number.isNaN(closesAt.getTime())) {
    throw new ShowroomDomainError('Showroom presentation window must contain valid dates');
  }
  if (opensAt.getTime() >= closesAt.getTime()) {
    throw new ShowroomDomainError('Showroom opening must be before closing');
  }
}

export function showroomId(value: string): ShowroomId {
  return requiredText(value, 'Showroom id') as ShowroomId;
}

export function showroomSnapshotId(value: string): ShowroomSnapshotId {
  return requiredText(value, 'Showroom snapshot id') as ShowroomSnapshotId;
}

export function createShowroom(input: {
  readonly id: string;
  readonly organisationId: OrganisationId;
  readonly collectionId: CollectionId;
  readonly code: string;
  readonly title: string;
  readonly description?: string;
  readonly opensAt: Date;
  readonly closesAt: Date;
  readonly ownerCredentialId: string;
  readonly now: Date;
}): Showroom {
  assertWindow(input.opensAt, input.closesAt);
  const timestamp = input.now.toISOString();
  return Object.freeze({
    id: showroomId(input.id),
    organisationId: input.organisationId,
    collectionId: input.collectionId,
    code: requiredText(input.code, 'Showroom code').toUpperCase(),
    title: requiredText(input.title, 'Showroom title'),
    description: normalizedDescription(input.description ?? ''),
    opensAt: input.opensAt.toISOString(),
    closesAt: input.closesAt.toISOString(),
    status: 'DRAFT' as const,
    ownerCredentialId: requiredText(input.ownerCredentialId, 'Owner credential id'),
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  });
}

export function reviseShowroom(
  showroom: Showroom,
  input: {
    readonly title?: string;
    readonly description?: string;
    readonly opensAt?: Date;
    readonly closesAt?: Date;
    readonly now: Date;
  },
): Showroom {
  if (showroom.status !== 'DRAFT') {
    throw new ShowroomDomainError('Only a draft Showroom can be edited');
  }
  const opensAt = input.opensAt ?? new Date(showroom.opensAt);
  const closesAt = input.closesAt ?? new Date(showroom.closesAt);
  assertWindow(opensAt, closesAt);
  return Object.freeze({
    ...showroom,
    title: input.title === undefined ? showroom.title : requiredText(input.title, 'Showroom title'),
    description:
      input.description === undefined
        ? showroom.description
        : normalizedDescription(input.description),
    opensAt: opensAt.toISOString(),
    closesAt: closesAt.toISOString(),
    updatedAt: input.now.toISOString(),
    version: showroom.version + 1,
  });
}

export function publishShowroom(
  showroom: Showroom,
  input: {
    readonly snapshotId: string;
    readonly actorCredentialId: string;
    readonly now: Date;
  },
): {
  readonly showroom: Showroom;
  readonly snapshot: ShowroomPublicationSnapshot;
} {
  if (showroom.status !== 'DRAFT') {
    throw new ShowroomDomainError('Only a draft Showroom can be published');
  }
  const published: Showroom = Object.freeze({
    ...showroom,
    status: 'PUBLISHED' as const,
    updatedAt: input.now.toISOString(),
    version: showroom.version + 1,
  });
  const snapshot: ShowroomPublicationSnapshot = Object.freeze({
    id: showroomSnapshotId(input.snapshotId),
    organisationId: published.organisationId,
    showroomId: published.id,
    showroomVersion: published.version,
    collectionId: published.collectionId,
    code: published.code,
    title: published.title,
    description: published.description,
    opensAt: published.opensAt,
    closesAt: published.closesAt,
    publishedByCredentialId: requiredText(input.actorCredentialId, 'Publication credential id'),
    publishedAt: input.now.toISOString(),
  });
  return Object.freeze({ showroom: published, snapshot });
}

export function archiveShowroom(showroom: Showroom, now: Date): Showroom {
  if (showroom.status === 'ARCHIVED') {
    throw new ShowroomDomainError('Showroom is already archived');
  }
  return Object.freeze({
    ...showroom,
    status: 'ARCHIVED' as const,
    updatedAt: now.toISOString(),
    version: showroom.version + 1,
  });
}
