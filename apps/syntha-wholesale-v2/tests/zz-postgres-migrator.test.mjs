import test from 'node:test';
import assert from 'node:assert/strict';
import { appendFile, copyFile, mkdtemp, readdir, rm } from 'node:fs/promises';
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
  const migrationFiles = (await readdir(migrationsDir)).filter((name) => name.endsWith('.sql')).sort();
  try {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    const clock = () => '2026-08-07T09:00:00.000Z';
    const results = await Promise.all([
      migratePostgres({ pool, migrationsDir, clock }),
      migratePostgres({ pool, migrationsDir, clock }),
    ]);
    const applied = results.flatMap((result) => result.applied).sort();
    const skipped = results.flatMap((result) => result.skipped).sort();
    assert.deepEqual(applied, migrationFiles);
    assert.deepEqual(skipped, migrationFiles);

    const ledger = await pool.query('SELECT version, length(trim(checksum)) AS checksum_length FROM schema_migrations ORDER BY version');
    assert.deepEqual(ledger.rows, migrationFiles.map((version) => ({ version, checksum_length: 64 })));
    const tables = await pool.query(
      `SELECT to_regclass('public.organisations') AS organisations,
              to_regclass('public.auth_users') AS auth_users,
              to_regclass('public.auth_login_throttles') AS auth_login_throttles,
              to_regclass('public.catalog_skus') AS catalog_skus,
              to_regclass('public.order_inventory_reservations') AS order_inventory_reservations,
              to_regclass('public.product_size_grids') AS product_size_grids,
              to_regclass('public.product_styles') AS product_styles,
              to_regclass('public.product_materials') AS product_materials,
              to_regclass('public.product_material_revisions') AS product_material_revisions,
              to_regclass('public.product_boms') AS product_boms,
              to_regclass('public.product_measurement_charts') AS product_measurement_charts,
              to_regclass('public.product_fit_samples') AS product_fit_samples,
              to_regclass('public.product_tech_packs') AS product_tech_packs`,
    );
    for (const [name, value] of Object.entries(tables.rows[0])) assert.equal(value, name);
    const catalogColumns = await pool.query(
      `SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'catalog_skus'
          AND column_name = ANY($1::text[])
        ORDER BY column_name`,
      [['style_id', 'style_version', 'size_grid_id', 'size_grid_version', 'size_label', 'color_code']],
    );
    assert.deepEqual(catalogColumns.rows.map((row) => row.column_name), [
      'color_code', 'size_grid_id', 'size_grid_version', 'size_label', 'style_id', 'style_version',
    ]);

    for (const file of migrationFiles) await copyFile(path.join(migrationsDir, file), path.join(tempDir, file));
    await appendFile(path.join(tempDir, '005_catalog_availability.sql'), '\n-- changed history must fail\n');
    await assert.rejects(
      () => migratePostgres({ pool, migrationsDir: tempDir, clock }),
      (error) => error?.code === 'MIGRATION_CHECKSUM_MISMATCH' && error.details?.file === '005_catalog_availability.sql',
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
    await pool.end();
  }
});
