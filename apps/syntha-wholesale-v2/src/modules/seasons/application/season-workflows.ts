import type { OrganisationId } from '@/modules/organisations';

import {
  changeSeasonStatus,
  createSeason,
  seasonId,
  type Season,
  type SeasonStatus,
} from '../domain/season';
import type {
  SeasonAuditRecord,
  SeasonRepository,
} from './season-repository';

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(prefix: string): string;
}

export class SeasonAlreadyExists extends Error {
  constructor(code: string) {
    super(`Season with code ${code} already exists`);
    this.name = 'SeasonAlreadyExists';
  }
}

export class SeasonNotFound extends Error {
  constructor(id: string) {
    super(`Season ${id} was not found`);
    this.name = 'SeasonNotFound';
  }
}

export class SeasonVersionConflict extends Error {
  constructor(id: string) {
    super(`Season ${id} was modified by another operation`);
    this.name = 'SeasonVersionConflict';
  }
}

export interface CreateSeasonCommand {
  readonly organisationId: OrganisationId;
  readonly code: string;
  readonly name: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly actorCredentialId: string;
}

function audit(input: {
  readonly ids: IdGenerator;
  readonly season: Season;
  readonly action: SeasonAuditRecord['action'];
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly occurredAt: Date;
}): SeasonAuditRecord {
  return Object.freeze({
    id: input.ids.next('audit'),
    organisationId: input.season.organisationId,
    seasonId: input.season.id,
    action: input.action,
    actorCredentialId: input.actorCredentialId,
    expectedVersion: input.expectedVersion,
    resultingVersion: input.season.version,
    occurredAt: input.occurredAt.toISOString(),
  });
}

export async function createSeasonUseCase(
  repository: SeasonRepository,
  clock: Clock,
  ids: IdGenerator,
  command: CreateSeasonCommand,
): Promise<Season> {
  const duplicate = await repository.findByCode(
    command.organisationId,
    command.code.trim().toUpperCase(),
  );
  if (duplicate) throw new SeasonAlreadyExists(command.code);

  const now = clock.now();
  const season = createSeason({
    id: ids.next('season'),
    organisationId: command.organisationId,
    code: command.code,
    name: command.name,
    startsAt: command.startsAt,
    endsAt: command.endsAt,
    ownerCredentialId: command.actorCredentialId,
    now,
  });
  await repository.create(
    season,
    audit({
      ids,
      season,
      action: 'CREATED',
      actorCredentialId: command.actorCredentialId,
      expectedVersion: null,
      occurredAt: now,
    }),
  );
  return season;
}

export async function listOrganisationSeasons(
  repository: SeasonRepository,
  organisationId: OrganisationId,
): Promise<readonly Season[]> {
  return repository.findByOrganisation(organisationId);
}

export async function getSeason(
  repository: SeasonRepository,
  organisationId: OrganisationId,
  id: string,
): Promise<Season> {
  const season = await repository.findById(organisationId, seasonId(id));
  if (!season) throw new SeasonNotFound(id);
  return season;
}

export async function changeSeasonStatusUseCase(
  repository: SeasonRepository,
  clock: Clock,
  ids: IdGenerator,
  input: {
    readonly organisationId: OrganisationId;
    readonly id: string;
    readonly status: SeasonStatus;
    readonly expectedVersion: number;
    readonly actorCredentialId: string;
  },
): Promise<Season> {
  const current = await getSeason(repository, input.organisationId, input.id);
  if (current.version !== input.expectedVersion) {
    throw new SeasonVersionConflict(input.id);
  }
  const now = clock.now();
  const changed = changeSeasonStatus(current, input.status, now);
  const updated = await repository.update(
    changed,
    input.expectedVersion,
    audit({
      ids,
      season: changed,
      action: 'STATUS_CHANGED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
  );
  if (!updated) throw new SeasonVersionConflict(input.id);
  return changed;
}
