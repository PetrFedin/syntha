import { getCampaignLifecyclePool } from '@/modules/campaigns';
import { runLifecycleIdempotencyMigrations } from '@/modules/lifecycle-idempotency';
import { runShowroomMigrations } from '@/modules/showroom';

import type { SelectionRepository } from '../application/selection-repository';
import { PostgresSelectionRepository } from './postgres-selection-repository';
import { runSelectionMigrations } from './selection-migrations';

let repositoryPromise: Promise<SelectionRepository> | null = null;

export async function getSelectionRepository(): Promise<SelectionRepository> {
  if (!repositoryPromise) {
    repositoryPromise = getCampaignLifecyclePool()
      .then(async (pool) => {
        await runLifecycleIdempotencyMigrations({ pool });
        await runShowroomMigrations({ pool });
        await runSelectionMigrations({ pool });
        return new PostgresSelectionRepository(pool);
      })
      .catch((error) => {
        repositoryPromise = null;
        throw error;
      });
  }
  return repositoryPromise;
}

export function resetSelectionRuntime(): void {
  repositoryPromise = null;
}
