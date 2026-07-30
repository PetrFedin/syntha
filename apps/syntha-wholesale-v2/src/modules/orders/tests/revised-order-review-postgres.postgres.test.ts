import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { runCampaignLifecycleMigrations } from '@/modules/campaigns';
import { createNodePostgresPoolFromEnvironment } from '@/modules/commercial-execution';
import { runLifecycleIdempotencyMigrations } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import { runSeasonMigrations } from '@/modules/seasons';
import { selectionItemId, runSelectionMigrations } from '@/modules/selection';
import { runShowroomMigrations } from '@/modules/showroom';

import {
  PostgresOrderAmendmentResponseRepository,
  PostgresRevisedOrderReviewRepository,
  approveRevisedOrderUseCase,
  confirmApprovedRevisedOrderUseCase,
  orderAmendmentResponseId,
  orderId,
  orderLineId,
  requestRevisedOrderAmendmentUseCase,
  revisedOrderVersionId,
  runOrderAmendmentResponseMigrations,
  runOrderIdempotencyMigration,
  runOrderMigrations,
  runRevisedOrderReviewMigrations,
  submittedOrderSnapshotId,
  type RevisedOrderVersion,
} from '../index';

const now = new Date('2026-07-30T16:00:00.000Z');
const clock = Object.freeze({ now: () => now });
const buyerOrganisationId = organisationId('SHOP-REVISED-PG');
const sellerOrganisationId = organisationId('BRAND-REVISED-PG');

function ids(scope: string) {
  let sequence = 0;
  return Object.freeze({ next: (prefix: string) => `${prefix}-${scope}-${++sequence}` });
}

function errorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

function revisedFixture(scope: string): RevisedOrderVersion {
  return Object.freeze({
    id: revisedOrderVersionId(`revised-order-pg-${scope}`),
    orderAmendmentResponseId: orderAmendmentResponseId(`response-pg-${scope}`),
    orderReviewId: `order-review-pg-${scope}` as RevisedOrderVersion['orderReviewId'],
    submittedOrderSnapshotId: submittedOrderSnapshotId(`snapshot-pg-${scope}`),
    orderId: orderId(`order-pg-${scope}`),
    sourceOrderVersion: 2,
    buyerOrganisationId,
    sellerOrganisationId,
    revisionKind: 'ACCEPTED',
    currency: 'EUR',
    lines: Object.freeze([
      Object.freeze({
        id: orderLineId(`line-pg-${scope}`),
        selectionItemId: selectionItemId(`selection-item-pg-${scope}`),
        productReference: `SKU-PG-${scope}`,
        variantReference: 'BLACK',
        sizeQuantities: Object.freeze([
          Object.freeze({ size: 'S', quantity: 2 }),
          Object.freeze({ size: 'M', quantity: 2 }),
        ]),
        totalQuantity: 4,
        unitPriceMinor: 25_000,
        discountBasisPoints: 500,
        taxBasisPoints: 2_000,
        totals: Object.freeze({
          grossMinor: 100_000,
          discountMinor: 5_000,
          netMinor: 95_000,
          taxMinor: 19_000,
          totalMinor: 114_000,
        }),
        note: 'PostgreSQL fixture',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }),
    ]),
    totals: Object.freeze({
      quantity: 4,
      grossMinor: 100_000,
      discountMinor: 5_000,
      netMinor: 95_000,
      taxMinor: 19_000,
      totalMinor: 114_000,
    }),
    createdByCredentialId: 'buyer-admin',
    createdAt: now.toISOString(),
  });
}

