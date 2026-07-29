import { getCampaignLifecyclePool } from '@/modules/campaigns';
import { runLifecycleIdempotencyMigrations } from '@/modules/lifecycle-idempotency';
import { runSelectionMigrations } from '@/modules/selection';
import { runShowroomMigrations } from '@/modules/showroom';

import type { OrderRepository } from '../application/order-repository';
import { runOrderIdempotencyMigration } from './order-idempotency-migration';
import { runOrderMigrations } from './order-migrations';
import { PostgresOrderRepository } from './postgres-order-repository';

let repositoryPromise: Promise<OrderRepository> | null = null;

export async function getOrderRepository(): Promise<OrderRepository> {
  if (!repositoryPromise) {
    repositoryPromise = getCampaignLifecyclePool()
      .then(async (pool) => {
        await runLifecycleIdempotencyMigrations({ pool });
        await runShowroomMigrations({ pool });
        await runSelectionMigrations({ pool });
        await runOrderIdempotencyMigration({ pool });
        await runOrderMigrations({ pool });
        return new PostgresOrderRepository(pool);
      })
      .catch((error) => {
        repositoryPromise = null;
        throw error;
      });
  }
  return repositoryPromise;
}

export function resetOrderRuntime(): void {
  repositoryPromise = null;
}
