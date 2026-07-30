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
import { organisationId, type OrganisationId } from '@/modules/organisations';
import { selectionItemId } from '@/modules/selection';

import { OrderReviewPersistenceVersionConflict } from '../application/order-conflicts';
import type {
  OrderReviewAuditRecord,
  OrderReviewOutboxEvent,
  OrderReviewRepository,
} from '../application/order-review-repository';
import {
  orderId,
  orderLineId,
  submittedOrderSnapshotId,
  type OrderLine,
  type OrderLineTotals,
  type OrderSizeQuantity,
  type OrderTotals,
  type SubmittedOrderSnapshotId,
} from '../domain/order';
import {
  confirmedOrderVersionId,
  orderReviewId,
  type ConfirmedOrderVersion,
  type ConfirmedOrderVersionId,
  type OrderAmendmentRequest,
  type OrderApproval,
  type OrderReview,
  type OrderReviewId,
  type OrderReviewStatus,
  type ProposedOrderLineChange,
} from '../domain/order-review';

interface ReviewRow {
  readonly sellerOrganisationId: string;
  readonly id: string;
  readonly buyerOrganisationId: string;
  readonly orderId: string;
  readonly submittedOrderSnapshotId: string;
  readonly status: OrderReviewStatus;
  readonly amendmentRequest: unknown | null;
  readonly approval: unknown | null;
  readonly confirmedOrderVersionId: string | null;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string | number;
}

interface ConfirmedRow {
  readonly sellerOrganisationId: string;
  readonly id: string;
  readonly buyerOrganisationId: string;
  readonly orderReviewId: string;
  readonly submittedOrderSnapshotId: string;
  readonly orderId: string;
  readonly sourceOrderVersion: string | number;
  readonly currency: string;
  readonly lines: unknown;
  readonly totals: unknown;
  readonly approvedByCredentialId: string;
  readonly approvedAt: string;
  readonly confirmedByCredentialId: string;
  readonly confirmedAt: string;
}

const reviewSelection = `SELECT
  seller_organisation_id AS "sellerOrganisationId",
  id,
  buyer_organisation_id AS "buyerOrganisationId",
  order_id AS "orderId",
  submitted_order_snapshot_id AS "submittedOrderSnapshotId",
  status,
  amendment_request AS "amendmentRequest",
  approval,
  confirmed_order_version_id AS "confirmedOrderVersionId",
  owner_credential_id AS "ownerCredentialId",
  created_at::text AS "createdAt",
  updated_at::text AS "updatedAt",
  version
FROM syntha_order_review`;

const confirmedSelection = `SELECT
  seller_organisation_id AS "sellerOrganisationId",
  id,
  buyer_organisation_id AS "buyerOrganisationId",
  order_review_id AS "orderReviewId",
  submitted_order_snapshot_id AS "submittedOrderSnapshotId",
  order_id AS "orderId",
  source_order_version AS "sourceOrderVersion",
  currency,
  lines,
  totals,
  approved_by_credential_id AS "approvedByCredentialId",
  approved_at::text AS "approvedAt",
  confirmed_by_credential_id AS "confirmedByCredentialId",
  confirmed_at::text AS "confirmedAt"
FROM syntha_confirmed_order_version`;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function freezeSizeQuantities(value: unknown): readonly OrderSizeQuantity[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.map((entry) => {
      const source = record(entry);
      return Object.freeze({
        size: String(source.size ?? ''),
        quantity: Number(source.quantity ?? 0),
      });
    }),
  );
}

function freezeLineTotals(value: unknown): OrderLineTotals {
  const source = record(value);
  return Object.freeze({
    grossMinor: Number(source.grossMinor ?? 0),
    discountMinor: Number(source.discountMinor ?? 0),
    netMinor: Number(source.netMinor ?? 0),
    taxMinor: Number(source.taxMinor ?? 0),
    totalMinor: Number(source.totalMinor ?? 0),
  });
}

