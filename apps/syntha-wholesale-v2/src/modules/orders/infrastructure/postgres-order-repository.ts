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
import {
  selectionId,
  selectionItemId,
  showroomAccessGrantId,
  type SelectionId,
} from '@/modules/selection';
import { showroomId, showroomSnapshotId } from '@/modules/showroom';

import { OrderPersistenceVersionConflict } from '../application/order-conflicts';
import type {
  OrderAuditRecord,
  OrderOutboxEvent,
  OrderRepository,
} from '../application/order-repository';
import {
  orderId,
  orderLineId,
  submittedOrderSnapshotId,
  type CommercialOrder,
  type OrderId,
  type OrderLine,
  type OrderLineTotals,
  type OrderSizeQuantity,
  type OrderStatus,
  type OrderTotals,
  type SubmittedOrderSnapshot,
  type SubmittedOrderSnapshotId,
} from '../domain/order';

interface OrderRow {
  readonly buyerOrganisationId: string;
  readonly id: string;
  readonly sellerOrganisationId: string;
  readonly selectionId: string;
  readonly showroomAccessGrantId: string;
  readonly showroomId: string;
  readonly showroomSnapshotId: string;
  readonly currency: string;
  readonly status: OrderStatus;
  readonly lines: unknown;
  readonly totals: unknown;
  readonly ownerCredentialId: string;
  readonly submittedSnapshotId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string | number;
}

interface SnapshotRow {
  readonly buyerOrganisationId: string;
  readonly id: string;
  readonly orderId: string;
  readonly orderVersion: string | number;
  readonly sellerOrganisationId: string;
  readonly selectionId: string;
  readonly showroomAccessGrantId: string;
  readonly showroomId: string;
  readonly showroomSnapshotId: string;
  readonly currency: string;
  readonly lines: unknown;
  readonly totals: unknown;
  readonly submittedByCredentialId: string;
  readonly submittedAt: string;
}

const orderSelection = `SELECT
  buyer_organisation_id AS "buyerOrganisationId",
  id,
  seller_organisation_id AS "sellerOrganisationId",
  selection_id AS "selectionId",
  showroom_access_grant_id AS "showroomAccessGrantId",
  showroom_id AS "showroomId",
  showroom_snapshot_id AS "showroomSnapshotId",
  currency,
  status,
  lines,
  totals,
  owner_credential_id AS "ownerCredentialId",
  submitted_snapshot_id AS "submittedSnapshotId",
  created_at::text AS "createdAt",
  updated_at::text AS "updatedAt",
  version
FROM syntha_order`;

const snapshotSelection = `SELECT
  buyer_organisation_id AS "buyerOrganisationId",
  id,
  order_id AS "orderId",
  order_version AS "orderVersion",
  seller_organisation_id AS "sellerOrganisationId",
  selection_id AS "selectionId",
  showroom_access_grant_id AS "showroomAccessGrantId",
  showroom_id AS "showroomId",
  showroom_snapshot_id AS "showroomSnapshotId",
  currency,
  lines,
  totals,
  submitted_by_credential_id AS "submittedByCredentialId",
  submitted_at::text AS "submittedAt"
FROM syntha_submitted_order_snapshot`;

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

function freezeOrder(row: OrderRow): CommercialOrder {
  return Object.freeze({
    id: orderId(row.id),
    buyerOrganisationId: organisationId(row.buyerOrganisationId),
    sellerOrganisationId: organisationId(row.sellerOrganisationId),
    selectionId: selectionId(row.selectionId),
    showroomAccessGrantId: showroomAccessGrantId(row.showroomAccessGrantId),
    showroomId: showroomId(row.showroomId),
    showroomSnapshotId: showroomSnapshotId(row.showroomSnapshotId),
    currency: row.currency,
    status: row.status,
    lines: freezeLines(row.lines),
    totals: freezeTotals(row.totals),
    ownerCredentialId: row.ownerCredentialId,
    submittedSnapshotId: row.submittedSnapshotId
      ? submittedOrderSnapshotId(row.submittedSnapshotId)
      : undefined,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    version: Number(row.version),
  });
}

function freezeSnapshot(row: SnapshotRow): SubmittedOrderSnapshot {
  return Object.freeze({
    id: submittedOrderSnapshotId(row.id),
    orderId: orderId(row.orderId),
    orderVersion: Number(row.orderVersion),
    buyerOrganisationId: organisationId(row.buyerOrganisationId),
    sellerOrganisationId: organisationId(row.sellerOrganisationId),
    selectionId: selectionId(row.selectionId),
    showroomAccessGrantId: showroomAccessGrantId(row.showroomAccessGrantId),
    showroomId: showroomId(row.showroomId),
    showroomSnapshotId: showroomSnapshotId(row.showroomSnapshotId),
    currency: row.currency,
    lines: freezeLines(row.lines),
    totals: freezeTotals(row.totals),
    submittedByCredentialId: row.submittedByCredentialId,
    submittedAt: new Date(row.submittedAt).toISOString(),
  });
}

