import { createHash } from 'node:crypto';

import type { TransactionalSqlPool } from '@/modules/commercial-execution';

interface RevisedReviewMigration {
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

function migration(version: number, name: string, sql: string): RevisedReviewMigration {
  return Object.freeze({
    version,
    name,
    sql,
    checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
  });
}

export const revisedOrderReviewMigrations: readonly RevisedReviewMigration[] =
  Object.freeze([
    migration(
      1,
      'revised_order_review_and_confirmation_source_of_truth',
      `CREATE TABLE IF NOT EXISTS syntha_revised_order_review (
  seller_organisation_id text NOT NULL,
  id text NOT NULL,
  buyer_organisation_id text NOT NULL,
  revised_order_version_id text NOT NULL,
  order_amendment_response_id text NOT NULL,
  submitted_order_snapshot_id text NOT NULL,
  order_id text NOT NULL,
  status text NOT NULL CHECK (status IN (
    'PENDING',
    'AMENDMENT_REQUESTED',
    'APPROVED',
    'CONFIRMED'
  )),
  confirmed_order_version_id text,
  updated_at timestamptz NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  version bigint NOT NULL CHECK (version > 0),
  PRIMARY KEY (seller_organisation_id, id),
  UNIQUE (seller_organisation_id, revised_order_version_id),
  UNIQUE (buyer_organisation_id, id),
  FOREIGN KEY (seller_organisation_id, revised_order_version_id)
    REFERENCES syntha_revised_order_version (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, revised_order_version_id)
    REFERENCES syntha_revised_order_version (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, order_amendment_response_id)
    REFERENCES syntha_order_amendment_response (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, order_amendment_response_id)
    REFERENCES syntha_order_amendment_response (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, submitted_order_snapshot_id)
    REFERENCES syntha_submitted_order_snapshot (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, submitted_order_snapshot_id)
    REFERENCES syntha_submitted_order_snapshot (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, order_id)
    REFERENCES syntha_order (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (buyer_organisation_id <> seller_organisation_id),
  CHECK (
    (status IN ('PENDING', 'AMENDMENT_REQUESTED', 'APPROVED')
      AND confirmed_order_version_id IS NULL)
    OR
    (status = 'CONFIRMED' AND confirmed_order_version_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS syntha_revised_order_review_seller_idx
  ON syntha_revised_order_review
  (seller_organisation_id, status, updated_at DESC, id);
CREATE INDEX IF NOT EXISTS syntha_revised_order_review_buyer_idx
  ON syntha_revised_order_review
  (buyer_organisation_id, status, updated_at DESC, id);

CREATE TABLE IF NOT EXISTS syntha_revised_confirmed_order_version (
  seller_organisation_id text NOT NULL,
  id text NOT NULL,
  buyer_organisation_id text NOT NULL,
  revised_order_review_id text NOT NULL,
  revised_order_version_id text NOT NULL,
  order_amendment_response_id text NOT NULL,
  submitted_order_snapshot_id text NOT NULL,
  order_id text NOT NULL,
  confirmed_at timestamptz NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  PRIMARY KEY (seller_organisation_id, id),
  UNIQUE (seller_organisation_id, revised_order_review_id),
  UNIQUE (buyer_organisation_id, id),
  FOREIGN KEY (seller_organisation_id, revised_order_review_id)
    REFERENCES syntha_revised_order_review (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, revised_order_review_id)
    REFERENCES syntha_revised_order_review (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, revised_order_version_id)
    REFERENCES syntha_revised_order_version (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, revised_order_version_id)
    REFERENCES syntha_revised_order_version (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, order_amendment_response_id)
    REFERENCES syntha_order_amendment_response (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, order_amendment_response_id)
    REFERENCES syntha_order_amendment_response (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, submitted_order_snapshot_id)
    REFERENCES syntha_submitted_order_snapshot (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, submitted_order_snapshot_id)
    REFERENCES syntha_submitted_order_snapshot (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, order_id)
    REFERENCES syntha_order (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (buyer_organisation_id <> seller_organisation_id)
);

CREATE INDEX IF NOT EXISTS syntha_revised_confirmed_order_seller_idx
  ON syntha_revised_confirmed_order_version
  (seller_organisation_id, confirmed_at DESC, id);
CREATE INDEX IF NOT EXISTS syntha_revised_confirmed_order_buyer_idx
  ON syntha_revised_confirmed_order_version
  (buyer_organisation_id, confirmed_at DESC, id);

CREATE TABLE IF NOT EXISTS syntha_revised_order_review_audit (
  id text PRIMARY KEY,
  buyer_organisation_id text NOT NULL,
  seller_organisation_id text NOT NULL,
  order_id text NOT NULL,
  submitted_order_snapshot_id text NOT NULL,
  order_amendment_response_id text NOT NULL,
  revised_order_version_id text NOT NULL,
  revised_order_review_id text NOT NULL,
  action text NOT NULL CHECK (action IN (
    'REVISED_ORDER_APPROVED',
    'REVISED_ORDER_AMENDMENT_REQUESTED',
    'REVISED_ORDER_CONFIRMED'
  )),
  actor_credential_id text NOT NULL,
  expected_version bigint NOT NULL CHECK (expected_version >= 0),
  resulting_version bigint NOT NULL CHECK (resulting_version > 0),
  occurred_at timestamptz NOT NULL,
  FOREIGN KEY (seller_organisation_id, revised_order_review_id)
    REFERENCES syntha_revised_order_review (seller_organisation_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS syntha_revised_order_review_audit_scope_idx
  ON syntha_revised_order_review_audit
  (seller_organisation_id, revised_order_review_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS syntha_revised_order_review_outbox (
  id text PRIMARY KEY,
  buyer_organisation_id text NOT NULL,
  seller_organisation_id text NOT NULL,
  aggregate_id text NOT NULL,
  aggregate_version bigint NOT NULL CHECK (aggregate_version > 0),
  event_name text NOT NULL CHECK (event_name IN (
    'REVISED_ORDER_APPROVED',
    'REVISED_ORDER_AMENDMENT_REQUESTED',
    'REVISED_ORDER_CONFIRMED'
  )),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  occurred_at timestamptz NOT NULL,
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  UNIQUE (seller_organisation_id, aggregate_id, aggregate_version, event_name)
);

CREATE INDEX IF NOT EXISTS syntha_revised_order_review_outbox_pending_idx
  ON syntha_revised_order_review_outbox (occurred_at, id)
  WHERE published_at IS NULL;`,
    ),
  ]);

export async function runRevisedOrderReviewMigrations(input: {
  readonly pool: TransactionalSqlPool;
  readonly appliedAt?: Date;
  readonly migrations?: readonly RevisedReviewMigration[];
}): Promise<{ readonly applied: readonly number[]; readonly skipped: readonly number[] }> {
  const migrations = [...(input.migrations ?? revisedOrderReviewMigrations)].sort(
    (left, right) => left.version - right.version,
  );
  const client = await input.pool.connect();
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'syntha-revised-order-review-migrations',
    ]);
    await client.query(`CREATE TABLE IF NOT EXISTS syntha_revised_order_review_migrations (
      version integer PRIMARY KEY,
      name text NOT NULL,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL
    )`);
    const existing = await client.query<AppliedMigrationRow>(
      `SELECT version, name, checksum
       FROM syntha_revised_order_review_migrations
       ORDER BY version`,
    );
    const byVersion = new Map(existing.rows.map((row) => [Number(row.version), row]));
    const applied: number[] = [];
    const skipped: number[] = [];
    for (const item of migrations) {
      const previous = byVersion.get(item.version);
      if (previous) {
        if (previous.name !== item.name || previous.checksum !== item.checksum) {
          throw new Error(
            `Revised Order review migration ${item.version} differs from applied definition`,
          );
        }
        skipped.push(item.version);
        continue;
      }
      await client.query(item.sql);
      await client.query(
        `INSERT INTO syntha_revised_order_review_migrations
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
