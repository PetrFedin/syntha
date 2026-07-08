/**
 * Wave 22 #65 + wave 35: logistics journal-only / TMS + gates.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { isWorkshop2LiveTmsConfigured } from '@/lib/production/workshop2-live-integration-probes-env';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export type Workshop2LogisticsMirrorInput = {
  shipmentCount: number;
  linkedToSampleOrder: boolean;
  currentStep?: string;
  status?: string;
};

export function buildWorkshop2LogisticsShipmentMirror(
  input: Workshop2LogisticsMirrorInput
): NonNullable<Workshop2DossierPhase1['logisticsShipmentMirror']> {
  const logisticsMode: 'journal_only' | 'tms_live' = isWorkshop2LiveTmsConfigured()
    ? 'tms_live'
    : 'journal_only';
  const unlinked = input.shipmentCount > 0 && !input.linkedToSampleOrder;
  const blockerSampleOrder = unlinked;
  const blockerHandoff = unlinked;
  const serverWorkflowEnabled =
    logisticsMode === 'journal_only'
      ? input.shipmentCount === 0 || input.linkedToSampleOrder
      : input.linkedToSampleOrder && !unlinked;

  let hintRu: string | undefined;
  if (input.shipmentCount === 0) {
    hintRu = 'Нет отгрузок в PG — journal после заказа образца.';
  } else if (unlinked) {
    hintRu = 'Отгрузка без sampleOrderId — привяжите к заказу образца.';
  } else if (logisticsMode === 'journal_only') {
    hintRu = 'Логистика: journal-only (без TMS API) — шаги в PG journal.';
  }

  return {
    mirroredAt: new Date().toISOString(),
    shipmentCount: input.shipmentCount,
    linkedToSampleOrder: input.linkedToSampleOrder,
    currentStep: input.currentStep,
    status: input.status,
    logisticsMode,
    serverWorkflowEnabled,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
  };
}

export type Workshop2LogisticsPanelTrackingUi = {
  trackingActive: boolean;
  statusLabelRu: string;
  mirrorInPg: boolean;
};

/** Wave T: честный chip трекинга — не «активен» без journal/mirror. */
export function summarizeWorkshop2LogisticsPanelTrackingUi(input: {
  dossier?: Workshop2DossierPhase1 | null;
  hasActiveShipment: boolean;
  currentStepLabel?: string;
}): Workshop2LogisticsPanelTrackingUi {
  const mirror = input.dossier?.logisticsShipmentMirror;
  if (mirror) {
    const active = workshop2PgMirrorNum(mirror, 'shipmentCount') > 0;
    const step =
      workshop2PgMirrorStr(mirror, 'currentStep') || workshop2PgMirrorStr(mirror, 'status');
    return {
      trackingActive: active,
      statusLabelRu: active ? `PG · ${step ?? 'journal'}` : 'Mirror в PG · нет отгрузок',
      mirrorInPg: true,
    };
  }
  if (input.hasActiveShipment) {
    return {
      trackingActive: true,
      statusLabelRu: input.currentStepLabel
        ? `Journal · ${input.currentStepLabel}`
        : 'Journal · не в PG mirror',
      mirrorInPg: false,
    };
  }
  return {
    trackingActive: false,
    statusLabelRu: 'Нет отгрузки — зарегистрируйте или сохраните mirror',
    mirrorInPg: false,
  };
}

export function evaluateWorkshop2LogisticsHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.logisticsShipmentMirror;
  if (!mirror) {
    return {
      id: 'logistics.mirror_missing_handoff',
      severity: 'warning',
      messageRu: 'Логистика не в досье — сохраните «Логистика → PG» перед handoff.',
    };
  }
  if (mirror.blockerHandoff) {
    return {
      id: 'logistics.sample_unlinked_handoff',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ??
        'Отгрузка без sample order — handoff commit заблокирован.',
    };
  }
  return null;
}

export function persistWorkshop2LogisticsShipmentMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  input: Workshop2LogisticsMirrorInput
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    logisticsShipmentMirror: buildWorkshop2LogisticsShipmentMirror(input),
  };
}

export function evaluateWorkshop2LogisticsSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.logisticsShipmentMirror;
  if (!mirror) {
    return {
      id: 'logistics.mirror_missing',
      severity: 'warning',
      messageRu: 'Логистика не зафиксирована в досье — сохраните «Логистика → PG» на Выпуске.',
    };
  }
  if (mirror.blockerSampleOrder) {
    return {
      id: 'logistics.sample_unlinked',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ??
        'Отгрузка не привязана к sample order — проверьте journal.',
    };
  }
  return null;
}

/** Wave 35: export-tz — logistics mirror. */
export function evaluateWorkshop2LogisticsExportGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.logisticsShipmentMirror;
  if (!mirror) {
    return {
      id: 'logistics.export_missing',
      severity: 'warning',
      messageRu: 'ZIP ТЗ: logistics mirror не в досье.',
    };
  }
  if (mirror.blockerHandoff) {
    return {
      id: 'logistics.export_unlinked',
      severity: 'blocker',
      messageRu: workshop2PgMirrorStr(mirror, 'hintRu') ?? 'ZIP ТЗ: отгрузка без sample order.',
    };
  }
  return null;
}
