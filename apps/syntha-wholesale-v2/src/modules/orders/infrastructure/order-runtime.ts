import { getCampaignLifecyclePool } from '@/modules/campaigns';
import { runLifecycleIdempotencyMigrations } from '@/modules/lifecycle-idempotency';
import { runSelectionMigrations } from '@/modules/selection';
import { runShowroomMigrations } from '@/modules/showroom';

import type { OrderAmendmentResponseRepository } from '../application/order-amendment-response-repository';
import type { OrderRepository } from '../application/order-repository';
import type { OrderReviewRepository } from '../application/order-review-repository';
import type { RevisedOrderReviewRepository } from '../application/revised-order-review-repository';
import { runOrderAmendmentResponseMigrations } from './order-amendment-response-migrations';
import { runOrderIdempotencyMigration } from './order-idempotency-migration';
import { runOrderMigrations } from './order-migrations';
import { PostgresOrderAmendmentResponseRepository } from './postgres-order-amendment-response-repository';
import { PostgresOrderRepository } from './postgres-order-repository';
import { PostgresOrderReviewRepository } from './postgres-order-review-repository';
import { PostgresRevisedOrderReviewRepository } from './postgres-revised-order-review-repository';
import { runRevisedOrderReviewMigrations } from './revised-order-review-migrations';

let poolPromise: ReturnType<typeof getCampaignLifecyclePool> | null = null;
let repositoryPromise: Promise<OrderRepository> | null = null;
let reviewRepositoryPromise: Promise<OrderReviewRepository> | null = null;
let amendmentResponseRepositoryPromise: Promise<OrderAmendmentResponseRepository> | null = null;
let revisedReviewRepositoryPromise: Promise<RevisedOrderReviewRepository> | null = null;

function getReadyOrderPool(): ReturnType<typeof getCampaignLifecyclePool> {
  if (!poolPromise) {
    poolPromise = getCampaignLifecyclePool()
      .then(async (pool) => {
        await runLifecycleIdempotencyMigrations({ pool });
        await runShowroomMigrations({ pool });
        await runSelectionMigrations({ pool });
        await runOrderMigrations({ pool });
        await runOrderIdempotencyMigration({ pool });
        await runOrderAmendmentResponseMigrations({ pool });
        await runRevisedOrderReviewMigrations({ pool });
        return pool;
      })
      .catch((error) => {
        poolPromise = null;
        repositoryPromise = null;
        reviewRepositoryPromise = null;
        amendmentResponseRepositoryPromise = null;
        revisedReviewRepositoryPromise = null;
        throw error;
      });
  }
  return poolPromise;
}

export async function getOrderRepository(): Promise<OrderRepository> {
  if (!repositoryPromise) {
    repositoryPromise = getReadyOrderPool().then(
      (pool) => new PostgresOrderRepository(pool),
    );
  }
  return repositoryPromise;
}

export async function getOrderReviewRepository(): Promise<OrderReviewRepository> {
  if (!reviewRepositoryPromise) {
    reviewRepositoryPromise = getReadyOrderPool().then(
      (pool) => new PostgresOrderReviewRepository(pool),
    );
  }
  return reviewRepositoryPromise;
}

export async function getOrderAmendmentResponseRepository(): Promise<OrderAmendmentResponseRepository> {
  if (!amendmentResponseRepositoryPromise) {
    amendmentResponseRepositoryPromise = getReadyOrderPool().then(
      (pool) => new PostgresOrderAmendmentResponseRepository(pool),
    );
  }
  return amendmentResponseRepositoryPromise;
}

export async function getRevisedOrderReviewRepository(): Promise<RevisedOrderReviewRepository> {
  if (!revisedReviewRepositoryPromise) {
    revisedReviewRepositoryPromise = getReadyOrderPool().then(
      (pool) => new PostgresRevisedOrderReviewRepository(pool),
    );
  }
  return revisedReviewRepositoryPromise;
}

export function resetOrderRuntime(): void {
  poolPromise = null;
  repositoryPromise = null;
  reviewRepositoryPromise = null;
  amendmentResponseRepositoryPromise = null;
  revisedReviewRepositoryPromise = null;
}
