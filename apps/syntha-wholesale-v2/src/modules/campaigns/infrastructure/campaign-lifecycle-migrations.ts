import { createHash } from 'node:crypto';

import type { TransactionalSqlPool } from '@/modules/commercial-execution';

interface LifecycleMigration {
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

function migration(version: number, name: string, sql: string): LifecycleMigration {
  return Object.freeze({
    version,
    name,
    sql,
    checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
  });
}

export const campaignLifecycleMigrations: readonly LifecycleMigration[] = Object.freeze([
  migration(
    1,
    'campaigns_collections_and_audit',
    `CREATE TABLE IF NOT EXISTS syntha_campaign (
  organisation_id text NOT NULL,
  id text NOT NULL,
  season_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED')),
  owner_credential_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  PRIMARY KEY (organisation_id, id),
  UNIQUE (organisation_id, code),
  CHECK (starts_at < ends_at)
);

CREATE INDEX IF NOT EXISTS syntha_campaign_season_idx
  ON syntha_campaign (organisation_id, season_id, status, starts_at);

CREATE TABLE IF NOT EXISTS syntha_collection (
  organisation_id text NOT NULL,
  id text NOT NULL,
  campaign_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  status text NOT NULL CHECK (status IN ('DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED')),
  owner_credential_id text NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  PRIMARY KEY (organisation_id, id),
  UNIQUE (organisation_id, campaign_id, code),
  FOREIGN KEY (organisation_id, campaign_id)
    REFERENCES syntha_campaign (organisation_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS syntha_collection_campaign_idx
  ON syntha_collection (organisation_id, campaign_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS syntha_lifecycle_audit (
  id text PRIMARY KEY,
  organisation_id text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('CAMPAIGN', 'COLLECTION')),
  entity_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'STATUS_CHANGED')),
  actor_credential_id text NOT NULL,
  expected_version bigint,
  resulting_version bigint NOT NULL CHECK (resulting_version > 0),
  occurred_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS syntha_lifecycle_audit_entity_idx
  ON syntha_lifecycle_audit (organisation_id, entity_type, entity_id, occurred_at DESC);`,
  ),
  migration(
    2,
    'campaign_season_tenant_foreign_key',
    `ALTER TABLE syntha_campaign
  DROP CONSTRAINT IF EXISTS syntha_campaign_season_fk;
ALTER TABLE syntha_campaign
  ADD CONSTRAINT syntha_campaign_season_fk
  FOREIGN KEY (organisation_id, season_id)
  REFERENCES syntha_season (organisation_id, id)
  ON DELETE RESTRICT
  NOT VALID;`,
  ),
]);

export async function runCampaignLifecycleMigrations(input: {
  readonly pool: TransactionalSqlPool;
  readonly appliedAt?: Date;
  readonly migrations?: readonly LifecycleMigration[];
}): Promise<{ readonly applied: readonly number[]; readonly skipped: readonly number[] }> {
  const migrations = [...(input.migrations ?? campaignLifecycleMigrations)].sort(
    (left, right) => left.version - right.version,
  );
  const versions = new Set<number>();
  for (const item of migrations) {
    if (!Number.isInteger(item.version) || item.version < 1 || versions.has(item.version)) {
      throw new Error(`Invalid lifecycle migration version: ${item.version}`);
    }
    versions.add(item.version);
  }

  const client = await input.pool.connect();
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'syntha-campaign-lifecycle-migrations',
    ]);
    await client.query(`CREATE TABLE IF NOT EXISTS syntha_campaign_lifecycle_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL
)`);
    const existing = await client.query<AppliedMigrationRow>(
      `SELECT version, name, checksum
       FROM syntha_campaign_lifecycle_migrations
       ORDER BY version`,
    );
    const byVersion = new Map(existing.rows.map((row) => [Number(row.version), row]));
    const applied: number[] = [];
    const skipped: number[] = [];

    for (const item of migrations) {
      const previous = byVersion.get(item.version);
      if (previous) {
        if (previous.name !== item.name || previous.checksum !== item.checksum) {
          throw new Error(`Lifecycle migration ${item.version} differs from applied definition`);
        }
        skipped.push(item.version);
        continue;
      }
      await client.query(item.sql);
      await client.query(
        `INSERT INTO syntha_campaign_lifecycle_migrations
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
