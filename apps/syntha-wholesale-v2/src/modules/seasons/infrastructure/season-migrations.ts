import { createHash } from 'node:crypto';

import type { TransactionalSqlPool } from '@/modules/commercial-execution';

interface SeasonMigration {
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

function migration(version: number, name: string, sql: string): SeasonMigration {
  return Object.freeze({
    version,
    name,
    sql,
    checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
  });
}

export const seasonMigrations: readonly SeasonMigration[] = Object.freeze([
  migration(
    1,
    'seasons_and_lifecycle_audit_contract',
    `CREATE TABLE IF NOT EXISTS syntha_season (
  organisation_id text NOT NULL,
  id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('PLANNING', 'ACTIVE', 'CLOSED', 'ARCHIVED')),
  owner_credential_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  PRIMARY KEY (organisation_id, id),
  UNIQUE (organisation_id, code),
  CHECK (starts_at < ends_at)
);

CREATE INDEX IF NOT EXISTS syntha_season_window_idx
  ON syntha_season (organisation_id, status, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS syntha_lifecycle_audit (
  id text PRIMARY KEY,
  organisation_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'STATUS_CHANGED')),
  actor_credential_id text NOT NULL,
  expected_version bigint,
  resulting_version bigint NOT NULL CHECK (resulting_version > 0),
  occurred_at timestamptz NOT NULL
);

ALTER TABLE syntha_lifecycle_audit
  DROP CONSTRAINT IF EXISTS syntha_lifecycle_audit_entity_type_check;
ALTER TABLE syntha_lifecycle_audit
  ADD CONSTRAINT syntha_lifecycle_audit_entity_type_check
  CHECK (entity_type IN ('SEASON', 'CAMPAIGN', 'COLLECTION')) NOT VALID;
ALTER TABLE syntha_lifecycle_audit
  VALIDATE CONSTRAINT syntha_lifecycle_audit_entity_type_check;

CREATE INDEX IF NOT EXISTS syntha_lifecycle_audit_entity_idx
  ON syntha_lifecycle_audit (organisation_id, entity_type, entity_id, occurred_at DESC);`,
  ),
]);

export async function runSeasonMigrations(input: {
  readonly pool: TransactionalSqlPool;
  readonly appliedAt?: Date;
  readonly migrations?: readonly SeasonMigration[];
}): Promise<{ readonly applied: readonly number[]; readonly skipped: readonly number[] }> {
  const migrations = [...(input.migrations ?? seasonMigrations)].sort(
    (left, right) => left.version - right.version,
  );
  const versions = new Set<number>();
  for (const item of migrations) {
    if (!Number.isInteger(item.version) || item.version < 1 || versions.has(item.version)) {
      throw new Error(`Invalid season migration version: ${item.version}`);
    }
    versions.add(item.version);
  }

  const client = await input.pool.connect();
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'syntha-season-migrations',
    ]);
    await client.query(`CREATE TABLE IF NOT EXISTS syntha_season_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL
)`);
    const existing = await client.query<AppliedMigrationRow>(
      `SELECT version, name, checksum FROM syntha_season_migrations ORDER BY version`,
    );
    const byVersion = new Map(existing.rows.map((row) => [Number(row.version), row]));
    const applied: number[] = [];
    const skipped: number[] = [];

    for (const item of migrations) {
      const previous = byVersion.get(item.version);
      if (previous) {
        if (previous.name !== item.name || previous.checksum !== item.checksum) {
          throw new Error(`Season migration ${item.version} differs from applied definition`);
        }
        skipped.push(item.version);
        continue;
      }
      await client.query(item.sql);
      await client.query(
        `INSERT INTO syntha_season_migrations
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
