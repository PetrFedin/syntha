import { createHash } from 'node:crypto';

import type { TransactionalSqlPool } from '@/modules/commercial-execution';

interface SelectionMigration {
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

function migration(version: number, name: string, sql: string): SelectionMigration {
  return Object.freeze({
    version,
    name,
    sql,
    checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
  });
}

export const selectionMigrations: readonly SelectionMigration[] = Object.freeze([
  migration(
    1,
    'buyer_access_and_selection_source_of_truth',
    `CREATE TABLE IF NOT EXISTS syntha_showroom_access_grant (
  seller_organisation_id text NOT NULL,
  id text NOT NULL,
  buyer_organisation_id text NOT NULL,
  showroom_id text NOT NULL,
  showroom_snapshot_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('ACTIVE', 'REVOKED')),
  granted_by_credential_id text NOT NULL,
  granted_at timestamptz NOT NULL,
  revoked_by_credential_id text,
  revoked_at timestamptz,
  version bigint NOT NULL CHECK (version > 0),
  PRIMARY KEY (seller_organisation_id, id),
  FOREIGN KEY (seller_organisation_id, showroom_id)
    REFERENCES syntha_showroom (organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, showroom_snapshot_id)
    REFERENCES syntha_showroom_publication_snapshot (organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (seller_organisation_id <> buyer_organisation_id),
  CHECK (
    (status = 'ACTIVE' AND revoked_by_credential_id IS NULL AND revoked_at IS NULL)
    OR
    (status = 'REVOKED' AND revoked_by_credential_id IS NOT NULL AND revoked_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS syntha_showroom_access_active_unique_idx
  ON syntha_showroom_access_grant
  (seller_organisation_id, showroom_id, buyer_organisation_id)
  WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS syntha_showroom_access_buyer_idx
  ON syntha_showroom_access_grant
  (buyer_organisation_id, status, granted_at DESC);

CREATE TABLE IF NOT EXISTS syntha_selection (
  buyer_organisation_id text NOT NULL,
  id text NOT NULL,
  seller_organisation_id text NOT NULL,
  showroom_access_grant_id text NOT NULL,
  showroom_id text NOT NULL,
  showroom_snapshot_id text NOT NULL,
  title text NOT NULL,
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  budget_minor bigint NOT NULL CHECK (budget_minor >= 0),
  status text NOT NULL CHECK (status IN ('DRAFT', 'READY', 'ARCHIVED')),
  items jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(items) = 'array'),
  owner_credential_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  PRIMARY KEY (buyer_organisation_id, id),
  UNIQUE (buyer_organisation_id, seller_organisation_id, showroom_access_grant_id),
  FOREIGN KEY (seller_organisation_id, showroom_access_grant_id)
    REFERENCES syntha_showroom_access_grant (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, showroom_id)
    REFERENCES syntha_showroom (organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (seller_organisation_id, showroom_snapshot_id)
    REFERENCES syntha_showroom_publication_snapshot (organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (buyer_organisation_id <> seller_organisation_id)
);

CREATE INDEX IF NOT EXISTS syntha_selection_buyer_status_idx
  ON syntha_selection (buyer_organisation_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS syntha_selection_audit (
  id text PRIMARY KEY,
  seller_organisation_id text NOT NULL,
  buyer_organisation_id text NOT NULL,
  showroom_id text NOT NULL,
  access_grant_id text NOT NULL,
  selection_id text,
  action text NOT NULL CHECK (action IN (
    'ACCESS_GRANTED',
    'ACCESS_REVOKED',
    'SELECTION_CREATED',
    'ITEM_ADDED',
    'BUDGET_CHANGED',
    'SIZE_CURVE_CHANGED',
    'MARKED_READY',
    'ARCHIVED'
  )),
  actor_credential_id text NOT NULL,
  expected_version bigint,
  resulting_version bigint NOT NULL CHECK (resulting_version > 0),
  occurred_at timestamptz NOT NULL,
  FOREIGN KEY (seller_organisation_id, access_grant_id)
    REFERENCES syntha_showroom_access_grant (seller_organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (buyer_organisation_id, selection_id)
    REFERENCES syntha_selection (buyer_organisation_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS syntha_selection_audit_scope_idx
  ON syntha_selection_audit
  (buyer_organisation_id, access_grant_id, selection_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS syntha_selection_outbox (
  id text PRIMARY KEY,
  seller_organisation_id text NOT NULL,
  buyer_organisation_id text NOT NULL,
  aggregate_type text NOT NULL CHECK (aggregate_type IN ('SHOWROOM_ACCESS', 'SELECTION')),
  aggregate_id text NOT NULL,
  aggregate_version bigint NOT NULL CHECK (aggregate_version > 0),
  event_name text NOT NULL CHECK (event_name IN (
    'SHOWROOM_ACCESS_GRANTED',
    'SHOWROOM_ACCESS_REVOKED',
    'SELECTION_CREATED',
    'SELECTION_ITEM_ADDED',
    'SELECTION_BUDGET_CHANGED',
    'SELECTION_SIZE_CURVE_CHANGED',
    'SELECTION_READY',
    'SELECTION_ARCHIVED'
  )),
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  UNIQUE (buyer_organisation_id, aggregate_type, aggregate_id, aggregate_version, event_name)
);

CREATE INDEX IF NOT EXISTS syntha_selection_outbox_pending_idx
  ON syntha_selection_outbox (occurred_at, id)
  WHERE published_at IS NULL;`,
  ),
]);

export async function runSelectionMigrations(input: {
  readonly pool: TransactionalSqlPool;
  readonly appliedAt?: Date;
  readonly migrations?: readonly SelectionMigration[];
}): Promise<{ readonly applied: readonly number[]; readonly skipped: readonly number[] }> {
  const migrations = [...(input.migrations ?? selectionMigrations)].sort(
    (left, right) => left.version - right.version,
  );
  const versions = new Set<number>();
  for (const item of migrations) {
    if (!Number.isInteger(item.version) || item.version < 1 || versions.has(item.version)) {
      throw new Error(`Invalid Selection migration version: ${item.version}`);
    }
    versions.add(item.version);
  }

  const client = await input.pool.connect();
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'syntha-selection-migrations',
    ]);
    await client.query(`CREATE TABLE IF NOT EXISTS syntha_selection_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL
)`);
    const existing = await client.query<AppliedMigrationRow>(
      `SELECT version, name, checksum
       FROM syntha_selection_migrations
       ORDER BY version`,
    );
    const byVersion = new Map(existing.rows.map((row) => [Number(row.version), row]));
    const applied: number[] = [];
    const skipped: number[] = [];

    for (const item of migrations) {
      const previous = byVersion.get(item.version);
      if (previous) {
        if (previous.name !== item.name || previous.checksum !== item.checksum) {
          throw new Error(`Selection migration ${item.version} differs from applied definition`);
        }
        skipped.push(item.version);
        continue;
      }
      await client.query(item.sql);
      await client.query(
        `INSERT INTO syntha_selection_migrations
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
      // Preserve the migration failure.
    }
    throw error;
  } finally {
    client.release();
  }
}
