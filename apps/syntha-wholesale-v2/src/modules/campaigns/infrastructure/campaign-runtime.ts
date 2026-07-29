import type { TransactionalSqlPool } from '@/modules/commercial-execution';
import { getSeasonLifecyclePool } from '@/modules/seasons';

import type { CampaignRepository } from '../application/campaign-repository';
import { runCampaignLifecycleMigrations } from './campaign-lifecycle-migrations';
import { PostgresCampaignRepository } from './postgres-campaign-repository';

let poolPromise: Promise<TransactionalSqlPool> | null = null;
let repositoryPromise: Promise<CampaignRepository> | null = null;

export async function getCampaignLifecyclePool(): Promise<TransactionalSqlPool> {
  if (!poolPromise) {
    poolPromise = (async () => {
      const pool = await getSeasonLifecyclePool();
      await runCampaignLifecycleMigrations({ pool });
      return pool;
    })().catch((error) => {
      poolPromise = null;
      throw error;
    });
  }
  return poolPromise;
}

export async function getCampaignRepository(): Promise<CampaignRepository> {
  if (!repositoryPromise) {
    repositoryPromise = getCampaignLifecyclePool()
      .then((pool) => new PostgresCampaignRepository(pool))
      .catch((error) => {
        repositoryPromise = null;
        throw error;
      });
  }
  return repositoryPromise;
}

export function resetCampaignRuntime(): void {
  poolPromise = null;
  repositoryPromise = null;
}
