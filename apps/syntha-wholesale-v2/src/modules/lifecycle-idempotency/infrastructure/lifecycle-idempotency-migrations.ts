import { createHash } from 'node:crypto';

import type { TransactionalSqlPool } from '@/modules/commercial-execution';

interface IdempotencyMigration {
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

function migration(version: number, name: string, sql: string): IdempotencyMigration {
  return Object.freeze({
    version,
    name,
    sql,
    checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
  });
}

export const lifecycleIdempotencyMigrations: readonly IdempotencyMigration[] = Object.freeze([
  migration(
    1,
    'lifecycle_create_idempotency',
    `CREATE TABLE IF NOT EXISTS syntha_lifecycle_idempotency (
  organisation_id text NOT NULL,
  command_name text NOT NULL CHECK (
    command_name IN ('CREATE_SEASON', 'CREATE_CAMPAIGN', 'CREATE_COLLECTION')
  ),
  idempotency_key text NOT NULL,
  fingerprint text NOT NULL,
  actor_credential_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
  result_entity_type text CHECK (
    result_entity_type IS NULL OR result_entity_type IN ('SEASON', 'CAMPAIGN', 'COLLECTION')
  ),
  result_entity_id text,
  created_at timestamptz NOT NULL,
  completed_at timestamptz,
  PRIMARY KEY (organisation_id, command_name, idempotency_key),
  CHECK (
    (status = 'IN_PROGRESS' AND result_entity_type IS NULL AND result_entity_id IS NULL AND completed_at IS NULL)
    OR
    (status = 'COMPLETED' AND result_entity_type IS NOT NULL AND result_entity_id IS NOT NULL AND completed_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS syntha_lifecycle_idempotency_result_idx
  ON syntha_lifecycle_idempotency
  (organisation_id, result_entity_type, result_entity_id)
  WHERE status = 'COMPLETED';`,
  ),
  migration(
    2,
    'showroom_create_and_publish_idempotency',
    `ALTER TABLE syntha_lifecycle_idempotency
  DROP CONSTRAINT IF EXISTS syntha_lifecycle_idempotency_command_name_check;
ALTER TABLE syntha_lifecycle_idempotency
  DROP CONSTRAINT IF EXISTS syntha_lifecycle_idempotency_result_entity_type_check;
ALTER TABLE syntha_lifecycle_idempotency
  ADD CONSTRAINT syntha_lifecycle_idempotency_command_name_check CHECK (
    command_name IN (
      'CREATE_SEASON',
      'CREATE_CAMPAIGN',
      'CREATE_COLLECTION',
      'CREATE_SHOWROOM',
      'PUBLISH_SHOWROOM'
    )
  );
ALTER TABLE syntha_lifecycle_idempotency
  ADD CONSTRAINT syntha_lifecycle_idempotency_result_entity_type_check CHECK (
    result_entity_type IS NULL OR result_entity_type IN (
      'SEASON',
      'CAMPAIGN',
      'COLLECTION',
      'SHOWROOM',
      'SHOWROOM_SNAPSHOT'
    )
  );`,
  ),
]);

export async function runLifecycleIdempotencyMigrations(input: {
  readonly pool: TransactionalSqlPool;
  readonly appliedAt?: Date;
  readonly migrations?: readonly IdempotencyMigration[];
}): Promise<{ readonly applied: readonly number[]; readonly skipped: readonly number[] }> {
  const migrations = [...(input.migrations ?? lifecycleIdempotencyMigrations)].sort(
    (left, right) => left.version - right.version,
  );
  const versions = new Set<number>();
  for (const item of migrations) {
    if (!Number.isInteger(item.version) || item.version < 1 || versions.has(item.version)) {
      throw new Error(`Invalid lifecycle idempotency migration version: ${item.version}`);
    }
    versions.add(item.version);
  }

  const client = await input.pool.connect();
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'syntha-lifecycle-idempotency-migrations',
    ]);
    await client.query(`CREATE TABLE IF NOT EXISTS syntha_lifecycle_idempotency_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL
)`);
    const existing = await client.query<AppliedMigrationRow>(
      `SELECT version, name, checksum
       FROM syntha_lifecycle_idempotency_migrations
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
            `Lifecycle idempotency migration ${item.version} differs from applied definition`,
          );
        }
        skipped.push(item.version);
        continue;
      }
      await client.query(item.sql);
      await client.query(
        `INSERT INTO syntha_lifecycle_idempotency_migrations
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
