import { createHash } from 'node:crypto';

import type { TransactionalSqlPool } from '@/modules/commercial-execution';

interface OrderMigration {
  readonly version: number;
  readonly name: string;
  readonly sql: string;
  readonly checksum: string;
}

interface AppliedMigrationRow {
  readonly version: number;
  readonly name: string;
  readonly checksum: string;
}

function migration(version: number, name: string, sql: string): OrderMigration {
  return Object.freeze({
    version,
    name,
    sql,
    checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
  });
}

export const orderMigrations: readonly OrderMigration[] = Object.freeze([
  migration(
    1,
    'order_builder_and_submitted_snapshot_source_of_truth',
    `CREATE TABLE IF NOT EXISTS syntha_order (
  buyer_organisation_id text NOT NULL,
  id text NOT NULL,
  seller_organisation_id text NOT NULL,
  selection_id text NOT NULL,
  showroom_access_grant_id text NOT NULL,
  showroom_id text NOT NULL,
  showroom_snapshot_id text NOT NULL,
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  status text NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'CANCELLED')),
  lines jsonb NOT NULL CHECK (jsonb_typeof(lines) = 'array'),
  totals jsonb NOT NULL CHECK (jsonb_typeof(totals) = 'object'),
  owner_credential_id text NOT NULL,
  submitted_snapshot_id text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  PRIMARY KEY (buyer_organisation_id, id),
  UNIQUE (buyer_organisation_id, selection_id),
  FOREIGN KEY (buyer_organisation_id, selection_id)
    REFERENCES syntha_selection (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, showroom_access_grant_id)
    REFERENCES syntha_showroom_access_grant (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, showroom_id)
    REFERENCES syntha_showroom (organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, showroom_snapshot_id)
    REFERENCES syntha_showroom_publication_snapshot (organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (buyer_organisation_id <> seller_organisation_id),
  CHECK (
    (status = 'SUBMITTED' AND submitted_snapshot_id IS NOT NULL)
    OR
    (status <> 'SUBMITTED' AND submitted_snapshot_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS syntha_order_buyer_status_idx
  ON syntha_order (buyer_organisation_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS syntha_submitted_order_snapshot (
  buyer_organisation_id text NOT NULL,
  id text NOT NULL,
  order_id text NOT NULL,
  order_version bigint NOT NULL CHECK (order_version > 0),
  seller_organisation_id text NOT NULL,
  selection_id text NOT NULL,
  showroom_access_grant_id text NOT NULL,
  showroom_id text NOT NULL,
  showroom_snapshot_id text NOT NULL,
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  lines jsonb NOT NULL CHECK (jsonb_typeof(lines) = 'array'),
  totals jsonb NOT NULL CHECK (jsonb_typeof(totals) = 'object'),
  submitted_by_credential_id text NOT NULL,
  submitted_at timestamptz NOT NULL,
  PRIMARY KEY (buyer_organisation_id, id),
  UNIQUE (buyer_organisation_id, order_id),
  FOREIGN KEY (buyer_organisation_id, order_id)
    REFERENCES syntha_order (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, selection_id)
    REFERENCES syntha_selection (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, showroom_access_grant_id)
    REFERENCES syntha_showroom_access_grant (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, showroom_snapshot_id)
    REFERENCES syntha_showroom_publication_snapshot (organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (buyer_organisation_id <> seller_organisation_id)
);

CREATE INDEX IF NOT EXISTS syntha_submitted_order_seller_idx
  ON syntha_submitted_order_snapshot
  (seller_organisation_id, submitted_at DESC, id);

CREATE INDEX IF NOT EXISTS syntha_submitted_order_buyer_idx
  ON syntha_submitted_order_snapshot
  (buyer_organisation_id, submitted_at DESC, id);

CREATE TABLE IF NOT EXISTS syntha_order_audit (
  id text PRIMARY KEY,
  buyer_organisation_id text NOT NULL,
  seller_organisation_id text NOT NULL,
  selection_id text NOT NULL,
  showroom_access_grant_id text NOT NULL,
  showroom_snapshot_id text NOT NULL,
  order_id text NOT NULL,
  action text NOT NULL CHECK (action IN (
    'DRAFT_CREATED',
    'LINE_QUANTITY_CHANGED',
    'LINE_TERMS_CHANGED',
    'ORDER_SUBMITTED'
  )),
  actor_credential_id text NOT NULL,
  expected_version bigint,
  resulting_version bigint NOT NULL CHECK (resulting_version > 0),
  occurred_at timestamptz NOT NULL,
  FOREIGN KEY (buyer_organisation_id, order_id)
    REFERENCES syntha_order (buyer_organisation_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS syntha_order_audit_scope_idx
  ON syntha_order_audit
  (buyer_organisation_id, order_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS syntha_order_outbox (
  id text PRIMARY KEY,
  buyer_organisation_id text NOT NULL,
  seller_organisation_id text NOT NULL,
  aggregate_id text NOT NULL,
  aggregate_version bigint NOT NULL CHECK (aggregate_version > 0),
  event_name text NOT NULL CHECK (event_name IN (
    'ORDER_DRAFT_CREATED',
    'ORDER_LINE_QUANTITY_CHANGED',
    'ORDER_LINE_TERMS_CHANGED',
    'ORDER_SUBMITTED'
  )),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  occurred_at timestamptz NOT NULL,
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  UNIQUE (buyer_organisation_id, aggregate_id, aggregate_version, event_name)
);

CREATE INDEX IF NOT EXISTS syntha_order_outbox_pending_idx
  ON syntha_order_outbox (occurred_at, id)
  WHERE published_at IS NULL;`,
  ),
]);

export async function runOrderMigrations(input: {
  readonly pool: TransactionalSqlPool;
  readonly appliedAt?: Date;
  readonly migrations?: readonly OrderMigration[];
}): Promise<{ readonly applied: readonly number[]; readonly skipped: readonly number[] }> {
  const migrations = [...(input.migrations ?? orderMigrations)].sort(
    (left, right) => left.version - right.version,
  );
  const versions = new Set<number>();
  for (const item of migrations) {
    if (!Number.isInteger(item.version) || item.version < 1 || versions.has(item.version)) {
      throw new Error(`Invalid Order migration version: ${item.version}`);
    }
    versions.add(item.version);
  }

  const client = await input.pool.connect();
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'syntha-order-migrations',
    ]);
    await client.query(`CREATE TABLE IF NOT EXISTS syntha_order_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL
)`);
    const existing = await client.query<AppliedMigrationRow>(
      `SELECT version, name, checksum
       FROM syntha_order_migrations
       ORDER BY version`,
    );
    const byVersion = new Map(existing.rows.map((row) => [Number(row.version), row]));
    const applied: number[] = [];
    const skipped: number[] = [];

    for (const item of migrations) {
      const previous = byVersion.get(item.version);
      if (previous) {
        if (previous.name !== item.name || previous.checksum !== item.checksum) {
          throw new Error(`Order migration ${item.version} differs from applied definition`);
        }
        skipped.push(item.version);
        continue;
      }
      await client.query(item.sql);
      await client.query(
        `INSERT INTO syntha_order_migrations
           (version, name, checksum, applied_at)
         VALUES ($1, $2, $3, $4::timestamptz)`,
        [
          item.version,
          item.name,
          item.checksum,
          (input.appliedAt ?? new Date()).toISOString(),
        ],
      );
      applied.push(item.version);
    }
    await client.query('COMMIT');
    return Object.freeze({
      applied: Object.freeze(applied),
      skipped: Object.freeze(skipped),
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original migration failure.
    }
    throw error;
  } finally {
    client.release();
  }
}
