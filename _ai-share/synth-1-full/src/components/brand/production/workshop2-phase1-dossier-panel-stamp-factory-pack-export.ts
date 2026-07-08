import { pushTzActionLog } from '@/components/brand/production/workshop2-phase1-dossier-panel-tz-action-log';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2TechPackReleaseGate } from '@/lib/production/workshop2-techpack-release-gate';

/** Досье после factory pack export + запись в журнал ТЗ. */
export function stampDossierAfterFactoryPackExport(opts: {
  dossier: Workshop2DossierPhase1;
  format: 'html' | 'pdf' | 'server_snapshot';
  updatedByLabel: string;
  skuDraft: string;
  snapshotId?: string;
  releaseGate: Pick<
    Workshop2TechPackReleaseGate,
    'sheetsReady' | 'sheetsTotal' | 'qtyBridged' | 'ready'
  >;
}): Workshop2DossierPhase1 {
  const exportedAt = new Date().toISOString();
  const dossierUpdatedAtSnapshot = opts.dossier.updatedAt ?? '';
  const meta = {
    exportedAt,
    exportedBy: opts.updatedByLabel.slice(0, 200),
    format: opts.format,
    snapshotId: opts.snapshotId?.trim() || undefined,
    sheetsReady: opts.releaseGate.sheetsReady,
    sheetsTotal: opts.releaseGate.sheetsTotal,
    qtyBridged: opts.releaseGate.qtyBridged,
    dossierUpdatedAtSnapshot,
    articleSkuSnapshot: opts.skuDraft.trim() || undefined,
  };
  return pushTzActionLog({ ...opts.dossier, factoryPackLastExport: meta }, opts.updatedByLabel, {
    type: 'factory_pack_export',
    format: opts.format,
    snapshotId: meta.snapshotId,
    sheetsReady: meta.sheetsReady,
    sheetsTotal: meta.sheetsTotal,
    qtyBridged: meta.qtyBridged,
    releaseGateReady: opts.releaseGate.ready,
    dossierUpdatedAtSnapshot,
  });
}
