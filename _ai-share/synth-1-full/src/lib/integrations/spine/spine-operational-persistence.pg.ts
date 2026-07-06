/**
 * Shared PG enable + mirror/hydrate for spine operational overlays (ADR-002).
 */
import 'server-only';

import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import {
  getWorkshop2PgPool,
  isWorkshop2PgConnectionError,
  isWorkshop2PostgresEnabled,
} from '@/lib/server/workshop2-pg-pool';
import type { OperationalOrderIntegration } from './integration-external-ref.schema';
import type { DeliveryWindowRecord } from './delivery-window-persistence.file';
import type { OrderTrackingShipment } from './order-tracking-persistence.file';
import type { IntegrationMetaFileV1 } from './integration-meta-persistence.file';
import type { OrderTrackingFileV1 } from './order-tracking-persistence.file';
import type { AllocationQueueRecord } from './allocation-queue-persistence.file';
import type { WorkingOrderVersion } from './working-order-persistence.file';
import type { ProductionWipFileV1 } from './production-wip-persistence.file';
import type { WholesaleExportRecord } from './wholesale-export.service';
import type { IntegrationSyncJob } from './sync-jobs-persistence.file';
import type { IntegrationExternalRef } from './integration-external-ref.schema';
import type { VendorPoRecord } from './vendor-po-persistence.file';
import type { CentricRfqRecord } from './centric-rfq-persistence.file';

export function isSpineOperationalPgEnabled(): boolean {
  if (process.env.SPINE_OPERATIONAL_PG === '0' || process.env.SPINE_IMPORTED_ORDERS_PG === '0') {
    return false;
  }
  return isWorkshop2PostgresEnabled();
}

/** @deprecated alias */
export const isSpineImportedOrdersPgEnabled = isSpineOperationalPgEnabled;

async function withPg<T>(fn: () => Promise<T>): Promise<T | void> {
  if (!isSpineOperationalPgEnabled()) return;
  try {
    await ensureWorkshop2PgSchema();
    return await fn();
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return;
    throw err;
  }
}

export async function mirrorIntegrationMetaSnapshotToPg(
  data: IntegrationMetaFileV1
): Promise<void> {
  await withPg(async () => {
    for (const [wholesaleOrderId, meta] of Object.entries(data.byWholesaleOrderId)) {
      await getWorkshop2PgPool().query(
        `INSERT INTO spine_integration_meta (wholesale_order_id, meta_json, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (wholesale_order_id) DO UPDATE SET meta_json = EXCLUDED.meta_json, updated_at = NOW()`,
        [wholesaleOrderId, JSON.stringify(meta)]
      );
    }
  });
}

export async function getIntegrationMetaFromPg(
  wholesaleOrderId: string
): Promise<OperationalOrderIntegration | undefined> {
  const id = wholesaleOrderId.trim();
  if (!id || !isSpineOperationalPgEnabled()) return undefined;
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      meta_json: OperationalOrderIntegration;
    }>(`SELECT meta_json FROM spine_integration_meta WHERE wholesale_order_id = $1 LIMIT 1`, [id]);
    return res.rows[0]?.meta_json;
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return undefined;
    throw err;
  }
}

export async function listIntegrationMetaFromPg(): Promise<
  Array<{ wholesaleOrderId: string; meta: OperationalOrderIntegration }>
> {
  if (!isSpineOperationalPgEnabled()) return [];
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      wholesale_order_id: string;
      meta_json: OperationalOrderIntegration;
    }>(`SELECT wholesale_order_id, meta_json FROM spine_integration_meta ORDER BY updated_at DESC`);
    return res.rows.map((r) => ({
      wholesaleOrderId: r.wholesale_order_id,
      meta: r.meta_json,
    }));
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return [];
    throw err;
  }
}

export async function mirrorDeliveryWindowsSnapshotToPg(
  byOrderId: Record<string, DeliveryWindowRecord>
): Promise<void> {
  await withPg(async () => {
    for (const record of Object.values(byOrderId)) {
      await getWorkshop2PgPool().query(
        `INSERT INTO spine_delivery_windows (wholesale_order_id, record_json, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (wholesale_order_id) DO UPDATE SET record_json = EXCLUDED.record_json, updated_at = NOW()`,
        [record.wholesaleOrderId, JSON.stringify(record)]
      );
    }
  });
}

export async function listDeliveryWindowsFromPg(): Promise<DeliveryWindowRecord[]> {
  if (!isSpineOperationalPgEnabled()) return [];
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ record_json: DeliveryWindowRecord }>(
      `SELECT record_json FROM spine_delivery_windows ORDER BY updated_at DESC`
    );
    return res.rows.map((r) => r.record_json);
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return [];
    throw err;
  }
}

