import 'server-only';

import type { BrandProductionState } from '@/lib/brand-production/types';
import { createSeedState } from '@/lib/brand-production/seed';
import type { BrandProductionOpsLocalSyncPayload } from '@/lib/production/brand-production-ops-local-sync';
import {
  mapBrandBomPurchaseStatusToRequisitionStatus,
  mapBrandPoStatusToWorkshop2,
} from '@/lib/production/brand-production-ops-local-sync';
import {
  type BrandProductionOpsSnapshot,
  workshop2PoToBrandProductionOpsRow,
  workshop2RequisitionToBrandProductionOpsBomRow,
} from '@/lib/production/brand-production-ops-spine';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import {
  listWorkshop2MaterialRequisitionsByCollection,
  upsertWorkshop2MaterialRequisition,
} from '@/lib/server/workshop2-material-requisition-repository';
import {
  listWorkshop2PurchaseOrdersByCollection,
  upsertWorkshop2PurchaseOrder,
} from '@/lib/server/workshop2-purchase-order-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

const BRAND_PRODUCTION_OPS_SYNC_SOURCE = 'brand-production-ops-local-sync';

const DEFAULT_ORG = 'org-brand-001';
let memory: BrandProductionState | null = null;

export async function getBrandProductionOpsStateServer(
  organizationId = DEFAULT_ORG
): Promise<{ state: BrandProductionState; storageMode: 'postgres' | 'memory' | 'local_only' }> {
  const org = organizationId.trim() || DEFAULT_ORG;

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const res = await getWorkshop2PgPool().query<{ state_json: BrandProductionState }>(
      `SELECT state_json FROM brand_production_ops_state WHERE organization_id = $1`,
      [org]
    );
    const row = res.rows[0]?.state_json;
    if (row && typeof row === 'object') {
      memory = row;
      return { state: row, storageMode: 'postgres' };
    }
    const seed = createSeedState();
    await putBrandProductionOpsStateServer({ organizationId: org, state: seed });
    return { state: seed, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) {
    return { state: createSeedState(), storageMode: 'local_only' };
  }

  if (!memory) memory = createSeedState();
  return { state: memory, storageMode: 'memory' };
}

export async function putBrandProductionOpsStateServer(input: {
  organizationId?: string;
  state: BrandProductionState;
}): Promise<{ ok: boolean; storageMode: 'postgres' | 'memory' | 'pg_only_blocked' }> {
  const org = input.organizationId?.trim() || DEFAULT_ORG;

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO brand_production_ops_state (organization_id, state_json, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (organization_id) DO UPDATE SET
         state_json = EXCLUDED.state_json,
         updated_at = NOW()`,
      [org, JSON.stringify(input.state)]
    );
    memory = input.state;
    return { ok: true, storageMode: 'postgres' };
  }

  if (isWorkshop2PgOnlyMode()) return { ok: false, storageMode: 'pg_only_blocked' };
  memory = input.state;
  return { ok: true, storageMode: 'memory' };
}

export function brandProductionOpsStorageMode(): 'postgres' | 'memory' {
  return isWorkshop2PostgresEnabled() ? 'postgres' : 'memory';
}

function resolveBrandProductionOpsSnapshotStorageMode(
  poCount: number,
  bomCount: number
): BrandProductionOpsSnapshot['storageMode'] {
  if (poCount || bomCount) {
    return isWorkshop2PostgresEnabled() ? 'pg' : 'file';
  }
  return 'empty';
}

export async function getBrandProductionOpsSnapshot(input: {
  collectionId: string;
  orderId?: string;
}): Promise<BrandProductionOpsSnapshot> {
  const collectionId = input.collectionId.trim();
  const orderId = input.orderId?.trim();

  const pos = await listWorkshop2PurchaseOrdersByCollection({ collectionId });
  const reqs = await listWorkshop2MaterialRequisitionsByCollection({ collectionId });

  const filteredPos = orderId
    ? pos.filter((po) => {
        const poOrder = String(po.payload?.b2bOrderId ?? '').trim();
        return !poOrder || poOrder === orderId;
      })
    : pos;

  const poRows = filteredPos.map(workshop2PoToBrandProductionOpsRow);
  const bomRows = reqs.map(workshop2RequisitionToBrandProductionOpsBomRow);

  return {
    poRows,
    bomRows,
    storageMode: resolveBrandProductionOpsSnapshotStorageMode(poRows.length, bomRows.length),
  };
}

export async function syncBrandProductionOpsFromLocal(input: {
  payload: BrandProductionOpsLocalSyncPayload;
}): Promise<{
  poSynced: number;
  bomSynced: number;
  snapshot: BrandProductionOpsSnapshot;
}> {
  const payload = input.payload;
  let poSynced = 0;
  let bomSynced = 0;

  for (const poLine of payload.poLines) {
    await upsertWorkshop2PurchaseOrder({
      id: poLine.id,
      collectionId: poLine.collectionId,
      articleId: poLine.articleId,
      qty: poLine.qty,
      status: mapBrandPoStatusToWorkshop2(poLine.brandPoStatus),
      lineRef: poLine.poCode,
      supplierId: poLine.factoryId,
      payload: {
        source: BRAND_PRODUCTION_OPS_SYNC_SOURCE,
        poCode: poLine.poCode,
        sku: poLine.sku,
        factoryName: poLine.factoryName,
        factoryId: poLine.factoryId,
        b2bOrderId: poLine.b2bOrderId ?? payload.orderId,
      },
    });
    poSynced += 1;
  }

  for (const bomLine of payload.bomLines) {
    await upsertWorkshop2MaterialRequisition({
      id: bomLine.id,
      collectionId: bomLine.collectionId,
      articleId: bomLine.articleId,
      bomLineRef: `${bomLine.sku}:${bomLine.materialCode}`,
      materialLabel: bomLine.materialName,
      quantity: bomLine.qtyPerUnit,
      unit: bomLine.unit,
      status: mapBrandBomPurchaseStatusToRequisitionStatus(bomLine.purchaseStatus),
      payload: {
        source: BRAND_PRODUCTION_OPS_SYNC_SOURCE,
        supplierId: bomLine.supplierId,
        supplierName: bomLine.supplierName,
        sku: bomLine.sku,
      },
    });
    bomSynced += 1;
  }

  const snapshot = await getBrandProductionOpsSnapshot({
    collectionId: payload.targetCollectionId,
    orderId: payload.orderId,
  });

  return { poSynced, bomSynced, snapshot };
}
