import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  PostgresCampaignRepository,
  createCampaignUseCase,
  runCampaignLifecycleMigrations,
} from '@/modules/campaigns';
import {
  PostgresCollectionRepository,
  createCollectionUseCase,
  updateCollectionUseCase,
} from '@/modules/collections';
import { createNodePostgresPoolFromEnvironment } from '@/modules/commercial-execution';
import {
  lifecycleCreateCommand,
  runLifecycleIdempotencyMigrations,
} from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import {
  PostgresSeasonRepository,
  createSeasonUseCase,
  runSeasonMigrations,
} from '@/modules/seasons';

import {
  PostgresShowroomRepository,
  createShowroom,
  createShowroomUseCase,
  publishShowroomUseCase,
  runShowroomMigrations,
  type ShowroomAuditRecord,
} from '../index';

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

describe('Showroom PostgreSQL publication', () => {
  let pool: Awaited<ReturnType<typeof createNodePostgresPoolFromEnvironment>>;
  let seasons: PostgresSeasonRepository;
  let campaigns: PostgresCampaignRepository;
  let collections: PostgresCollectionRepository;
  let showrooms: PostgresShowroomRepository;

  beforeAll(async () => {
    pool = await createNodePostgresPoolFromEnvironment();
    await runLifecycleIdempotencyMigrations({ pool, appliedAt: now });
    await runSeasonMigrations({ pool, appliedAt: now });
    await runCampaignLifecycleMigrations({ pool, appliedAt: now });
    await runShowroomMigrations({ pool, appliedAt: now });
    seasons = new PostgresSeasonRepository(pool);
    campaigns = new PostgresCampaignRepository(pool);
    collections = new PostgresCollectionRepository(pool);
    showrooms = new PostgresShowroomRepository(pool);
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE
      syntha_showroom_outbox,
      syntha_showroom_audit,
      syntha_showroom_publication_snapshot,
      syntha_showroom,
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

  async function createPublishedCollection(scope: string) {
    const organisation = organisationId(`ORG-SHOWROOM-${scope}`);
    const season = await createSeasonUseCase(seasons, clock, ids(`${scope}-season`), {
      organisationId: organisation,
      code: `SEASON-${scope}`,
      name: `Season ${scope}`,
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-12-31T00:00:00.000Z'),
      actorCredentialId: 'showroom-fixture',
      idempotencyKey: `season-${scope}-create`,
    });
    const campaign = await createCampaignUseCase({
      repository: campaigns,
      seasonRepository: seasons,
      clock,
      ids: ids(`${scope}-campaign`),
      organisationId: organisation,
      seasonId: season.entity.id,
      code: `CAMPAIGN-${scope}`,
      name: `Campaign ${scope}`,
      startsAt: new Date('2027-02-01T00:00:00.000Z'),
      endsAt: new Date('2027-11-30T00:00:00.000Z'),
      actorCredentialId: 'showroom-fixture',
      idempotencyKey: `campaign-${scope}-create`,
    });
    const collection = await createCollectionUseCase({
      campaignRepository: campaigns,
      collectionRepository: collections,
      clock,
      ids: ids(`${scope}-collection`),
      organisationId: organisation,
      campaignId: campaign.entity.id,
      code: `COLLECTION-${scope}`,
      name: `Collection ${scope}`,
      currency: 'EUR',
      actorCredentialId: 'showroom-fixture',
      idempotencyKey: `collection-${scope}-create`,
    });
    const ready = await updateCollectionUseCase({
      repository: collections,
      clock,
      ids: ids(`${scope}-ready`),
      organisationId: organisation,
      id: collection.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'showroom-fixture',
      status: 'READY',
    });
    const published = await updateCollectionUseCase({
      repository: collections,
      clock,
      ids: ids(`${scope}-published`),
      organisationId: organisation,
      id: ready.id,
      expectedVersion: 2,
      actorCredentialId: 'showroom-fixture',
      status: 'PUBLISHED',
    });
    return { organisation, collection: published };
  }

  it('publishes and replays one immutable snapshot with audit and outbox evidence', async () => {
    const fixture = await createPublishedCollection('REPLAY');
    const created = await createShowroomUseCase({
      repository: showrooms,
      collectionRepository: collections,
      clock,
      ids: ids('showroom-create'),
      organisationId: fixture.organisation,
      collectionId: fixture.collection.id,
      code: 'BUYER-PREVIEW',
      title: 'Buyer Preview',
      description: 'Published from PostgreSQL',
      opensAt: new Date('2027-03-01T00:00:00.000Z'),
      closesAt: new Date('2027-10-01T00:00:00.000Z'),
      actorCredentialId: 'showroom-editor',
      idempotencyKey: 'showroom-postgres-create',
    });
    const input = {
      repository: showrooms,
      collectionRepository: collections,
      clock,
      ids: ids('showroom-publish'),
      organisationId: fixture.organisation,
      id: created.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'showroom-publisher',
      idempotencyKey: 'showroom-postgres-publish',
    } as const;

    const published = await publishShowroomUseCase(input);
    const replay = await publishShowroomUseCase({ ...input, ids: ids('showroom-replay') });

    expect(published.replayed).toBe(false);
    expect(replay).toEqual({ entity: published.entity, replayed: true });
    const result = await pool.query<{
      readonly status: string;
      readonly version: string;
      readonly snapshots: string;
      readonly audits: string;
      readonly outbox: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT status FROM syntha_showroom WHERE organisation_id = $1 AND id = $2) AS status,
      (SELECT version::text FROM syntha_showroom WHERE organisation_id = $1 AND id = $2) AS version,
      (SELECT count(*)::text FROM syntha_showroom_publication_snapshot WHERE organisation_id = $1) AS snapshots,
      (SELECT count(*)::text FROM syntha_showroom_audit WHERE organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_showroom_outbox WHERE organisation_id = $1) AS outbox,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency WHERE organisation_id = $1) AS commands`,
      [fixture.organisation, created.entity.id],
    );
    expect(result.rows[0]).toEqual({
      status: 'PUBLISHED',
      version: '2',
      snapshots: '1',
      audits: '2',
      outbox: '1',
      commands: '5',
    });
  });

  it('rolls back aggregate, snapshot, audit, outbox and publish command together', async () => {
    const fixture = await createPublishedCollection('ROLLBACK');
    const created = await createShowroomUseCase({
      repository: showrooms,
      collectionRepository: collections,
      clock,
      ids: ids('rollback-create'),
      organisationId: fixture.organisation,
      collectionId: fixture.collection.id,
      code: 'ROLLBACK',
      title: 'Rollback Showroom',
      opensAt: new Date('2027-03-01T00:00:00.000Z'),
      closesAt: new Date('2027-10-01T00:00:00.000Z'),
      actorCredentialId: 'showroom-editor',
      idempotencyKey: 'showroom-rollback-create',
    });
    await pool.query(
      `INSERT INTO syntha_showroom_outbox
         (id, organisation_id, aggregate_id, aggregate_version, event_name, payload, occurred_at)
       VALUES ($1, $2, $3, 1, 'SHOWROOM_PUBLISHED', '{}'::jsonb, $4::timestamptz)`,
      ['event-rollback-publish-3', fixture.organisation, created.entity.id, now.toISOString()],
    );

    let thrown: unknown;
    try {
      await publishShowroomUseCase({
        repository: showrooms,
        collectionRepository: collections,
        clock,
        ids: ids('rollback-publish'),
        organisationId: fixture.organisation,
        id: created.entity.id,
        expectedVersion: 1,
        actorCredentialId: 'showroom-publisher',
        idempotencyKey: 'showroom-rollback-publish',
      });
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23505');

    const result = await pool.query<{
      readonly status: string;
      readonly version: string;
      readonly snapshots: string;
      readonly audits: string;
      readonly publishCommands: string;
    }>(`SELECT
      (SELECT status FROM syntha_showroom WHERE organisation_id = $1 AND id = $2) AS status,
      (SELECT version::text FROM syntha_showroom WHERE organisation_id = $1 AND id = $2) AS version,
      (SELECT count(*)::text FROM syntha_showroom_publication_snapshot WHERE organisation_id = $1) AS snapshots,
      (SELECT count(*)::text FROM syntha_showroom_audit WHERE organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $1 AND command_name = 'PUBLISH_SHOWROOM') AS "publishCommands"`,
      [fixture.organisation, created.entity.id],
    );
    expect(result.rows[0]).toEqual({
      status: 'DRAFT',
      version: '1',
      snapshots: '0',
      audits: '1',
      publishCommands: '0',
    });
  });

  it('rejects a Showroom that references another organisation Collection', async () => {
    const fixture = await createPublishedCollection('TENANT-A');
    const otherOrganisation = organisationId('ORG-SHOWROOM-TENANT-B');
    const showroom = createShowroom({
      id: 'showroom-cross-tenant',
      organisationId: otherOrganisation,
      collectionId: fixture.collection.id,
      code: 'CROSS-TENANT',
      title: 'Cross Tenant',
      opensAt: new Date('2027-03-01T00:00:00.000Z'),
      closesAt: new Date('2027-10-01T00:00:00.000Z'),
      ownerCredentialId: 'other-operator',
      now,
    });
    const command = lifecycleCreateCommand({
      organisationId: otherOrganisation,
      commandName: 'CREATE_SHOWROOM',
      idempotencyKey: 'showroom-cross-tenant-command',
      payload: { collectionId: fixture.collection.id, code: showroom.code },
      actorCredentialId: 'other-operator',
      requestedAt: now,
    });
    const audit: ShowroomAuditRecord = Object.freeze({
      id: 'audit-cross-tenant-showroom',
      organisationId: otherOrganisation,
      showroomId: showroom.id,
      action: 'CREATED',
      actorCredentialId: 'other-operator',
      expectedVersion: null,
      resultingVersion: 1,
      snapshotId: null,
      occurredAt: now.toISOString(),
    });

    let thrown: unknown;
    try {
      await showrooms.create(showroom, audit, command);
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23503');

    const result = await pool.query<{ readonly showrooms: string; readonly commands: string }>(
      `SELECT
        (SELECT count(*)::text FROM syntha_showroom WHERE organisation_id = $1) AS showrooms,
        (SELECT count(*)::text FROM syntha_lifecycle_idempotency WHERE organisation_id = $1) AS commands`,
      [otherOrganisation],
    );
    expect(result.rows[0]).toEqual({ showrooms: '0', commands: '0' });
  });
});
