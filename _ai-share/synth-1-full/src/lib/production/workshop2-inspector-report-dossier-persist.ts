/**
 * Wave 32 #68: inspectorReportMirror из PUT reports + fail-closed offline.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import type { Workshop2InspectorReportDto } from '@/lib/production/workshop2-inspector-report-client';
import {
  buildWorkshop2MobileInspectorChecklist,
  workshop2InspectorChecklistProgress,
} from '@/lib/production/workshop2-mobile-inspector-checklist';
import {
  summarizeWorkshop2InspectorReportStatus,
  type Workshop2InspectorSaveState,
} from '@/lib/production/workshop2-inspector-report-status';

export type Workshop2InspectorReportMirrorInput = {
  sampleOrderId: string;
  totalItems: number;
  checkedCount: number;
  requiredDone: number;
  requiredTotal: number;
  /** PUT workshop2_inspector_reports успешен */
  pgSynced: boolean;
  saveState?: Workshop2InspectorSaveState;
  updatedAt?: string;
};

export function buildWorkshop2InspectorReportMirror(
  input: Workshop2InspectorReportMirrorInput
): NonNullable<Workshop2DossierPhase1['inspectorReportMirror']> {
  const saveState: Workshop2InspectorSaveState = input.pgSynced
    ? 'saved'
    : (input.saveState ?? 'error');
  const status = summarizeWorkshop2InspectorReportStatus({
    totalItems: input.totalItems,
    checkedCount: input.checkedCount,
    requiredDone: input.requiredDone,
    requiredTotal: input.requiredTotal,
    saveState,
  });

  const offlineOnly = !input.pgSynced;
  const requiredComplete = input.requiredTotal > 0 && input.requiredDone >= input.requiredTotal;
  const blockerSampleOrder = offlineOnly || input.totalItems === 0 || !input.sampleOrderId;
  const blockerHandoff =
    offlineOnly || !requiredComplete || status.state === 'at_risk' || status.state === 'empty';

  let hintRu = status.hintRu;
  if (offlineOnly) {
    hintRu = 'Отчёт инспектора только в localStorage — PUT в PG не подтверждён (fail-closed).';
  } else if (!requiredComplete) {
    hintRu = `Обязательных: ${input.requiredDone}/${input.requiredTotal} — handoff заблокирован.`;
  }

  return {
    mirroredAt: new Date().toISOString(),
    sampleOrderId: input.sampleOrderId,
    totalItems: input.totalItems,
    checkedCount: input.checkedCount,
    requiredDone: input.requiredDone,
    requiredTotal: input.requiredTotal,
    pgSynced: input.pgSynced,
    offlineOnly,
    reportState: status.state,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
    reportUpdatedAt: input.updatedAt,
  };
}

export function persistWorkshop2InspectorReportMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  input: Workshop2InspectorReportMirrorInput
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    inspectorReportMirror: buildWorkshop2InspectorReportMirror(input),
  };
}

export function buildWorkshop2InspectorReportMirrorFromDto(input: {
  report: Workshop2InspectorReportDto;
  totalItems: number;
  requiredDone: number;
  requiredTotal: number;
  pgSynced: boolean;
}): NonNullable<Workshop2DossierPhase1['inspectorReportMirror']> {
  return buildWorkshop2InspectorReportMirror({
    sampleOrderId: input.report.sampleOrderId,
    totalItems: input.totalItems,
    checkedCount: input.report.checkedItemIds.length,
    requiredDone: input.requiredDone,
    requiredTotal: input.requiredTotal,
    pgSynced: input.pgSynced,
    updatedAt: input.report.updatedAt,
    saveState: input.pgSynced ? 'saved' : 'error',
  });
}

export function syncWorkshop2InspectorReportMirrorAfterPut(input: {
  dossier: Workshop2DossierPhase1;
  report: Pick<Workshop2InspectorReportDto, 'sampleOrderId' | 'checkedItemIds' | 'updatedAt'>;
  orderQty?: number;
}): Workshop2DossierPhase1 {
  const items = buildWorkshop2MobileInspectorChecklist({
    dossier: input.dossier,
    sampleOrderId: input.report.sampleOrderId,
    orderQty: input.orderQty ?? 1,
    checkedIds: input.report.checkedItemIds,
  });
  const prog = workshop2InspectorChecklistProgress(items);
  return persistWorkshop2InspectorReportMirrorToDossier(input.dossier, {
    sampleOrderId: input.report.sampleOrderId,
    totalItems: items.length,
    checkedCount: input.report.checkedItemIds.length,
    requiredDone: prog.requiredDone,
    requiredTotal: prog.required,
    pgSynced: true,
    updatedAt: input.report.updatedAt,
    saveState: 'saved',
  });
}

export function evaluateWorkshop2InspectorReportSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.inspectorReportMirror;
  if (!mirror) {
    return {
      id: 'qc.inspector.mirror_missing',
      severity: 'warning',
      messageRu: 'Отчёт мобильного инспектора не в досье — сохраните PWA или «Inspector → PG».',
    };
  }
  if (mirror.offlineOnly) {
    return {
      id: 'qc.inspector.offline_only',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'Инспектор не синхронизирован с PG — образец заблокирован.',
    };
  }
  if (mirror.blockerSampleOrder) {
    return {
      id: 'qc.inspector.not_ready_sample',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') || 'Чек-лист инспектора не готов для sample-order.',
    };
  }
  return null;
}

export function evaluateWorkshop2InspectorReportHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.inspectorReportMirror;
  if (!mirror) {
    return {
      id: 'qc.inspector.mirror_missing_handoff',
      severity: 'blocker',
      messageRu: 'Отчёт инспектора не в досье — «Inspector → PG» перед handoff.',
    };
  }
  if (mirror.blockerHandoff) {
    return {
      id: 'qc.inspector.not_ready_handoff',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'Инспектор блокирует handoff: offline, незакрытые обязательные пункты.',
    };
  }
  return null;
}
