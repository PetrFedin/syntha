import { createServer } from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { migratePostgres, waitForPostgres } from './infrastructure/postgres-migrator.mjs';
import { createNotificationProjector } from './runtime/notification-projector.mjs';
import { createPostgresWholesaleRuntime } from './runtime/postgres-runtime.mjs';
import { createStandaloneHandler } from './web/static-handler.mjs';

const databaseUrl = process.env.SYNTHA_V2_DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('SYNTHA_V2_DATABASE_URL is required');
const port = Number(process.env.PORT ?? 4100);
const host = process.env.HOST ?? '127.0.0.1';
const sessionTtlMs = Number(process.env.SYNTHA_SESSION_TTL_MS ?? 43_200_000);
const pool = new pg.Pool({ connectionString: databaseUrl, max: Number(process.env.SYNTHA_DB_POOL_MAX ?? 10) });
const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');

await waitForPostgres({
  pool,
  attempts: Number(process.env.SYNTHA_DB_READY_ATTEMPTS ?? 30),
  delayMs: Number(process.env.SYNTHA_DB_READY_DELAY_MS ?? 1_000),
});
const migrationResult = await migratePostgres({ pool, migrationsDir });
console.log(`Syntha V2 migrations: applied=${migrationResult.applied.length}, skipped=${migrationResult.skipped.length}`);

const runtime = createPostgresWholesaleRuntime({
  pool,
  migrationsDir,
  sessionTtlMs,
  maxLoginFailures: Number(process.env.SYNTHA_AUTH_MAX_FAILURES ?? 5),
  loginWindowMs: Number(process.env.SYNTHA_AUTH_WINDOW_MS ?? 900_000),
  loginBlockMs: Number(process.env.SYNTHA_AUTH_BLOCK_MS ?? 900_000),
  revokedSessionRetentionMs: Number(process.env.SYNTHA_REVOKED_SESSION_RETENTION_MS ?? 604_800_000),
});
const notificationProjector = createNotificationProjector({
  notifications: runtime.notifications,
  intervalMs: Number(process.env.SYNTHA_NOTIFICATION_PROJECTION_INTERVAL_MS ?? 1_000),
  logger: console,
});
const handler = createStandaloneHandler({ apiHandler: runtime.handler });
const server = createServer(handler);
server.listen(port, host, () => {
  notificationProjector.start();
  console.log(`Syntha V2 listening on http://${host}:${port}`);
});

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}; shutting down`);
  const forcedExit = setTimeout(() => process.exit(1), 10_000);
  forcedExit.unref();
  try {
    const serverClosed = new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
    await notificationProjector.stop();
    await serverClosed;
    await pool.end();
    clearTimeout(forcedExit);
    process.exit(0);
  } catch (error) {
    console.error('Syntha V2 shutdown failed', {
      name: error?.name ?? 'Error',
      code: error?.code ?? 'SHUTDOWN_FAILED',
      message: error?.message ?? 'Shutdown failed',
    });
    process.exit(1);
  }
}
process.on('SIGINT', () => { void shutdown('SIGINT'); });
process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
