import type {
  SqlExecutor,
  TransactionalSqlClient,
  TransactionalSqlPool,
} from '@/modules/commercial-execution';
import {
  executeLifecycleCreate,
  findLifecycleCreateReplay,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type {
  RevisedOrderReviewAuditRecord,
  RevisedOrderReviewOutboxEvent,
  RevisedOrderReviewRepository,
} from '../application/revised-order-review-repository';
import type { RevisedOrderVersionId } from '../domain/order-amendment-response';
import type {
  RevisedConfirmedOrderVersion,
  RevisedConfirmedOrderVersionId,
  RevisedOrderReview,
  RevisedOrderReviewId,
} from '../domain/revised-order-review';

interface PayloadRow {
  readonly payload: unknown;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

function freezeReview(row: PayloadRow): RevisedOrderReview {
  return deepFreeze(structuredClone(row.payload) as RevisedOrderReview);
}

function freezeConfirmed(row: PayloadRow): RevisedConfirmedOrderVersion {
  return deepFreeze(structuredClone(row.payload) as RevisedConfirmedOrderVersion);
}

const reviewSelection = `SELECT payload FROM syntha_revised_order_review`;
const confirmedSelection = `SELECT payload FROM syntha_revised_confirmed_order_version`;

async function loadReviewForSeller(
  executor: SqlExecutor,
  sellerOrganisationId: OrganisationId,
  id: string,
): Promise<RevisedOrderReview | null> {
  const result = await executor.query<PayloadRow>(
    `${reviewSelection} WHERE seller_organisation_id = $1 AND id = $2`,
    [sellerOrganisationId, id],
  );
  return result.rows[0] ? freezeReview(result.rows[0]) : null;
}

async function loadConfirmedForSeller(
  executor: SqlExecutor,
  sellerOrganisationId: OrganisationId,
  id: string,
): Promise<RevisedConfirmedOrderVersion | null> {
  const result = await executor.query<PayloadRow>(
    `${confirmedSelection} WHERE seller_organisation_id = $1 AND id = $2`,
    [sellerOrganisationId, id],
  );
  return result.rows[0] ? freezeConfirmed(result.rows[0]) : null;
}

async function appendAudit(
  client: TransactionalSqlClient,
  audit: RevisedOrderReviewAuditRecord,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_revised_order_review_audit
       (id, buyer_organisation_id, seller_organisation_id, order_id,
        submitted_order_snapshot_id, order_amendment_response_id,
        revised_order_version_id, revised_order_review_id, action,
        actor_credential_id, expected_version, resulting_version, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
             $13::timestamptz)`,
    [
      audit.id,
      audit.buyerOrganisationId,
      audit.sellerOrganisationId,
      audit.orderId,
      audit.submittedOrderSnapshotId,
      audit.orderAmendmentResponseId,
      audit.revisedOrderVersionId,
      audit.revisedOrderReviewId,
      audit.action,
      audit.actorCredentialId,
      audit.expectedVersion,
      audit.resultingVersion,
      audit.occurredAt,
    ],
  );
}

async function appendOutbox(
  client: TransactionalSqlClient,
  event: RevisedOrderReviewOutboxEvent,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_revised_order_review_outbox
       (id, buyer_organisation_id, seller_organisation_id, aggregate_id,
        aggregate_version, event_name, payload, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::timestamptz)`,
    [
      event.id,
      event.buyerOrganisationId,
      event.sellerOrganisationId,
      event.aggregateId,
      event.aggregateVersion,
      event.eventName,
      JSON.stringify(event.payload),
      event.occurredAt,
    ],
  );
}

async function withTransaction<Result>(
  pool: TransactionalSqlPool,
  operation: (client: TransactionalSqlClient) => Promise<Result>,
): Promise<Result> {
  const client = await pool.connect();
  await client.query('BEGIN');
  try {
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original write failure.
    }
    throw error;
  } finally {
    client.release();
  }
}

