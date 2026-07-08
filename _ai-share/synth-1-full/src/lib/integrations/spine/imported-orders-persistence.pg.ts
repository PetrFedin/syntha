/**
 * PG persistence for INT-* imported wholesale orders (ADR-002).
 */
import 'server-only';

import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';
import type { B2BOrder } from '@/lib/types';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import {
  getWorkshop2PgPool,
  isWorkshop2PgConnectionError,
  isWorkshop2PostgresEnabled,
} from '@/lib/server/workshop2-pg-pool';
import type {
  ImportedOperationalOrderRecord,
  ImportedOrdersFileV1,
} from './imported-orders-persistence.file';

export function isSpineImportedOrdersPgEnabled(): boolean {
  if (process.env.SPINE_OPERATIONAL_PG === '0' || process.env.SPINE_IMPORTED_ORDERS_PG === '0') {
    return false;
  }
  return isWorkshop2PostgresEnabled();
}

function rowToRecord(row: {
  wholesale_order_id: string;
  order_json: B2BOrder;
  line_items_json: B2BOrderLineItem[];
  imported_at: Date;
}): ImportedOperationalOrderRecord {
  return {
    wholesaleOrderId: row.wholesale_order_id,
    order: row.order_json,
    lineItems: Array.isArray(row.line_items_json) ? row.line_items_json : [],
    importedAt: row.imported_at.toISOString(),
  };
}

export async function getSpineImportedOrderRecordFromPg(
  wholesaleOrderId: string
): Promise<ImportedOperationalOrderRecord | undefined> {
  const id = wholesaleOrderId.trim();
  if (!id || !isSpineImportedOrdersPgEnabled()) return undefined;
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      wholesale_order_id: string;
      order_json: B2BOrder;
      line_items_json: B2BOrderLineItem[];
      imported_at: Date;
    }>(
      `SELECT wholesale_order_id, order_json, line_items_json, imported_at
       FROM spine_imported_wholesale_orders
       WHERE wholesale_order_id = $1
       LIMIT 1`,
      [id]
    );
    const row = res.rows[0];
    if (!row) return undefined;
    return rowToRecord(row);
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return undefined;
    throw err;
  }
}

export async function listSpineImportedOrdersFromPg(): Promise<
  Array<{ record: ImportedOperationalOrderRecord; externalKey: string }>
> {
  if (!isSpineImportedOrdersPgEnabled()) return [];
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      wholesale_order_id: string;
      external_key: string;
      order_json: B2BOrder;
      line_items_json: B2BOrderLineItem[];
      imported_at: Date;
    }>(
      `SELECT wholesale_order_id, external_key, order_json, line_items_json, imported_at
       FROM spine_imported_wholesale_orders
       ORDER BY updated_at DESC`
    );
    return res.rows.map((row) => ({
      externalKey: row.external_key,
      record: rowToRecord(row),
    }));
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return [];
    throw err;
  }
}

export async function upsertSpineImportedOrderToPg(
  record: ImportedOperationalOrderRecord,
  externalKey: string
): Promise<void> {
  if (!isSpineImportedOrdersPgEnabled()) return;
  try {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO spine_imported_wholesale_orders (
         wholesale_order_id, external_key, order_json, line_items_json, imported_at, updated_at
       ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::timestamptz, NOW())
       ON CONFLICT (wholesale_order_id) DO UPDATE SET
         external_key = EXCLUDED.external_key,
         order_json = EXCLUDED.order_json,
         line_items_json = EXCLUDED.line_items_json,
         updated_at = NOW()`,
      [
        record.wholesaleOrderId,
        externalKey,
        JSON.stringify(record.order),
        JSON.stringify(record.lineItems ?? []),
        record.importedAt,
      ]
    );
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return;
    throw err;
  }
}

export async function mirrorImportedOrdersSnapshotToPg(data: ImportedOrdersFileV1): Promise<void> {
  if (!isSpineImportedOrdersPgEnabled()) return;
  const entries = Object.entries(data.orders);
  if (!entries.length) return;
  await ensureWorkshop2PgSchema();
  for (const [wholesaleOrderId, record] of entries) {
    const externalKey =
      Object.entries(data.externalIndex).find(([, id]) => id === wholesaleOrderId)?.[0] ??
      `syntha:${wholesaleOrderId}`;
    await upsertSpineImportedOrderToPg(record, externalKey);
  }
}
