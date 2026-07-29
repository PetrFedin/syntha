import { createHash } from "node:crypto";

import type {
  TransactionalSqlPool,
} from "./postgres-commercial-execution-unit-of-work";

export interface CommercialExecutionMigration {
  readonly version: number;
  readonly name: string;
  readonly sql: string;
  readonly checksum: string;
}

export interface CommercialExecutionMigrationResult {
  readonly appliedVersions: readonly number[];
  readonly skippedVersions: readonly number[];
}

interface AppliedMigrationRow {
  readonly version: number;
  readonly name: string;
  readonly checksum: string;
}

function checksum(sql: string): string {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

function migration(input: {
  readonly version: number;
  readonly name: string;
  readonly sql: string;
}): CommercialExecutionMigration {
  return Object.freeze({
    ...input,
    checksum: checksum(input.sql),
  });
}

export const commercialExecutionMigrations: readonly CommercialExecutionMigration[] =
  Object.freeze([
    migration({
      version: 1,
      name: "commercial_workflow_state",
      sql: `CREATE TABLE IF NOT EXISTS syntha_commercial_workflow_state (
  workflow_id text PRIMARY KEY,
  version bigint NOT NULL CHECK (version > 0),
  state jsonb NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS syntha_commercial_workflow_state_updated_at_idx
  ON syntha_commercial_workflow_state (updated_at);`,
    }),
  ]);

export async function runPostgresCommercialExecutionMigrations(input: {
  readonly pool: TransactionalSqlPool;
  readonly appliedAt?: string;
  readonly migrations?: readonly CommercialExecutionMigration[];
}): Promise<CommercialExecutionMigrationResult> {
  const appliedAt = new Date(
    input.appliedAt ?? new Date().toISOString(),
  ).toISOString();
  const migrations = [...(input.migrations ?? commercialExecutionMigrations)].sort(
    (left, right) => left.version - right.version,
  );
  const versions = new Set<number>();
  for (const candidate of migrations) {
    if (!Number.isInteger(candidate.version) || candidate.version < 1) {
      throw new Error("Migration version must be a positive integer.");
    }
    if (versions.has(candidate.version)) {
      throw new Error(`Duplicate migration version: ${candidate.version}.`);
    }
    versions.add(candidate.version);
  }

  const client = await input.pool.connect();
  await client.query("BEGIN");
  try {
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      ["syntha-commercial-execution-migrations"],
    );
    await client.query(`CREATE TABLE IF NOT EXISTS syntha_commercial_execution_migrations (
  version integer PRIMARY KEY,
  name text NOT NULL,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL
)`);
    const applied = await client.query<AppliedMigrationRow>(
      `SELECT version, name, checksum
       FROM syntha_commercial_execution_migrations
       ORDER BY version`,
    );
    const appliedByVersion = new Map(
      applied.rows.map((row) => [Number(row.version), row]),
    );
    const appliedVersions: number[] = [];
    const skippedVersions: number[] = [];

    for (const candidate of migrations) {
      const existing = appliedByVersion.get(candidate.version);
      if (existing) {
        if (
          existing.name !== candidate.name ||
          existing.checksum !== candidate.checksum
        ) {
          throw new Error(
            `Migration ${candidate.version} differs from the already applied definition.`,
          );
        }
        skippedVersions.push(candidate.version);
        continue;
      }
      await client.query(candidate.sql);
      await client.query(
        `INSERT INTO syntha_commercial_execution_migrations
           (version, name, checksum, applied_at)
         VALUES ($1, $2, $3, $4::timestamptz)`,
        [candidate.version, candidate.name, candidate.checksum, appliedAt],
      );
      appliedVersions.push(candidate.version);
    }
    await client.query("COMMIT");
    return Object.freeze({
      appliedVersions: Object.freeze(appliedVersions),
      skippedVersions: Object.freeze(skippedVersions),
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the migration error.
    }
    throw error;
  } finally {
    client.release();
  }
}
