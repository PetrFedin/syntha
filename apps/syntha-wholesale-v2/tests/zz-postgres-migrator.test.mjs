import test from 'node:test';
import assert from 'node:assert/strict';
import { appendFile, copyFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migratePostgres } from '../src/infrastructure/postgres-migrator.mjs';

const databaseUrl = process.env.POSTGRES_TEST_URL;

test('PostgreSQL migration ledger serializes runners and rejects changed history', { skip: !databaseUrl }, async () => {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: databaseUrl, max: 4 });
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const migrationsDir = path.join(root, 'db', 'migrations');
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'syntha-v2-migrations-'));
  try {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    const clock = () => '2026-07-31T12:00:00.000Z';
    const results = await Promise.all([
      migratePostgres({ pool, migrationsDir, clock }),
      migratePostgres({ pool, migrationsDir, clock }),
    ]);
    const applied = results.flatMap((result) => result.applied).sort();
    const skipped = results.flatMap((result) => result.skipped).sort();
    assert.deepEqual(applied, ['001_wholesale_v2.sql', '002_auth.sql']);
    assert.deepEqual(skipped, ['001_wholesale_v2.sql', '002_auth.sql']);

    const ledger = await pool.query('SELECT version, length(trim(checksum)) AS checksum_length FROM schema_migrations ORDER BY version');
    assert.deepEqual(ledger.rows, [
      { version: '001_wholesale_v2.sql', checksum_length: 64 },
      { version: '002_auth.sql', checksum_length: 64 },
    ]);
    const tables = await pool.query("SELECT to_regclass('public.organisations') AS organisations, to_regclass('public.auth_users') AS auth_users");
    assert.equal(tables.rows[0].organisations, 'organisations');
    assert.equal(tables.rows[0].auth_users, 'auth_users');

    for (const file of ['001_wholesale_v2.sql', '002_auth.sql']) {
      await copyFile(path.join(migrationsDir, file), path.join(tempDir, file));
    }
    await appendFile(path.join(tempDir, '002_auth.sql'), '\n-- changed history must fail\n');
    await assert.rejects(
      () => migratePostgres({ pool, migrationsDir: tempDir, clock }),
      (error) => error?.code === 'MIGRATION_CHECKSUM_MISMATCH' && error.details?.file === '002_auth.sql',
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
    await pool.end();
  }
});
