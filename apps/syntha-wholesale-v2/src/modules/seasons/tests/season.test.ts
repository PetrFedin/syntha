import { describe, expect, it } from 'vitest';

import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import {
  InMemorySeasonRepository,
  SeasonAlreadyExists,
  SeasonDomainError,
  SeasonNotFound,
  SeasonVersionConflict,
  changeSeasonStatusUseCase,
  createSeason,
  createSeasonUseCase,
  getSeason,
  seasonId,
} from '@/modules/seasons';

const organisation = organisationId('organisation-1');
const clock = { now: () => new Date('2026-07-24T10:00:00.000Z') };

function ids() {
  let sequence = 0;
  return { next: (prefix: string) => `${prefix}-${++sequence}` };
}

function createCommand(overrides: Partial<Parameters<typeof createSeasonUseCase>[3]> = {}) {
  return {
    organisationId: organisation,
    code: 'fw26',
    name: 'Fall Winter 2026',
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2027-02-01T00:00:00.000Z'),
    actorCredentialId: 'org-operator',
    idempotencyKey: 'season-create-0001',
    ...overrides,
  };
}

function draftSeason(organisationIdValue = organisation) {
  return createSeason({
    id: 'season-1',
    organisationId: organisationIdValue,
    code: 'FW26',
    name: 'Fall Winter 2026',
    startsAt: new Date('2026-08-01T00:00:00.000Z'),
    endsAt: new Date('2027-02-01T00:00:00.000Z'),
    ownerCredentialId: 'season-owner',
    now: clock.now(),
  });
}

describe('Season domain', () => {
  it('creates a normalized planning season with explicit owner', () => {
    expect(draftSeason()).toMatchObject({
      id: seasonId('season-1'),
      code: 'FW26',
      status: 'PLANNING',
      ownerCredentialId: 'season-owner',
      version: 1,
    });
  });

  it('rejects an invalid date range', () => {
    expect(() =>
      createSeason({
        id: 'season-1',
        organisationId: organisation,
        code: 'FW26',
        name: 'Fall Winter 2026',
        startsAt: new Date('2027-02-01T00:00:00.000Z'),
        endsAt: new Date('2026-08-01T00:00:00.000Z'),
        ownerCredentialId: 'season-owner',
        now: clock.now(),
      }),
    ).toThrow(SeasonDomainError);
  });

  it('supports only explicit lifecycle transitions', async () => {
    const repository = new InMemorySeasonRepository([draftSeason()]);
    const generator = ids();
    const active = await changeSeasonStatusUseCase(repository, clock, generator, {
      organisationId: organisation,
      id: 'season-1',
      status: 'ACTIVE',
      expectedVersion: 1,
      actorCredentialId: 'approver',
    });
    expect(active).toMatchObject({ status: 'ACTIVE', version: 2 });
    await expect(
      changeSeasonStatusUseCase(repository, clock, generator, {
        organisationId: organisation,
        id: 'season-1',
        status: 'ARCHIVED',
        expectedVersion: 2,
        actorCredentialId: 'approver',
      }),
    ).rejects.toThrow(SeasonDomainError);
  });
});

describe('Season application', () => {
  it('creates and audits a season using injected clock and id generator', async () => {
    const repository = new InMemorySeasonRepository();
    const result = await createSeasonUseCase(repository, clock, ids(), createCommand());
    expect(result).toMatchObject({ replayed: false });
    expect(result.entity.code).toBe('FW26');
    expect(await repository.findByOrganisation(organisation)).toHaveLength(1);
    expect(repository.audits[0]).toEqual(
      expect.objectContaining({
        organisationId: organisation,
        seasonId: result.entity.id,
        action: 'CREATED',
        actorCredentialId: 'org-operator',
        resultingVersion: 1,
      }),
    );
  });

  it('replays the original result without another entity or audit', async () => {
    const repository = new InMemorySeasonRepository();
    const first = await createSeasonUseCase(repository, clock, ids(), createCommand());
    const replay = await createSeasonUseCase(repository, clock, ids(), createCommand());

    expect(replay).toEqual({ entity: first.entity, replayed: true });
    expect(await repository.findByOrganisation(organisation)).toHaveLength(1);
    expect(repository.audits).toHaveLength(1);
  });

  it('rejects idempotency-key reuse with another payload', async () => {
    const repository = new InMemorySeasonRepository();
    await createSeasonUseCase(repository, clock, ids(), createCommand());
    await expect(
      createSeasonUseCase(
        repository,
        clock,
        ids(),
        createCommand({ name: 'Different season name' }),
      ),
    ).rejects.toBeInstanceOf(LifecycleIdempotencyConflict);
  });

  it('enforces code uniqueness inside an organisation for another command key', async () => {
    const repository = new InMemorySeasonRepository([draftSeason()]);
    await expect(
      createSeasonUseCase(
        repository,
        clock,
        ids(),
        createCommand({ idempotencyKey: 'season-create-0002' }),
      ),
    ).rejects.toThrow(SeasonAlreadyExists);
  });

  it('does not expose the same season identifier through another organisation', async () => {
    const repository = new InMemorySeasonRepository([draftSeason()]);
    await expect(
      getSeason(repository, organisationId('organisation-2'), 'season-1'),
    ).rejects.toBeInstanceOf(SeasonNotFound);
  });

  it('allows the same season identifier in isolated organisations', async () => {
    const otherOrganisation = organisationId('organisation-2');
    const repository = new InMemorySeasonRepository([
      draftSeason(),
      draftSeason(otherOrganisation),
    ]);
    expect(await repository.findByOrganisation(organisation)).toHaveLength(1);
    expect(await repository.findByOrganisation(otherOrganisation)).toHaveLength(1);
  });

  it('rejects stale optimistic-concurrency updates', async () => {
    const repository = new InMemorySeasonRepository([draftSeason()]);
    const generator = ids();
    await changeSeasonStatusUseCase(repository, clock, generator, {
      organisationId: organisation,
      id: 'season-1',
      status: 'ACTIVE',
      expectedVersion: 1,
      actorCredentialId: 'approver',
    });
    await expect(
      changeSeasonStatusUseCase(repository, clock, generator, {
        organisationId: organisation,
        id: 'season-1',
        status: 'CLOSED',
        expectedVersion: 1,
        actorCredentialId: 'stale-client',
      }),
    ).rejects.toThrow(SeasonVersionConflict);
  });
});
