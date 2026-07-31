import 'server-only';
import { Pool } from 'pg';
// External domain package is JavaScript-first and validated by its own CI gate.
// @ts-expect-error external monorepo ESM module
import { createPostgresWholesaleRuntime } from '../../../../../apps/syntha-wholesale-v2/src/runtime/postgres-runtime.mjs';
// @ts-expect-error external monorepo ESM module
import { createFirebaseRestAuthenticator } from '../../../../../apps/syntha-wholesale-v2/src/http/firebase-rest-authenticator.mjs';

type WholesaleRuntime = {
  fetchHandler(request: Request): Promise<Response>;
  notifications: { projectPending(): Promise<unknown> };
};

declare global {
  // eslint-disable-next-line no-var
  var __synthaWholesaleV2RuntimePromise: Promise<WholesaleRuntime> | undefined;
}

export function getWholesaleV2Runtime(): Promise<WholesaleRuntime> {
  globalThis.__synthaWholesaleV2RuntimePromise ??= createRuntime();
  return globalThis.__synthaWholesaleV2RuntimePromise;
}

async function createRuntime(): Promise<WholesaleRuntime> {
  const connectionString = process.env.SYNTHA_WHOLESALE_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error('SYNTHA_WHOLESALE_DATABASE_URL or DATABASE_URL is required');
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is required');

  const pool = new Pool({ connectionString, max: Number(process.env.SYNTHA_WHOLESALE_DB_POOL_MAX ?? 10) });
  const authenticate = createFirebaseRestAuthenticator({ apiKey });
  return createPostgresWholesaleRuntime({ pool, authenticate }) as WholesaleRuntime;
}