export class PostgresRevisedOrderReviewRepository
  implements RevisedOrderReviewRepository
{
  constructor(private readonly pool: TransactionalSqlPool) {}

  async findReviewForSeller(
    sellerOrganisationId: OrganisationId,
    reviewId: RevisedOrderReviewId,
  ): Promise<RevisedOrderReview | null> {
    return loadReviewForSeller(this.pool, sellerOrganisationId, reviewId);
  }

  async findReviewByVersionForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: RevisedOrderVersionId,
  ): Promise<RevisedOrderReview | null> {
    const result = await this.pool.query<PayloadRow>(
      `${reviewSelection}
       WHERE seller_organisation_id = $1 AND revised_order_version_id = $2`,
      [sellerOrganisationId, versionId],
    );
    return result.rows[0] ? freezeReview(result.rows[0]) : null;
  }

  async findReviewForBuyer(
    buyerOrganisationId: OrganisationId,
    reviewId: RevisedOrderReviewId,
  ): Promise<RevisedOrderReview | null> {
    const result = await this.pool.query<PayloadRow>(
      `${reviewSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
      [buyerOrganisationId, reviewId],
    );
    return result.rows[0] ? freezeReview(result.rows[0]) : null;
  }

  async listReviewsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderReview[]> {
    const result = await this.pool.query<PayloadRow>(
      `${reviewSelection}
       WHERE seller_organisation_id = $1
       ORDER BY updated_at DESC, id`,
      [sellerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeReview));
  }

  async listReviewsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderReview[]> {
    const result = await this.pool.query<PayloadRow>(
      `${reviewSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY updated_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeReview));
  }

  async findDecisionReplay(
    command: LifecycleCreateCommand,
  ): Promise<RevisedOrderReview | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'REVISED_ORDER_REVIEW',
      loadEntity: (executor, id) =>
        loadReviewForSeller(executor, command.organisationId, id),
    });
  }

  async createDecision(
    review: RevisedOrderReview,
    audit: RevisedOrderReviewAuditRecord,
    event: RevisedOrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<RevisedOrderReview>> {
    return withTransaction(this.pool, async (client) =>
      executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'REVISED_ORDER_REVIEW',
        resultEntityId: review.id,
        loadEntity: (executor, id) =>
          loadReviewForSeller(executor, command.organisationId, id),
        createEntity: async () => {
          await client.query(
            `INSERT INTO syntha_revised_order_review
               (seller_organisation_id, id, buyer_organisation_id,
                revised_order_version_id, order_amendment_response_id,
                submitted_order_snapshot_id, order_id, status,
                confirmed_order_version_id, updated_at, payload, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
                     $10::timestamptz, $11::jsonb, $12)`,
            [
              review.sellerOrganisationId,
              review.id,
              review.buyerOrganisationId,
              review.revisedOrderVersionId,
              review.orderAmendmentResponseId,
              review.submittedOrderSnapshotId,
              review.orderId,
              review.status,
              review.confirmedOrderVersionId ?? null,
              review.updatedAt,
              JSON.stringify(review),
              review.version,
            ],
          );
          await appendAudit(client, audit);
          await appendOutbox(client, event);
          return review;
        },
      }),
    );
  }

  async findConfirmationReplay(
    command: LifecycleCreateCommand,
  ): Promise<RevisedConfirmedOrderVersion | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'REVISED_CONFIRMED_ORDER_VERSION',
      loadEntity: (executor, id) =>
        loadConfirmedForSeller(executor, command.organisationId, id),
    });
  }

  async confirm(
    review: RevisedOrderReview,
    confirmed: RevisedConfirmedOrderVersion,
    expectedVersion: number,
    audit: RevisedOrderReviewAuditRecord,
    event: RevisedOrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<RevisedConfirmedOrderVersion>> {
    return withTransaction(this.pool, async (client) =>
      executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'REVISED_CONFIRMED_ORDER_VERSION',
        resultEntityId: confirmed.id,
        loadEntity: (executor, id) =>
          loadConfirmedForSeller(executor, command.organisationId, id),
        createEntity: async () => {
          const updated = await client.query(
            `UPDATE syntha_revised_order_review
             SET status = $1,
                 confirmed_order_version_id = $2,
                 updated_at = $3::timestamptz,
                 payload = $4::jsonb,
                 version = $5
             WHERE seller_organisation_id = $6
               AND id = $7
               AND version = $8`,
            [
              review.status,
              review.confirmedOrderVersionId,
              review.updatedAt,
              JSON.stringify(review),
              review.version,
              review.sellerOrganisationId,
              review.id,
              expectedVersion,
            ],
          );
          if (updated.rowCount !== 1) {
            throw new Error('REVISED_ORDER_REVIEW_VERSION_CONFLICT');
          }
          await client.query(
            `INSERT INTO syntha_revised_confirmed_order_version
               (seller_organisation_id, id, buyer_organisation_id,
                revised_order_review_id, revised_order_version_id,
                order_amendment_response_id, submitted_order_snapshot_id,
                order_id, confirmed_at, payload)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                     $9::timestamptz, $10::jsonb)`,
            [
              confirmed.sellerOrganisationId,
              confirmed.id,
              confirmed.buyerOrganisationId,
              confirmed.revisedOrderReviewId,
              confirmed.revisedOrderVersionId,
              confirmed.orderAmendmentResponseId,
              confirmed.submittedOrderSnapshotId,
              confirmed.orderId,
              confirmed.confirmedAt,
              JSON.stringify(confirmed),
            ],
          );
          await appendAudit(client, audit);
          await appendOutbox(client, event);
          return confirmed;
        },
      }),
    );
  }

  async findConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: RevisedConfirmedOrderVersionId,
  ): Promise<RevisedConfirmedOrderVersion | null> {
    return loadConfirmedForSeller(this.pool, sellerOrganisationId, versionId);
  }

  async findConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
    versionId: RevisedConfirmedOrderVersionId,
  ): Promise<RevisedConfirmedOrderVersion | null> {
    const result = await this.pool.query<PayloadRow>(
      `${confirmedSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
      [buyerOrganisationId, versionId],
    );
    return result.rows[0] ? freezeConfirmed(result.rows[0]) : null;
  }

  async listConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedConfirmedOrderVersion[]> {
    const result = await this.pool.query<PayloadRow>(
      `${confirmedSelection}
       WHERE seller_organisation_id = $1
       ORDER BY confirmed_at DESC, id`,
      [sellerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeConfirmed));
  }

  async listConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedConfirmedOrderVersion[]> {
    const result = await this.pool.query<PayloadRow>(
      `${confirmedSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY confirmed_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeConfirmed));
  }
}