function freezeLines(value: unknown): readonly OrderLine[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.map((entry) => {
      const source = record(entry);
      return Object.freeze({
        id: orderLineId(String(source.id ?? '')),
        selectionItemId: selectionItemId(String(source.selectionItemId ?? '')),
        productReference: String(source.productReference ?? ''),
        variantReference:
          source.variantReference === null || source.variantReference === undefined
            ? undefined
            : String(source.variantReference),
        sizeQuantities: freezeSizeQuantities(source.sizeQuantities),
        totalQuantity: Number(source.totalQuantity ?? 0),
        unitPriceMinor: Number(source.unitPriceMinor ?? 0),
        discountBasisPoints: Number(source.discountBasisPoints ?? 0),
        taxBasisPoints: Number(source.taxBasisPoints ?? 0),
        totals: freezeLineTotals(source.totals),
        note: String(source.note ?? ''),
        createdAt: new Date(String(source.createdAt)).toISOString(),
        updatedAt: new Date(String(source.updatedAt)).toISOString(),
      });
    }),
  );
}

function freezeTotals(value: unknown): OrderTotals {
  const source = record(value);
  return Object.freeze({
    quantity: Number(source.quantity ?? 0),
    grossMinor: Number(source.grossMinor ?? 0),
    discountMinor: Number(source.discountMinor ?? 0),
    netMinor: Number(source.netMinor ?? 0),
    taxMinor: Number(source.taxMinor ?? 0),
    totalMinor: Number(source.totalMinor ?? 0),
  });
}

function freezeLineChanges(value: unknown): readonly ProposedOrderLineChange[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.map((entry) => {
      const source = record(entry);
      return Object.freeze({
        lineId: orderLineId(String(source.lineId ?? '')),
        ...(source.sizeQuantities !== undefined
          ? { sizeQuantities: freezeSizeQuantities(source.sizeQuantities) }
          : {}),
        ...(source.unitPriceMinor !== undefined
          ? { unitPriceMinor: Number(source.unitPriceMinor) }
          : {}),
        ...(source.discountBasisPoints !== undefined
          ? { discountBasisPoints: Number(source.discountBasisPoints) }
          : {}),
        ...(source.taxBasisPoints !== undefined
          ? { taxBasisPoints: Number(source.taxBasisPoints) }
          : {}),
        ...(source.note !== undefined ? { note: String(source.note) } : {}),
      });
    }),
  );
}

function freezeAmendment(value: unknown | null): OrderAmendmentRequest | undefined {
  if (value === null) return undefined;
  const source = record(value);
  return Object.freeze({
    reason: String(source.reason ?? ''),
    lineChanges: freezeLineChanges(source.lineChanges),
    requestedByCredentialId: String(source.requestedByCredentialId ?? ''),
    requestedAt: new Date(String(source.requestedAt)).toISOString(),
  });
}

function freezeApproval(value: unknown | null): OrderApproval | undefined {
  if (value === null) return undefined;
  const source = record(value);
  return Object.freeze({
    approvedByCredentialId: String(source.approvedByCredentialId ?? ''),
    approvedAt: new Date(String(source.approvedAt)).toISOString(),
  });
}

function freezeReview(row: ReviewRow): OrderReview {
  const amendmentRequest = freezeAmendment(row.amendmentRequest);
  const approval = freezeApproval(row.approval);
  return Object.freeze({
    id: orderReviewId(row.id),
    submittedOrderSnapshotId: submittedOrderSnapshotId(row.submittedOrderSnapshotId),
    orderId: orderId(row.orderId),
    buyerOrganisationId: organisationId(row.buyerOrganisationId),
    sellerOrganisationId: organisationId(row.sellerOrganisationId),
    status: row.status,
    ...(amendmentRequest ? { amendmentRequest } : {}),
    ...(approval ? { approval } : {}),
    ...(row.confirmedOrderVersionId
      ? { confirmedOrderVersionId: confirmedOrderVersionId(row.confirmedOrderVersionId) }
      : {}),
    ownerCredentialId: row.ownerCredentialId,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    version: Number(row.version),
  });
}

function freezeConfirmed(row: ConfirmedRow): ConfirmedOrderVersion {
  return Object.freeze({
    id: confirmedOrderVersionId(row.id),
    orderReviewId: orderReviewId(row.orderReviewId),
    submittedOrderSnapshotId: submittedOrderSnapshotId(row.submittedOrderSnapshotId),
    orderId: orderId(row.orderId),
    sourceOrderVersion: Number(row.sourceOrderVersion),
    buyerOrganisationId: organisationId(row.buyerOrganisationId),
    sellerOrganisationId: organisationId(row.sellerOrganisationId),
    currency: row.currency,
    lines: freezeLines(row.lines),
    totals: freezeTotals(row.totals),
    approvedByCredentialId: row.approvedByCredentialId,
    approvedAt: new Date(row.approvedAt).toISOString(),
    confirmedByCredentialId: row.confirmedByCredentialId,
    confirmedAt: new Date(row.confirmedAt).toISOString(),
  });
}

