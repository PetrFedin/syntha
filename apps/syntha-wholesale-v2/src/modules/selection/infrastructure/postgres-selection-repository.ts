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
import { showroomId, showroomSnapshotId, type ShowroomId } from '@/modules/showroom';

import type {
  SelectionAuditRecord,
  SelectionOutboxEvent,
  SelectionRepository,
} from '../application/selection-repository';
import {
  selectionId,
  selectionItemId,
  showroomAccessGrantId,
  type Selection,
  type SelectionId,
  type SelectionItem,
  type SelectionStatus,
  type ShowroomAccessGrant,
  type ShowroomAccessGrantId,
  type ShowroomAccessStatus,
  type SizeCurveEntry,
} from '../domain/selection';

interface GrantRow {
  readonly sellerOrganisationId: string;
  readonly id: string;
  readonly buyerOrganisationId: string;
  readonly showroomId: string;
  readonly showroomSnapshotId: string;
  readonly status: ShowroomAccessStatus;
  readonly grantedByCredentialId: string;
  readonly grantedAt: string;
  readonly revokedByCredentialId: string | null;
  readonly revokedAt: string | null;
  readonly version: string | number;
}

interface SelectionRow {
  readonly buyerOrganisationId: string;
  readonly id: string;
  readonly sellerOrganisationId: string;
  readonly showroomAccessGrantId: string;
  readonly showroomId: string;
  readonly showroomSnapshotId: string;
  readonly title: string;
  readonly currency: string;
  readonly budgetMinor: string | number;
  readonly status: SelectionStatus;
  readonly items: unknown;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string | number;
}

const grantSelection = `SELECT
  seller_organisation_id AS "sellerOrganisationId",
  id,
  buyer_organisation_id AS "buyerOrganisationId",
  showroom_id AS "showroomId",
  showroom_snapshot_id AS "showroomSnapshotId",
  status,
  granted_by_credential_id AS "grantedByCredentialId",
  granted_at::text AS "grantedAt",
  revoked_by_credential_id AS "revokedByCredentialId",
  revoked_at::text AS "revokedAt",
  version
FROM syntha_showroom_access_grant`;

const selectionSelection = `SELECT
  buyer_organisation_id AS "buyerOrganisationId",
  id,
  seller_organisation_id AS "sellerOrganisationId",
  showroom_access_grant_id AS "showroomAccessGrantId",
  showroom_id AS "showroomId",
  showroom_snapshot_id AS "showroomSnapshotId",
  title,
  currency,
  budget_minor AS "budgetMinor",
  status,
  items,
  owner_credential_id AS "ownerCredentialId",
  created_at::text AS "createdAt",
  updated_at::text AS "updatedAt",
  version
FROM syntha_selection`;

function freezeGrant(row: GrantRow): ShowroomAccessGrant {
  return Object.freeze({
    id: showroomAccessGrantId(row.id),
    sellerOrganisationId: organisationId(row.sellerOrganisationId),
    buyerOrganisationId: organisationId(row.buyerOrganisationId),
    showroomId: showroomId(row.showroomId),
    showroomSnapshotId: showroomSnapshotId(row.showroomSnapshotId),
    status: row.status,
    grantedByCredentialId: row.grantedByCredentialId,
    grantedAt: new Date(row.grantedAt).toISOString(),
    revokedByCredentialId: row.revokedByCredentialId ?? undefined,
    revokedAt: row.revokedAt ? new Date(row.revokedAt).toISOString() : undefined,
    version: Number(row.version),
  });
}

function freezeSizeCurve(value: unknown): readonly SizeCurveEntry[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.map((entry) => {
      const record = entry as Record<string, unknown>;
      return Object.freeze({
        size: String(record.size ?? ''),
        quantity: Number(record.quantity ?? 0),
      });
    }),
  );
}

function freezeItems(value: unknown): readonly SelectionItem[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.map((entry) => {
      const record = entry as Record<string, unknown>;
      return Object.freeze({
        id: selectionItemId(String(record.id ?? '')),
        productReference: String(record.productReference ?? ''),
        variantReference:
          record.variantReference === undefined || record.variantReference === null
            ? undefined
            : String(record.variantReference),
        quantityIntent: Number(record.quantityIntent ?? 0),
        sizeCurve: freezeSizeCurve(record.sizeCurve),
        note: String(record.note ?? ''),
        position: Number(record.position ?? 0),
        createdAt: new Date(String(record.createdAt)).toISOString(),
        updatedAt: new Date(String(record.updatedAt)).toISOString(),
      });
    }),
  );
}

function freezeSelection(row: SelectionRow): Selection {
  return Object.freeze({
    id: selectionId(row.id),
    sellerOrganisationId: organisationId(row.sellerOrganisationId),
    buyerOrganisationId: organisationId(row.buyerOrganisationId),
    showroomAccessGrantId: showroomAccessGrantId(row.showroomAccessGrantId),
    showroomId: showroomId(row.showroomId),
    showroomSnapshotId: showroomSnapshotId(row.showroomSnapshotId),
    title: row.title,
    currency: row.currency,
    budgetMinor: Number(row.budgetMinor),
    status: row.status,
    items: freezeItems(row.items),
    ownerCredentialId: row.ownerCredentialId,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    version: Number(row.version),
  });
}

