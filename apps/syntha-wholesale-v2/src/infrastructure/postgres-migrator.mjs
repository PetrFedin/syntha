import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { invariant } from '../core/errors.mjs';

const MIGRATION_LOCK_KEY = 824226214;

export async function waitForPostgres({ pool, attempts = 30, delayMs = 1_000, sleep = defaultSleep } = {}) {
  invariant(pool && typeof pool.query === 'function', 'POSTGRES_POOL_REQUIRED', 'PostgreSQL pool is required');
  invariant(Number.isInteger(attempts) && attempts > 0, 'POSTGRES_READINESS_ATTEMPTS_INVALID', 'PostgreSQL readiness attempts must be a positive integer');
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return Object.freeze({ attempt });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(delayMs);
    }
  }
  throw lastError;
}

export async function migratePostgres({ pool, migrationsDir, clock = () => new Date().toISOString() } = {}) {
  invariant(pool && typeof pool.connect === 'function', 'POSTGRES_POOL_REQUIRED', 'PostgreSQL pool is required');
  invariant(migrationsDir, 'MIGRATIONS_DIR_REQUIRED', 'Migrations directory is required');
  const client = await pool.connect();
  const applied = [];
  const skipped = [];
  let locked = false;
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY]);
    locked = true;
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      checksum char(64) NOT NULL,
      applied_at timestamptz NOT NULL
    )`);
    const files = (await readdir(migrationsDir)).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
    invariant(files.length > 0, 'MIGRATIONS_NOT_FOUND', 'No PostgreSQL migrations found');
    for (const file of files) {
      const rawSql = await readFile(path.join(migrationsDir, file), 'utf8');
      const checksum = createHash('sha256').update(rawSql).digest('hex');
      const existing = await client.query('SELECT checksum FROM schema_migrations WHERE version = $1', [file]);
      if (existing.rowCount) {
        invariant(existing.rows[0].checksum.trim() === checksum, 'MIGRATION_CHECKSUM_MISMATCH', 'Applied migration checksum does not match repository', { file });
        skipped.push(file);
        continue;
      }
      const sql = unwrapLegacyTransaction(rawSql, file);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version, checksum, applied_at) VALUES ($1, $2, $3)', [file, checksum, clock()]);
        await client.query('COMMIT');
        applied.push(file);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    return Object.freeze({ applied: Object.freeze(applied), skipped: Object.freeze(skipped) });
  } finally {
    if (locked) await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_KEY]).catch(() => undefined);
    client.release();
  }
}

function unwrapLegacyTransaction(sql, file) {
  const trimmed = sql.trim();
  const begins = /^BEGIN\s*;/i.test(trimmed);
  const commits = /COMMIT\s*;$/i.test(trimmed);
  invariant(begins === commits, 'MIGRATION_TRANSACTION_INVALID', 'Migration transaction wrapper is incomplete', { file });
  return begins ? trimmed.replace(/^BEGIN\s*;/i, '').replace(/COMMIT\s*;$/i, '').trim() : trimmed;
}
function defaultSleep(delayMs) { return new Promise((resolve) => setTimeout(resolve, delayMs)); }
