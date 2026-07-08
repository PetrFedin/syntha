/**
 * Wave 23 #44: зеркало assignment signoff + усиление sample-order gate.
 */
import { summarizeWorkshop2AssignmentSignoffChecklist } from '@/lib/production/workshop2-assignment-signoff-checklist';
import { evaluateWorkshop2AssignmentSignoffGate } from '@/lib/production/workshop2-assignment-signoff-gate';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';

const MIN_SECTIONS = 4;

export function buildWorkshop2AssignmentSignoffMirror(
  dossier: Workshop2DossierPhase1
): NonNullable<Workshop2DossierPhase1['assignmentSignoffMirror']> {
  const summary = summarizeWorkshop2AssignmentSignoffChecklist(dossier);
  const sectionsSigned = summary?.sectionsSigned ?? 0;
  const blockerSampleOrder = sectionsSigned < MIN_SECTIONS;

  return {
    mirroredAt: new Date().toISOString(),
    sectionsSigned,
    sectionsTotal: MIN_SECTIONS,
    assignmentSectionSigned: summary?.assignmentSectionSigned ?? false,
    state: summary?.state ?? 'blocked',
    blockerSampleOrder,
    hintRu: summary?.hintRu,
  };
}

export function persistWorkshop2AssignmentSignoffMirrorToDossier(
  dossier: Workshop2DossierPhase1
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    assignmentSignoffMirror: buildWorkshop2AssignmentSignoffMirror(dossier),
  };
}

/** Дублирует gate с PG-аудитом: mirror отсутствует → warning, неполные подписи → blocker. */
export function evaluateWorkshop2AssignmentSignoffMirrorGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.assignmentSignoffMirror;
  if (!mirror) {
    return (
      evaluateWorkshop2AssignmentSignoffGate(dossier) ?? {
        id: 'assignment.signoff.mirror_missing',
        severity: 'warning',
        messageRu: 'Чеклист подписей не в PG — сохраните «Подписи → PG» на вкладке Задание.',
      }
    );
  }
  if (mirror.blockerSampleOrder === true) {
    return {
      id: 'assignment.signoff.sections',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        `Подпишите секции ТЗ (${workshop2PgMirrorNum(mirror, 'sectionsSigned')}/${workshop2PgMirrorNum(mirror, 'sectionsTotal', MIN_SECTIONS)}) перед образцом.`,
    };
  }
  return null;
}