async function loadGrantForSeller(
  executor: SqlExecutor,
  sellerOrganisationId: OrganisationId,
  id: string,
): Promise<ShowroomAccessGrant | null> {
  const result = await executor.query<GrantRow>(
    `${grantSelection} WHERE seller_organisation_id = $1 AND id = $2`,
    [sellerOrganisationId, id],
  );
  return result.rows[0] ? freezeGrant(result.rows[0]) : null;
}

async function loadSelectionForBuyer(
  executor: SqlExecutor,
  buyerOrganisationId: OrganisationId,
  id: string,
): Promise<Selection | null> {
  const result = await executor.query<SelectionRow>(
    `${selectionSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
    [buyerOrganisationId, id],
  );
  return result.rows[0] ? freezeSelection(result.rows[0]) : null;
}

async function appendAudit(
  client: TransactionalSqlClient,
  audit: SelectionAuditRecord,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_selection_audit
       (id, seller_organisation_id, buyer_organisation_id, showroom_id,
        access_grant_id, selection_id, action, actor_credential_id,
        expected_version, resulting_version, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamptz)`,
    [
      audit.id,
      audit.sellerOrganisationId,
      audit.buyerOrganisationId,
      audit.showroomId,
      audit.accessGrantId,
      audit.selectionId,
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
  event: SelectionOutboxEvent,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_selection_outbox
       (id, seller_organisation_id, buyer_organisation_id, aggregate_type,
        aggregate_id, aggregate_version, event_name, payload, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::timestamptz)`,
    [
      event.id,
      event.sellerOrganisationId,
      event.buyerOrganisationId,
      event.aggregateType,
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

export class PostgresSelectionRepository implements SelectionRepository {
  constructor(private readonly pool: TransactionalSqlPool) {}

  async findActiveGrant(
    sellerOrganisationId: OrganisationId,
    showroomIdValue: ShowroomId,
    buyerOrganisationId: OrganisationId,
  ): Promise<ShowroomAccessGrant | null> {
    const result = await this.pool.query<GrantRow>(
      `${grantSelection}
       WHERE seller_organisation_id = $1
         AND showroom_id = $2
         AND buyer_organisation_id = $3
         AND status = 'ACTIVE'`,
      [sellerOrganisationId, showroomIdValue, buyerOrganisationId],
    );
    return result.rows[0] ? freezeGrant(result.rows[0]) : null;
  }

  async findGrantForSeller(
    sellerOrganisationId: OrganisationId,
    grantId: ShowroomAccessGrantId,
  ): Promise<ShowroomAccessGrant | null> {
    return loadGrantForSeller(this.pool, sellerOrganisationId, grantId);
  }

  async findGrantForBuyer(
    buyerOrganisationId: OrganisationId,
    grantId: ShowroomAccessGrantId,
  ): Promise<ShowroomAccessGrant | null> {
    const result = await this.pool.query<GrantRow>(
      `${grantSelection} WHERE buyer_organisation_id = $1 AND id = $2`,
      [buyerOrganisationId, grantId],
    );
    return result.rows[0] ? freezeGrant(result.rows[0]) : null;
  }

  async listGrantsForSeller(
    sellerOrganisationId: OrganisationId,
  ): Promise<readonly ShowroomAccessGrant[]> {
    const result = await this.pool.query<GrantRow>(
      `${grantSelection}
       WHERE seller_organisation_id = $1
       ORDER BY granted_at DESC, id`,
      [sellerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeGrant));
  }

  async listGrantsForBuyer(
    buyerOrganisationId: OrganisationId,
  ): Promise<readonly ShowroomAccessGrant[]> {
    const result = await this.pool.query<GrantRow>(
      `${grantSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY granted_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeGrant));
  }

  async findGrantReplay(command: LifecycleCreateCommand): Promise<ShowroomAccessGrant | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'SHOWROOM_ACCESS_GRANT',
      loadEntity: (executor, id) => loadGrantForSeller(executor, command.organisationId, id),
    });
  }

  async createGrant(
    grant: ShowroomAccessGrant,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<ShowroomAccessGrant>> {
    return withTransaction(this.pool, async (client) =>
      executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'SHOWROOM_ACCESS_GRANT',
        resultEntityId: grant.id,
        loadEntity: (executor, id) =>
          loadGrantForSeller(executor, command.organisationId, id),
        createEntity: async () => {
          await client.query(
            `INSERT INTO syntha_showroom_access_grant
               (seller_organisation_id, id, buyer_organisation_id, showroom_id,
                showroom_snapshot_id, status, granted_by_credential_id,
                granted_at, revoked_by_credential_id, revoked_at, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz,
                     $9, $10::timestamptz, $11)`,
            [
              grant.sellerOrganisationId,
              grant.id,
              grant.buyerOrganisationId,
              grant.showroomId,
              grant.showroomSnapshotId,
              grant.status,
              grant.grantedByCredentialId,
              grant.grantedAt,
              grant.revokedByCredentialId ?? null,
              grant.revokedAt ?? null,
              grant.version,
            ],
          );
          await appendAudit(client, audit);
          await appendOutbox(client, event);
          return grant;
        },
      }),
    );
  }

  async updateGrant(
    grant: ShowroomAccessGrant,
    expectedVersion: number,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
  ): Promise<boolean> {
    return withTransaction(this.pool, async (client) => {
      const updated = await client.query(
        `UPDATE syntha_showroom_access_grant
         SET status = $1,
             revoked_by_credential_id = $2,
             revoked_at = $3::timestamptz,
             version = $4
         WHERE seller_organisation_id = $5 AND id = $6 AND version = $7`,
        [
          grant.status,
          grant.revokedByCredentialId ?? null,
          grant.revokedAt ?? null,
          grant.version,
          grant.sellerOrganisationId,
          grant.id,
          expectedVersion,
        ],
      );
      if (updated.rowCount === 0) return false;
      await appendAudit(client, audit);
      await appendOutbox(client, event);
      return true;
    });
  }

  async findSelection(
    buyerOrganisationId: OrganisationId,
    id: SelectionId,
  ): Promise<Selection | null> {
    return loadSelectionForBuyer(this.pool, buyerOrganisationId, id);
  }

  async findSelectionByGrant(
    buyerOrganisationId: OrganisationId,
    grantId: ShowroomAccessGrantId,
  ): Promise<Selection | null> {
    const result = await this.pool.query<SelectionRow>(
      `${selectionSelection}
       WHERE buyer_organisation_id = $1 AND showroom_access_grant_id = $2`,
      [buyerOrganisationId, grantId],
    );
    return result.rows[0] ? freezeSelection(result.rows[0]) : null;
  }

  async listSelections(buyerOrganisationId: OrganisationId): Promise<readonly Selection[]> {
    const result = await this.pool.query<SelectionRow>(
      `${selectionSelection}
       WHERE buyer_organisation_id = $1
       ORDER BY updated_at DESC, id`,
      [buyerOrganisationId],
    );
    return Object.freeze(result.rows.map(freezeSelection));
  }

  async findSelectionReplay(command: LifecycleCreateCommand): Promise<Selection | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'SELECTION',
      loadEntity: (executor, id) => loadSelectionForBuyer(executor, command.organisationId, id),
    });
  }

  async createSelection(
    selection: Selection,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<Selection>> {
    return withTransaction(this.pool, async (client) =>
      executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'SELECTION',
        resultEntityId: selection.id,
        loadEntity: (executor, id) =>
          loadSelectionForBuyer(executor, command.organisationId, id),
        createEntity: async () => {
          await client.query(
            `INSERT INTO syntha_selection
               (buyer_organisation_id, id, seller_organisation_id,
                showroom_access_grant_id, showroom_id, showroom_snapshot_id,
                title, currency, budget_minor, status, items, owner_credential_id,
                created_at, updated_at, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                     $11::jsonb, $12, $13::timestamptz, $14::timestamptz, $15)`,
            [
              selection.buyerOrganisationId,
              selection.id,
              selection.sellerOrganisationId,
              selection.showroomAccessGrantId,
              selection.showroomId,
              selection.showroomSnapshotId,
              selection.title,
              selection.currency,
              selection.budgetMinor,
              selection.status,
              JSON.stringify(selection.items),
              selection.ownerCredentialId,
              selection.createdAt,
              selection.updatedAt,
              selection.version,
            ],
          );
          await appendAudit(client, audit);
          await appendOutbox(client, event);
          return selection;
        },
      }),
    );
  }

  async updateSelection(
    selection: Selection,
    expectedVersion: number,
    audit: SelectionAuditRecord,
    event: SelectionOutboxEvent,
  ): Promise<boolean> {
    return withTransaction(this.pool, async (client) => {
      const updated = await client.query(
        `UPDATE syntha_selection
         SET title = $1,
             currency = $2,
             budget_minor = $3,
             status = $4,
             items = $5::jsonb,
             updated_at = $6::timestamptz,
             version = $7
         WHERE buyer_organisation_id = $8 AND id = $9 AND version = $10`,
        [
          selection.title,
          selection.currency,
          selection.budgetMinor,
          selection.status,
          JSON.stringify(selection.items),
          selection.updatedAt,
          selection.version,
          selection.buyerOrganisationId,
          selection.id,
          expectedVersion,
        ],
      );
      if (updated.rowCount === 0) return false;
      await appendAudit(client, audit);
      await appendOutbox(client, event);
      return true;
    });
  }
}
