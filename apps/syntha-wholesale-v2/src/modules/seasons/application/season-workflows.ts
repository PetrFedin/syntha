import type { OrganisationId } from '@/modules/organisations';
import {
  changeSeasonStatus,
  createSeason,
  seasonId,
  type Season,
  type SeasonStatus,
} from '../domain/season';
import type { SeasonRepository } from './season-repository';

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
}

export async function createSeasonUseCase(
  repository: SeasonRepository,
  clock: Clock,
  ids: IdGenerator,
  command: CreateSeasonCommand,
): Promise<Season> {
  const duplicate = await repository.findByCode(command.organisationId, command.code.trim().toUpperCase());
  if (duplicate) throw new SeasonAlreadyExists(command.code);

  const season = createSeason({
    id: ids.next('season'),
    organisationId: command.organisationId,
    code: command.code,
    name: command.name,
    startsAt: command.startsAt,
    endsAt: command.endsAt,
    now: clock.now(),
  });
  await repository.save(season);
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
  id: string,
): Promise<Season> {
  const season = await repository.findById(seasonId(id));
  if (!season) throw new SeasonNotFound(id);
  return season;
}

export async function changeSeasonStatusUseCase(
  repository: SeasonRepository,
  clock: Clock,
  input: {
    readonly id: string;
    readonly status: SeasonStatus;
    readonly expectedVersion: number;
  },
): Promise<Season> {
  const current = await getSeason(repository, input.id);
  if (current.version !== input.expectedVersion) {
    throw new SeasonVersionConflict(input.id);
  }
  const changed = changeSeasonStatus(current, input.status, clock.now());
  await repository.save(changed, input.expectedVersion);
  return changed;
}