export async function getDeliveryWindowFromPg(
  wholesaleOrderId: string
): Promise<DeliveryWindowRecord | undefined> {
  const id = wholesaleOrderId.trim();
  if (!id || !isSpineOperationalPgEnabled()) return undefined;
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ record_json: DeliveryWindowRecord }>(
      `SELECT record_json FROM spine_delivery_windows WHERE wholesale_order_id = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0]?.record_json;
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return undefined;
    throw err;
  }
}

export async function mirrorOrderTrackingSnapshotToPg(data: OrderTrackingFileV1): Promise<void> {
  await withPg(async () => {
    for (const shipment of Object.values(data.byWholesaleOrderId)) {
      await getWorkshop2PgPool().query(
        `INSERT INTO spine_order_tracking (wholesale_order_id, shipment_json, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (wholesale_order_id) DO UPDATE SET shipment_json = EXCLUDED.shipment_json, updated_at = NOW()`,
        [shipment.wholesaleOrderId, JSON.stringify(shipment)]
      );
    }
  });
}

export async function listOrderTrackingFromPg(): Promise<OrderTrackingShipment[]> {
  if (!isSpineOperationalPgEnabled()) return [];
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ shipment_json: OrderTrackingShipment }>(
      `SELECT shipment_json FROM spine_order_tracking ORDER BY updated_at DESC`
    );
    return res.rows.map((r) => r.shipment_json);
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return [];
    throw err;
  }
}

export async function getOrderTrackingShipmentFromPg(
  wholesaleOrderId: string
): Promise<OrderTrackingShipment | undefined> {
  const id = wholesaleOrderId.trim();
  if (!id || !isSpineOperationalPgEnabled()) return undefined;
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ shipment_json: OrderTrackingShipment }>(
      `SELECT shipment_json FROM spine_order_tracking WHERE wholesale_order_id = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0]?.shipment_json;
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return undefined;
    throw err;
  }
}

export async function mirrorAllocationSnapshotToPg(input: {
  byOrderId: Record<string, AllocationQueueRecord>;
  queueOrder: string[];
}): Promise<void> {
  await withPg(async () => {
    const positions = new Map(input.queueOrder.map((id, i) => [id, input.queueOrder.length - i]));
    for (const record of Object.values(input.byOrderId)) {
      await getWorkshop2PgPool().query(
        `INSERT INTO spine_allocation_queue (wholesale_order_id, record_json, queue_position, updated_at)
         VALUES ($1, $2::jsonb, $3, NOW())
         ON CONFLICT (wholesale_order_id) DO UPDATE SET
           record_json = EXCLUDED.record_json,
           queue_position = EXCLUDED.queue_position,
           updated_at = NOW()`,
        [
          record.wholesaleOrderId,
          JSON.stringify(record),
          positions.get(record.wholesaleOrderId) ?? 0,
        ]
      );
    }
  });
}

export async function listAllocationFromPg(): Promise<{
  byOrderId: Record<string, AllocationQueueRecord>;
  queueOrder: string[];
}> {
  if (!isSpineOperationalPgEnabled()) return { byOrderId: {}, queueOrder: [] };
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      wholesale_order_id: string;
      record_json: AllocationQueueRecord;
      queue_position: number;
    }>(
      `SELECT wholesale_order_id, record_json, queue_position
       FROM spine_allocation_queue
       ORDER BY queue_position DESC, updated_at DESC`
    );
    const byOrderId: Record<string, AllocationQueueRecord> = {};
    const queueOrder: string[] = [];
    for (const row of res.rows) {
      byOrderId[row.wholesale_order_id] = row.record_json;
      queueOrder.push(row.wholesale_order_id);
    }
    return { byOrderId, queueOrder };
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return { byOrderId: {}, queueOrder: [] };
    throw err;
  }
}

export async function mirrorWorkingOrderVersionsSnapshotToPg(
  byOrderId: Record<string, WorkingOrderVersion[]>
): Promise<void> {
  await withPg(async () => {
    for (const versions of Object.values(byOrderId)) {
      for (const version of versions) {
        await getWorkshop2PgPool().query(
          `INSERT INTO spine_working_order_versions (version_id, wholesale_order_id, version_json, created_at)
           VALUES ($1, $2, $3::jsonb, $4::timestamptz)
           ON CONFLICT (version_id) DO UPDATE SET
             version_json = EXCLUDED.version_json,
             wholesale_order_id = EXCLUDED.wholesale_order_id,
             created_at = EXCLUDED.created_at`,
          [version.versionId, version.wholesaleOrderId, JSON.stringify(version), version.createdAt]
        );
      }
    }
  });
}

export async function listWorkingOrderVersionsFromPg(): Promise<
  Record<string, WorkingOrderVersion[]>
