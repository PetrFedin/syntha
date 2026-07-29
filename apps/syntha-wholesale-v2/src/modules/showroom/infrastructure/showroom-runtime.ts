import { getCampaignLifecyclePool } from '@/modules/campaigns';
import { runLifecycleIdempotencyMigrations } from '@/modules/lifecycle-idempotency';

import type { ShowroomRepository } from '../application/showroom-repository';
import { PostgresShowroomRepository } from './postgres-showroom-repository';
import { runShowroomMigrations } from './showroom-migrations';

let repositoryPromise: Promise<ShowroomRepository> | null = null;

export async function getShowroomRepository(): Promise<ShowroomRepository> {
  if (!repositoryPromise) {
    repositoryPromise = getCampaignLifecyclePool()
      .then(async (pool) => {
        await runLifecycleIdempotencyMigrations({ pool });
        await runShowroomMigrations({ pool });
        return new PostgresShowroomRepository(pool);
      })
      .catch((error) => {
        repositoryPromise = null;
        throw error;
      });
  }
  return repositoryPromise;
}

export function resetShowroomRuntime(): void {
  repositoryPromise = null;
}
