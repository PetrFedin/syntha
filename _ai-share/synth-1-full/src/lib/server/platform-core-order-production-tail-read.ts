import 'server-only';

import type { PlatformCoreOrderProductionTail } from '@/lib/platform-core-order-production-tail';
import {
  getWorkshop2PgPool,
  isWorkshop2PostgresEnabled,
  isWorkshop2PgConnectionError,
} from '@/lib/server/workshop2-pg-pool';

type SnapshotRow = {
  snapshot: PlatformCoreOrderProductionTail;
};

/**
 * Reads the canonical Order Production tail from the Workshop2 PostgreSQL store.
 * Missing PG/table/row is a valid legacy state and must not break the cabinet.
 */
export async function getPlatformCoreOrderProductionTailSnapshot(
  orderId: string
): Promise<PlatformCoreOrderProductionTail | null> {
  const id = orderId.trim();
  if (!id || !isWorkshop2PostgresEnabled()) return null;

  try {
    const result = await getWorkshop2PgPool().query<SnapshotRow>(
      `SELECT snapshot
         FROM platform_core_order_production_snapshots
        WHERE order_id = $1
        LIMIT 1`,
      [id]
    );
    return result.rows[0]?.snapshot ?? null;
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';

    if (code === '42P01' || isWorkshop2PgConnectionError(error)) return null;
    throw error;
  }
}
