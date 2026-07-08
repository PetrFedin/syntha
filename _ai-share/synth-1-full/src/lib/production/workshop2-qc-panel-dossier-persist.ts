/**
 * Wave 32 #67: qcPanelMirror в PG + gates sample-order / handoff.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import {
  summarizeWorkshop2QcPanelStatus,
  type Workshop2QcPanelStatus,
} from '@/lib/production/workshop2-qc-panel-status';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';

function workshop2QcPanelSupplierSource(
  mirror: Workshop2DossierPhase1['qcPanelMirror']
): Workshop2QcPanelMirrorInput['supplierSource'] {
  const raw = workshop2PgMirrorStr(mirror, 'supplierSource');
  return raw === 'purchase_order' || raw === 'seed_default' || raw === 'none' ? raw : 'none';
}

export type Workshop2QcPanelMirrorInput = {
  batchCount: number;
  pendingBatchCount: number;
  failedBatchCount: number;
  hasSampleOrder: boolean;
  hasInspectorLink: boolean;
  supplierId: string;
  supplierSource: 'purchase_order' | 'seed_default' | 'none';
  purchaseOrderCount: number;
  poConfirmedCount: number;
  activeSampleOrderId?: string;
};

export function buildWorkshop2QcPanelMirrorFromStatus(
  status: Workshop2QcPanelStatus,
  input: Workshop2QcPanelMirrorInput
): NonNullable<Workshop2DossierPhase1['qcPanelMirror']> {
  const supplierResolved = input.supplierSource === 'purchase_order' && Boolean(input.supplierId);
  const blockerSampleOrder =
    !input.hasSampleOrder ||
    status.state === 'empty' ||
    (input.batchCount > 0 && input.pendingBatchCount > 0 && !input.hasInspectorLink);
  const blockerHandoff =
    status.state !== 'ready' ||
    !supplierResolved ||
    input.pendingBatchCount > 0 ||
    input.failedBatchCount > 0;

  let hintRu = status.hintRu;
  if (!input.hasSampleOrder) {
    hintRu = 'Нет sample-order — панель ОТК не готова к образцу/handoff.';
  } else if (input.pendingBatchCount > 0 && !input.hasInspectorLink) {
    hintRu = 'Pending партии без ссылки инспектора — завершите мобильный чек-лист.';
  } else if (!supplierResolved) {
    hintRu = 'supplierId не из PO — укажите поставщика в плане закупки.';
  }

  return {
    mirroredAt: new Date().toISOString(),
    batchCount: input.batchCount,
    pendingBatchCount: input.pendingBatchCount,
    failedBatchCount: input.failedBatchCount,
    hasSampleOrder: input.hasSampleOrder,
    hasInspectorLink: input.hasInspectorLink,
    supplierId: input.supplierId || undefined,
    supplierSource: input.supplierSource,
    purchaseOrderCount: input.purchaseOrderCount,
    poConfirmedCount: input.poConfirmedCount,
    activeSampleOrderId: input.activeSampleOrderId,
    panelState: status.state,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
  };
}

export function persistWorkshop2QcPanelMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  input: Workshop2QcPanelMirrorInput
): Workshop2DossierPhase1 {
  const status = summarizeWorkshop2QcPanelStatus({
    batchCount: input.batchCount,
    pendingBatchCount: input.pendingBatchCount,
    hasSampleOrder: input.hasSampleOrder,
    hasInspectorLink: input.hasInspectorLink,
    supplierResolved: input.supplierSource === 'purchase_order' && Boolean(input.supplierId),
  });
  return {
    ...dossier,
    qcPanelMirror: buildWorkshop2QcPanelMirrorFromStatus(status, input),
  };
}

export function syncWorkshop2QcPanelMirrorAfterInspectorPut(input: {
  dossier: Workshop2DossierPhase1;
  sampleOrderId: string;
}): Workshop2DossierPhase1 {
  const prev = input.dossier.qcPanelMirror;
  return persistWorkshop2QcPanelMirrorToDossier(input.dossier, {
    batchCount: workshop2PgMirrorNum(prev, 'batchCount'),
    pendingBatchCount: workshop2PgMirrorNum(prev, 'pendingBatchCount'),
    failedBatchCount: workshop2PgMirrorNum(prev, 'failedBatchCount'),
    hasSampleOrder: true,
    hasInspectorLink: true,
    supplierId: workshop2PgMirrorStr(prev, 'supplierId'),
    supplierSource: workshop2QcPanelSupplierSource(prev),
    purchaseOrderCount: workshop2PgMirrorNum(prev, 'purchaseOrderCount'),
    poConfirmedCount: workshop2PgMirrorNum(prev, 'poConfirmedCount'),
    activeSampleOrderId: input.sampleOrderId,
  });
}

export function evaluateWorkshop2QcPanelSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.qcPanelMirror;
  if (!mirror) {
    return {
      id: 'qc.panel.mirror_missing',
      severity: 'blocker',
      messageRu: 'Панель ОТК не в досье — нажмите «QC → PG» на вкладке ОТК.',
    };
  }
  if (mirror.blockerSampleOrder) {
    return {
      id: 'qc.panel.not_ready_sample',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'ОТК не готов: нет sample-order, pending партий или инспектора.',
    };
  }
  if (mirror.panelState === 'partial') {
    return {
      id: 'qc.panel.partial',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'ОТК частично готов — проверьте партии и scorecard.',
    };
  }
  return null;
}

export function evaluateWorkshop2QcPanelHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.qcPanelMirror;
  if (!mirror) {
    return {
      id: 'qc.panel.mirror_missing_handoff',
      severity: 'blocker',
      messageRu: 'Панель ОТК не в досье — сохраните «QC → PG» перед handoff commit.',
    };
  }
  if (mirror.blockerHandoff) {
    return {
      id: 'qc.panel.not_ready_handoff',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'ОТК блокирует handoff: pending/брак/parties или поставщик из PO.',
    };
  }
  return null;
}
