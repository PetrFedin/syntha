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
import { runLifecycleIdempotencyMigrations } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import {
  PostgresSeasonRepository,
  createSeasonUseCase,
  runSeasonMigrations,
} from '@/modules/seasons';
import {
  PostgresSelectionRepository,
  addSelectionItemUseCase,
  createSelectionUseCase,
  grantShowroomAccessUseCase,
  markSelectionReadyUseCase,
  runSelectionMigrations,
  setSelectionSizeCurveUseCase,
} from '@/modules/selection';
import {
  PostgresShowroomRepository,
  createShowroomUseCase,
  publishShowroomUseCase,
  runShowroomMigrations,
} from '@/modules/showroom';

import {
  PostgresOrderRepository,
  createOrderDraftUseCase,
  runOrderIdempotencyMigration,
  runOrderMigrations,
  setOrderLineCommercialTermsUseCase,
  setOrderLineQuantityUseCase,
  submitOrderUseCase,
} from '../index';

const now = new Date('2026-07-29T23:00:00.000Z');
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

describe('Order PostgreSQL durability', () => {
  let pool: Awaited<ReturnType<typeof createNodePostgresPoolFromEnvironment>>;
  let seasons: PostgresSeasonRepository;
  let campaigns: PostgresCampaignRepository;
  let collections: PostgresCollectionRepository;
  let showrooms: PostgresShowroomRepository;
  let selections: PostgresSelectionRepository;
  let orders: PostgresOrderRepository;

  beforeAll(async () => {
    pool = await createNodePostgresPoolFromEnvironment();
    await runLifecycleIdempotencyMigrations({ pool, appliedAt: now });
    await runSeasonMigrations({ pool, appliedAt: now });
    await runCampaignLifecycleMigrations({ pool, appliedAt: now });
    await runShowroomMigrations({ pool, appliedAt: now });
    await runSelectionMigrations({ pool, appliedAt: now });
    await runOrderMigrations({ pool, appliedAt: now });
    await runOrderIdempotencyMigration({ pool });
    seasons = new PostgresSeasonRepository(pool);
    campaigns = new PostgresCampaignRepository(pool);
    collections = new PostgresCollectionRepository(pool);
    showrooms = new PostgresShowroomRepository(pool);
    selections = new PostgresSelectionRepository(pool);
    orders = new PostgresOrderRepository(pool);
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE
      syntha_order_outbox,
      syntha_order_audit,
      syntha_submitted_order_snapshot,
      syntha_order,
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

  async function createReadySelection(scope: string) {
    const sellerOrganisationId = organisationId(`BRAND-ORDER-${scope}`);
    const buyerOrganisationId = organisationId(`SHOP-ORDER-${scope}`);
    const season = await createSeasonUseCase(seasons, clock, ids(`${scope}-season`), {
      organisationId: sellerOrganisationId,
      code: `SEASON-${scope}`,
      name: `Season ${scope}`,
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-12-31T00:00:00.000Z'),
      actorCredentialId: 'order-fixture',
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
      actorCredentialId: 'order-fixture',
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
      actorCredentialId: 'order-fixture',
      idempotencyKey: `collection-${scope}-create`,
    });
    const readyCollection = await updateCollectionUseCase({
      repository: collections,
      clock,
      ids: ids(`${scope}-collection-ready`),
      organisationId: sellerOrganisationId,
      id: collection.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'order-fixture',
      status: 'READY',
    });
    const publishedCollection = await updateCollectionUseCase({
      repository: collections,
      clock,
      ids: ids(`${scope}-collection-published`),
      organisationId: sellerOrganisationId,
      id: readyCollection.id,
      expectedVersion: 2,
      actorCredentialId: 'order-fixture',
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
    await publishShowroomUseCase({
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
    const grant = await grantShowroomAccessUseCase({
      repository: selections,
      showroomRepository: showrooms,
      clock,
      ids: ids(`${scope}-grant`),
      sellerOrganisationId,
      buyerOrganisationId,
      showroomId: showroom.entity.id,
      actorCredentialId: 'brand-admin',
      idempotencyKey: `grant-${scope}-create`,
    });
    const selection = await createSelectionUseCase({
      repository: selections,
      clock,
      ids: ids(`${scope}-selection`),
      buyerOrganisationId,
      grantId: grant.entity.id,
      title: `Buy ${scope}`,
      currency: 'EUR',
      budgetMinor: 500_000,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: `selection-${scope}-create`,
    });
    const withItem = await addSelectionItemUseCase({
      repository: selections,
      clock,
      ids: ids(`${scope}-item`),
      buyerOrganisationId,
      selectionId: selection.entity.id,
      expectedVersion: 1,
      productReference: `SKU-${scope}`,
      variantReference: 'BLACK',
      quantityIntent: 5,
      note: 'Order fixture',
      actorCredentialId: 'buyer-admin',
    });
    const sized = await setSelectionSizeCurveUseCase({
      repository: selections,
      clock,
      ids: ids(`${scope}-sizes`),
      buyerOrganisationId,
      selectionId: withItem.id,
      expectedVersion: 2,
      itemId: withItem.items[0]!.id,
      sizeCurve: [
        { size: 'S', quantity: 2 },
        { size: 'M', quantity: 3 },
      ],
      actorCredentialId: 'buyer-admin',
    });
    const readySelection = await markSelectionReadyUseCase({
      repository: selections,
      clock,
      ids: ids(`${scope}-ready`),
      buyerOrganisationId,
      selectionId: sized.id,
      expectedVersion: 3,
      actorCredentialId: 'buyer-admin',
    });
    return {
      buyerOrganisationId,
      sellerOrganisationId,
      grant: grant.entity,
      selection: readySelection,
    };
  }

  it('persists replay-safe draft and submission facts atomically', async () => {
    const fixture = await createReadySelection('REPLAY');
    const createInput = {
      repository: orders,
      selectionRepository: selections,
      clock,
      ids: ids('order-create-replay'),
      buyerOrganisationId: fixture.buyerOrganisationId,
      selectionId: fixture.selection.id,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'order-create-replay',
    } as const;
    const created = await createOrderDraftUseCase(createInput);
    const createReplay = await createOrderDraftUseCase({
      ...createInput,
      ids: ids('order-create-replay-second'),
    });
    expect(created.replayed).toBe(false);
    expect(createReplay).toEqual({ entity: created.entity, replayed: true });

    const line = created.entity.lines[0]!;
    const priced = await setOrderLineCommercialTermsUseCase({
      repository: orders,
      selectionRepository: selections,
      clock,
      ids: ids('order-price-replay'),
      buyerOrganisationId: fixture.buyerOrganisationId,
      orderId: created.entity.id,
      expectedVersion: 1,
      lineId: line.id,
      unitPriceMinor: 25_000,
      discountBasisPoints: 1_000,
      taxBasisPoints: 2_000,
      actorCredentialId: 'buyer-admin',
    });
    const resized = await setOrderLineQuantityUseCase({
      repository: orders,
      selectionRepository: selections,
      clock,
      ids: ids('order-quantity-replay'),
      buyerOrganisationId: fixture.buyerOrganisationId,
      orderId: priced.id,
      expectedVersion: 2,
      lineId: line.id,
      size: 'M',
      quantity: 4,
      actorCredentialId: 'buyer-admin',
    });
    expect(resized.totals).toEqual({
      quantity: 6,
      grossMinor: 150_000,
      discountMinor: 15_000,
      netMinor: 135_000,
      taxMinor: 27_000,
      totalMinor: 162_000,
    });

    const submitInput = {
      repository: orders,
      selectionRepository: selections,
      clock,
      ids: ids('order-submit-replay'),
      buyerOrganisationId: fixture.buyerOrganisationId,
      orderId: resized.id,
      expectedVersion: 3,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'order-submit-replay',
    } as const;
    const submitted = await submitOrderUseCase(submitInput);
    const submitReplay = await submitOrderUseCase({
      ...submitInput,
      ids: ids('order-submit-replay-second'),
    });
    expect(submitted.replayed).toBe(false);
    expect(submitReplay).toEqual({ entity: submitted.entity, replayed: true });
    expect(submitted.entity).toMatchObject({
      orderVersion: 4,
      totals: { quantity: 6, totalMinor: 162_000 },
    });

    const counts = await pool.query<{
      readonly orders: string;
      readonly snapshots: string;
      readonly audits: string;
      readonly outbox: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_order
        WHERE buyer_organisation_id = $1) AS orders,
      (SELECT count(*)::text FROM syntha_submitted_order_snapshot
        WHERE buyer_organisation_id = $1) AS snapshots,
      (SELECT count(*)::text FROM syntha_order_audit
        WHERE buyer_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_order_outbox
        WHERE buyer_organisation_id = $1) AS outbox,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $1
          AND command_name IN ('CREATE_ORDER_DRAFT', 'SUBMIT_ORDER')) AS commands`,
    [fixture.buyerOrganisationId]);
    expect(counts.rows[0]).toEqual({
      orders: '1',
      snapshots: '1',
      audits: '4',
      outbox: '4',
      commands: '2',
    });
    expect(
      await orders.findOrder(
        organisationId('SHOP-ORDER-OTHER'),
        created.entity.id,
      ),
    ).toBeNull();
    expect(
      await orders.findOrder(fixture.sellerOrganisationId, created.entity.id),
    ).toBeNull();
    expect(
      await orders.findSubmittedSnapshotForSeller(
        fixture.sellerOrganisationId,
        submitted.entity.id,
      ),
    ).toEqual(submitted.entity);
    expect(
      await orders.findSubmittedSnapshotForSeller(
        organisationId('BRAND-ORDER-OTHER'),
        submitted.entity.id,
      ),
    ).toBeNull();
  });

  it('rolls back Order, audit and idempotency when outbox append fails', async () => {
    const fixture = await createReadySelection('ROLLBACK');
    await pool.query(
      `INSERT INTO syntha_order_outbox
         (id, buyer_organisation_id, seller_organisation_id, aggregate_id,
          aggregate_version, event_name, payload, occurred_at)
       VALUES ($1, $2, $3, 'seed', 1, 'ORDER_DRAFT_CREATED',
               '{}'::jsonb, $4::timestamptz)`,
      [
        'order-event-rollback-order-4',
        fixture.buyerOrganisationId,
        fixture.sellerOrganisationId,
        now.toISOString(),
      ],
    );

    let thrown: unknown;
    try {
      await createOrderDraftUseCase({
        repository: orders,
        selectionRepository: selections,
        clock,
        ids: ids('rollback-order'),
        buyerOrganisationId: fixture.buyerOrganisationId,
        selectionId: fixture.selection.id,
        actorCredentialId: 'buyer-admin',
        idempotencyKey: 'order-create-rollback',
      });
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23505');

    const counts = await pool.query<{
      readonly orders: string;
      readonly audits: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_order
        WHERE buyer_organisation_id = $1) AS orders,
      (SELECT count(*)::text FROM syntha_order_audit
        WHERE buyer_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $1 AND command_name = 'CREATE_ORDER_DRAFT') AS commands`,
    [fixture.buyerOrganisationId]);
    expect(counts.rows[0]).toEqual({ orders: '0', audits: '0', commands: '0' });
  });

  it('rejects an Order whose buyer does not own the source Selection', async () => {
    const fixture = await createReadySelection('TENANT');
    let thrown: unknown;
    try {
      await pool.query(
        `INSERT INTO syntha_order
           (buyer_organisation_id, id, seller_organisation_id, selection_id,
            showroom_access_grant_id, showroom_id, showroom_snapshot_id,
            currency, status, lines, totals, owner_credential_id,
            submitted_snapshot_id, created_at, updated_at, version)
         VALUES ($1, 'cross-tenant-order', $2, $3, $4, $5, $6,
                 'EUR', 'DRAFT', '[]'::jsonb, '{}'::jsonb, 'cross-tenant',
                 NULL, $7::timestamptz, $7::timestamptz, 1)`,
        [
          organisationId('SHOP-ORDER-TENANT-OTHER'),
          fixture.sellerOrganisationId,
          fixture.selection.id,
          fixture.grant.id,
          fixture.grant.showroomId,
          fixture.grant.showroomSnapshotId,
          now.toISOString(),
        ],
      );
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23503');
  });
});
