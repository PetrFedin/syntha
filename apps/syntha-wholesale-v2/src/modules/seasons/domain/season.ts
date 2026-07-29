import type { OrganisationId } from '@/modules/organisations';

export type SeasonId = string & { readonly __brand: 'SeasonId' };
export type SeasonStatus = 'PLANNING' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export interface Season {
  readonly id: SeasonId;
  readonly organisationId: OrganisationId;
  readonly code: string;
  readonly name: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: SeasonStatus;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface CreateSeasonInput {
  readonly id: string;
  readonly organisationId: OrganisationId;
  readonly code: string;
  readonly name: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly ownerCredentialId: string;
  readonly now: Date;
}

export class SeasonDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SeasonDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new SeasonDomainError(`${label} must not be empty`);
  return normalized;
}

export function seasonId(value: string): SeasonId {
  return requiredText(value, 'Season id') as SeasonId;
}

export function createSeason(input: CreateSeasonInput): Season {
  if (input.startsAt.getTime() >= input.endsAt.getTime()) {
    throw new SeasonDomainError('Season start must be before season end');
  }

  const timestamp = input.now.toISOString();
  return Object.freeze({
    id: seasonId(input.id),
    organisationId: input.organisationId,
    code: requiredText(input.code, 'Season code').toUpperCase(),
    name: requiredText(input.name, 'Season name'),
    startsAt: input.startsAt.toISOString(),
    endsAt: input.endsAt.toISOString(),
    status: 'PLANNING' as const,
    ownerCredentialId: requiredText(input.ownerCredentialId, 'Owner credential id'),
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  });
}

const allowedTransitions: Readonly<Record<SeasonStatus, readonly SeasonStatus[]>> = Object.freeze({
  PLANNING: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['CLOSED'],
  CLOSED: ['ARCHIVED'],
  ARCHIVED: [],
});

export function changeSeasonStatus(
  season: Season,
  nextStatus: SeasonStatus,
  now: Date,
): Season {
  if (season.status === nextStatus) return season;
  if (!allowedTransitions[season.status].includes(nextStatus)) {
    throw new SeasonDomainError(`Season transition ${season.status} -> ${nextStatus} is not allowed`);
  }

  return Object.freeze({
    ...season,
    status: nextStatus,
    updatedAt: now.toISOString(),
    version: season.version + 1,
  });
}
