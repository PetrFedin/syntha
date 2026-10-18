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
  PostgresOrderReviewRepository,
  approveSubmittedOrderUseCase,
  confirmApprovedOrderUseCase,
  createOrderDraftUseCase,
  runOrderIdempotencyMigration,
  runOrderMigrations,
  setOrderLineCommercialTermsUseCase,
  submitOrderUseCase,
} from '../index';

const now = new Date('2026-07-30T00:00:00.000Z');
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

describe('Order review PostgreSQL durability', () => {
  let pool: Awaited<ReturnType<typeof createNodePostgresPoolFromEnvironment>>;
  let seasons: PostgresSeasonRepository;
  let campaigns: PostgresCampaignRepository;
  let collections: PostgresCollectionRepository;
  let showrooms: PostgresShowroomRepository;
  let selections: PostgresSelectionRepository;
  let orders: PostgresOrderRepository;
  let reviews: PostgresOrderReviewRepository;

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
    reviews = new PostgresOrderReviewRepository(pool);
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE
      syntha_order_review_outbox,
      syntha_order_review_audit,
      syntha_confirmed_order_version,
      syntha_order_review,
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

  async function createSubmittedOrder(scope: string) {
    const sellerOrganisationId = organisationId(`BRAND-REVIEW-${scope}`);
    const buyerOrganisationId = organisationId(`SHOP-REVIEW-${scope}`);
    const season = await createSeasonUseCase(seasons, clock, ids(`${scope}-season`), {
      organisationId: sellerOrganisationId,
      code: `SEASON-${scope}`,
      name: `Season ${scope}`,
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-12-31T00:00:00.000Z'),
      actorCredentialId: 'fixture',
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
      actorCredentialId: 'fixture',
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
      actorCredentialId: 'fixture',
      idempotencyKey: `collection-${scope}-create`,
    });
    const readyCollection = await updateCollectionUseCase({
      repository: collections,
      clock,
      ids: ids(`${scope}-ready`),
      organisationId: sellerOrganisationId,
      id: collection.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'fixture',
      status: 'READY',
    });
    const publishedCollection = await updateCollectionUseCase({
      repository: collections,
      clock,
      ids: ids(`${scope}-published`),
      organisationId: sellerOrganisationId,
      id: readyCollection.id,
      expectedVersion: 2,
      actorCredentialId: 'fixture',
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
      actorCredentialId: 'fixture',
      idempotencyKey: `showroom-${scope}-create`,
    });
    await publishShowroomUseCase({
      repository: showrooms,
      collectionRepository: collections,
      clock,
      ids: ids(`${scope}-publish`),
      organisationId: sellerOrganisationId,
      id: showroom.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'fixture',
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
      note: 'Review fixture',
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
      ids: ids(`${scope}-selection-ready`),
      buyerOrganisationId,
      selectionId: sized.id,
      expectedVersion: 3,
      actorCredentialId: 'buyer-admin',
    });
    const draft = await createOrderDraftUseCase({
      repository: orders,
      selectionRepository: selections,
      clock,
      ids: ids(`${scope}-order`),
      buyerOrganisationId,
      selectionId: readySelection.id,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: `order-${scope}-create`,
    });
    const priced = await setOrderLineCommercialTermsUseCase({
      repository: orders,
      selectionRepository: selections,
      clock,
      ids: ids(`${scope}-price`),
      buyerOrganisationId,
      orderId: draft.entity.id,
      expectedVersion: 1,
      lineId: draft.entity.lines[0]!.id,
      unitPriceMinor: 25_000,
      discountBasisPoints: 1_000,
      taxBasisPoints: 2_000,
      actorCredentialId: 'buyer-admin',
    });
    const submitted = await submitOrderUseCase({
      repository: orders,
      selectionRepository: selections,
      clock,
      ids: ids(`${scope}-submit`),
      buyerOrganisationId,
      orderId: priced.id,
      expectedVersion: 2,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: `order-${scope}-submit`,
    });
    return { buyerOrganisationId, sellerOrganisationId, submitted: submitted.entity };
  }

  it('persists replay-safe approval and confirmation without changing source snapshot', async () => {
    const fixture = await createSubmittedOrder('REPLAY');
    const before = await orders.findSubmittedSnapshotForBuyer(
      fixture.buyerOrganisationId,
      fixture.submitted.id,
    );
    const approveInput = {
      orderRepository: orders,
      reviewRepository: reviews,
      clock,
      ids: ids('review-approve'),
      sellerOrganisationId: fixture.sellerOrganisationId,
      snapshotId: fixture.submitted.id,
      expectedVersion: 0,
      actorCredentialId: 'seller-approver',
      idempotencyKey: 'review-approve-replay',
    } as const;
    const approved = await approveSubmittedOrderUseCase(approveInput);
    const approveReplay = await approveSubmittedOrderUseCase({
      ...approveInput,
      ids: ids('review-approve-replay'),
    });
    expect(approveReplay).toEqual({ entity: approved.entity, replayed: true });

    const confirmInput = {
      orderRepository: orders,
      reviewRepository: reviews,
      clock,
      ids: ids('review-confirm'),
      sellerOrganisationId: fixture.sellerOrganisationId,
      reviewId: approved.entity.id,
      expectedVersion: 2,
      actorCredentialId: 'seller-confirmer',
      idempotencyKey: 'review-confirm-replay',
    } as const;
    const confirmed = await confirmApprovedOrderUseCase(confirmInput);
    const confirmReplay = await confirmApprovedOrderUseCase({
      ...confirmInput,
      ids: ids('review-confirm-replay'),
    });
    expect(confirmReplay).toEqual({ entity: confirmed.entity, replayed: true });
    expect(confirmed.entity.totals).toEqual(fixture.submitted.totals);
    expect(
      await orders.findSubmittedSnapshotForBuyer(
        fixture.buyerOrganisationId,
        fixture.submitted.id,
      ),
    ).toEqual(before);
    expect(
      await reviews.findConfirmedForBuyer(
        fixture.buyerOrganisationId,
        confirmed.entity.id,
      ),
    ).toEqual(confirmed.entity);
    expect(
      await reviews.findConfirmedForBuyer(
        organisationId('SHOP-REVIEW-OTHER'),
        confirmed.entity.id,
      ),
    ).toBeNull();

    const counts = await pool.query<{
      readonly reviews: string;
      readonly confirmed: string;
      readonly audits: string;
      readonly outbox: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_order_review
        WHERE seller_organisation_id = $1) AS reviews,
      (SELECT count(*)::text FROM syntha_confirmed_order_version
        WHERE seller_organisation_id = $1) AS confirmed,
      (SELECT count(*)::text FROM syntha_order_review_audit
        WHERE seller_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_order_review_outbox
        WHERE seller_organisation_id = $1) AS outbox,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $1
          AND command_name IN ('APPROVE_ORDER', 'CONFIRM_ORDER')) AS commands`,
    [fixture.sellerOrganisationId]);
    expect(counts.rows[0]).toEqual({
      reviews: '1',
      confirmed: '1',
      audits: '2',
      outbox: '2',
      commands: '2',
    });
  });

  it('rolls back decision, audit and idempotency when outbox append fails', async () => {
    const fixture = await createSubmittedOrder('ROLLBACK');
    await pool.query(
      `INSERT INTO syntha_order_review_outbox
         (id, buyer_organisation_id, seller_organisation_id, aggregate_id,
          aggregate_version, event_name, payload, occurred_at)
       VALUES ($1, $2, $3, 'seed', 1, 'ORDER_APPROVED',
               '{}'::jsonb, $4::timestamptz)`,
      [
        'order-review-event-rollback-3',
        fixture.buyerOrganisationId,
        fixture.sellerOrganisationId,
        now.toISOString(),
      ],
    );
    let thrown: unknown;
    try {
      await approveSubmittedOrderUseCase({
        orderRepository: orders,
        reviewRepository: reviews,
        clock,
        ids: ids('rollback'),
        sellerOrganisationId: fixture.sellerOrganisationId,
        snapshotId: fixture.submitted.id,
        expectedVersion: 0,
        actorCredentialId: 'seller-approver',
        idempotencyKey: 'review-approve-rollback',
      });
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23505');
    const counts = await pool.query<{
      readonly reviews: string;
      readonly audits: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_order_review
        WHERE seller_organisation_id = $1) AS reviews,
      (SELECT count(*)::text FROM syntha_order_review_audit
        WHERE seller_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $1 AND command_name = 'APPROVE_ORDER') AS commands`,
    [fixture.sellerOrganisationId]);
    expect(counts.rows[0]).toEqual({ reviews: '0', audits: '0', commands: '0' });
  });

  it('rejects a review whose seller does not own the submitted snapshot', async () => {
    const fixture = await createSubmittedOrder('TENANT');
    let thrown: unknown;
    try {
      await pool.query(
        `INSERT INTO syntha_order_review
           (seller_organisation_id, id, buyer_organisation_id, order_id,
            submitted_order_snapshot_id, status, amendment_request, approval,
            confirmed_order_version_id, owner_credential_id, created_at,
            updated_at, version)
         VALUES ($1, 'cross-tenant-review', $2, $3, $4, 'APPROVED', NULL,
                 $5::jsonb, NULL, 'cross-tenant', $6::timestamptz,
                 $6::timestamptz, 2)`,
        [
          organisationId('BRAND-REVIEW-TENANT-OTHER'),
          fixture.buyerOrganisationId,
          fixture.submitted.orderId,
          fixture.submitted.id,
          JSON.stringify({
            approvedByCredentialId: 'cross-tenant',
            approvedAt: now.toISOString(),
          }),
          now.toISOString(),
        ],
      );
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23503');
  });
});