async function loadOrder(
  executor: SqlExecutor,
  buyerOrganisationId: OrganisationId,
  id: string,
): Promise<CommercialOrder | null> {
  const result = await executor.query<OrderRow>(
    `${orderSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
    [buyerOrganisationId, id],
  );
  return result.rows[0] ? freezeOrder(result.rows[0]) : null;
}

async function loadSnapshotForBuyer(
  executor: SqlExecutor,
  buyerOrganisationId: OrganisationId,
  id: string,
): Promise<SubmittedOrderSnapshot | null> {
  const result = await executor.query<SnapshotRow>(
    `${snapshotSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
    [buyerOrganisationId, id],
  );
  return result.rows[0] ? freezeSnapshot(result.rows[0]) : null;
}

async function appendAudit(
  client: TransactionalSqlClient,
  audit: OrderAuditRecord,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_order_audit
       (id, buyer_organisation_id, seller_organisation_id, selection_id,
        showroom_access_grant_id, showroom_snapshot_id, order_id, action,
        actor_credential_id, expected_version, resulting_version, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::timestamptz)`,
    [
      audit.id,
      audit.buyerOrganisationId,
      audit.sellerOrganisationId,
      audit.selectionId,
      audit.showroomAccessGrantId,
      audit.showroomSnapshotId,
      audit.orderId,
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
  event: OrderOutboxEvent,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_order_outbox
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

export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly pool: TransactionalSqlPool) {}

  async findOrder(
    buyerOrganisationId: OrganisationId,
    id: OrderId,
  ): Promise<CommercialOrder | null> {
    return loadOrder(this.pool, buyerOrganisationId, id);
  }

  async findOrderBySelection(
    buyerOrganisationId: OrganisationId,
    sourceSelectionId: SelectionId,
  ): Promise<CommercialOrder | null> {
    const result = await this.pool.query<OrderRow>(
      `${orderSelection} WHERE buyer_organisation_id = $1 AND selection_id = $2`,
      [buyerOrganisationId, sourceSelectionId],
    );
    return result.rows[0] ? freezeOrder(result.rows[0]) : null;
  }

  async listBuyerOrders(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly CommercialOrder[]> {
    const result = await this.pool.query<OrderRow>(
      `${orderSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY updated_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeOrder));
  }

  async findCreateReplay(command: LifecycleCreateCommand): Promise<CommercialOrder | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'ORDER',
      loadEntity: (executor, id) => loadOrder(executor, command.organisationId, id),
    });
  }

  async createOrder(
    order: CommercialOrder,
    audit: OrderAuditRecord,
    event: OrderOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<CommercialOrder>> {
    return withTransaction(this.pool, async (client) =>
      executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'ORDER',
        resultEntityId: order.id,
        loadEntity: (executor, id) => loadOrder(executor, command.organisationId, id),
        createEntity: async () => {
          await client.query(
            `INSERT INTO syntha_order
               (buyer_organisation_id, id, seller_organisation_id, selection_id,
                showroom_access_grant_id, showroom_id, showroom_snapshot_id,
                currency, status, lines, totals, owner_credential_id,
                submitted_snapshot_id, created_at, updated_at, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb,
                     $11::jsonb, $12, $13, $14::timestamptz, $15::timestamptz, $16)`,
            [
              order.buyerOrganisationId,
              order.id,
              order.sellerOrganisationId,
              order.selectionId,
              order.showroomAccessGrantId,
              order.showroomId,
              order.showroomSnapshotId,
              order.currency,
              order.status,
              JSON.stringify(order.lines),
              JSON.stringify(order.totals),
              order.ownerCredentialId,
              order.submittedSnapshotId ?? null,
              order.createdAt,
              order.updatedAt,
              order.version,
            ],
          );
          await appendAudit(client, audit);
          await appendOutbox(client, event);
          return order;
        },
      }),
    );
  }

  async updateOrder(
    order: CommercialOrder,
    expectedVersion: number,
    audit: OrderAuditRecord,
    event: OrderOutboxEvent,
  ): Promise<boolean> {
    return withTransaction(this.pool, async (client) => {
      const updated = await client.query(
        `UPDATE syntha_order
         SET status = $1,
             lines = $2::jsonb,
             totals = $3::jsonb,
             submitted_snapshot_id = $4,
             updated_at = $5::timestamptz,
             version = $6
         WHERE buyer_organisation_id = $7 AND id = $8 AND version = $9`,
        [
          order.status,
          JSON.stringify(order.lines),
          JSON.stringify(order.totals),
          order.submittedSnapshotId ?? null,
          order.updatedAt,
          order.version,
          order.buyerOrganisationId,
          order.id,
          expectedVersion,
        ],
      );
      if (updated.rowCount === 0) return false;
      await appendAudit(client, audit);
      await appendOutbox(client, event);
      return true;
    });
  }

  async findSubmitReplay(
    command: LifecycleCreateCommand,
  ): Promise<SubmittedOrderSnapshot | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'SUBMITTED_ORDER_SNAPSHOT',
      loadEntity: (executor, id) =>
        loadSnapshotForBuyer(executor, command.organisationId, id),
    });
  }

  async submitOrder(
    order: CommercialOrder,
    snapshot: SubmittedOrderSnapshot,
    expectedVersion: number,
    audit: OrderAuditRecord,
    event: OrderOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<SubmittedOrderSnapshot>> {
    return withTransaction(this.pool, async (client) =>
      executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'SUBMITTED_ORDER_SNAPSHOT',
        resultEntityId: snapshot.id,
        loadEntity: (executor, id) =>
          loadSnapshotForBuyer(executor, command.organisationId, id),
        createEntity: async () => {
          const updated = await client.query(
            `UPDATE syntha_order
             SET status = $1,
                 lines = $2::jsonb,
                 totals = $3::jsonb,
                 submitted_snapshot_id = $4,
                 updated_at = $5::timestamptz,
                 version = $6
             WHERE buyer_organisation_id = $7 AND id = $8 AND version = $9`,
            [
              order.status,
              JSON.stringify(order.lines),
              JSON.stringify(order.totals),
              snapshot.id,
              order.updatedAt,
              order.version,
              order.buyerOrganisationId,
              order.id,
              expectedVersion,
            ],
          );
          if (updated.rowCount === 0) {
            throw new OrderPersistenceVersionConflict(order.id);
          }
          await client.query(
            `INSERT INTO syntha_submitted_order_snapshot
               (buyer_organisation_id, id, order_id, order_version,
                seller_organisation_id, selection_id, showroom_access_grant_id,
                showroom_id, showroom_snapshot_id, currency, lines, totals,
                submitted_by_credential_id, submitted_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                     $11::jsonb, $12::jsonb, $13, $14::timestamptz)`,
            [
              snapshot.buyerOrganisationId,
              snapshot.id,
              snapshot.orderId,
              snapshot.orderVersion,
              snapshot.sellerOrganisationId,
              snapshot.selectionId,
              snapshot.showroomAccessGrantId,
              snapshot.showroomId,
              snapshot.showroomSnapshotId,
              snapshot.currency,
              JSON.stringify(snapshot.lines),
              JSON.stringify(snapshot.totals),
              snapshot.submittedByCredentialId,
              snapshot.submittedAt,
            ],
          );
          await appendAudit(client, audit);
          await appendOutbox(client, event);
          return snapshot;
        },
      }),
    );
  }

  async findSubmittedSnapshotForBuyer(
    buyerOrganisationId: OrganisationId,
    id: SubmittedOrderSnapshotId,
  ): Promise<SubmittedOrderSnapshot | null> {
    return loadSnapshotForBuyer(this.pool, buyerOrganisationId, id);
  }

  async findSubmittedSnapshotForSeller(
    sellerOrganisationId: OrganisationId,
    id: SubmittedOrderSnapshotId,
  ): Promise<SubmittedOrderSnapshot | null> {
    const result = await this.pool.query<SnapshotRow>(
      `${snapshotSelection} WHERE seller_organisation_id = $1 AND id = $2`,
      [sellerOrganisationId, id],
    );
    return result.rows[0] ? freezeSnapshot(result.rows[0]) : null;
  }

  async listSubmittedSnapshotsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly SubmittedOrderSnapshot[]> {
    const result = await this.pool.query<SnapshotRow>(
      `${snapshotSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY submitted_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeSnapshot));
  }

  async listSubmittedSnapshotsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly SubmittedOrderSnapshot[]> {
    const result = await this.pool.query<SnapshotRow>(
      `${snapshotSelection}
       WHERE seller_organisation_id = $1
       ORDER BY submitted_at DESC, id`,
      [sellerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeSnapshot));
  }
}
