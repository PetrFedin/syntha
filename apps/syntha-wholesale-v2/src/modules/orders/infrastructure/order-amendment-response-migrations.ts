import { createHash } from 'node:crypto';

import type { TransactionalSqlPool } from '@/modules/commercial-execution';

interface AmendmentResponseMigration {
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

function migration(
  version: number,
  name: string,
  sql: string,
): AmendmentResponseMigration {
  return Object.freeze({
    version,
    name,
    sql,
    checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
  });
}

export const orderAmendmentResponseMigrations: readonly AmendmentResponseMigration[] =
  Object.freeze([
    migration(
      1,
      'buyer_amendment_response_and_revised_order_source_of_truth',
      `DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'syntha_order_review_buyer_id_unique'
  ) THEN
    ALTER TABLE syntha_order_review
      ADD CONSTRAINT syntha_order_review_buyer_id_unique
      UNIQUE (buyer_organisation_id, id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS syntha_order_amendment_response (
  buyer_organisation_id text NOT NULL,
  id text NOT NULL,
  seller_organisation_id text NOT NULL,
  order_review_id text NOT NULL,
  submitted_order_snapshot_id text NOT NULL,
  order_id text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('ACCEPTED', 'COUNTERED', 'REJECTED')),
  revised_order_version_id text,
  responded_at timestamptz NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  version bigint NOT NULL CHECK (version > 0),
  PRIMARY KEY (buyer_organisation_id, id),
  UNIQUE (buyer_organisation_id, order_review_id),
  UNIQUE (seller_organisation_id, id),
  FOREIGN KEY (buyer_organisation_id, order_review_id)
    REFERENCES syntha_order_review (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, order_review_id)
    REFERENCES syntha_order_review (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, submitted_order_snapshot_id)
    REFERENCES syntha_submitted_order_snapshot (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, submitted_order_snapshot_id)
    REFERENCES syntha_submitted_order_snapshot (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, order_id)
    REFERENCES syntha_order (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (buyer_organisation_id <> seller_organisation_id),
  CHECK (
    (decision IN ('ACCEPTED', 'COUNTERED') AND revised_order_version_id IS NOT NULL)
    OR
    (decision = 'REJECTED' AND revised_order_version_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS syntha_order_amendment_response_buyer_idx
  ON syntha_order_amendment_response (buyer_organisation_id, responded_at DESC, id);
CREATE INDEX IF NOT EXISTS syntha_order_amendment_response_seller_idx
  ON syntha_order_amendment_response (seller_organisation_id, responded_at DESC, id);

CREATE TABLE IF NOT EXISTS syntha_revised_order_version (
  buyer_organisation_id text NOT NULL,
  id text NOT NULL,
  seller_organisation_id text NOT NULL,
  order_amendment_response_id text NOT NULL,
  order_review_id text NOT NULL,
  submitted_order_snapshot_id text NOT NULL,
  order_id text NOT NULL,
  source_order_version bigint NOT NULL CHECK (source_order_version > 0),
  revision_kind text NOT NULL CHECK (revision_kind IN ('ACCEPTED', 'COUNTERED')),
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  PRIMARY KEY (buyer_organisation_id, id),
  UNIQUE (buyer_organisation_id, order_amendment_response_id),
  UNIQUE (seller_organisation_id, id),
  FOREIGN KEY (buyer_organisation_id, order_amendment_response_id)
    REFERENCES syntha_order_amendment_response (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, order_amendment_response_id)
    REFERENCES syntha_order_amendment_response (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, order_review_id)
    REFERENCES syntha_order_review (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, order_review_id)
    REFERENCES syntha_order_review (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, submitted_order_snapshot_id)
    REFERENCES syntha_submitted_order_snapshot (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, submitted_order_snapshot_id)
    REFERENCES syntha_submitted_order_snapshot (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, order_id)
    REFERENCES syntha_order (buyer_organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (buyer_organisation_id <> seller_organisation_id)
);

CREATE INDEX IF NOT EXISTS syntha_revised_order_version_buyer_idx
  ON syntha_revised_order_version (buyer_organisation_id, created_at DESC, id);
CREATE INDEX IF NOT EXISTS syntha_revised_order_version_seller_idx
  ON syntha_revised_order_version (seller_organisation_id, created_at DESC, id);

CREATE TABLE IF NOT EXISTS syntha_order_amendment_response_audit (
  id text PRIMARY KEY,
  buyer_organisation_id text NOT NULL,
  seller_organisation_id text NOT NULL,
  order_id text NOT NULL,
  submitted_order_snapshot_id text NOT NULL,
  order_review_id text NOT NULL,
  order_amendment_response_id text NOT NULL,
  action text NOT NULL CHECK (action IN (
    'ORDER_AMENDMENT_ACCEPTED',
    'ORDER_AMENDMENT_COUNTERED',
    'ORDER_AMENDMENT_REJECTED'
  )),
  actor_credential_id text NOT NULL,
  expected_review_version bigint NOT NULL CHECK (expected_review_version > 0),
  resulting_response_version bigint NOT NULL CHECK (resulting_response_version > 0),
  occurred_at timestamptz NOT NULL,
  FOREIGN KEY (buyer_organisation_id, order_amendment_response_id)
    REFERENCES syntha_order_amendment_response (buyer_organisation_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS syntha_order_amendment_response_audit_scope_idx
  ON syntha_order_amendment_response_audit
  (buyer_organisation_id, order_amendment_response_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS syntha_order_amendment_response_outbox (
  id text PRIMARY KEY,
  buyer_organisation_id text NOT NULL,
  seller_organisation_id text NOT NULL,
  aggregate_id text NOT NULL,
  aggregate_version bigint NOT NULL CHECK (aggregate_version > 0),
  event_name text NOT NULL CHECK (event_name IN (
    'ORDER_AMENDMENT_ACCEPTED',
    'ORDER_AMENDMENT_COUNTERED',
    'ORDER_AMENDMENT_REJECTED'
  )),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  occurred_at timestamptz NOT NULL,
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  UNIQUE (buyer_organisation_id, aggregate_id, aggregate_version, event_name)
);

CREATE INDEX IF NOT EXISTS syntha_order_amendment_response_outbox_pending_idx
  ON syntha_order_amendment_response_outbox (occurred_at, id)
  WHERE published_at IS NULL;`,
    ),
  ]);

export async function runOrderAmendmentResponseMigrations(input: {
  readonly pool: TransactionalSqlPool;
  readonly appliedAt?: Date;
  readonly migrations?: readonly AmendmentResponseMigration[];
}): Promise<{ readonly applied: readonly number[]; readonly skipped: readonly number[] }> {
  const migrations = [...(input.migrations ?? orderAmendmentResponseMigrations)].sort(
    (left, right) => left.version - right.version,
  );
  const client = await input.pool.connect();
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'syntha-order-amendment-response-migrations',
    ]);
    await client.query(`CREATE TABLE IF NOT EXISTS syntha_order_amendment_response_migrations (
      version integer PRIMARY KEY,
      name text NOT NULL,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL
    )`);
    const existing = await client.query<AppliedMigrationRow>(
      `SELECT version, name, checksum
       FROM syntha_order_amendment_response_migrations
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
            `Order amendment response migration ${item.version} differs from applied definition`,
          );
        }
        skipped.push(item.version);
        continue;
      }
      await client.query(item.sql);
      await client.query(
        `INSERT INTO syntha_order_amendment_response_migrations
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
