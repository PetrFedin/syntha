/**
 * Wave 30 #69: зеркало последнего AQL расчёта в PG + gates.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import {
  appendWorkshop2QcAqlInspectionToDossier,
  type Workshop2QcAqlPersistInput,
} from '@/lib/production/workshop2-qc-aql-persist';

export function buildWorkshop2QcAqlMirrorFromDossier(
  dossier: Workshop2DossierPhase1
): NonNullable<Workshop2DossierPhase1['qcAqlMirror']> | null {
  const last = dossier.qcAqlInspectionLog?.[0];
  if (!last) return null;

  const blockerSampleOrder = last.isFail;
  const blockerHandoff = last.isFail;

  return {
    mirroredAt: new Date().toISOString(),
    lastRecordId: last.id,
    recordedAt: last.recordedAt,
    orderQty: last.orderQty,
    aqlLevel: last.aqlLevel,
    sampleSize: last.sampleSize,
    isFail: last.isFail,
    blockerSampleOrder,
    blockerHandoff,
    hintRu: last.isFail
      ? `AQL ${last.aqlLevel}: брак (critical/major/minor) — пересмотрите партию перед образцом/handoff.`
      : undefined,
  };
}

export function persistWorkshop2QcAqlRecordToDossier(
  dossier: Workshop2DossierPhase1,
  input: Workshop2QcAqlPersistInput
): Workshop2DossierPhase1 {
  const { dossier: withLog } = appendWorkshop2QcAqlInspectionToDossier(dossier, input);
  const mirror = buildWorkshop2QcAqlMirrorFromDossier(withLog);
  return {
    ...withLog,
    qcAqlMirror: mirror ?? undefined,
  };
}

export function refreshWorkshop2QcAqlMirrorOnDossier(
  dossier: Workshop2DossierPhase1
): Workshop2DossierPhase1 {
  const mirror = buildWorkshop2QcAqlMirrorFromDossier(dossier);
  return {
    ...dossier,
    qcAqlMirror: mirror ?? undefined,
  };
}

export function evaluateWorkshop2QcAqlSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.qcAqlMirror;
  if (!mirror) {
    return {
      id: 'qc.aql.mirror_missing',
      severity: 'warning',
      messageRu: 'Расчёт AQL не сохранён в досье — нажмите «AQL → PG» на вкладке ОТК.',
    };
  }
  if (mirror.blockerSampleOrder) {
    return {
      id: 'qc.aql.fail',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'Последний AQL — брак; заказ образца заблокирован.',
    };
  }
  return null;
}

export function evaluateWorkshop2QcAqlHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.qcAqlMirror;
  if (!mirror) return null;
  if (mirror.blockerHandoff) {
    return {
      id: 'qc.aql.fail_handoff',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') || 'AQL брак в досье — handoff commit заблокирован.',
    };
  }
  return null;
}
