import { createHash } from 'node:crypto';

import type { TransactionalSqlPool } from '@/modules/commercial-execution';

interface ShowroomMigration {
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

function migration(version: number, name: string, sql: string): ShowroomMigration {
  return Object.freeze({
    version,
    name,
    sql,
    checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
  });
}

export const showroomMigrations: readonly ShowroomMigration[] = Object.freeze([
  migration(
    1,
    'showroom_publication_source_of_truth',
    `CREATE TABLE IF NOT EXISTS syntha_showroom (
  organisation_id text NOT NULL,
  id text NOT NULL,
  collection_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  opens_at timestamptz NOT NULL,
  closes_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  owner_credential_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  PRIMARY KEY (organisation_id, id),
  UNIQUE (organisation_id, collection_id, code),
  FOREIGN KEY (organisation_id, collection_id)
    REFERENCES syntha_collection (organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (opens_at < closes_at),
  CHECK (char_length(description) <= 2000)
);

CREATE INDEX IF NOT EXISTS syntha_showroom_collection_idx
  ON syntha_showroom (organisation_id, collection_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS syntha_showroom_publication_snapshot (
  organisation_id text NOT NULL,
  id text NOT NULL,
  showroom_id text NOT NULL,
  showroom_version bigint NOT NULL CHECK (showroom_version > 1),
  collection_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  opens_at timestamptz NOT NULL,
  closes_at timestamptz NOT NULL,
  published_by_credential_id text NOT NULL,
  published_at timestamptz NOT NULL,
  PRIMARY KEY (organisation_id, id),
  UNIQUE (organisation_id, showroom_id),
  FOREIGN KEY (organisation_id, showroom_id)
    REFERENCES syntha_showroom (organisation_id, id)
    ON DELETE RESTRICT,
  FOREIGN KEY (organisation_id, collection_id)
    REFERENCES syntha_collection (organisation_id, id)
    ON DELETE RESTRICT,
  CHECK (opens_at < closes_at),
  CHECK (char_length(description) <= 2000)
);

CREATE INDEX IF NOT EXISTS syntha_showroom_snapshot_collection_idx
  ON syntha_showroom_publication_snapshot
  (organisation_id, collection_id, published_at DESC);

CREATE TABLE IF NOT EXISTS syntha_showroom_audit (
  id text PRIMARY KEY,
  organisation_id text NOT NULL,
  showroom_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'PUBLISHED', 'ARCHIVED')),
  actor_credential_id text NOT NULL,
  expected_version bigint,
  resulting_version bigint NOT NULL CHECK (resulting_version > 0),
  snapshot_id text,
  occurred_at timestamptz NOT NULL,
  FOREIGN KEY (organisation_id, showroom_id)
    REFERENCES syntha_showroom (organisation_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS syntha_showroom_audit_entity_idx
  ON syntha_showroom_audit
  (organisation_id, showroom_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS syntha_showroom_outbox (
  id text PRIMARY KEY,
  organisation_id text NOT NULL,
  aggregate_id text NOT NULL,
  aggregate_version bigint NOT NULL CHECK (aggregate_version > 0),
  event_name text NOT NULL CHECK (event_name = 'SHOWROOM_PUBLISHED'),
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  UNIQUE (organisation_id, aggregate_id, aggregate_version, event_name),
  FOREIGN KEY (organisation_id, aggregate_id)
    REFERENCES syntha_showroom (organisation_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS syntha_showroom_outbox_pending_idx
  ON syntha_showroom_outbox (occurred_at, id)
  WHERE published_at IS NULL;`,
  ),
]);

export async function runShowroomMigrations(input: {
  readonly pool: TransactionalSqlPool;
  readonly appliedAt?: Date;
  readonly migrations?: readonly ShowroomMigration[];
}): Promise<{ readonly applied: readonly number[]; readonly skipped: readonly number[] }> {
  const migrations = [...(input.migrations ?? showroomMigrations)].sort(
    (left, right) => left.version - right.version,
  );
  const versions = new Set<number>();
  for (const item of migrations) {
    if (!Number.isInteger(item.version) || item.version < 1 || versions.has(item.version)) {
      throw new Error(`Invalid Showroom migration version: ${item.version}`);
    }
    versions.add(item.version);
  }

  const client = await input.pool.connect();
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'syntha-showroom-migrations',
    ]);
    await client.query(`CREATE TABLE IF NOT EXISTS syntha_showroom_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL
)`);
    const existing = await client.query<AppliedMigrationRow>(
      `SELECT version, name, checksum
       FROM syntha_showroom_migrations
       ORDER BY version`,
    );
    const byVersion = new Map(existing.rows.map((row) => [Number(row.version), row]));
    const applied: number[] = [];
    const skipped: number[] = [];

    for (const item of migrations) {
      const previous = byVersion.get(item.version);
      if (previous) {
        if (previous.name !== item.name || previous.checksum !== item.checksum) {
          throw new Error(`Showroom migration ${item.version} differs from applied definition`);
        }
        skipped.push(item.version);
        continue;
      }
      await client.query(item.sql);
      await client.query(
        `INSERT INTO syntha_showroom_migrations
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
