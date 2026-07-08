/**
 * Wave 21 #6: зеркало статуса справочников в досье + gate handoff commit.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import {
  summarizeWorkshop2ReferencesStatus,
  type Workshop2ReferencesStatusInput,
} from '@/lib/production/workshop2-references-status-summary';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export function buildWorkshop2ReferencesMirrorFromStatus(
  input: Workshop2ReferencesStatusInput
): NonNullable<Workshop2DossierPhase1['referencesMirror']> {
  const summary = summarizeWorkshop2ReferencesStatus(input);
  const blockerHandoff = input.postgres !== 'ok';
  const blockerSampleOrder = blockerHandoff;

  return {
    mirroredAt: new Date().toISOString(),
    postgres: input.postgres,
    postgresDirectoryCount: summary.postgresDirectoryCount,
    staticDirectoryCount: summary.staticDirectoryCount,
    blockerSampleOrder,
    blockerHandoff,
    hintRu: summary.blockerRu,
  };
}

export function evaluateWorkshop2ReferencesSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.referencesMirror;
  if (!mirror) {
    return {
      id: 'references.mirror_missing',
      severity: 'warning',
      messageRu:
        'Статус справочников не в досье — откройте артикул для синхронизации references mirror.',
    };
  }
  if (mirror.blockerSampleOrder) {
    return {
      id: 'references.pg_down',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ??
        'Справочники на static — PG недоступен, заказ образца заблокирован.',
    };
  }
  if (
    workshop2PgMirrorNum(mirror, 'staticDirectoryCount') > 0 &&
    mirror.postgresDirectoryCount === 0
  ) {
    return {
      id: 'references.static_only',
      severity: 'warning',
      messageRu: 'Все справочники из static — нет PG CRUD для материалов/ТН ВЭД.',
    };
  }
  return null;
}

export function persistWorkshop2ReferencesMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  input: Workshop2ReferencesStatusInput
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    referencesMirror: buildWorkshop2ReferencesMirrorFromStatus(input),
  };
}

export function evaluateWorkshop2ReferencesHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.referencesMirror;
  if (!mirror) {
    return {
      id: 'references.mirror_missing',
      severity: 'warning',
      messageRu: 'Статус справочников не в досье — обновите зеркало перед передачей в цех.',
    };
  }
  if (mirror.blockerHandoff) {
    return {
      id: 'references.pg_down',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ??
        'Справочники на static seeds — PG недоступен, handoff commit заблокирован.',
    };
  }
  if (
    workshop2PgMirrorNum(mirror, 'staticDirectoryCount') > 0 &&
    mirror.postgresDirectoryCount === 0
  ) {
    return {
      id: 'references.static_only',
      severity: 'warning',
      messageRu: 'Все справочники из static — нет PG CRUD для материалов/ТН ВЭД.',
    };
  }
  return null;
}