describe('Revised Order review PostgreSQL durability', () => {
  let pool: Awaited<ReturnType<typeof createNodePostgresPoolFromEnvironment>>;
  let responseRepository: PostgresOrderAmendmentResponseRepository;
  let reviewRepository: PostgresRevisedOrderReviewRepository;

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
    await runRevisedOrderReviewMigrations({ pool, appliedAt: now });
    responseRepository = new PostgresOrderAmendmentResponseRepository(pool);
    reviewRepository = new PostgresRevisedOrderReviewRepository(pool);
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE
      syntha_revised_order_review_outbox,
      syntha_revised_order_review_audit,
      syntha_revised_confirmed_order_version,
      syntha_revised_order_review,
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
      syntha_lifecycle_idempotency
      RESTART IDENTITY CASCADE`);
  });

  afterAll(async () => {
    await pool?.close();
  });

  async function seedSource(scope: string): Promise<RevisedOrderVersion> {
    const revised = revisedFixture(scope);
    const orderLines = revised.lines;
    const totals = revised.totals;
    await pool.query('ALTER TABLE syntha_order DISABLE TRIGGER ALL');
    await pool.query('ALTER TABLE syntha_submitted_order_snapshot DISABLE TRIGGER ALL');
    try {
      await pool.query(
        `INSERT INTO syntha_order
           (buyer_organisation_id, id, seller_organisation_id, selection_id,
            showroom_access_grant_id, showroom_id, showroom_snapshot_id,
            currency, status, lines, totals, owner_credential_id,
            submitted_snapshot_id, created_at, updated_at, version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'EUR', 'SUBMITTED',
                 $8::jsonb, $9::jsonb, 'buyer-admin', $10,
                 $11::timestamptz, $11::timestamptz, 2)`,
        [
          buyerOrganisationId,
          revised.orderId,
          sellerOrganisationId,
          `selection-pg-${scope}`,
          `grant-pg-${scope}`,
          `showroom-pg-${scope}`,
          `showroom-snapshot-pg-${scope}`,
          JSON.stringify(orderLines),
          JSON.stringify(totals),
          revised.submittedOrderSnapshotId,
          now.toISOString(),
        ],
      );
      await pool.query(
        `INSERT INTO syntha_submitted_order_snapshot
           (buyer_organisation_id, id, order_id, order_version,
            seller_organisation_id, selection_id, showroom_access_grant_id,
            showroom_id, showroom_snapshot_id, currency, lines, totals,
            submitted_by_credential_id, submitted_at)
         VALUES ($1, $2, $3, 2, $4, $5, $6, $7, $8, 'EUR',
                 $9::jsonb, $10::jsonb, 'buyer-admin', $11::timestamptz)`,
        [
          buyerOrganisationId,
          revised.submittedOrderSnapshotId,
          revised.orderId,
          sellerOrganisationId,
          `selection-pg-${scope}`,
          `grant-pg-${scope}`,
          `showroom-pg-${scope}`,
          `showroom-snapshot-pg-${scope}`,
          JSON.stringify(orderLines),
          JSON.stringify(totals),
          now.toISOString(),
        ],
      );
    } finally {
      await pool.query('ALTER TABLE syntha_submitted_order_snapshot ENABLE TRIGGER ALL');
      await pool.query('ALTER TABLE syntha_order ENABLE TRIGGER ALL');
    }
    const amendmentRequest = Object.freeze({
      reason: 'Seller amendment',
      lineChanges: Object.freeze([
        Object.freeze({
          lineId: revised.lines[0]!.id,
          sizeQuantities: Object.freeze([
            Object.freeze({ size: 'M', quantity: 2 }),
          ]),
        }),
      ]),
      requestedByCredentialId: 'seller-reviewer',
      requestedAt: now.toISOString(),
    });
    await pool.query(
      `INSERT INTO syntha_order_review
         (seller_organisation_id, id, buyer_organisation_id, order_id,
          submitted_order_snapshot_id, status, amendment_request, approval,
          confirmed_order_version_id, owner_credential_id, created_at,
          updated_at, version)
       VALUES ($1, $2, $3, $4, $5, 'AMENDMENT_REQUESTED', $6::jsonb,
               NULL, NULL, 'seller-reviewer', $7::timestamptz,
               $7::timestamptz, 2)`,
      [
        sellerOrganisationId,
        revised.orderReviewId,
        buyerOrganisationId,
        revised.orderId,
        revised.submittedOrderSnapshotId,
        JSON.stringify(amendmentRequest),
        now.toISOString(),
      ],
    );
    const responsePayload = Object.freeze({
      id: revised.orderAmendmentResponseId,
      orderReviewId: revised.orderReviewId,
      submittedOrderSnapshotId: revised.submittedOrderSnapshotId,
      orderId: revised.orderId,
      buyerOrganisationId,
      sellerOrganisationId,
      decision: 'ACCEPTED',
      proposedLineChanges: amendmentRequest.lineChanges,
      revisedOrderVersionId: revised.id,
      respondedByCredentialId: 'buyer-admin',
      respondedAt: now.toISOString(),
      version: 1,
    });
    await pool.query(
      `INSERT INTO syntha_order_amendment_response
         (buyer_organisation_id, id, seller_organisation_id,
          order_review_id, submitted_order_snapshot_id, order_id,
          decision, revised_order_version_id, responded_at, payload, version)
       VALUES ($1, $2, $3, $4, $5, $6, 'ACCEPTED', $7,
               $8::timestamptz, $9::jsonb, 1)`,
      [
        buyerOrganisationId,
        revised.orderAmendmentResponseId,
        sellerOrganisationId,
        revised.orderReviewId,
        revised.submittedOrderSnapshotId,
        revised.orderId,
        revised.id,
        now.toISOString(),
        JSON.stringify(responsePayload),
      ],
    );
    await pool.query(
      `INSERT INTO syntha_revised_order_version
         (buyer_organisation_id, id, seller_organisation_id,
          order_amendment_response_id, order_review_id,
          submitted_order_snapshot_id, order_id, source_order_version,
          revision_kind, currency, created_at, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 2, 'ACCEPTED',
               'EUR', $8::timestamptz, $9::jsonb)`,
      [
        buyerOrganisationId,
        revised.id,
        sellerOrganisationId,
        revised.orderAmendmentResponseId,
        revised.orderReviewId,
        revised.submittedOrderSnapshotId,
        revised.orderId,
        now.toISOString(),
        JSON.stringify(revised),
      ],
    );
    return revised;
  }

  it('persists replay-safe approval and confirmation without changing the Revised Order', async () => {
    const revised = await seedSource('REPLAY');
    const sourceBefore = await responseRepository.findRevisedForSeller(
      sellerOrganisationId,
      revised.id,
    );
    const approveInput = {
      responseRepository,
      reviewRepository,
      clock,
      ids: ids('approve'),
      sellerOrganisationId,
      versionId: revised.id,
      expectedVersion: 0,
      actorCredentialId: 'seller-reviewer',
      idempotencyKey: 'approve-revised-pg-replay',
    } as const;
    const approved = await approveRevisedOrderUseCase(approveInput);
    const approveReplay = await approveRevisedOrderUseCase({
      ...approveInput,
      ids: ids('approve-replay'),
    });
    expect(approveReplay).toEqual({ entity: approved.entity, replayed: true });

    const confirmInput = {
      responseRepository,
      reviewRepository,
      clock,
      ids: ids('confirm'),
      sellerOrganisationId,
      reviewId: approved.entity.id,
      expectedVersion: approved.entity.version,
      actorCredentialId: 'seller-approver',
      idempotencyKey: 'confirm-revised-pg-replay',
    } as const;
    const confirmed = await confirmApprovedRevisedOrderUseCase(confirmInput);
    const confirmReplay = await confirmApprovedRevisedOrderUseCase({
      ...confirmInput,
      ids: ids('confirm-replay'),
    });
    expect(confirmReplay).toEqual({ entity: confirmed.entity, replayed: true });
    expect(confirmed.entity.totals).toEqual(revised.totals);
    expect(
      await reviewRepository.findConfirmedForBuyer(
        buyerOrganisationId,
        confirmed.entity.id,
      ),
    ).toEqual(confirmed.entity);
    expect(
      await responseRepository.findRevisedForSeller(
        sellerOrganisationId,
        revised.id,
      ),
    ).toEqual(sourceBefore);
    const counts = await pool.query<{
      readonly reviews: string;
      readonly confirmed: string;
      readonly audits: string;
      readonly outbox: string;
      readonly commands: string;
    }>(`SELECT
      (SELECT count(*)::text FROM syntha_revised_order_review
        WHERE seller_organisation_id = $1) AS reviews,
      (SELECT count(*)::text FROM syntha_revised_confirmed_order_version
        WHERE seller_organisation_id = $1) AS confirmed,
      (SELECT count(*)::text FROM syntha_revised_order_review_audit
        WHERE seller_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_revised_order_review_outbox
        WHERE seller_organisation_id = $1) AS outbox,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $1 AND command_name IN
          ('APPROVE_REVISED_ORDER', 'CONFIRM_REVISED_ORDER')) AS commands`,
    [sellerOrganisationId]);
    expect(counts.rows[0]).toEqual({
      reviews: '1',
      confirmed: '1',
      audits: '2',
      outbox: '2',
      commands: '2',
    });
  });

  it('persists another amendment request without a confirmed version', async () => {
    const revised = await seedSource('AMEND');
    const requested = await requestRevisedOrderAmendmentUseCase({
      responseRepository,
      reviewRepository,
      clock,
      ids: ids('request'),
      sellerOrganisationId,
      versionId: revised.id,
      expectedVersion: 0,
      reason: 'Reduce M again',
      lineChanges: [
        {
          lineId: revised.lines[0]!.id,
          sizeQuantities: [{ size: 'M', quantity: 1 }],
        },
      ],
      actorCredentialId: 'seller-reviewer',
      idempotencyKey: 'request-revised-pg-create',
    });
    expect(requested.entity.status).toBe('AMENDMENT_REQUESTED');
    expect(await reviewRepository.listConfirmedForSeller(sellerOrganisationId)).toEqual([]);
  });

  it('rolls back review, audit and idempotency when outbox append fails', async () => {
    const revised = await seedSource('ROLLBACK');
    await pool.query(
      `INSERT INTO syntha_revised_order_review_outbox
         (id, buyer_organisation_id, seller_organisation_id, aggregate_id,
          aggregate_version, event_name, payload, occurred_at)
       VALUES ($1, $2, $3, 'seed', 1, 'REVISED_ORDER_APPROVED',
               '{}'::jsonb, $4::timestamptz)`,
      [
        'revised-order-review-event-rollback-3',
        buyerOrganisationId,
        sellerOrganisationId,
        now.toISOString(),
      ],
    );
    let thrown: unknown;
    try {
      await approveRevisedOrderUseCase({
        responseRepository,
        reviewRepository,
        clock,
        ids: ids('rollback'),
        sellerOrganisationId,
        versionId: revised.id,
        expectedVersion: 0,
        actorCredentialId: 'seller-reviewer',
        idempotencyKey: 'approve-revised-pg-rollback',
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
      (SELECT count(*)::text FROM syntha_revised_order_review
        WHERE seller_organisation_id = $1) AS reviews,
      (SELECT count(*)::text FROM syntha_revised_order_review_audit
        WHERE seller_organisation_id = $1) AS audits,
      (SELECT count(*)::text FROM syntha_lifecycle_idempotency
        WHERE organisation_id = $1 AND command_name = 'APPROVE_REVISED_ORDER') AS commands`,
    [sellerOrganisationId]);
    expect(counts.rows[0]).toEqual({
      reviews: '0',
      audits: '0',
      commands: '0',
    });
  });

  it('rejects a review whose buyer does not own the Revised Order source', async () => {
    const revised = await seedSource('TENANT');
    let thrown: unknown;
    try {
      await pool.query(
        `INSERT INTO syntha_revised_order_review
           (seller_organisation_id, id, buyer_organisation_id,
            revised_order_version_id, order_amendment_response_id,
            submitted_order_snapshot_id, order_id, status,
            confirmed_order_version_id, updated_at, payload, version)
         VALUES ($1, 'cross-tenant-revised-review', $2, $3, $4, $5, $6,
                 'APPROVED', NULL, $7::timestamptz, $8::jsonb, 2)`,
        [
          sellerOrganisationId,
          organisationId('SHOP-REVISED-PG-OTHER'),
          revised.id,
          revised.orderAmendmentResponseId,
          revised.submittedOrderSnapshotId,
          revised.orderId,
          now.toISOString(),
          JSON.stringify({ id: 'cross-tenant-revised-review' }),
        ],
      );
    } catch (error) {
      thrown = error;
    }
    expect(errorCode(thrown)).toBe('23503');
  });
});
