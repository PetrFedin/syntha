import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  PostgresCampaignRepository,
  createCampaign,
  createCampaignUseCase,
  runCampaignLifecycleMigrations,
  type LifecycleAuditRecord,
} from '@/modules/campaigns';
import {
  PostgresCollectionRepository,
  createCollectionUseCase,
} from '@/modules/collections';
import { createNodePostgresPoolFromEnvironment } from '@/modules/commercial-execution';
import {
  lifecycleCreateCommand,
  runLifecycleIdempotencyMigrations,
} from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import {
  PostgresSeasonRepository,
  SeasonVersionConflict,
  changeSeasonStatusUseCase,
  createSeason,
  createSeasonUseCase,
  runSeasonMigrations,
  type SeasonAuditRecord,
} from '@/modules/seasons';

const now = new Date('2026-07-29T12:00:00.000Z');
const clock = Object.freeze({ now: () => now });

function ids(scope: string) {
  let sequence = 0;
  return Object.freeze({ next: (prefix: string) => `${prefix}-${scope}-${++sequence}` });
}

function errorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

describe('authoritative lifecycle PostgreSQL integration', () => {
  let pool: Awaited<ReturnType<typeof createNodePostgresPoolFromEnvironment>>;
  let seasons: PostgresSeasonRepository;
  let campaigns: PostgresCampaignRepository;
  let collections: PostgresCollectionRepository;

  beforeAll(async () => {
    pool = await createNodePostgresPoolFromEnvironment();
    await runLifecycleIdempotencyMigrations({ pool, appliedAt: now });
    await runSeasonMigrations({ pool, appliedAt: now });
    await runCampaignLifecycleMigrations({ pool, appliedAt: now });
    seasons = new PostgresSeasonRepository(pool);
    campaigns = new PostgresCampaignRepository(pool);
    collections = new PostgresCollectionRepository(pool);
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE
      syntha_collection,
      syntha_campaign,
      syntha_season,
      syntha_lifecycle_audit,
      syntha_lifecycle_idempotency
      RESTART IDENTITY CASCADE`);
  });

  afterAll(async () => {
    await pool?.close();
  });

  it('persists and replays Season, Campaign and Collection without duplicate facts', async () => {
    const organisation = organisationId('ORG-POSTGRES-A');
    const seasonCommand = {
      organisationId: organisation,
      code: 'FW27',
      name: 'Fall Winter 2027',
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-08-01T00:00:00.000Z'),
      actorCredentialId: 'postgres-operator',
      idempotencyKey: 'season-postgres-replay',
    } as const;
    const season = await createSeasonUseCase(seasons, clock, ids('season'), seasonCommand);
    const seasonReplay = await createSeasonUseCase(
      seasons,
      clock,
      ids('season-replay'),
      seasonCommand,
    );

    const campaignCommand = {
      repository: campaigns,
      seasonRepository: seasons,
      clock,
      ids: ids('campaign'),
      organisationId: organisation,
      seasonId: season.entity.id,
      code: 'FW27-MAIN',
      name: 'Fall Winter 2027 Main Campaign',
      startsAt: new Date('2027-01-15T00:00:00.000Z'),
      endsAt: new Date('2027-07-15T00:00:00.000Z'),
      actorCredentialId: 'postgres-operator',
      idempotencyKey: 'campaign-postgres-replay',
    } as const;
    const campaign = await createCampaignUseCase(campaignCommand);
    const campaignReplay = await createCampaignUseCase({
      ...campaignCommand,
      ids: ids('campaign-replay'),
    });

    const collectionCommand = {
      campaignRepository: campaigns,
      collectionRepository: collections,
      clock,
      ids: ids('collection'),
      organisationId: organisation,
      campaignId: campaign.entity.id,
      code: 'MAIN-LINE',
      name: 'Main Line',
      currency: 'EUR',
      actorCredentialId: 'postgres-operator',
      idempotencyKey: 'collection-postgres-replay',
    } as const;
    const collection = await createCollectionUseCase(collectionCommand);
    const collectionReplay = await createCollectionUseCase({
      ...collectionCommand,
      ids: ids('collection-replay'),
    });

    expect(seasonReplay).toEqual({ entity: season.entity, replayed: true });
    expect(campaignReplay).toEqual({ entity: campaign.entity, replayed: true });
    expect(collectionReplay).toEqual({ entity: collection.entity, replayed: true });

    const result = await pool.query<{
      readonly seasons: string;
      readonly campaigns: string;
      readonly collections: string;
      readonly audits: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_season) AS seasons,
      (SELECT count(*)::text FROM syntha_campaign) AS campaigns,
      (SELECT count(*)::text FROM syntha_collection) AS collections,
      (SELECT count(*)::text FROM syntha_lifecycle_audit) AS audits,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency) AS commands`);

    expect(result.rows[0]).toEqual({
      seasons: '1',
      campaigns: '1',
      collections: '1',
      audits: '3',
      commands: '3',
    });
  });

  it('rolls back entity, audit and idempotency reservation as one transaction', async () => {
    const organisation = organisationId('ORG-POSTGRES-ROLLBACK');
    await pool.query(
      `INSERT INTO syntha_lifecycle_audit
         (id, organisation_id, entity_type, entity_id, action, actor_credential_id,
          expected_version, resulting_version, occurred_at)
       VALUES ($1, $2, 'SEASON', 'existing', 'CREATED', 'fixture', NULL, 1, $3::timestamptz)`,
      ['audit-duplicate', organisation, now.toISOString()],
    );

    const season = createSeason({
      id: 'season-rollback',
      organisationId: organisation,
      code: 'ROLLBACK27',
      name: 'Rollback Season',
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-08-01T00:00:00.000Z'),
      ownerCredentialId: 'rollback-operator',
      now,
    });
    const command = lifecycleCreateCommand({
      organisationId: organisation,
      commandName: 'CREATE_SEASON',
      idempotencyKey: 'season-rollback-command',
      payload: { code: season.code },
      actorCredentialId: 'rollback-operator',
      requestedAt: now,
    });
    const audit: SeasonAuditRecord = Object.freeze({
      id: 'audit-duplicate',
      organisationId: organisation,
      seasonId: season.id,
      action: 'CREATED',
      actorCredentialId: 'rollback-operator',
      expectedVersion: null,
      resultingVersion: 1,
      occurredAt: now.toISOString(),
    });

    let thrown: unknown;
    try {
      await seasons.create(season, audit, command);
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23505');

    const result = await pool.query<{ readonly seasons: string; readonly commands: string }>(
      `SELECT
        (SELECT count(*)::text FROM syntha_season WHERE organisation_id = $1) AS seasons,
        (SELECT count(*)::text FROM syntha_lifecycle_idempotency WHERE organisation_id = $1) AS commands`,
      [organisation],
    );
    expect(result.rows[0]).toEqual({ seasons: '0', commands: '0' });
  });

  it('enforces unique business keys and composite tenant foreign keys in PostgreSQL', async () => {
    const organisation = organisationId('ORG-POSTGRES-UNIQUE');
    const created = await createSeasonUseCase(seasons, clock, ids('unique-a'), {
      organisationId: organisation,
      code: 'UNIQUE27',
      name: 'Unique Season',
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-08-01T00:00:00.000Z'),
      actorCredentialId: 'unique-operator',
      idempotencyKey: 'season-unique-command-a',
    });

    const duplicate = createSeason({
      id: 'season-unique-duplicate',
      organisationId: organisation,
      code: 'UNIQUE27',
      name: 'Duplicate Season',
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-08-01T00:00:00.000Z'),
      ownerCredentialId: 'unique-operator',
      now,
    });
    const duplicateCommand = lifecycleCreateCommand({
      organisationId: organisation,
      commandName: 'CREATE_SEASON',
      idempotencyKey: 'season-unique-command-b',
      payload: { code: duplicate.code, name: duplicate.name },
      actorCredentialId: 'unique-operator',
      requestedAt: now,
    });
    const duplicateAudit: SeasonAuditRecord = Object.freeze({
      id: 'audit-season-unique-duplicate',
      organisationId: organisation,
      seasonId: duplicate.id,
      action: 'CREATED',
      actorCredentialId: 'unique-operator',
      expectedVersion: null,
      resultingVersion: 1,
      occurredAt: now.toISOString(),
    });

    let duplicateError: unknown;
    try {
      await seasons.create(duplicate, duplicateAudit, duplicateCommand);
    } catch (error) {
      duplicateError = error;
    }
    expect(errorCode(duplicateError)).toBe('23505');

    const otherOrganisation = organisationId('ORG-POSTGRES-OTHER');
    const crossTenantCampaign = createCampaign({
      id: 'campaign-cross-tenant',
      organisationId: otherOrganisation,
      seasonId: created.entity.id,
      code: 'CROSS-TENANT',
      name: 'Cross Tenant Campaign',
      startsAt: new Date('2027-02-01T00:00:00.000Z'),
      endsAt: new Date('2027-07-01T00:00:00.000Z'),
      ownerCredentialId: 'other-operator',
      now,
    });
    const crossTenantCommand = lifecycleCreateCommand({
      organisationId: otherOrganisation,
      commandName: 'CREATE_CAMPAIGN',
      idempotencyKey: 'campaign-cross-tenant-command',
      payload: { seasonId: created.entity.id, code: crossTenantCampaign.code },
      actorCredentialId: 'other-operator',
      requestedAt: now,
    });
    const campaignAudit: LifecycleAuditRecord = Object.freeze({
      id: 'audit-cross-tenant',
      organisationId: otherOrganisation,
      entityType: 'CAMPAIGN',
      entityId: crossTenantCampaign.id,
      action: 'CREATED',
      actorCredentialId: 'other-operator',
      expectedVersion: null,
      resultingVersion: 1,
      occurredAt: now.toISOString(),
    });

    let foreignKeyError: unknown;
    try {
      await campaigns.create(crossTenantCampaign, campaignAudit, crossTenantCommand);
    } catch (error) {
      foreignKeyError = error;
    }
    expect(errorCode(foreignKeyError)).toBe('23503');

    const result = await pool.query<{
      readonly commands: string;
      readonly crossTenantCampaigns: string;
    }>(
      `SELECT
        (SELECT count(*)::text FROM syntha_lifecycle_idempotency) AS commands,
        (SELECT count(*)::text FROM syntha_campaign WHERE organisation_id = $1) AS "crossTenantCampaigns"`,
      [otherOrganisation],
    );
    expect(result.rows[0]).toEqual({ commands: '1', crossTenantCampaigns: '0' });
  });

  it('allows exactly one concurrent optimistic update to win', async () => {
    const organisation = organisationId('ORG-POSTGRES-CONCURRENCY');
    const created = await createSeasonUseCase(seasons, clock, ids('concurrency-create'), {
      organisationId: organisation,
      code: 'CONCURRENT27',
      name: 'Concurrent Season',
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-08-01T00:00:00.000Z'),
      actorCredentialId: 'concurrency-creator',
      idempotencyKey: 'season-concurrency-create',
    });

    const outcomes = await Promise.allSettled([
      changeSeasonStatusUseCase(seasons, clock, ids('concurrency-a'), {
        organisationId: organisation,
        id: created.entity.id,
        status: 'ACTIVE',
        expectedVersion: 1,
        actorCredentialId: 'concurrency-a',
      }),
      changeSeasonStatusUseCase(seasons, clock, ids('concurrency-b'), {
        organisationId: organisation,
        id: created.entity.id,
        status: 'ACTIVE',
        expectedVersion: 1,
        actorCredentialId: 'concurrency-b',
      }),
    ]);

    const fulfilled = outcomes.filter((outcome) => outcome.status === 'fulfilled');
    const rejected = outcomes.filter((outcome) => outcome.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(SeasonVersionConflict);

    const current = await seasons.findById(organisation, created.entity.id);
    expect(current).toMatchObject({ status: 'ACTIVE', version: 2 });
    const auditCount = await pool.query<{ readonly count: string }>(
      `SELECT count(*)::text AS count
       FROM syntha_lifecycle_audit
       WHERE organisation_id = $1 AND entity_type = 'SEASON' AND entity_id = $2`,
      [organisation, created.entity.id],
    );
    expect(auditCount.rows[0]?.count).toBe('2');
  });
});
