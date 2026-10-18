import { getCampaignLifecyclePool } from '@/modules/campaigns';

import type { CollectionRepository } from '../application/collection-repository';
import { PostgresCollectionRepository } from './postgres-collection-repository';

let repositoryPromise: Promise<CollectionRepository> | null = null;

export async function getCollectionRepository(): Promise<CollectionRepository> {
  if (!repositoryPromise) {
    repositoryPromise = getCampaignLifecyclePool()
      .then((pool) => new PostgresCollectionRepository(pool))
      .catch((error) => {
        repositoryPromise = null;
        throw error;
      });
  }
  return repositoryPromise;
}

export function resetCollectionRuntime(): void {
  repositoryPromise = null;
}
