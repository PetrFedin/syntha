import { createServer } from 'node:http';
import process from 'node:process';
import pg from 'pg';
import { createPostgresWholesaleRuntime } from './runtime/postgres-runtime.mjs';

const databaseUrl = process.env.SYNTHA_V2_DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('SYNTHA_V2_DATABASE_URL is required');
const port = Number(process.env.PORT ?? 4100);
const host = process.env.HOST ?? '127.0.0.1';
const sessionTtlMs = Number(process.env.SYNTHA_SESSION_TTL_MS ?? 43_200_000);
const pool = new pg.Pool({ connectionString: databaseUrl, max: Number(process.env.SYNTHA_DB_POOL_MAX ?? 10) });
const runtime = createPostgresWholesaleRuntime({ pool, sessionTtlMs });
const server = createServer(runtime.handler);
server.listen(port, host, () => console.log(`Syntha V2 listening on http://${host}:${port}`));

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