> {
  if (!isSpineOperationalPgEnabled()) return {};
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      wholesale_order_id: string;
      version_json: WorkingOrderVersion;
    }>(
      `SELECT wholesale_order_id, version_json
       FROM spine_working_order_versions
       ORDER BY wholesale_order_id, created_at ASC`
    );
    const byOrderId: Record<string, WorkingOrderVersion[]> = {};
    for (const row of res.rows) {
      (byOrderId[row.wholesale_order_id] ??= []).push(row.version_json);
    }
    return byOrderId;
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return {};
    throw err;
  }
}

export async function mirrorProductionWipSnapshotToPg(data: ProductionWipFileV1): Promise<void> {
  await withPg(async () => {
    for (const record of Object.values(data.byProductionOrderId)) {
      await getWorkshop2PgPool().query(
        `INSERT INTO spine_production_wip (production_order_id, b2b_order_id, record_json, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW())
         ON CONFLICT (production_order_id) DO UPDATE SET
           b2b_order_id = EXCLUDED.b2b_order_id,
           record_json = EXCLUDED.record_json,
           updated_at = NOW()`,
        [record.productionOrderId, record.b2bOrderId, JSON.stringify(record)]
      );
    }
  });
}

export async function listProductionWipFromPg(): Promise<ProductionWipFileV1> {
  if (!isSpineOperationalPgEnabled()) {
    return { schemaVersion: 1, byProductionOrderId: {}, byB2bOrderId: {} };
  }
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      production_order_id: string;
      b2b_order_id: string;
      record_json: ProductionWipFileV1['byProductionOrderId'][string];
    }>(`SELECT production_order_id, b2b_order_id, record_json FROM spine_production_wip`);
    const byProductionOrderId: ProductionWipFileV1['byProductionOrderId'] = {};
    const byB2bOrderId: ProductionWipFileV1['byB2bOrderId'] = {};
    for (const row of res.rows) {
      byProductionOrderId[row.production_order_id] = row.record_json;
      byB2bOrderId[row.b2b_order_id] = row.production_order_id;
    }
    return { schemaVersion: 1, byProductionOrderId, byB2bOrderId };
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) {
      return { schemaVersion: 1, byProductionOrderId: {}, byB2bOrderId: {} };
    }
    throw err;
  }
}

export async function getProductionWipByB2bOrderIdFromPg(
  b2bOrderId: string
): Promise<ProductionWipFileV1['byProductionOrderId'][string] | undefined> {
  const id = b2bOrderId.trim();
  if (!id || !isSpineOperationalPgEnabled()) return undefined;
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      record_json: ProductionWipFileV1['byProductionOrderId'][string];
    }>(`SELECT record_json FROM spine_production_wip WHERE b2b_order_id = $1 LIMIT 1`, [id]);
    return res.rows[0]?.record_json;
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return undefined;
    throw err;
  }
}

export async function getProductionWipByPoIdFromPg(
  productionOrderId: string
): Promise<ProductionWipFileV1['byProductionOrderId'][string] | undefined> {
  const id = productionOrderId.trim();
  if (!id || !isSpineOperationalPgEnabled()) return undefined;
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{
      record_json: ProductionWipFileV1['byProductionOrderId'][string];
    }>(`SELECT record_json FROM spine_production_wip WHERE production_order_id = $1 LIMIT 1`, [id]);
    return res.rows[0]?.record_json;
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return undefined;
    throw err;
  }
}

export async function mirrorWholesaleExportSnapshotToPg(
  byOrderId: Record<string, WholesaleExportRecord>
): Promise<void> {
  await withPg(async () => {
    for (const record of Object.values(byOrderId)) {
      await getWorkshop2PgPool().query(
        `INSERT INTO spine_wholesale_export (wholesale_order_id, record_json, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (wholesale_order_id) DO UPDATE SET record_json = EXCLUDED.record_json, updated_at = NOW()`,
        [record.wholesaleOrderId, JSON.stringify(record)]
      );
    }
  });
}

export async function listWholesaleExportFromPg(): Promise<Record<string, WholesaleExportRecord>> {
  if (!isSpineOperationalPgEnabled()) return {};
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ record_json: WholesaleExportRecord }>(
      `SELECT record_json FROM spine_wholesale_export ORDER BY updated_at DESC`
    );
    const byOrderId: Record<string, WholesaleExportRecord> = {};
    for (const row of res.rows) {
      byOrderId[row.record_json.wholesaleOrderId] = row.record_json;
    }
    return byOrderId;
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return {};
    throw err;
  }
}

