import 'server-only';
import { Pool } from 'pg';

/** URL Postgres для workshop2: приоритет WORKSHOP2_DATABASE_URL → legacy → DATABASE_URL */
export function getWorkshop2DatabaseUrl(): string {
  return (
    process.env.WORKSHOP2_DATABASE_URL?.trim() ||
    process.env.WORKSHOP2_DOSSIER_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    ''
  );
}

export function isWorkshop2PostgresEnabled(): boolean {
  return getWorkshop2DatabaseUrl().length > 0;
}

/** ECONNREFUSED / timeout — PG URL задан, но инстанс не поднят (OrbStack off). */
/** PG URL задан, но инстанс недоступен — тихий demo/file fallback вместо 503 в UI. */
export async function withWorkshop2PgFallback<T>(
  attempt: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> {
  if (!isWorkshop2PostgresEnabled()) {
    return fallback();
  }
  try {
    return await attempt();
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) {
      return fallback();
    }
    throw err;
  }
}

export function isWorkshop2PgConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; errors?: Array<{ code?: string }> };
  const codes = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', '57P01']);
  if (e.code && codes.has(e.code)) return true;
  if (Array.isArray(e.errors)) {
    if (e.errors.some((x) => x.code && codes.has(x.code))) return true;
  }
  const msg = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  if (
    msg.includes('connection terminated') ||
    msg.includes('timeout expired') ||
    msg.includes('connect etimedout') ||
    msg.includes('econnrefused')
  ) {
    return true;
  }
  return false;
}

export async function probeWorkshop2PgReachable(): Promise<boolean> {
  if (!isWorkshop2PostgresEnabled()) return false;
  try {
    await getWorkshop2PgPool().query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

let pgPool: Pool | null = null;

export function getWorkshop2PgPool(): Pool {
  const url = getWorkshop2DatabaseUrl();
  if (!url) {
    throw new Error('WORKSHOP2_DATABASE_URL_NOT_CONFIGURED');
  }
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: url,
      /** Health/E2E: не блокировать webServer при недоступном Postgres. */
      connectionTimeoutMillis: 5_000,
    });
  }
  return pgPool;
}

/** Сброс пула (тесты). */
export async function resetWorkshop2PgPoolForTests(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}
