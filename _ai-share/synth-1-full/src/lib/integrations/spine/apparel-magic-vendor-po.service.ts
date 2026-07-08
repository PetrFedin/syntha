/**
 * Wave D6 · AM vendor PO import + supplier ack (F-PROCUREMENT).
 */
import 'server-only';

import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import { upsertExternalRef } from './integration-external-refs-persistence.file';
import {
  getVendorPoById,
  getVendorPoByOrderId,
  upsertVendorPo,
  type VendorPoLine,
  type VendorPoRecord,
} from './vendor-po-persistence.file';
import {
  ensureSpineOperationalStoreReady,
  SPINE_PROCUREMENT_SCOPES,
} from './spine-operational-store';
import { getImportedOrderRecord } from './imported-orders-persistence';
import { getCentricRfqByOrderId } from './centric-rfq-persistence.file';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';
import {
  isSpineOperationalPgEnabled,
  mirrorVendorPoRecordToPg,
} from './spine-operational-persistence.pg';

async function persistVendorPoWriteThrough(record: VendorPoRecord): Promise<VendorPoRecord> {
  const saved = upsertVendorPo(record);
  if (isSpineOperationalPgEnabled()) {
    await mirrorVendorPoRecordToPg(saved);
  }
  return saved;
}

export type VendorPoImportPayload = {
  vendorPoId?: string;
  b2bOrderId: string;
  productionOrderId?: string;
  lines?: VendorPoLine[];
};

export async function importApparelMagicVendorPo(
  payload: VendorPoImportPayload,
  organizationId?: string
): Promise<VendorPoRecord> {
  await ensureSpineOperationalStoreReady(SPINE_PROCUREMENT_SCOPES);
  const org = organizationId?.trim() || 'org-brand-001';
  const b2bOrderId = payload.b2bOrderId.trim();
  const rfq = getCentricRfqByOrderId(b2bOrderId);
  const lines = payload.lines?.length
    ? payload.lines
    : (rfq?.lines.map((l) => ({
        materialName: l.materialName,
        qty: l.qty,
        unit: l.unit,
      })) ?? [
        { materialName: 'Main fabric SS27', qty: 1200, unit: 'm' },
        { materialName: 'Lining', qty: 800, unit: 'm' },
      ]);

  const vendorPoId =
    payload.vendorPoId?.trim() || `AM-VPO-${b2bOrderId.replace(/[^a-zA-Z0-9]/g, '-')}`;

  const record = await persistVendorPoWriteThrough({
    vendorPoId,
    b2bOrderId,
    productionOrderId: payload.productionOrderId,
    platform: 'apparel_magic',
    status: 'open',
    lines,
    importedAt: new Date().toISOString(),
  });

  upsertExternalRef({
    platform: 'apparel_magic',
    externalId: vendorPoId,
    synthaEntityType: 'po',
    synthaEntityId: b2bOrderId,
    lastSyncedAt: new Date().toISOString(),
    syncDirection: 'inbound',
  });

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: workshop2B2bOrderContextId(b2bOrderId),
    message: `Apparel Magic vendor PO ${vendorPoId} · ${lines.length} строк · supplier procurement.`,
  });

  return record;
}

export async function acknowledgeApparelMagicVendorPo(input: {
  vendorPoId: string;
  organizationId?: string;
  ackLines?: Array<{ materialName: string; ackQty: number; ackDate?: string }>;
}): Promise<VendorPoRecord | null> {
  await ensureSpineOperationalStoreReady(SPINE_PROCUREMENT_SCOPES);
  const org = input.organizationId?.trim() || 'org-brand-001';
  const existing = getVendorPoById(input.vendorPoId);
  if (!existing) return null;

  const ackMap = new Map(input.ackLines?.map((l) => [l.materialName, l]) ?? []);
  const lines = existing.lines.map((line) => {
    const ack = ackMap.get(line.materialName);
    return ack
      ? {
          ...line,
          ackQty: ack.ackQty,
          ackDate: ack.ackDate ?? new Date().toISOString().slice(0, 10),
        }
      : { ...line, ackQty: line.qty, ackDate: new Date().toISOString().slice(0, 10) };
  });

  const record = await persistVendorPoWriteThrough({
    ...existing,
    status: 'acknowledged',
    lines,
    acknowledgedAt: new Date().toISOString(),
  });

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: workshop2B2bOrderContextId(record.b2bOrderId),
    message: `Supplier ack vendor PO ${record.vendorPoId} · qty/date подтверждены · materials_supplied.`,
  });

  bumpPlatformCoreChainStatus([record.b2bOrderId]);

  return record;
}

export async function importVendorPoForHandoff(
  b2bOrderId: string,
  productionOrderId: string
): Promise<VendorPoRecord | null> {
  const existing = getVendorPoByOrderId(b2bOrderId);
  if (existing) return existing;
  const imported = getImportedOrderRecord(b2bOrderId);
  if (!imported) return null;
  return importApparelMagicVendorPo({ b2bOrderId, productionOrderId });
}
