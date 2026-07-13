import 'server-only';

import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { PoolClient, QueryResultRow } from 'pg';
import { createPlatformCoreOrderProductionCommandHandler } from '@/lib/platform-core-order-production-command-handler';
import type {
  PlatformCoreOrderProductionEvent,
  PlatformCoreOrderProductionMutationResult,
  PlatformCoreOrderProductionSnapshot,
} from '@/lib/platform-core-order-production-port';
import { createPlatformCoreOrderProductionTail } from '@/lib/platform-core-order-production-tail';
import { getWorkshop2PgPool } from '@/lib/server/workshop2-pg-pool';

const transactionClient = new AsyncLocalStorage<PoolClient>();

function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  const client = transactionClient.getStore();
  return client ? client.query<T>(text, values) : getWorkshop2PgPool().query<T>(text, values);
}

type SnapshotRow = {
  snapshot: PlatformCoreOrderProductionSnapshot['tail'];
  version: number;
  updated_at: Date | string;
};

type JsonResultRow = { result: PlatformCoreOrderProductionMutationResult };

type EventRow = {
  event_id: string;
  order_id: string;
  event_type: PlatformCoreOrderProductionEvent['type'];
  actor: PlatformCoreOrderProductionEvent['actor'];
  payload: PlatformCoreOrderProductionEvent['payload'];
  version: number;
  occurred_at: Date | string;
};

const persistence = {
  async getByOrderId(orderId: string): Promise<PlatformCoreOrderProductionSnapshot | null> {
    const result = await query<SnapshotRow>(
      `SELECT snapshot, version, updated_at
         FROM platform_core_order_production_snapshots
        WHERE order_id = $1
        LIMIT 1`,
      [orderId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      tail: row.snapshot,
      version: row.version,
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  },

  async save(snapshot: PlatformCoreOrderProductionSnapshot, expectedVersion?: number): Promise<void> {
    if (expectedVersion === undefined) {
      await query(
        `INSERT INTO platform_core_order_production_snapshots(order_id, snapshot, version, updated_at)
         VALUES ($1, $2::jsonb, $3, $4::timestamptz)
         ON CONFLICT (order_id) DO UPDATE
           SET snapshot = EXCLUDED.snapshot,
               version = EXCLUDED.version,
               updated_at = EXCLUDED.updated_at`,
        [snapshot.tail.orderId, JSON.stringify(snapshot.tail), snapshot.version, snapshot.updatedAt]
      );
      return;
    }

    const result = await query(
      `UPDATE platform_core_order_production_snapshots
          SET snapshot = $2::jsonb,
              version = $3,
              updated_at = $4::timestamptz
        WHERE order_id = $1
          AND version = $5`,
      [
        snapshot.tail.orderId,
        JSON.stringify(snapshot.tail),
        snapshot.version,
        snapshot.updatedAt,
        expectedVersion,
      ]
    );
    if (result.rowCount !== 1) {
      throw new Error(`Version conflict for Order Production ${snapshot.tail.orderId}`);
    }
  },

  async getByIdempotencyKey(
    idempotencyKey: string
  ): Promise<PlatformCoreOrderProductionMutationResult | null> {
    const result = await query<JsonResultRow>(
      `SELECT result
         FROM platform_core_order_production_idempotency
        WHERE idempotency_key = $1
        LIMIT 1`,
      [idempotencyKey]
    );
    return result.rows[0]?.result ?? null;
  },

  async saveIdempotencyResult(
    idempotencyKey: string,
    result: PlatformCoreOrderProductionMutationResult
  ): Promise<void> {
    await query(
      `INSERT INTO platform_core_order_production_idempotency(idempotency_key, result)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (idempotency_key) DO NOTHING`,
      [idempotencyKey, JSON.stringify(result)]
    );
  },
};

const events = {
  async append(event: PlatformCoreOrderProductionEvent): Promise<void> {
    await query(
      `INSERT INTO platform_core_order_production_events(
         event_id, order_id, event_type, actor, payload, version, occurred_at
       ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7::timestamptz)`,
      [
        event.eventId,
        event.orderId,
        event.type,
        JSON.stringify(event.actor),
        JSON.stringify(event.payload),
        event.version,
        event.occurredAt,
      ]
    );
  },

  async listByOrderId(orderId: string): Promise<readonly PlatformCoreOrderProductionEvent[]> {
    const result = await query<EventRow>(
      `SELECT event_id, order_id, event_type, actor, payload, version, occurred_at
         FROM platform_core_order_production_events
        WHERE order_id = $1
        ORDER BY occurred_at ASC`,
      [orderId]
    );
    return result.rows.map((row) => ({
      eventId: row.event_id,
      orderId: row.order_id,
      type: row.event_type,
      actor: row.actor,
      payload: row.payload,
      version: row.version,
      occurredAt: new Date(row.occurred_at).toISOString(),
    }));
  },
};

const transaction = {
  async run<T>(work: () => Promise<T>): Promise<T> {
    const client = await getWorkshop2PgPool().connect();
    try {
      await client.query('BEGIN');
      const result = await transactionClient.run(client, work);
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

export const platformCoreOrderProductionRuntime =
  createPlatformCoreOrderProductionCommandHandler({
    persistence,
    events,
    transaction,
    createEventId: randomUUID,
  });

/** Creates the canonical tail once; subsequent commands use optimistic locking. */
export async function ensurePlatformCoreOrderProductionTail(orderId: string): Promise<void> {
  const id = orderId.trim();
  if (!id) throw new Error('orderId is required');
  const current = await persistence.getByOrderId(id);
  if (current) return;
  await persistence.save({
    tail: createPlatformCoreOrderProductionTail({ orderId: id }),
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}
