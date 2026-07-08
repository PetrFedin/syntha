/**
 * Wave 37 #66: journal audit trail для PO ERP (без UI «synced» без erpOrderId).
 */
import type {
  Workshop2DossierPhase1,
  Workshop2FactoryErpAuditEntry,
  Workshop2FactoryErpAuditMirror,
} from '@/lib/production/workshop2-dossier-phase1.types';
import { buildWorkshop2PurchaseOrderErpMirror } from '@/lib/production/workshop2-purchase-order-erp-dossier-persist';
import type { Workshop2PurchaseOrderErpRow } from '@/lib/production/workshop2-purchase-order-erp-dossier-persist';
import { resolveWorkshop2PurchaseOrderErpDisplayStatus } from '@/lib/production/workshop2-purchase-order-erp-display';
import { workshop2PgMirrorNum } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export type {
  Workshop2FactoryErpAuditEntry,
  Workshop2FactoryErpAuditMirror,
} from '@/lib/production/workshop2-dossier-phase1.types';
export type { Workshop2PurchaseOrderErpRow } from '@/lib/production/workshop2-purchase-order-erp-dossier-persist';

export function buildWorkshop2FactoryErpAuditMirror(input: {
  purchaseOrders: Workshop2PurchaseOrderErpRow[];
  erpConfigured: boolean;
}): Workshop2FactoryErpAuditMirror {
  const base = buildWorkshop2PurchaseOrderErpMirror(input);
  const at = new Date().toISOString();
  const entries: Workshop2FactoryErpAuditEntry[] = input.purchaseOrders.map((po) => {
    const display = resolveWorkshop2PurchaseOrderErpDisplayStatus({
      status: po.status,
      erpExternalId: po.erpExternalId,
      lastError: po.lastError,
      erpConfigured: input.erpConfigured,
    });
    return {
      at,
      poId: po.id,
      status: po.status,
      erpExternalId: po.erpExternalId,
      displayCode: display.code,
      event: 'mirror_sync',
    };
  });
  const blocksFakeSyncedUi =
    workshop2PgMirrorNum(base, 'fakeSyncedCount') > 0 ||
    entries.some((e) => e.status === 'synced' && !e.erpExternalId?.trim());
  return {
    mirroredAt: at,
    entries,
    blocksFakeSyncedUi,
    journalOnly: base.erpSyncMode === 'journal_only',
  };
}

export function persistWorkshop2FactoryErpAuditToDossier(
  dossier: Workshop2DossierPhase1,
  input: { purchaseOrders: Workshop2PurchaseOrderErpRow[]; erpConfigured: boolean }
): Workshop2DossierPhase1 {
  const audit = buildWorkshop2FactoryErpAuditMirror(input);
  return {
    ...dossier,
    purchaseOrderErpMirror: buildWorkshop2PurchaseOrderErpMirror(input),
    factoryErpAuditMirror: audit,
  };
}

/** UI may show «Синхронизировано» only when erpOrderId present (live) or journal-only label. */
export function workshop2FactoryErpUiMayShowSynced(input: {
  status: string;
  erpExternalId?: string | null;
  erpConfigured: boolean;
  journalOnly?: boolean;
}): boolean {
  if (input.journalOnly) return false;
  const display = resolveWorkshop2PurchaseOrderErpDisplayStatus({
    status: input.status,
    erpExternalId: input.erpExternalId,
    erpConfigured: input.erpConfigured,
  });
  return display.code === 'synced' && Boolean(input.erpExternalId?.trim());
}
