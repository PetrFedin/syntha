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
  PostgresOrderAmendmentResponseRepository,
  PostgresOrderRepository,
  PostgresOrderReviewRepository,
  acceptOrderAmendmentUseCase,
  createOrderDraftUseCase,
  rejectOrderAmendmentUseCase,
  requestOrderAmendmentUseCase,
  runOrderAmendmentResponseMigrations,
  runOrderIdempotencyMigration,
  runOrderMigrations,
  setOrderLineCommercialTermsUseCase,
  submitOrderUseCase,
} from '../index';

const now = new Date('2026-07-30T10:00:00.000Z');
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

describe('Order amendment response PostgreSQL durability', () => {
  let pool: Awaited<ReturnType<typeof createNodePostgresPoolFromEnvironment>>;
  let seasons: PostgresSeasonRepository;
  let campaigns: PostgresCampaignRepository;
  let collections: PostgresCollectionRepository;
  let showrooms: PostgresShowroomRepository;
  let selections: PostgresSelectionRepository;
  let orders: PostgresOrderRepository;
  let reviews: PostgresOrderReviewRepository;
  let responses: PostgresOrderAmendmentResponseRepository;

  beforeAll(async () => {
    pool = await createNodePostgresPoolFromEnvironment();
    await runLifecycleIdempotencyMigrations({ pool, appliedAt: now });
    await runSeasonMigrations({ pool, appliedAt: now });
    await runCampaignLifecycleMigrations({ pool, appliedAt: now });
    await runShowroomMigrations({ pool, appliedAt: now });
    await runSelectionMigrations({ pool, appliedAt: now });
    await runOrderMigrations({ pool, appliedAt: now });
    await runOrderIdempotencyMigration({ pool });
    await runOrderAmendmentResponseMigrations({ pool, appliedAt: now });
    seasons = new PostgresSeasonRepository(pool);
    campaigns = new PostgresCampaignRepository(pool);
    collections = new PostgresCollectionRepository(pool);
    showrooms = new PostgresShowroomRepository(pool);
    selections = new PostgresSelectionRepository(pool);
    orders = new PostgresOrderRepository(pool);
    reviews = new PostgresOrderReviewRepository(pool);
    responses = new PostgresOrderAmendmentResponseRepository(pool);
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE
      syntha_order_amendment_response_outbox,
      syntha_order_amendment_response_audit,
      syntha_revised_order_version,
      syntha_order_amendment_response,
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
    const sellerOrganisationId = organisationId(`BRAND-RESPONSE-${scope}`);
    const buyerOrganisationId = organisationId(`SHOP-RESPONSE-${scope}`);
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
      note: 'Amendment response fixture',
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

  async function createAmendmentReview(scope: string) {
    const fixture = await createSubmittedOrder(scope);
    const review = await requestOrderAmendmentUseCase({
      orderRepository: orders,
      reviewRepository: reviews,
      clock,
      ids: ids(`${scope}-review`),
      sellerOrganisationId: fixture.sellerOrganisationId,
      snapshotId: fixture.submitted.id,
      expectedVersion: 0,
      reason: 'Reduce M and improve discount',
      lineChanges: [
        {
          lineId: fixture.submitted.lines[0]!.id,
          sizeQuantities: [{ size: 'M', quantity: 2 }],
          discountBasisPoints: 500,
        },
      ],
      actorCredentialId: 'seller-reviewer',
      idempotencyKey: `review-${scope}-amend`,
    });
    return { ...fixture, review: review.entity };
  }

  it('persists replay-safe accept and immutable revised version without changing sources', async () => {
    const fixture = await createAmendmentReview('REPLAY');
    const snapshotBefore = await orders.findSubmittedSnapshotForBuyer(
      fixture.buyerOrganisationId,
      fixture.submitted.id,
    );
    const reviewBefore = await reviews.findReviewForBuyer(
      fixture.buyerOrganisationId,
      fixture.review.id,
    );
    const input = {
      orderRepository: orders,
      reviewRepository: reviews,
      responseRepository: responses,
      clock,
      ids: ids('response-accept'),
      buyerOrganisationId: fixture.buyerOrganisationId,
      reviewId: fixture.review.id,
      expectedReviewVersion: fixture.review.version,
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'response-accept-replay',
    } as const;
    const accepted = await acceptOrderAmendmentUseCase(input);
    const replay = await acceptOrderAmendmentUseCase({
      ...input,
      ids: ids('response-accept-replay'),
    });
    expect(replay).toEqual({ entity: accepted.entity, replayed: true });
    expect(accepted.entity.revisedOrderVersionId).toBeDefined();
    expect(
      await responses.findResponseForSeller(
        fixture.sellerOrganisationId,
        accepted.entity.id,
      ),
    ).toEqual(accepted.entity);
    const revised = await responses.findRevisedForBuyer(
      fixture.buyerOrganisationId,
      accepted.entity.revisedOrderVersionId!,
    );
    expect(revised?.totals).toEqual({
      quantity: 4,
      grossMinor: 100_000,
      discountMinor: 5_000,
      netMinor: 95_000,
      taxMinor: 19_000,
      totalMinor: 114_000,
    });
    expect(
      await orders.findSubmittedSnapshotForBuyer(
        fixture.buyerOrganisationId,
        fixture.submitted.id,
      ),
    ).toEqual(snapshotBefore);
    expect(
      await reviews.findReviewForBuyer(
        fixture.buyerOrganisationId,
        fixture.review.id,
      ),
    ).toEqual(reviewBefore);
    const counts = await pool.query<{
      readonly responses: string;
      readonly revisions: string;
      readonly audits: string;
      readonly outbox: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_order_amendment_response
        WHERE buyer_organisation_id = $1) AS responses,
      (SELECT count(*)::text FROM syntha_revised_order_version
        WHERE buyer_organisation_id = $1) AS revisions,
      (SELECT count(*)::text FROM syntha_order_amendment_response_audit
        WHERE buyer_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_order_amendment_response_outbox
        WHERE buyer_organisation_id = $1) AS outbox,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $1 AND command_name = 'ACCEPT_ORDER_AMENDMENT') AS commands`,
    [fixture.buyerOrganisationId]);
    expect(counts.rows[0]).toEqual({
      responses: '1',
      revisions: '1',
      audits: '1',
      outbox: '1',
      commands: '1',
    });
  });

  it('persists rejection without creating a revised version', async () => {
    const fixture = await createAmendmentReview('REJECT');
    const rejected = await rejectOrderAmendmentUseCase({
      orderRepository: orders,
      reviewRepository: reviews,
      responseRepository: responses,
      clock,
      ids: ids('response-reject'),
      buyerOrganisationId: fixture.buyerOrganisationId,
      reviewId: fixture.review.id,
      expectedReviewVersion: fixture.review.version,
      reason: 'Original terms remain required',
      actorCredentialId: 'buyer-admin',
      idempotencyKey: 'response-reject-create',
    });
    expect(rejected.entity.decision).toBe('REJECTED');
    expect(rejected.entity.revisedOrderVersionId).toBeUndefined();
    expect(await responses.listRevisedForBuyer(fixture.buyerOrganisationId)).toEqual([]);
  });

  it('rolls back response, revision, audit and idempotency when outbox append fails', async () => {
    const fixture = await createAmendmentReview('ROLLBACK');
    await pool.query(
      `INSERT INTO syntha_order_amendment_response_outbox
         (id, buyer_organisation_id, seller_organisation_id, aggregate_id,
          aggregate_version, event_name, payload, occurred_at)
       VALUES ($1, $2, $3, 'seed', 1, 'ORDER_AMENDMENT_ACCEPTED',
               '{}'::jsonb, $4::timestamptz)`,
      [
        'order-amendment-response-event-response-rollback-4',
        fixture.buyerOrganisationId,
        fixture.sellerOrganisationId,
        now.toISOString(),
      ],
    );
    let thrown: unknown;
    try {
      await acceptOrderAmendmentUseCase({
        orderRepository: orders,
        reviewRepository: reviews,
        responseRepository: responses,
        clock,
        ids: ids('response-rollback'),
        buyerOrganisationId: fixture.buyerOrganisationId,
        reviewId: fixture.review.id,
        expectedReviewVersion: fixture.review.version,
        actorCredentialId: 'buyer-admin',
        idempotencyKey: 'response-accept-rollback',
      });
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23505');
    const counts = await pool.query<{
      readonly responses: string;
      readonly revisions: string;
      readonly audits: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_order_amendment_response
        WHERE buyer_organisation_id = $1) AS responses,
      (SELECT count(*)::text FROM syntha_revised_order_version
        WHERE buyer_organisation_id = $1) AS revisions,
      (SELECT count(*)::text FROM syntha_order_amendment_response_audit
        WHERE buyer_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $1 AND command_name = 'ACCEPT_ORDER_AMENDMENT') AS commands`,
    [fixture.buyerOrganisationId]);
    expect(counts.rows[0]).toEqual({
      responses: '0',
      revisions: '0',
      audits: '0',
      commands: '0',
    });
  });

  it('rejects a response whose buyer does not own the source review', async () => {
    const fixture = await createAmendmentReview('TENANT');
    let thrown: unknown;
    try {
      await pool.query(
        `INSERT INTO syntha_order_amendment_response
           (buyer_organisation_id, id, seller_organisation_id, order_review_id,
            submitted_order_snapshot_id, order_id, decision,
            revised_order_version_id, responded_at, payload, version)
         VALUES ($1, 'cross-tenant-response', $2, $3, $4, $5, 'REJECTED',
                 NULL, $6::timestamptz, $7::jsonb, 1)`,
        [
          organisationId('SHOP-RESPONSE-TENANT-OTHER'),
          fixture.sellerOrganisationId,
          fixture.review.id,
          fixture.submitted.id,
          fixture.submitted.orderId,
          now.toISOString(),
          JSON.stringify({
            id: 'cross-tenant-response',
            buyerOrganisationId: 'SHOP-RESPONSE-TENANT-OTHER',
          }),
        ],
      );
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23503');
  });
});
