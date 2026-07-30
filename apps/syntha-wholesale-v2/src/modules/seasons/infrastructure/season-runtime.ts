import {
  createNodePostgresPoolFromEnvironment,
  type TransactionalSqlPool,
} from '@/modules/commercial-execution';
import { runLifecycleIdempotencyMigrations } from '@/modules/lifecycle-idempotency';

import type { SeasonRepository } from '../application/season-repository';
import { PostgresSeasonRepository } from './postgres-season-repository';
import { runSeasonMigrations } from './season-migrations';

let poolPromise: Promise<TransactionalSqlPool> | null = null;
let repositoryPromise: Promise<SeasonRepository> | null = null;

export async function getSeasonLifecyclePool(): Promise<TransactionalSqlPool> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const pool = await createNodePostgresPoolFromEnvironment();
      try {
        await runLifecycleIdempotencyMigrations({ pool });
        await runSeasonMigrations({ pool });
        return pool;
      } catch (error) {
        await pool.close();
        throw error;
      }
    })().catch((error) => {
      poolPromise = null;
      throw error;
    });
  }
  return poolPromise;
}

export async function getSeasonRepository(): Promise<SeasonRepository> {
  if (!repositoryPromise) {
    repositoryPromise = getSeasonLifecyclePool()
      .then((pool) => new PostgresSeasonRepository(pool))
      .catch((error) => {
        repositoryPromise = null;
        throw error;
      });
  }
  return repositoryPromise;
}

export function resetSeasonRuntime(): void {
  poolPromise = null;
  repositoryPromise = null;
}