export async function getWholesaleExportFromPgByOrderId(
  wholesaleOrderId: string
): Promise<WholesaleExportRecord | undefined> {
  const id = wholesaleOrderId.trim();
  if (!id || !isSpineOperationalPgEnabled()) return undefined;
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ record_json: WholesaleExportRecord }>(
      `SELECT record_json FROM spine_wholesale_export WHERE wholesale_order_id = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0]?.record_json;
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return undefined;
    throw err;
  }
}

export async function upsertWholesaleExportToPg(record: WholesaleExportRecord): Promise<void> {
  if (!isSpineOperationalPgEnabled()) return;
  await withPg(async () => {
    await getWorkshop2PgPool().query(
      `INSERT INTO spine_wholesale_export (wholesale_order_id, record_json, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (wholesale_order_id) DO UPDATE SET record_json = EXCLUDED.record_json, updated_at = NOW()`,
      [record.wholesaleOrderId, JSON.stringify(record)]
    );
  });
}

function externalRefPgKey(ref: IntegrationExternalRef): string {
  return `${ref.platform}:${ref.synthaEntityType}:${ref.synthaEntityId}`;
}

export async function mirrorSyncJobsSnapshotToPg(jobs: IntegrationSyncJob[]): Promise<void> {
  await withPg(async () => {
    for (const job of jobs) {
      await getWorkshop2PgPool().query(
        `INSERT INTO spine_integration_sync_jobs (job_id, job_json, created_at)
         VALUES ($1, $2::jsonb, COALESCE($3::timestamptz, NOW()))
         ON CONFLICT (job_id) DO UPDATE SET job_json = EXCLUDED.job_json, created_at = EXCLUDED.created_at`,
        [job.id, JSON.stringify(job), job.createdAt]
      );
    }
  });
}

export async function listSyncJobsFromPg(limit = 100): Promise<IntegrationSyncJob[]> {
  if (!isSpineOperationalPgEnabled()) return [];
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ job_json: IntegrationSyncJob }>(
      `SELECT job_json FROM spine_integration_sync_jobs ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return res.rows.map((r) => r.job_json);
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return [];
    throw err;
  }
}

export async function mirrorExternalRefsSnapshotToPg(
  refs: IntegrationExternalRef[]
): Promise<void> {
  await withPg(async () => {
    for (const ref of refs) {
      await getWorkshop2PgPool().query(
        `INSERT INTO spine_integration_external_refs (ref_key, ref_json, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (ref_key) DO UPDATE SET ref_json = EXCLUDED.ref_json, updated_at = NOW()`,
        [externalRefPgKey(ref), JSON.stringify(ref)]
      );
    }
  });
}

export async function listExternalRefsFromPg(): Promise<IntegrationExternalRef[]> {
  if (!isSpineOperationalPgEnabled()) return [];
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ ref_json: IntegrationExternalRef }>(
      `SELECT ref_json FROM spine_integration_external_refs ORDER BY updated_at DESC`
    );
    return res.rows.map((r) => r.ref_json);
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return [];
    throw err;
  }
}

export async function mirrorVendorPoRecordToPg(record: VendorPoRecord): Promise<void> {
  await withPg(async () => {
    await getWorkshop2PgPool().query(
      `INSERT INTO spine_vendor_po (vendor_po_id, b2b_order_id, record_json, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (vendor_po_id) DO UPDATE SET
         b2b_order_id = EXCLUDED.b2b_order_id,
         record_json = EXCLUDED.record_json,
         updated_at = NOW()`,
      [record.vendorPoId, record.b2bOrderId, JSON.stringify(record)]
    );
  });
}

export async function listVendorPoFromPg(): Promise<VendorPoRecord[]> {
  if (!isSpineOperationalPgEnabled()) return [];
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ record_json: VendorPoRecord }>(
      `SELECT record_json FROM spine_vendor_po ORDER BY updated_at DESC`
    );
    return res.rows.map((r) => r.record_json);
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return [];
    throw err;
  }
}

export async function mirrorCentricRfqRecordToPg(record: CentricRfqRecord): Promise<void> {
  await withPg(async () => {
    await getWorkshop2PgPool().query(
      `INSERT INTO spine_centric_rfq (rfq_id, b2b_order_id, record_json, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (rfq_id) DO UPDATE SET
         b2b_order_id = EXCLUDED.b2b_order_id,
         record_json = EXCLUDED.record_json,
         updated_at = NOW()`,
      [record.rfqId, record.b2bOrderId ?? null, JSON.stringify(record)]
    );
  });
}

export async function listCentricRfqFromPg(): Promise<CentricRfqRecord[]> {
  if (!isSpineOperationalPgEnabled()) return [];
  try {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ record_json: CentricRfqRecord }>(
      `SELECT record_json FROM spine_centric_rfq ORDER BY updated_at DESC`
    );
    return res.rows.map((r) => r.record_json);
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) return [];
    throw err;
  }
}
