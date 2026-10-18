import { describe, expect, it } from 'vitest';
import { organisationId } from '@/modules/organisations';
import {
  InMemorySeasonRepository,
  SeasonAlreadyExists,
  SeasonDomainError,
  SeasonVersionConflict,
  changeSeasonStatusUseCase,
  createSeason,
  createSeasonUseCase,
  seasonId,
} from '@/modules/seasons';

const organisation = organisationId('organisation-1');
const clock = { now: () => new Date('2026-07-24T10:00:00.000Z') };
const ids = { next: () => 'season-1' };

function draftSeason() {
  return createSeason({
    id: 'season-1',
    organisationId: organisation,
    code: 'FW26',
    name: 'Fall Winter 2026',
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2027-02-01T00:00:00.000Z'),
    now: clock.now(),
  });
}

describe('Season domain', () => {
  it('creates a normalized planning season', () => {
    expect(draftSeason()).toMatchObject({
      id: seasonId('season-1'),
      code: 'FW26',
      status: 'PLANNING',
      version: 1,
    });
  });

  it('rejects an invalid date range', () => {
    expect(() => createSeason({
      id: 'season-1',
      organisationId: organisation,
      code: 'FW26',
      name: 'Fall Winter 2026',
      startsAt: new Date('2027-02-01T00:00:00.000Z'),
      endsAt: new Date('2026-08-01T00:00:00.000Z'),
      now: clock.now(),
    })).toThrow(SeasonDomainError);
  });

  it('supports only explicit lifecycle transitions', async () => {
    const repository = new InMemorySeasonRepository([draftSeason()]);
    const active = await changeSeasonStatusUseCase(repository, clock, {
      id: 'season-1', status: 'ACTIVE', expectedVersion: 1,
    });
    expect(active).toMatchObject({ status: 'ACTIVE', version: 2 });
    await expect(changeSeasonStatusUseCase(repository, clock, {
      id: 'season-1', status: 'ARCHIVED', expectedVersion: 2,
    })).rejects.toThrow(SeasonDomainError);
  });
});

describe('Season application', () => {
  it('creates and lists a season using injected clock and id generator', async () => {
    const repository = new InMemorySeasonRepository();
    const created = await createSeasonUseCase(repository, clock, ids, {
      organisationId: organisation,
      code: 'fw26',
      name: 'Fall Winter 2026',
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2027-02-01T00:00:00.000Z'),
    });
    expect(created.id).toBe('season-1');
    expect(await repository.findByOrganisation(organisation)).toHaveLength(1);
  });

  it('enforces code uniqueness inside an organisation', async () => {
    const repository = new InMemorySeasonRepository([draftSeason()]);
    await expect(createSeasonUseCase(repository, clock, ids, {
      organisationId: organisation,
      code: 'fw26',
      name: 'Duplicate',
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2027-02-01T00:00:00.000Z'),
    })).rejects.toThrow(SeasonAlreadyExists);
  });

  it('rejects stale optimistic-concurrency updates', async () => {
    const repository = new InMemorySeasonRepository([draftSeason()]);
    await changeSeasonStatusUseCase(repository, clock, {
      id: 'season-1', status: 'ACTIVE', expectedVersion: 1,
    });
    await expect(changeSeasonStatusUseCase(repository, clock, {
      id: 'season-1', status: 'CLOSED', expectedVersion: 1,
    })).rejects.toThrow(SeasonVersionConflict);
  });
});
