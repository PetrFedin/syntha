import 'server-only';

import { AsyncLocalStorage } from 'node:async_hooks';
import type { Pool, PoolClient, QueryResult } from 'pg';

import type {
  PlatformCoreOrderProductionPersistencePort,
  PlatformCoreOrderProductionTransactionPort,
} from '@/lib/platform-core-order-production-command-handler';
import type {
  PlatformCoreOrderProductionEvent,
  PlatformCoreOrderProductionEventPort,
  PlatformCoreOrderProductionMutationResult,
  PlatformCoreOrderProductionSnapshot,
} from '@/lib/platform-core-order-production-port';

export const PLATFORM_CORE_ORDER_PRODUCTION_PG_MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS platform_core_order_production_snapshots (
  order_id text PRIMARY KEY,
  version integer NOT NULL CHECK (version > 0),
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_core_order_production_events (
  event_id text PRIMARY KEY,
  order_id text NOT NULL,
  event_type text NOT NULL,
  actor_role text NOT NULL,
  actor_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  UNIQUE (order_id, version)
);

CREATE INDEX IF NOT EXISTS platform_core_order_production_events_order_idx
  ON platform_core_order_production_events (order_id, version);

CREATE TABLE IF NOT EXISTS platform_core_order_production_idempotency (
  idempotency_key text PRIMARY KEY,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

type Queryable = Pick<Pool, 'query'> | Pick<PoolClient, 'query'>;

type SnapshotRow = {
  order_id: string;
  version: number;
  snapshot: PlatformCoreOrderProductionSnapshot['tail'];
  updated_at: Date | string;
};

type EventRow = {
  event_id: string;
  order_id: string;
  event_type: PlatformCoreOrderProductionEvent['type'];
  actor_role: PlatformCoreOrderProductionEvent['actor']['role'];
  actor_id: string;
  occurred_at: Date | string;
  version: number;
  payload: PlatformCoreOrderProductionEvent['payload'];
};

type IdempotencyRow = {
  result: PlatformCoreOrderProductionMutationResult;
};

const transactionContext = new AsyncLocalStorage<PoolClient>();

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export type PlatformCoreOrderProductionPgPorts = {
  persistence: PlatformCoreOrderProductionPersistencePort;
  events: PlatformCoreOrderProductionEventPort;
  transaction: PlatformCoreOrderProductionTransactionPort;
  ensureSchema(): Promise<void>;
  createInitialSnapshot(snapshot: PlatformCoreOrderProductionSnapshot): Promise<void>;
};

export function createPlatformCoreOrderProductionPgPorts(
  pool: Pool
): PlatformCoreOrderProductionPgPorts {
  function db(): Queryable {
    return transactionContext.getStore() ?? pool;
  }

  async function query<Row extends Record<string, unknown>>(
    text: string,
    values: readonly unknown[] = []
  ): Promise<QueryResult<Row>> {
    return db().query<Row>(text, [...values]);
  }

  const persistence: PlatformCoreOrderProductionPersistencePort = {
    async getByOrderId(orderId) {
      const result = await query<SnapshotRow>(
        `SELECT order_id, version, snapshot, updated_at
           FROM platform_core_order_production_snapshots
          WHERE order_id = $1`,
        [orderId]
      );
      const row = result.rows[0];
      if (!row) return null;

      return {
        tail: row.snapshot,
        version: row.version,
        updatedAt: iso(row.updated_at),
      };
    },

    async save(snapshot, expectedVersion) {
      if (expectedVersion === undefined) {
        await query(
          `INSERT INTO platform_core_order_production_snapshots
             (order_id, version, snapshot, updated_at)
           VALUES ($1, $2, $3::jsonb, $4::timestamptz)
           ON CONFLICT (order_id) DO UPDATE SET
             version = EXCLUDED.version,
             snapshot = EXCLUDED.snapshot,
             updated_at = EXCLUDED.updated_at`,
          [
            snapshot.tail.orderId,
            snapshot.version,
            JSON.stringify(snapshot.tail),
            snapshot.updatedAt,
          ]
        );
        return;
      }

      const result = await query(
        `UPDATE platform_core_order_production_snapshots
            SET version = $1,
                snapshot = $2::jsonb,
                updated_at = $3::timestamptz
          WHERE order_id = $4
            AND version = $5`,
        [
          snapshot.version,
          JSON.stringify(snapshot.tail),
          snapshot.updatedAt,
          snapshot.tail.orderId,
          expectedVersion,
        ]
      );

      if (result.rowCount !== 1) {
        throw new Error(
          `Version conflict while saving Order Production ${snapshot.tail.orderId}: expected ${expectedVersion}`
        );
      }
    },

    async getByIdempotencyKey(idempotencyKey) {
      const result = await query<IdempotencyRow>(
        `SELECT result
           FROM platform_core_order_production_idempotency
          WHERE idempotency_key = $1`,
        [idempotencyKey]
      );
      return result.rows[0]?.result ?? null;
    },

    async saveIdempotencyResult(idempotencyKey, result) {
      await query(
        `INSERT INTO platform_core_order_production_idempotency
           (idempotency_key, result)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (idempotency_key) DO NOTHING`,
        [idempotencyKey, JSON.stringify(result)]
      );
    },
  };

  const events: PlatformCoreOrderProductionEventPort = {
    async append(event) {
      await query(
        `INSERT INTO platform_core_order_production_events
           (event_id, order_id, event_type, actor_role, actor_id, occurred_at, version, payload)
         VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7, $8::jsonb)`,
        [
          event.eventId,
          event.orderId,
          event.type,
          event.actor.role,
          event.actor.actorId,
          event.occurredAt,
          event.version,
          JSON.stringify(event.payload),
        ]
      );
    },

    async listByOrderId(orderId) {
      const result = await query<EventRow>(
        `SELECT event_id, order_id, event_type, actor_role, actor_id, occurred_at, version, payload
           FROM platform_core_order_production_events
          WHERE order_id = $1
          ORDER BY version ASC`,
        [orderId]
      );

      return result.rows.map((row) => ({
        eventId: row.event_id,
        orderId: row.order_id,
        type: row.event_type,
        actor: {
          role: row.actor_role,
          actorId: row.actor_id,
        },
        occurredAt: iso(row.occurred_at),
        version: row.version,
        payload: row.payload,
      }));
    },
  };

  const transaction: PlatformCoreOrderProductionTransactionPort = {
    async run(work) {
      const existingClient = transactionContext.getStore();
      if (existingClient) return work();

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await transactionContext.run(client, work);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };

  return {
    persistence,
    events,
    transaction,

    async ensureSchema() {
      await pool.query(PLATFORM_CORE_ORDER_PRODUCTION_PG_MIGRATION_SQL);
    },

    async createInitialSnapshot(snapshot) {
      await pool.query(
        `INSERT INTO platform_core_order_production_snapshots
           (order_id, version, snapshot, updated_at)
         VALUES ($1, $2, $3::jsonb, $4::timestamptz)
         ON CONFLICT (order_id) DO NOTHING`,
        [
          snapshot.tail.orderId,
          snapshot.version,
          JSON.stringify(snapshot.tail),
          snapshot.updatedAt,
        ]
      );
    },
  };
}
