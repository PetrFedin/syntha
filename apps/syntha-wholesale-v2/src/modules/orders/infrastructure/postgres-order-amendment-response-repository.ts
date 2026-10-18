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
  OrderAmendmentResponseAuditRecord,
  OrderAmendmentResponseOutboxEvent,
  OrderAmendmentResponseRepository,
} from '../application/order-amendment-response-repository';
import type {
  OrderAmendmentResponse,
  OrderAmendmentResponseId,
  RevisedOrderVersion,
  RevisedOrderVersionId,
} from '../domain/order-amendment-response';
import type { OrderReviewId } from '../domain/order-review';

interface ResponseRow {
  readonly payload: unknown;
}

interface RevisedRow {
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

function freezeResponse(row: ResponseRow): OrderAmendmentResponse {
  return deepFreeze(structuredClone(row.payload) as OrderAmendmentResponse);
}

function freezeRevision(row: RevisedRow): RevisedOrderVersion {
  return deepFreeze(structuredClone(row.payload) as RevisedOrderVersion);
}

const responseSelection = `SELECT payload
  FROM syntha_order_amendment_response`;
const revisedSelection = `SELECT payload
  FROM syntha_revised_order_version`;

async function loadResponseForBuyer(
  executor: SqlExecutor,
  buyerOrganisationId: OrganisationId,
  id: string,
): Promise<OrderAmendmentResponse | null> {
  const result = await executor.query<ResponseRow>(
    `${responseSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
    [buyerOrganisationId, id],
  );
  return result.rows[0] ? freezeResponse(result.rows[0]) : null;
}

async function appendAudit(
  client: TransactionalSqlClient,
  audit: OrderAmendmentResponseAuditRecord,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_order_amendment_response_audit
       (id, buyer_organisation_id, seller_organisation_id, order_id,
        submitted_order_snapshot_id, order_review_id,
        order_amendment_response_id, action, actor_credential_id,
        expected_review_version, resulting_response_version, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::timestamptz)`,
    [
      audit.id,
      audit.buyerOrganisationId,
      audit.sellerOrganisationId,
      audit.orderId,
      audit.submittedOrderSnapshotId,
      audit.orderReviewId,
      audit.orderAmendmentResponseId,
      audit.action,
      audit.actorCredentialId,
      audit.expectedReviewVersion,
      audit.resultingResponseVersion,
      audit.occurredAt,
    ],
  );
}

async function appendOutbox(
  client: TransactionalSqlClient,
  event: OrderAmendmentResponseOutboxEvent,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_order_amendment_response_outbox
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

export class PostgresOrderAmendmentResponseRepository
  implements OrderAmendmentResponseRepository
{
  constructor(private readonly pool: TransactionalSqlPool) {}

  async findCreateReplay(
    command: LifecycleCreateCommand,
  ): Promise<OrderAmendmentResponse | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'ORDER_AMENDMENT_RESPONSE',
      loadEntity: (executor, id) =>
        loadResponseForBuyer(executor, command.organisationId, id),
    });
  }

  async findResponseForBuyer(
    buyerOrganisationId: OrganisationId,
    responseId: OrderAmendmentResponseId,
  ): Promise<OrderAmendmentResponse | null> {
    return loadResponseForBuyer(this.pool, buyerOrganisationId, responseId);
  }

  async findResponseForSeller(
    sellerOrganisationId: OrganisationId,
    responseId: OrderAmendmentResponseId,
  ): Promise<OrderAmendmentResponse | null> {
    const result = await this.pool.query<ResponseRow>(
      `${responseSelection} WHERE seller_organisation_id = $1 AND id = $2`,
      [sellerOrganisationId, responseId],
    );
    return result.rows[0] ? freezeResponse(result.rows[0]) : null;
  }

  async findResponseByReviewForBuyer(
    buyerOrganisationId: OrganisationId,
    reviewId: OrderReviewId,
  ): Promise<OrderAmendmentResponse | null> {
    const result = await this.pool.query<ResponseRow>(
      `${responseSelection}
       WHERE buyer_organisation_id = $1 AND order_review_id = $2`,
      [buyerOrganisationId, reviewId],
    );
    return result.rows[0] ? freezeResponse(result.rows[0]) : null;
  }

  async findResponseByReviewForSeller(
    sellerOrganisationId: OrganisationId,
    reviewId: OrderReviewId,
  ): Promise<OrderAmendmentResponse | null> {
    const result = await this.pool.query<ResponseRow>(
      `${responseSelection}
       WHERE seller_organisation_id = $1 AND order_review_id = $2`,
      [sellerOrganisationId, reviewId],
    );
    return result.rows[0] ? freezeResponse(result.rows[0]) : null;
  }

  async createResponse(
    response: OrderAmendmentResponse,
    revised: RevisedOrderVersion | null,
    audit: OrderAmendmentResponseAuditRecord,
    event: OrderAmendmentResponseOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<OrderAmendmentResponse>> {
    return withTransaction(this.pool, async (client) =>
      executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'ORDER_AMENDMENT_RESPONSE',
        resultEntityId: response.id,
        loadEntity: (executor, id) =>
          loadResponseForBuyer(executor, command.organisationId, id),
        createEntity: async () => {
          await client.query(
            `INSERT INTO syntha_order_amendment_response
               (buyer_organisation_id, id, seller_organisation_id,
                order_review_id, submitted_order_snapshot_id, order_id,
                decision, revised_order_version_id, responded_at, payload, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz,
                     $10::jsonb, $11)`,
            [
              response.buyerOrganisationId,
              response.id,
              response.sellerOrganisationId,
              response.orderReviewId,
              response.submittedOrderSnapshotId,
              response.orderId,
              response.decision,
              response.revisedOrderVersionId ?? null,
              response.respondedAt,
              JSON.stringify(response),
              response.version,
            ],
          );
          if (revised) {
            await client.query(
              `INSERT INTO syntha_revised_order_version
                 (buyer_organisation_id, id, seller_organisation_id,
                  order_amendment_response_id, order_review_id,
                  submitted_order_snapshot_id, order_id, source_order_version,
                  revision_kind, currency, created_at, payload)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                       $11::timestamptz, $12::jsonb)`,
              [
                revised.buyerOrganisationId,
                revised.id,
                revised.sellerOrganisationId,
                revised.orderAmendmentResponseId,
                revised.orderReviewId,
                revised.submittedOrderSnapshotId,
                revised.orderId,
                revised.sourceOrderVersion,
                revised.revisionKind,
                revised.currency,
                revised.createdAt,
                JSON.stringify(revised),
              ],
            );
          }
          await appendAudit(client, audit);
          await appendOutbox(client, event);
          return response;
        },
      }),
    );
  }

  async findRevisedForBuyer(
    buyerOrganisationId: OrganisationId,
    versionId: RevisedOrderVersionId,
  ): Promise<RevisedOrderVersion | null> {
    const result = await this.pool.query<RevisedRow>(
      `${revisedSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
      [buyerOrganisationId, versionId],
    );
    return result.rows[0] ? freezeRevision(result.rows[0]) : null;
  }

  async findRevisedForSeller(
    sellerOrganisationId: OrganisationId,
    versionId: RevisedOrderVersionId,
  ): Promise<RevisedOrderVersion | null> {
    const result = await this.pool.query<RevisedRow>(
      `${revisedSelection} WHERE seller_organisation_id = $1 AND id = $2`,
      [sellerOrganisationId, versionId],
    );
    return result.rows[0] ? freezeRevision(result.rows[0]) : null;
  }

  async listResponsesForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly OrderAmendmentResponse[]> {
    const result = await this.pool.query<ResponseRow>(
      `${responseSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY responded_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeResponse));
  }

  async listResponsesForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly OrderAmendmentResponse[]> {
    const result = await this.pool.query<ResponseRow>(
      `${responseSelection}
       WHERE seller_organisation_id = $1
       ORDER BY responded_at DESC, id`,
      [sellerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeResponse));
  }

  async listRevisedForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderVersion[]> {
    const result = await this.pool.query<RevisedRow>(
      `${revisedSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY created_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeRevision));
  }

  async listRevisedForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly RevisedOrderVersion[]> {
    const result = await this.pool.query<RevisedRow>(
      `${revisedSelection}
       WHERE seller_organisation_id = $1
       ORDER BY created_at DESC, id`,
      [sellerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeRevision));
  }
}
