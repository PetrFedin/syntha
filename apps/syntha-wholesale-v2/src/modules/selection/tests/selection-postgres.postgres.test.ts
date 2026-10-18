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
  createShowroomUseCase,
  publishShowroomUseCase,
  runShowroomMigrations,
} from '@/modules/showroom';

import {
  PostgresSelectionRepository,
  createSelectionUseCase,
  grantShowroomAccess,
  grantShowroomAccessUseCase,
  runSelectionMigrations,
  setSelectionBudgetUseCase,
  type SelectionAuditRecord,
  type SelectionOutboxEvent,
} from '../index';

const now = new Date('2026-07-29T20:00:00.000Z');
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

describe('Selection PostgreSQL durability', () => {
  let pool: Awaited<ReturnType<typeof createNodePostgresPoolFromEnvironment>>;
  let seasons: PostgresSeasonRepository;
  let campaigns: PostgresCampaignRepository;
  let collections: PostgresCollectionRepository;
  let showrooms: PostgresShowroomRepository;
  let selections: PostgresSelectionRepository;

  beforeAll(async () => {
    pool = await createNodePostgresPoolFromEnvironment();
    await runLifecycleIdempotencyMigrations({ pool, appliedAt: now });
    await runSeasonMigrations({ pool, appliedAt: now });
    await runCampaignLifecycleMigrations({ pool, appliedAt: now });
    await runShowroomMigrations({ pool, appliedAt: now });
    await runSelectionMigrations({ pool, appliedAt: now });
    seasons = new PostgresSeasonRepository(pool);
    campaigns = new PostgresCampaignRepository(pool);
    collections = new PostgresCollectionRepository(pool);
    showrooms = new PostgresShowroomRepository(pool);
    selections = new PostgresSelectionRepository(pool);
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE
      syntha_selection_outbox,
      syntha_selection_audit,
      syntha_selection,
      syntha_showroom_access_grant,
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

  async function createPublishedShowroom(scope: string) {
    const sellerOrganisationId = organisationId(`BRAND-SELECTION-${scope}`);
    const season = await createSeasonUseCase(seasons, clock, ids(`${scope}-season`), {
      organisationId: sellerOrganisationId,
      code: `SEASON-${scope}`,
      name: `Season ${scope}`,
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-12-31T00:00:00.000Z'),
      actorCredentialId: 'selection-fixture',
      idempotencyKey: `season-${scope}-create`,
    });
    const campaign = await createCampaignUseCase({
      repository: campaigns,
      seasonRepository: seasons,
      clock,
      ids: ids(`${scope}-campaign`),
      organisationId: sellerOrganisationId,
      seasonId: season.entity.id,
      code: `CAMPAIGN-${scope}`,
      name: `Campaign ${scope}`,
      startsAt: new Date('2027-02-01T00:00:00.000Z'),
      endsAt: new Date('2027-11-30T00:00:00.000Z'),
      actorCredentialId: 'selection-fixture',
      idempotencyKey: `campaign-${scope}-create`,
    });
    const collection = await createCollectionUseCase({
      campaignRepository: campaigns,
      collectionRepository: collections,
      clock,
      ids: ids(`${scope}-collection`),
      organisationId: sellerOrganisationId,
      campaignId: campaign.entity.id,
      code: `COLLECTION-${scope}`,
      name: `Collection ${scope}`,
      currency: 'EUR',
      actorCredentialId: 'selection-fixture',
      idempotencyKey: `collection-${scope}-create`,
    });
    const ready = await updateCollectionUseCase({
      repository: collections,
      clock,
      ids: ids(`${scope}-ready`),
      organisationId: sellerOrganisationId,
      id: collection.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'selection-fixture',
      status: 'READY',
    });
    const publishedCollection = await updateCollectionUseCase({
      repository: collections,
      clock,
      ids: ids(`${scope}-published`),
      organisationId: sellerOrganisationId,
      id: ready.id,
      expectedVersion: 2,
      actorCredentialId: 'selection-fixture',
      status: 'PUBLISHED',
    });
    const showroom = await createShowroomUseCase({
      repository: showrooms,
      collectionRepository: collections,
      clock,
      ids: ids(`${scope}-showroom`),
      organisationId: sellerOrganisationId,
      collectionId: publishedCollection.id,
      code: `SHOWROOM-${scope}`,
      title: `Showroom ${scope}`,
      opensAt: new Date('2027-03-01T00:00:00.000Z'),
      closesAt: new Date('2027-10-01T00:00:00.000Z'),
      actorCredentialId: 'showroom-editor',
      idempotencyKey: `showroom-${scope}-create`,
    });
    const snapshot = await publishShowroomUseCase({
      repository: showrooms,
      collectionRepository: collections,
      clock,
      ids: ids(`${scope}-showroom-publish`),
      organisationId: sellerOrganisationId,
      id: showroom.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'showroom-publisher',
      idempotencyKey: `showroom-${scope}-publish`,
    });
    return {
      sellerOrganisationId,
      showroom: showroom.entity,
      snapshot: snapshot.entity,
    };
  }

  it('persists replay-safe access and one buyer-private Selection', async () => {
    const fixture = await createPublishedShowroom('REPLAY');
    const buyerOrganisationId = organisationId('SHOP-SELECTION-REPLAY');
    const grantInput = {
      repository: selections,
      showroomRepository: showrooms,
      clock,
      ids: ids('grant-replay'),
      sellerOrganisationId: fixture.sellerOrganisationId,
      buyerOrganisationId,
      showroomId: fixture.showroom.id,
      actorCredentialId: 'brand-admin',
      idempotencyKey: 'selection-grant-replay',
    } as const;
    const granted = await grantShowroomAccessUseCase(grantInput);
    const grantReplay = await grantShowroomAccessUseCase({
      ...grantInput,
      ids: ids('grant-replay-second'),
    });
    expect(granted.replayed).toBe(false);
    expect(grantReplay).toEqual({ entity: granted.entity, replayed: true });

    const selectionInput = {
      repository: selections,
      clock,
      ids: ids('selection-replay'),
      buyerOrganisationId,
      grantId: granted.entity.id,
      title: 'AW27 Main Buy',
      currency: 'EUR',
      budgetMinor: 500_000,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'selection-create-replay',
    } as const;
    const created = await createSelectionUseCase(selectionInput);
    const selectionReplay = await createSelectionUseCase({
      ...selectionInput,
      ids: ids('selection-replay-second'),
    });
    expect(selectionReplay).toEqual({ entity: created.entity, replayed: true });

    const changed = await setSelectionBudgetUseCase({
      repository: selections,
      clock,
      ids: ids('selection-budget'),
      buyerOrganisationId,
      selectionId: created.entity.id,
      expectedVersion: 1,
      budgetMinor: 750_000,
      actorCredentialId: 'buyer-admin',
    });
    expect(changed.version).toBe(2);

    const result = await pool.query<{
      readonly grants: string;
      readonly selections: string;
      readonly audits: string;
      readonly outbox: string;
      readonly commands: string;
      readonly budgetMinor: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_showroom_access_grant
        WHERE buyer_organisation_id = $1) AS grants,
      (SELECT count(*)::text FROM syntha_selection
        WHERE buyer_organisation_id = $1) AS selections,
      (SELECT count(*)::text FROM syntha_selection_audit
        WHERE buyer_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_selection_outbox
        WHERE buyer_organisation_id = $1) AS outbox,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id IN ($1, $2)
          AND command_name IN ('GRANT_SHOWROOM_ACCESS', 'CREATE_SELECTION')) AS commands,
      (SELECT budget_minor::text FROM syntha_selection
        WHERE buyer_organisation_id = $1) AS "budgetMinor"`,
    [buyerOrganisationId, fixture.sellerOrganisationId]);
    expect(result.rows[0]).toEqual({
      grants: '1',
      selections: '1',
      audits: '3',
      outbox: '3',
      commands: '2',
      budgetMinor: '750000',
    });
    expect(
      await selections.findSelection(organisationId('SHOP-SELECTION-OTHER'), created.entity.id),
    ).toBeNull();
  });

  it('rolls back grant, audit and idempotency when outbox append fails', async () => {
    const fixture = await createPublishedShowroom('ROLLBACK');
    const buyerOrganisationId = organisationId('SHOP-SELECTION-ROLLBACK');
    await pool.query(
      `INSERT INTO syntha_selection_outbox
         (id, seller_organisation_id, buyer_organisation_id, aggregate_type,
          aggregate_id, aggregate_version, event_name, payload, occurred_at)
       VALUES ($1, $2, $3, 'SHOWROOM_ACCESS', 'seed', 1,
               'SHOWROOM_ACCESS_GRANTED', '{}'::jsonb, $4::timestamptz)`,
      [
        'selection-event-rollback-grant-3',
        fixture.sellerOrganisationId,
        buyerOrganisationId,
        now.toISOString(),
      ],
    );

    let thrown: unknown;
    try {
      await grantShowroomAccessUseCase({
        repository: selections,
        showroomRepository: showrooms,
        clock,
        ids: ids('rollback-grant'),
        sellerOrganisationId: fixture.sellerOrganisationId,
        buyerOrganisationId,
        showroomId: fixture.showroom.id,
        actorCredentialId: 'brand-admin',
        idempotencyKey: 'selection-grant-rollback',
      });
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23505');

    const result = await pool.query<{
      readonly grants: string;
      readonly audits: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_showroom_access_grant
        WHERE buyer_organisation_id = $1) AS grants,
      (SELECT count(*)::text FROM syntha_selection_audit
        WHERE buyer_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $2 AND command_name = 'GRANT_SHOWROOM_ACCESS') AS commands`,
    [buyerOrganisationId, fixture.sellerOrganisationId]);
    expect(result.rows[0]).toEqual({ grants: '0', audits: '0', commands: '0' });
  });

  it('rejects a grant whose seller does not own the Showroom snapshot', async () => {
    const fixture = await createPublishedShowroom('TENANT');
    const otherSeller = organisationId('BRAND-SELECTION-OTHER');
    const buyerOrganisationId = organisationId('SHOP-SELECTION-TENANT');
    const grant = grantShowroomAccess({
      id: 'cross-tenant-grant',
      sellerOrganisationId: otherSeller,
      buyerOrganisationId,
      showroomId: fixture.showroom.id,
      showroomSnapshotId: fixture.snapshot.id,
      actorCredentialId: 'other-brand-admin',
      now,
    });
    const command = lifecycleCreateCommand({
      organisationId: otherSeller,
      commandName: 'GRANT_SHOWROOM_ACCESS',
      idempotencyKey: 'selection-cross-tenant-grant',
      payload: { showroomId: grant.showroomId, buyerOrganisationId },
      actorCredentialId: 'other-brand-admin',
      requestedAt: now,
    });
    const audit: SelectionAuditRecord = Object.freeze({
      id: 'selection-audit-cross-tenant',
      sellerOrganisationId: otherSeller,
      buyerOrganisationId,
      showroomId: grant.showroomId,
      accessGrantId: grant.id,
      selectionId: null,
      action: 'ACCESS_GRANTED',
      actorCredentialId: 'other-brand-admin',
      expectedVersion: null,
      resultingVersion: 1,
      occurredAt: now.toISOString(),
    });
    const event: SelectionOutboxEvent = Object.freeze({
      id: 'selection-event-cross-tenant',
      sellerOrganisationId: otherSeller,
      buyerOrganisationId,
      aggregateType: 'SHOWROOM_ACCESS',
      aggregateId: grant.id,
      aggregateVersion: 1,
      eventName: 'SHOWROOM_ACCESS_GRANTED',
      payload: Object.freeze({ showroomId: grant.showroomId }),
      occurredAt: now.toISOString(),
    });

    let thrown: unknown;
    try {
      await selections.createGrant(grant, audit, event, command);
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23503');

    const result = await pool.query<{ readonly grants: string; readonly commands: string }>(
      `SELECT
        (SELECT count(*)::text FROM syntha_showroom_access_grant
          WHERE seller_organisation_id = $1) AS grants,
        (SELECT count(*)::text FROM syntha_lifecycle_idempotency
          WHERE organisation_id = $1) AS commands`,
      [otherSeller],
    );
    expect(result.rows[0]).toEqual({ grants: '0', commands: '0' });
  });
});