async function loadReviewForSeller(
  executor: SqlExecutor,
  sellerOrganisationId: OrganisationId,
  id: string,
): Promise<OrderReview | null> {
  const result = await executor.query<ReviewRow>(
    `${reviewSelection} WHERE seller_organisation_id = $1 AND id = $2`,
    [sellerOrganisationId, id],
  );
  return result.rows[0] ? freezeReview(result.rows[0]) : null;
}

async function loadConfirmedForSeller(
  executor: SqlExecutor,
  sellerOrganisationId: OrganisationId,
  id: string,
): Promise<ConfirmedOrderVersion | null> {
  const result = await executor.query<ConfirmedRow>(
    `${confirmedSelection} WHERE seller_organisation_id = $1 AND id = $2`,
    [sellerOrganisationId, id],
  );
  return result.rows[0] ? freezeConfirmed(result.rows[0]) : null;
}

async function appendAudit(
  client: TransactionalSqlClient,
  audit: OrderReviewAuditRecord,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_order_review_audit
       (id, buyer_organisation_id, seller_organisation_id, order_id,
        submitted_order_snapshot_id, order_review_id, action,
        actor_credential_id, expected_version, resulting_version, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamptz)`,
    [
      audit.id,
      audit.buyerOrganisationId,
      audit.sellerOrganisationId,
      audit.orderId,
      audit.submittedOrderSnapshotId,
      audit.orderReviewId,
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
  event: OrderReviewOutboxEvent,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_order_review_outbox
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

export class PostgresOrderReviewRepository implements OrderReviewRepository {
  constructor(private readonly pool: TransactionalSqlPool) {}

  async findReviewForSeller(
    sellerOrganisationId: OrganisationId,
    id: OrderReviewId,
  ): Promise<OrderReview | null> {
    return loadReviewForSeller(this.pool, sellerOrganisationId, id);
  }

  async findReviewBySnapshotForSeller(
    sellerOrganisationId: OrganisationId,
    snapshotId: SubmittedOrderSnapshotId,
  ): Promise<OrderReview | null> {
    const result = await this.pool.query<ReviewRow>(
      `${reviewSelection}
       WHERE seller_organisation_id = $1 AND submitted_order_snapshot_id = $2`,
      [sellerOrganisationId, snapshotId],
    );
    return result.rows[0] ? freezeReview(result.rows[0]) : null;
  }

  async findReviewForBuyer(
    buyerOrganisationId: OrganisationId,
    id: OrderReviewId,
  ): Promise<OrderReview | null> {
    const result = await this.pool.query<ReviewRow>(
      `${reviewSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
      [buyerOrganisationId, id],
    );
    return result.rows[0] ? freezeReview(result.rows[0]) : null;
  }

  async listReviewsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly OrderReview[]> {
    const result = await this.pool.query<ReviewRow>(
      `${reviewSelection}
       WHERE seller_organisation_id = $1
       ORDER BY updated_at DESC, id`,
      [sellerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeReview));
  }

  async listReviewsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly OrderReview[]> {
    const result = await this.pool.query<ReviewRow>(
      `${reviewSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY updated_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeReview));
  }

  async findDecisionReplay(command: LifecycleCreateCommand): Promise<OrderReview | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'ORDER_REVIEW',
      loadEntity: (executor, id) =>
        loadReviewForSeller(executor, command.organisationId, id),
    });
  }

  async createDecision(
    review: OrderReview,
    audit: OrderReviewAuditRecord,
    event: OrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<OrderReview>> {
    return withTransaction(this.pool, async (client) =>
      executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'ORDER_REVIEW',
        resultEntityId: review.id,
        loadEntity: (executor, id) =>
          loadReviewForSeller(executor, command.organisationId, id),
        createEntity: async () => {
          await client.query(
            `INSERT INTO syntha_order_review
               (seller_organisation_id, id, buyer_organisation_id, order_id,
                submitted_order_snapshot_id, status, amendment_request, approval,
                confirmed_order_version_id, owner_credential_id, created_at,
                updated_at, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb,
                     $9, $10, $11::timestamptz, $12::timestamptz, $13)`,
            [
              review.sellerOrganisationId,
              review.id,
              review.buyerOrganisationId,
              review.orderId,
              review.submittedOrderSnapshotId,
              review.status,
              review.amendmentRequest ? JSON.stringify(review.amendmentRequest) : null,
              review.approval ? JSON.stringify(review.approval) : null,
              review.confirmedOrderVersionId ?? null,
              review.ownerCredentialId,
              review.createdAt,
              review.updatedAt,
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
  ): Promise<ConfirmedOrderVersion | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'CONFIRMED_ORDER_VERSION',
      loadEntity: (executor, id) =>
        loadConfirmedForSeller(executor, command.organisationId, id),
    });
  }

  async confirm(
    review: OrderReview,
    confirmed: ConfirmedOrderVersion,
    expectedVersion: number,
    audit: OrderReviewAuditRecord,
    event: OrderReviewOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<ConfirmedOrderVersion>> {
    return withTransaction(this.pool, async (client) =>
      executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'CONFIRMED_ORDER_VERSION',
        resultEntityId: confirmed.id,
        loadEntity: (executor, id) =>
          loadConfirmedForSeller(executor, command.organisationId, id),
        createEntity: async () => {
          const updated = await client.query<{ readonly id: string }>(
            `UPDATE syntha_order_review
             SET status = $4,
                 amendment_request = $5::jsonb,
                 approval = $6::jsonb,
                 confirmed_order_version_id = $7,
                 updated_at = $8::timestamptz,
                 version = $9
             WHERE seller_organisation_id = $1 AND id = $2 AND version = $3
             RETURNING id`,
            [
              review.sellerOrganisationId,
              review.id,
              expectedVersion,
              review.status,
              review.amendmentRequest ? JSON.stringify(review.amendmentRequest) : null,
              review.approval ? JSON.stringify(review.approval) : null,
              review.confirmedOrderVersionId ?? null,
              review.updatedAt,
              review.version,
            ],
          );
          if (!updated.rows[0]) {
            throw new OrderReviewPersistenceVersionConflict(review.id);
          }
          await client.query(
            `INSERT INTO syntha_confirmed_order_version
               (seller_organisation_id, id, buyer_organisation_id, order_review_id,
                submitted_order_snapshot_id, order_id, source_order_version,
                currency, lines, totals, approved_by_credential_id, approved_at,
                confirmed_by_credential_id, confirmed_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb,
                     $11, $12::timestamptz, $13, $14::timestamptz)`,
            [
              confirmed.sellerOrganisationId,
              confirmed.id,
              confirmed.buyerOrganisationId,
              confirmed.orderReviewId,
              confirmed.submittedOrderSnapshotId,
              confirmed.orderId,
              confirmed.sourceOrderVersion,
              confirmed.currency,
              JSON.stringify(confirmed.lines),
              JSON.stringify(confirmed.totals),
              confirmed.approvedByCredentialId,
              confirmed.approvedAt,
              confirmed.confirmedByCredentialId,
              confirmed.confirmedAt,
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
    id: ConfirmedOrderVersionId,
  ): Promise<ConfirmedOrderVersion | null> {
    return loadConfirmedForSeller(this.pool, sellerOrganisationId, id);
  }

  async findConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
    id: ConfirmedOrderVersionId,
  ): Promise<ConfirmedOrderVersion | null> {
    const result = await this.pool.query<ConfirmedRow>(
      `${confirmedSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
      [buyerOrganisationId, id],
    );
    return result.rows[0] ? freezeConfirmed(result.rows[0]) : null;
  }

  async listConfirmedForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly ConfirmedOrderVersion[]> {
    const result = await this.pool.query<ConfirmedRow>(
      `${confirmedSelection}
       WHERE seller_organisation_id = $1
       ORDER BY confirmed_at DESC, id`,
      [sellerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeConfirmed));
  }

  async listConfirmedForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly ConfirmedOrderVersion[]> {
    const result = await this.pool.query<ConfirmedRow>(
      `${confirmedSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY confirmed_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeConfirmed));
  }
}
